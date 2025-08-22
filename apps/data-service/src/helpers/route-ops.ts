import { getLink } from '@repo/data-ops/queries/links';
import { linkSchema, LinkSchemaType } from '@repo/data-ops/zod-schema/links';

async function getLinkFromCache(env: Env, id: string) {
	const link = await env.CACHE.get(id);
	if (!link) return null;
	try {
		const parsedLink = JSON.parse(link);
		return linkSchema.parse(parsedLink);
	} catch (error) {
		return null;
	}
}

const TTL_TIME = 60 * 60 * 24; // 1 day

async function saveLinkToCache(env: Env, id: string, link: LinkSchemaType) {
	try {
		await env.CACHE.put(id, JSON.stringify(link), {
			expirationTtl: TTL_TIME,
		});
	} catch (error) {
		console.error('Error saving link to cache:', error);
	}
}

export async function getRoutingDestinations(env: Env, id: string) {
	const link = await getLinkFromCache(env, id);
	if (link) return link;
	const dbLink = await getLink(id);
	if (!dbLink) return null;
	await saveLinkToCache(env, id, dbLink);
	return dbLink;
}

export function getDestinationForCountry(linkInfo: LinkSchemaType, countryCode?: string) {
	if (!countryCode) {
		return linkInfo.destinations.default;
	}

	// Check if the country code exists in destinations
	if (linkInfo.destinations[countryCode]) {
		return linkInfo.destinations[countryCode];
	}

	// Fallback to default
	return linkInfo.destinations.default;
}
