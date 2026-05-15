import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";

export async function scheduleEvaluation(data: LinkClickMessageType["data"], scheduler: Env['EVALUATION_SCHEDULER']) {
    const schedulerId = scheduler.idFromName(`${data.id}.${data.destination}`);
    const schedulerInstance = scheduler.get(schedulerId);
    await schedulerInstance.scheduleClickDataEvaluation({
        accountId: data.accountId,
        destinationCountryCode: data.country ?? "UNKNOWN",
        destinationUrl: data.destination,
        linkId: data.id
    })
}