import { parse } from "json2csv";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import fs from 'fs';
import { autoScroll } from "../utils/autoscroll";
import { getPage } from "../utils/browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";

// scraps farfetch skirts page.
export async function scrapeMaxMara(browser: Browser) {

    // CSV definitions.
    const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
    let content: any[] = [];
    const opts = { fields };
    const url = `https://world.maxmara.com/clothing/skirts`;
    try {
        const startTime = new Date();

        console.log("loading maxmara page...");

        // loads the current page in browser
        const catalogPage: Page = await getPage(browser, url);

        console.log("displaying items...");
        await displayAllItems(catalogPage);

        console.log("autoscrolling...");
        await autoScroll(catalogPage);

        console.log("scraping catalog...");
        content = await scrapeMaxMaraCatalog(catalogPage);

        await catalogPage.close();

        console.log(content);

        // save the data in a csv
        // in data folder.
        const csv = parse(content, opts);
        fs.writeFileSync('data/data-skirts-max-mara.csv', csv);

        // To display duration
        const endTime = new Date();
        const duration = (endTime.valueOf() - startTime.valueOf()) / 1000;
        console.log("duration in seconds: " + duration);
    } catch (err) {
        console.error(err);
    }
}

// Displays normal layout and
// press "load more" button.
async function displayAllItems(page: Page) {
    await page.evaluate(async () => {
        (document.querySelector('button[data-listing-layout-type="normal"]') as HTMLElement).click();
        (document.querySelector('button[data-infinite-scroll]') as HTMLElement).click();
    });
}

// scraps catalog page
async function scrapeMaxMaraCatalog(page: Page) {
    const content = await page.evaluate(async () => {
        const items = Array.from(document.querySelectorAll('a[class="product-card"]'));
        const itemsData = [];
        for(const item of items) {
            const itemUrl = (item as HTMLLinkElement).href;

            // In some cases the item doesnt
            // have the 2nd picture.
            const images = item.querySelectorAll('img');
            let pictureURL = "";
            if(images.length > 1) {
                pictureURL = (images[1] as HTMLImageElement).src;
            }else {
                pictureURL = (images[0] as HTMLImageElement).src;
            }

            // if the image is not secure, then we dont use it.
            if(!pictureURL.startsWith("https")) {
                pictureURL = "";
            }

            const brandElement = item.querySelector('p[class="product-labels label label--major "]');
            let brand = "";
            if(brandElement) {
                brand = (brandElement as HTMLElement).innerText;
            }

            const modelElement = item.querySelector('p[class="short-description"]');
            let model = "";
            if(modelElement) {
                model = (modelElement as HTMLElement).innerText;
            }

            const title = `${brand}(${model})`;

            // no price displayed
            const cost = "";
            const currency = "";

            const newRow = {
                title,
                url: itemUrl,
                cost,
                currency,
                pictureURL
            };
            itemsData.push(newRow);
        }
        return itemsData;
    });
    return content;
}
