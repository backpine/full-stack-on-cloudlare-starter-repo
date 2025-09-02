import { addLinkClick } from "@repo/data-ops/queries/links";
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";




export async function handleLinkClick(env:Env, event: LinkClickMessageType){
    await addLinkClick(event.data)
    const doId = env.EVALUATION_SCHEDULAR.idFromName(`${event.data.id}:${event.data.destination}`);
    const stub = env.EVALUATION_SCHEDULAR.get(doId);
    const {accountId, id, destination, country} = event.data
    await stub.collectClickData(accountId, id, destination, country || "Unknown")
}
