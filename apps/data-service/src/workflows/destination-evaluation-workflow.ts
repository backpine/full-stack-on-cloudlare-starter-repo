import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers"
import { collectDestinationInfo } from "@/workflows/helpers/browser-render";
import { aiDestinationChecker } from "@/workflows/helpers/ai-destination-checker";
import { storeEvaluationAssets } from "@/workflows/helpers/store-evaluation-assets";
import { addEvaluation } from "@repo/data-ops/queries/evaluations";
import { initDatabase } from "@repo/data-ops/database";

export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, DestinationEvaluationWorkflowParams> {
    async run(event: Readonly<WorkflowEvent<DestinationEvaluationWorkflowParams>>, step: WorkflowStep) {
        initDatabase(this.env.DB);

        const evaluationInfo = await step.do("Collect rendered destination page data", {
            retries: {
                limit: 1,
                delay: 1000,
            },
        }, async () => {
            const data = await collectDestinationInfo(this.env, event.payload.destinationUrl);
            const { evaluationId } = await storeEvaluationAssets(this.env, event.payload.accountId, {
                html: data.html,
                bodyText: data.bodyText,
                screenshotBase64: data.screenshotBase64,
            });
            return {
                evaluationId,
                bodyText: data.bodyText,
            };
        });


        const aiStatus = await step.do(
            'Use AI to check status of page',
            {
                retries: {
                    limit: 0,
                    delay: 0,
                },
            },
            async () => {
                return await aiDestinationChecker(this.env, evaluationInfo.bodyText);
            },
        );

        await step.do('Save evaluation in database', async () => {
            return await addEvaluation({
                id: evaluationInfo.evaluationId,
                linkId: event.payload.linkId,
                status: aiStatus.status,
                reason: aiStatus.statusReason,
                accountId: event.payload.accountId,
                destinationUrl: event.payload.destinationUrl,
            });
        });

    }

}

