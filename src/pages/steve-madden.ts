import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Category } from '../enum/category.enum';
import { BasePage } from '../models/base-page';
import { PageData } from '../models/page-data';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { ScrapingParameters } from '../models/scrape-catalog-params';

export class SteveMadden extends BasePage{

    // scraps catalog page
    async scrapeCatalog(params: ScrapingParameters) {
        const content = await params.page.evaluate(async () => {
            const items = Array.from(document.querySelectorAll('[class="product span3   hasTwoImg"]'));
            const itemsData = [];
            for(const item of items) {
                const itemUrl = (item.querySelector('a') as HTMLAnchorElement).href;
                const pictureURL = item.querySelector('img').src;
                const title = (item.querySelector('h4[class="title"]') as HTMLElement).innerText;

                // if has more than 1 child means in sale.
                const nodesCount = item.querySelector('span[class="price"]').childNodes.length;
                let price = (item.querySelector('span[class="price"]') as HTMLElement).innerText
                if(nodesCount > 1) {
                    price = item.querySelector('span[class="price"]').childNodes[2].textContent;
                }
                const cost = price.match(/\d+(\.\d+)/g).join('');
                const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "").split('.').join("").trim();

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