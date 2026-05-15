import { captureLinkClickInBackground, getDestinationForCountry, getLinkInfo } from '@/hono/helpers/route';
import { cloudflareInfoSchema } from '@repo/data-ops/zod-schema/links';
import { LinkClickMessageType } from '@repo/data-ops/zod-schema/queue';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

export const App = new Hono<{ Bindings: Env }>();

App.use("*", cors());
App.get('/click-socket', async (c) => {
    const upgradeHeader = c.req.header('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return c.text('Expected Upgrade: websocket', 426);
    }

    const accountId = c.req.header('account-id')
    if (!accountId) return c.text('No Headers', 404);
    const doId = c.env.LINK_CLICK_TRACKER.idFromName(accountId);
    const stub = c.env.LINK_CLICK_TRACKER.get(doId);
    return await stub.fetch(c.req.raw)
})


App.get('/:id', async (c) => {
    const id = c.req.param('id');

    const linkInfo = await getLinkInfo(c.env.CACHE, id);
    if (!linkInfo) {
        return c.text('Destination not found', 404);
    }
    const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
    if (!cfHeader.success) {
        return c.text('Invalid Cloudflare headers', 400);
    }

    const headers = cfHeader.data
    const originationCountry = headers.country
    const destinationUrl = getDestinationForCountry(linkInfo, originationCountry);
    const data = {
            id: id,
            country: originationCountry,
            destination: destinationUrl,
            accountId: linkInfo.accountId,
            latitude: headers.latitude,
            longitude: headers.longitude,
            timestamp: new Date().toISOString()
        }

    console.log("data sent to queue: ", data)
    const queueMessage: LinkClickMessageType = {
        "type": "LINK_CLICK",
        data
    }
    c.executionCtx.waitUntil(captureLinkClickInBackground(c.env, queueMessage))
    return c.redirect(destinationUrl);
})
