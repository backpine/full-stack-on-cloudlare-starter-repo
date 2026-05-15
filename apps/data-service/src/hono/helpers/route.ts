import { getLink } from "@repo/data-ops/queries/links";
import { linkSchema, LinkSchemaType } from "@repo/data-ops/zod-schema/links";
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";
import moment from "moment";

export function getDestinationForCountry(linkInfo: LinkSchemaType, countryCode?: string) {
    if (!countryCode) {
        return linkInfo.destinations.default;
    }
    console.log({linkInfo, countryCode});
    // Check if the country code exists in destinations
    if (linkInfo.destinations[countryCode]) {
        return linkInfo.destinations[countryCode];
    }

    // Fallback to default
    return linkInfo.destinations.default;
}
async function cacheLinkInfo(cache: KVNamespace, id: string, linkInfo: LinkSchemaType) {
    try {
        await cache.put(id, JSON.stringify(linkInfo), {
            expirationTtl: 60 * 60 * 24 // 1 day
        });
    } catch (error) {
        console.error("error saving linkInfo to cache")
    }
}
export async function getCachedLinkInfo(cache: KVNamespace, id: string): Promise<LinkSchemaType | undefined> {
    const cachedLinkInfo = await cache.get(id);
    if (!cachedLinkInfo) return;
    try {
        const parsedLinkInfo = linkSchema.parse(JSON.parse(cachedLinkInfo))
        console.log("Cached linkInfo found")
        return parsedLinkInfo;
    } catch (error) {

    }

}
export async function getLinkInfo(cache: KVNamespace, id: string): Promise<LinkSchemaType | undefined> {
    const cachedLinkInfo = await getCachedLinkInfo(cache, id);
    if (cachedLinkInfo) return cachedLinkInfo;
    const linkInfoFromDb = await getLink(id);
    if (!linkInfoFromDb) return;
    try {
        return linkInfoFromDb
    } finally { 
        await cacheLinkInfo(cache, id, linkInfoFromDb);
    }

}

export async function captureLinkClickInBackground(env: Env, event: LinkClickMessageType) {
	await env.QUEUE.send(event)
	const doId = env.LINK_CLICK_TRACKER.idFromName(event.data.accountId);
	const stub = env.LINK_CLICK_TRACKER.get(doId);
    console.log('sending data to durable object: ', event.data.country, 'into current do id:', doId);
	if (!event.data.latitude || !event.data.longitude || !event.data.country) return
	await stub.addClick(
		event.data.latitude,
		event.data.longitude,
		event.data.country,
		moment().valueOf()
	)
}