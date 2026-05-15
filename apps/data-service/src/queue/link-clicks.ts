import { addLinkClick } from "@repo/data-ops/queries/links";
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";
import { scheduleEvaluation } from "./helpers/clickDataScheduler";

export async function handleLinkClick(env: Env, event: LinkClickMessageType) {
	await addLinkClick(event.data);
	await scheduleEvaluation(event.data, env.EVALUATION_SCHEDULER);
}
