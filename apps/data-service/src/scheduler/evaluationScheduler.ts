import { DurableObject } from "cloudflare:workers";
import moment from "moment";

interface ClickData {
    destinationUrl: string,
    linkId: string,
    accountId: string,
    destinationCountryCode: string
}
const CLICK_DATA = 'click_data';
export class EvaluationScheduler extends DurableObject {
    clickData?: ClickData;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env)
        ctx.blockConcurrencyWhile(async () => {
            this.clickData = await ctx.storage.get<ClickData>(CLICK_DATA);
        })

    }

    async scheduleClickDataEvaluation(data: ClickData) {
        this.clickData = data;
        await this.ctx.storage.put(CLICK_DATA, data);
        const alarm = await this.ctx.storage.getAlarm();

        if (!alarm) {
            const alarmTime = moment().add(10, "seconds").valueOf();
            await this.ctx.storage.setAlarm(alarmTime)
        }
    }

    async alarm(): Promise<void> {
        if (!this.clickData) throw new Error("Click data is not defined")
        await this.env.DESTINATION_EVALUATION_WORKFLOW.create({
            params: {
                linkId: this.clickData.linkId,
                destinationUrl: this.clickData.destinationUrl,
                accountId: this.clickData.accountId
            }
        })
    }

}