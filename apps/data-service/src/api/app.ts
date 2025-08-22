import { Hono } from 'hono';
import { cloudflareInfoSchema } from '@repo/data-ops/zod-schema/links';
import { getDestinationForCountry, getRoutingDestinations } from '@/helpers/route-ops';

export const App = new Hono<{ Bindings: Env }>();

App.get('/:id', async (c) => {
	const id = c.req.param('id');
	const link = await getRoutingDestinations(c.env, id);
	if (!link) {
		return c.text('Destination not found', 404);
	}

	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeader.success) {
		return c.text('Invalid Cf headers', 400);
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(link, headers.country);
	return c.redirect(destination);
});
