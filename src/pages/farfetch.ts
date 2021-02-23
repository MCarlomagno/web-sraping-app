import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Category } from '../enum/category.enum';
import { BasePage } from '../models/base-page';
import { PageData } from '../models/page-data';
import { ScrapingParameters } from '../models/scrape-catalog-params';

export class Farfetch extends BasePage{

    // scraps the data for a
    // given item page.
    async scrapeItem(page: any) {
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

    // scraps catalog page
    async scrapeCatalog(params: ScrapingParameters) {
        const content = await params.page.evaluate(async () => {
            const items = Array.from(document.querySelectorAll('a[itemprop="itemListElement"]'));
            const itemsData = [];
            for(const item of items) {
                const itemUrl = (item as HTMLLinkElement).href;
                const pictureURL = item.querySelector('img').src;
                const brand = item.querySelector('h3').innerText;
                const model = item.querySelector('p').innerText;
                const title = `${brand}(${model})`;
                const price = (item.querySelector('span[data-testid="price"]') as HTMLElement).innerText;
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

}