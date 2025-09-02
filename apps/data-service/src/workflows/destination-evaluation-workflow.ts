import { WorkerEntrypoint, WorkflowStep, WorkflowEvent,  } from "cloudflare:workers";
import { collectDestinationData } from "@/helpers/browser-reneder";
import { aiDestinationChecker } from "@/helpers/ai-destination-checker";
import { addEvaluation } from "@repo/data-ops/queries/evaluations";
import { initDatabase } from "@repo/data-ops/database";

export class DestinationEvaluationWorkflow extends WorkerEntrypoint<Env>{
    /**
     *
     */
    async run(event: WorkflowEvent<DestinationStatusEvaluationParams>, step: WorkflowStep) {
        initDatabase(this.env.DB);
        console.log("Running the destination evaluation workflow");
        const collectedData = await step.do("setting and getting the brower",async()=>{
            return await collectDestinationData(this.env, event.payload.destinationUrl)
        });
        const aiStatus = await step.do('Use AI to check status of page',
            {
                retries: {
                    limit: 0,
                    delay: 0,
                }
            },
            async () => {
                return await aiDestinationChecker(this.env,collectedData.bodyText)
            }
        )
        const evaluationId = await step.do("store the result in the database", async()=>{
            return await addEvaluation({
                linkId: event.payload.linkId,
                accountId: event.payload.accountId,
                destinationUrl: event.payload.destinationUrl,
                status: aiStatus.status,
                reason: aiStatus.statusReason,
            })
        });
        await step.do("backup destination gtml in R2", async()=>{
            const accountId = event.payload.accountId;
            const r2PathHtml = `evaluations/${accountId}/html/${evaluationId}`;
            const r2PathBody = `evaluations/${accountId}/body/${evaluationId}`;
            const screenshotBas64 = collectedData.screenshot;
            const screenshotBuffer = Buffer.from(screenshotBas64, 'base64')
            const r2PathScreenshot = `evaluations/${accountId}/screenshots/${evaluationId}.png`;
            await this.env.BUCKET.put(r2PathHtml, collectedData.html);
            await this.env.BUCKET.put(r2PathBody, collectedData.bodyText);
            await this.env.BUCKET.put(r2PathScreenshot, screenshotBuffer);
        });        
    }

}