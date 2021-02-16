import { parse } from "json2csv";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import fs from 'fs';
import { autoScroll } from "../utils/autoscroll";
import { getPage } from "../utils/browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";

// scraps farfetch skirts page.
export async function scrapeRiverIsland(browser: Browser) {

    // CSV definitions.
    const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
    const content: any[] = [];
    const opts = { fields };
    const url = `https://www.riverisland.com/c/women/skirts`;
    try {
        const startTime = new Date();

        // loads the current page in browser
        const catalogPage: Page = await getPage(browser, url);
        const itemUrls = await getCatalogItems(catalogPage);
        await catalogPage.close();

        // iterates in each one of the
        // urls previously extracted from catalog.
        for(const itemUrl of itemUrls) {
            const itemPage: Page = await getPage(browser, itemUrl);
            const itemData = await scrapeItem(itemPage);
            await itemPage.close();
            itemData.url = itemUrl;
            content.push(itemData);
            console.log("page finished");
        }
        console.log(content);

        // save the data in a csv
        // in data folder.
        const csv = parse(content, opts);
        fs.writeFileSync('data/data-skirts-river-island.csv', csv);

        // To display duration
        const endTime = new Date();
        const duration = (endTime.valueOf() - startTime.valueOf()) / 1000;
        console.log("duration in seconds: " + duration);
    } catch (err) {
        console.error(err);
    }

}

async function getCatalogItems(page:Page) {
    const urls = await page.evaluate(async () => {
        const items: HTMLLinkElement[] = Array.from(document.querySelectorAll('a[data-qa="product-card"]'));
        return items.map(i => i.href);
    });
    return urls;
}

// scraps
async function scrapeItem(page: any) {
    const content = await page.evaluate(async () => {
        const pictureURLIndex = document.querySelectorAll('li[role="presentation"]').length - 1;
        const pictureURL = (document.querySelector(`img[data-index="${pictureURLIndex}"]`) as HTMLImageElement).src;
        const title = (document.querySelector('h2[class="product-title ui-product-title"]') as HTMLElement).innerText;
        const price = (document.querySelector('div[class="price ui-headline"]') as HTMLElement).innerText;
        const cost = price.match(/\d+(\.\d+)/g).join('');
        const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");

        return {
            pictureURL,
            title,
            cost,
            currency
        };
    });
    return content;
}