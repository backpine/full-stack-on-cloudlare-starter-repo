import { addLinkClick } from '@repo/data-ops/queries/links';
import { LinkClickMessageType } from '@repo/data-ops/zod-schema/queue';
import { scheduleEvalWorkflow } from '@/helpers/route-ops';

export async function handleLinkClick(env: Env, event: LinkClickMessageType) {
	await addLinkClick(event.data);
	await scheduleEvalWorkflow(env, event);
}
