import { getLink } from "@repo/data-ops/queries/links";
import { linkSchema, LinkSchemaType } from "@repo/data-ops/zod-schema/links";
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";
import moment from "moment";


async function getLinkInfoFromKV(env: Env, id: string) {
    const linkInfo = await env.CACHE.get(id);
    if (!linkInfo){
        return null;
    }
    try{
        const parsedLinkInfo = JSON.parse(linkInfo);
        return linkSchema.parse(parsedLinkInfo);
    }
    catch (error){
        return null;
    }

}
const TTL = 60 * 60 * 24
async function saveInfoToKV(env: Env, id: string, linkInfo: LinkSchemaType){
    try{
        await env.CACHE.put(id, JSON.stringify(linkInfo), 
    {
        expirationTtl: TTL 
    });
    }
    catch (error){
        console.error("Error saving to the KV store", error);
    }
}
export async function getRoutingDestinations(env: Env, id: string){
    const linkInfo = await getLinkInfoFromKV(env, id)
    if (linkInfo){
        return linkInfo;
    }
    const linkInfoFromDB = await getLink(id);
        if (!linkInfoFromDB){
            return null;
        }
        await saveInfoToKV(env, id, linkInfoFromDB);
        return linkInfoFromDB;
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

export async function captureLinkClickInBackground(env: Env, event: LinkClickMessageType) {
	await env.QUEUE.send(event)
	const doId = env.LINK_CLICK_TRACKER_OBJECT.idFromName(event.data.accountId);
	const stub = env.LINK_CLICK_TRACKER_OBJECT.get(doId);
	if (!event.data.latitude || !event.data.longitude || !event.data.country) return
	await stub.addClick(
		event.data.latitude,
		event.data.longitude,
		event.data.country,
		moment().valueOf()
	)
}
