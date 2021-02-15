// recieves the browser and the

import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";

// url and returns the page.
export async function getPage(browser: Browser, url: string): Promise<Page> {
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1200,
        height: 800
    });
    return page;
}