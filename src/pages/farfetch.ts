import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Category } from '../enums/category.enum';

export class Farfetch {

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

        if(category === Category.SKIRTS) url = `https://www.farfetch.com/ae/shopping/women/skirts-1/items.aspx?page=${pageNumber}&view=90`;
        else if(category === Category.TOPS) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=135983`;
        else if(category === Category.PANTS) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=135981`;
        else if(category === Category.DRESSES) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=135979`;
        else if(category === Category.BLAZERS) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=136229`;
        else if(category === Category.ACCESSORIES) url = `https://www.farfetch.com/ae/shopping/women/accessories-all-1/items.aspx?page=${pageNumber}&view=90`;
        else if(category === Category.OUTWEAR) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=136228|136230|136231|136482|136235|136495|136491|136232|136233|136234|136490|136236|136237`;
        else if(category === Category.KNITWEAR) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=136245`;
        else if(category === Category.SHOES) url = `https://www.farfetch.com/ae/shopping/women/shoes-1/items.aspx?page=${pageNumber}&view=90&scale=274`;
        else if(category === Category.JEANS) url = `https://www.farfetch.com/ae/shopping/women/clothing-1/items.aspx?page=${pageNumber}&view=90&category=136043`;
        else url = `https://www.farfetch.com/ae/shopping/women/skirts-1/items.aspx?page=${pageNumber}&view=90`;

        return url;
    }

    private static getPagesQuantity(category: Category) {
        let pagesQuantity = 1;

        if(category === Category.SKIRTS) pagesQuantity = 41;
        else if (category === Category.TOPS) pagesQuantity = 194;
        else if (category === Category.PANTS) pagesQuantity = 73;
        else if (category === Category.DRESSES) pagesQuantity = 112;
        else if (category === Category.BLAZERS) pagesQuantity = 24;
        else if (category === Category.ACCESSORIES) pagesQuantity = 193;
        else if (category === Category.OUTWEAR) pagesQuantity = 40;
        else if (category === Category.KNITWEAR) pagesQuantity = 88;
        else if (category === Category.SHOES) pagesQuantity = 224;
        else if (category === Category.JEANS) pagesQuantity = 29;
        else pagesQuantity = 1;

        return pagesQuantity;
    }

    private static getFilePath(category: Category) {
        let path = "";

        if(category === Category.SKIRTS) path = "data/data-skirts-farfetch.csv";
        else if(category === Category.TOPS) path = "data/data-tops-farfetch.csv";
        else if(category === Category.PANTS) path = "data/data-pants-farfetch.csv";
        else if(category === Category.DRESSES) path = "data/data-dresses-farfetch.csv";
        else if(category === Category.BLAZERS) path = "data/data-blazers-farfetch.csv";
        else if(category === Category.ACCESSORIES) path = "data/data-accessories-farfetch.csv";
        else if(category === Category.OUTWEAR) path = "data/data-outwear-farfetch.csv";
        else if(category === Category.KNITWEAR) path = "data/data-knitwear-farfetch.csv";
        else if(category === Category.SHOES) path = "data/data-shoes-farfetch.csv";
        else if(category === Category.JEANS) path = "data/data-jeans-farfetch.csv";
        else path = "data/farfetch-default.csv";

        return path;
    }

    // scraps the data for a
    // given item page.
    private static async scrapeItem(page: any) {
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
    private static async scrapeCatalog(page: any) {
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

}