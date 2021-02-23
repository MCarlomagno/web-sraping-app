import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Category } from '../enum/category.enum';
import { ItemData } from '../models/item-data.model';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { delay } from '../utils/delay';
import { BasePage } from '../models/base-page';
import { PageData } from '../models/page-data';
import { ScrapingParameters } from '../models/scrape-catalog-params';

export class Bershka extends BasePage{

    async beforeScraping(browser: Browser) {
        const setLocationUrl = 'https://www.bershka.com/?select-store=true';
        const page = await getPage(browser, setLocationUrl);

        console.log("setting location... (20 sec)");
        await delay(10000);
        await page.evaluate(async () => {
            (document.querySelector('button[type="submit"]') as HTMLElement).click();
        });

        await delay(5000);
    }

    // scraps catalog page
    async scrapeCatalog(params: ScrapingParameters) {
        // gets the items urls.
        const urls = await params.page.evaluate(async (category) => {
            let items: any[] = [];

            // in case of Kniwear, the query changes.
            if(category !== "knitwear"){
                items = Array.from(document.querySelectorAll('div[class="grid-card category-product-card"]'));
            }else {
                items = Array.from(document.querySelectorAll('div[class="grid-card search-product-card"]'));
            }

            const urls = items.map(item => (item.querySelector('a') as HTMLAnchorElement).href);
            return urls;
        }, params.category);

        const content: ItemData[] = [];
        for(const url of urls) {
            try {
                const startTime = new Date();

                console.log("scraping " + (urls.indexOf(url) + 1) + " of " + urls.length)
                const page = await getPage(params.browser, url);
                await autoScroll(page);
                const itemData = await this.scrapeItem(page);
                itemData.url = url;
                content.push(itemData);
                await page.close();

                // To display every
                // item duration.
                const endTime = new Date();
                const pageDuration = (endTime.valueOf() - startTime.valueOf()) / 1000;
                console.log("item duration in seconds: " + pageDuration);
            }catch(err) {
                console.log(err);
            }
        }
        return content;
    }

    // scraps the data for a
    // given item page.
    async scrapeItem(page: any): Promise<ItemData> {
        const itemData: ItemData = await page.evaluate(async () => {
            const title = (document.querySelector('h1[class="product-title"]') as HTMLElement).innerText;
            const price = (document.querySelector('div[class="current-price-elem"]') as HTMLElement).innerText;
            const cost = price.match(/\d+(\.\d+)/g).join('');
            const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "").split(".").join("");
            const imageWrapperItem = document.querySelector('div[class="plane"]');
            const pictureURL = imageWrapperItem.querySelector('img').src

            const itemData: ItemData =  {
                title,
                cost,
                currency,
                pictureURL,
                url: ''
            };
            return itemData;
        });
        return itemData;
    }
}