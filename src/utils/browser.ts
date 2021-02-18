import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";

// recieves the browser and the
// url and returns the page.
export async function getPage(browser: Browser, url: string): Promise<Page> {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36");
    await page.goto(url);
    await page.setViewport({
        width: 1200,
        height: 800
    });
    return page;
}