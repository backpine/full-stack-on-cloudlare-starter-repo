import { v4 as uuidv4 } from 'uuid';

interface EvaluationAssets {
    html: string;
    bodyText: string;
    screenshotBase64: string;
}

export async function storeEvaluationAssets(env: Env, accountId: string, assets: EvaluationAssets) {
    const evaluationId = uuidv4();
    const r2PathHtml = `evaluations/${accountId}/html/${evaluationId}`;
    const r2PathBodyText = `evaluations/${accountId}/body/${evaluationId}`;
    const r2PathScreenshot = `evaluations/${accountId}/screenshots/${evaluationId}.png`;

    const screenshotBuffer = Buffer.from(assets.screenshotBase64, 'base64');

    await Promise.all([
        env.BUCKET.put(r2PathHtml, assets.html),
        env.BUCKET.put(r2PathBodyText, assets.bodyText),
        env.BUCKET.put(r2PathScreenshot, screenshotBuffer),
    ]);

    return { evaluationId };
}
