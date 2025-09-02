import puppeteer, { Page } from '@cloudflare/puppeteer';

export const collectDestinationData = async (env: Env, url: string) => {
	const browser = await puppeteer.launch(env.VIRTUAL_BROWSER);
	const page = await browser.newPage();
	const response = await page.goto(url);
	await page.waitForNetworkIdle();
	const bodyText = (await page.$eval('body', (el) => el.innerText)) as string;
	const html = await page.content();
	const status = response ? response.status() : 0;
    const screenshot = await page.screenshot({ encoding: 'base64'});
	await browser.close();
    return {
		bodyText,
		html,
		status,
        screenshot
	};
};
