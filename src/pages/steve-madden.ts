import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Category } from '../enum/category.enum';

export class SteveMadden {

    static async scrap(browser: Browser, category: Category) {
        // CSV definitions.
        const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
        const content = [];
        const opts = { fields };
        let pageNumber = 1;
        console.log("pages quantity: " + this.getPagesQuantity(category));
        console.log("page url: " + this.getUrl(category, pageNumber));
        while(pageNumber <= this.getPagesQuantity(category)) {
            const url = this.getUrl(category, pageNumber);
            console.log("scraping page number: " + pageNumber);
            try {
                const startTime = new Date();

                // loads the current page in browser
                // scrolls and collects and collects the data
                const page = await getPage(browser, url);
                await autoScroll(page);
                content.push(...await this.scrapeCatalog(page));
                await page.close();

                // save the data in a csv
                // in data folder.
                const csv = parse(content, opts);
                fs.writeFileSync(this.getFilePath(category), csv);

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

    private static getUrl(category: Category, pageNumber: number) {
        let url = "";

        // Only shoes and accessories are available.
        if(category === Category.ACCESSORIES) url = `https://stevemadden.me/collections/handbags-all-handbags?page=${pageNumber}`;
        else if(category === Category.SHOES) url = `https://stevemadden.me/collections/womens?page=${pageNumber}`;
        else throw new Error("Not implemented.");

        return url;
    }

    private static getPagesQuantity(category: Category) {
        let pagesQuantity = 1;

        // Only shoes and accessories are available.
        if (category === Category.ACCESSORIES) pagesQuantity = 4;
        else if (category === Category.SHOES) pagesQuantity = 5;
        else throw new Error("Not implemented.");

        return pagesQuantity;
    }

    private static getFilePath(category: Category) {
        let path = "";

        // Only shoes and accessories are available.
        if(category === Category.ACCESSORIES) path = "data/stevemadden/data-accessories-stevemadden.csv";
        else if(category === Category.SHOES) path = "data/stevemadden/data-shoes-stevemadden.csv";
        else throw new Error("Not implemented.");

        return path;
    }

    // scraps the data for a
    // given item page.
    private static async scrapeItem(page: any) {
        throw new Error("Not implemented.");
    }

    // scraps catalog page
    private static async scrapeCatalog(page: any) {
        const content = await page.evaluate(async () => {
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