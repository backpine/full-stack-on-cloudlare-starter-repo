 import puppeteer from '@cloudflare/puppeteer';

export async function collectDestinationInfo(env: Env, destinationUrl: string) {
	const browser = await puppeteer.launch(env.VIRTUAL_BROWSER);
	const page = await browser.newPage();
	const response = await page.goto(destinationUrl);
	await page.waitForNetworkIdle();

	const bodyText = (await page.$eval('body', (el) => el.innerText)) as string;
	const html = await page.content();
	const status = response ? response.status() : 0;

	const screenshotBase64 = await page.screenshot({ encoding: 'base64' });
	await browser.close();
	return {
		bodyText,
		html,
		status,
		screenshotBase64,
	};
}
