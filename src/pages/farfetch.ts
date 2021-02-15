import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';

// scraps farfetch skirts page.
export async function scrapeFatfetch(browser: Browser) {

    // CSV definitions.
    const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
    const content = [];
    const opts = { fields };
    let pageNumber = 1;
    while(pageNumber <= 1) {
        const url = `https://www.farfetch.com/ae/shopping/women/skirts-1/items.aspx?page=${pageNumber}&view=90`;
        console.log("scraping page number: " + pageNumber);
        try {
            const startTime = new Date();

            // loads the current page in browser
            // scrolls and collects and collects the data
            const page = await getPage(browser, url);
            await autoScroll(page);
            content.push(...await scrapeCatalog(page));
            await page.close();

            // save the data in a csv
            // at the project root.
            const csv = parse(content, opts);
            fs.writeFileSync('data/data-skirts-farfetch.csv', csv);

            // To display every
            // page duration
            const endTime = new Date();
            const pageDuration = (endTime.valueOf() - startTime.valueOf()) / 1000;
            console.log("page duration in seconds: " + pageDuration);
        } catch (err) {
            console.error(err);
        }

        pageNumber++;
    }
}

// scraps the data for a
// given item page.
async function scrapeItem(page: any) {
    const dataFromPage = await page.evaluate(async () => {
        const brand = (document.querySelector("#bannerComponents-Container > h1").children[0] as HTMLElement).innerText;
        const model = (document.querySelector("#bannerComponents-Container > h1").children[1] as HTMLElement).innerText;
        const title = `${brand}(${model})`;
        const price = (document.querySelector('[data-tstid=priceInfo-original]') as HTMLElement).innerText;
        const cost = price.match(/\d/g).join('');
        const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");
        const pictureURL = (document.querySelector('img[data-test="imagery-img0"]') as HTMLImageElement).src;

        return {
            title,
            cost,
            currency,
            pictureURL
        };
    });
    return dataFromPage;
}

// scraps
async function scrapeCatalog(page: any) {
    const content = await page.evaluate(async () => {
        const items = Array.from(document.querySelectorAll('a[itemprop="itemListElement"]'));
        const itemsData = [];
        for(const item of items) {
            const itemUrl = (item as HTMLLinkElement).href;
            const pictureURL = item.querySelector('img').src;
            const brand = item.querySelector('h3').innerText;
            const model = item.querySelector('p').innerText;
            const title = `${brand}(${model})`;
            const price = (item.querySelector('span[data-test="price"]') as HTMLElement).innerText;
            const cost = price.match(/\d/g).join('');
            const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");

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
