import { parse } from 'json2csv';
import { autoScroll } from'../utils/autoscroll';
import { getPage } from '../utils/browser';
import fs from 'fs';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Category } from '../enum/category.enum';
import { ItemData } from '../models/item-data.model';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { delay } from '../utils/delay';

export class Bershka {

    static async scrap(browser: Browser, category: Category) {
        // CSV definitions.
        const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
        const content = [];
        const opts = { fields };
        const pageNumber = 1;

        try {
            const startTime = new Date();

            // confirms the location in browser.
            await this.setLocation(browser);
            const url = this.getUrl(category, pageNumber);

            // loads the current page in browser
            // scrolls and collects and collects the data
            const page = await getPage(browser, url);

            console.log("Scrolling...");
            await autoScroll(page);
            // console.log("catalog after scroll");
            // await page.screenshot({path: 'data/bershka/screenshot_catalog.png'});

            content.push(...await this.scrapeCatalog(page, browser, category));
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
    }

    private static getUrl(category: Category, pageNumber: number) {
        let url = "";

        if(category === Category.SKIRTS) url = `https://www.bershka.com/ww/women/clothes/skirts-c1010193224.html?page=${pageNumber}`;
        else if(category === Category.TOPS) url = `https://www.bershka.com/ww/women/clothes/t-shirts-and-tops-c1010193217.html?page=${pageNumber}`;
        else if(category === Category.PANTS) url = `https://www.bershka.com/ww/women/clothes/trousers-c1010193216.html?page=${pageNumber}`;
        else if(category === Category.DRESSES) url = `https://www.bershka.com/ww/women/clothes/dresses-c1010193213.html?page=${pageNumber}`;
        else if(category === Category.BLAZERS) url = `https://www.bershka.com/ww/women/clothes/blazers-c1010205537.html?page=${pageNumber}`;
        else if(category === Category.ACCESSORIES) url = `https://www.bershka.com/ww/women/accessories-c1010193134.html?page=${pageNumber}`;
        else if(category === Category.OUTWEAR) url = `https://www.bershka.com/ww/women/clothes/jackets-and-coats-c1010193212.html?tipology=1010193261&page=${pageNumber}`;
        else if(category === Category.KNITWEAR) url = `https://www.bershka.com/ww/q/knitwear?page=${pageNumber}`;
        else if(category === Category.SHOES) url = `https://www.bershka.com/ww/women/shoes-c1010193192.html?page=${pageNumber}`;
        else if(category === Category.JEANS) url = `https://www.bershka.com/ww/women/clothes/jeans-c1010276029.html?page=${pageNumber}`;
        else throw new Error("Not implemented.");

        return url;
    }

    private static getPagesQuantity(category: Category) {
        let pagesQuantity = 1;

        // lazy loaded catalogs without pagination.
        if(category === Category.SKIRTS) pagesQuantity = 1;
        else if (category === Category.TOPS) pagesQuantity = 1;
        else if (category === Category.PANTS) pagesQuantity = 1;
        else if (category === Category.DRESSES) pagesQuantity = 1;
        else if (category === Category.BLAZERS) pagesQuantity = 1;
        else if (category === Category.ACCESSORIES) pagesQuantity = 1;
        else if (category === Category.OUTWEAR) pagesQuantity = 1;
        else if (category === Category.KNITWEAR) pagesQuantity = 1;
        else if (category === Category.SHOES) pagesQuantity = 1;
        else if (category === Category.JEANS) pagesQuantity = 1;
        else pagesQuantity = 1;

        return pagesQuantity;
    }

    private static getFilePath(category: Category) {
        let path = "";

        if(category === Category.SKIRTS) path = "data/bershka/data-skirts-bershka.csv";
        else if(category === Category.TOPS) path = "data/bershka/data-tops-bershka.csv";
        else if(category === Category.PANTS) path = "data/bershka/data-pants-bershka.csv";
        else if(category === Category.DRESSES) path = "data/bershka/data-dresses-bershka.csv";
        else if(category === Category.BLAZERS) path = "data/bershka/data-blazers-bershka.csv";
        else if(category === Category.ACCESSORIES) path = "data/bershka/data-accessories-bershka.csv";
        else if(category === Category.OUTWEAR) path = "data/bershka/data-outwear-bershka.csv";
        else if(category === Category.KNITWEAR) path = "data/bershka/data-knitwear-bershka.csv";
        else if(category === Category.SHOES) path = "data/bershka/data-shoes-bershka.csv";
        else if(category === Category.JEANS) path = "data/bershka/data-jeans-bershka.csv";
        else path = "data/bershka/bershka-default.csv";

        return path;
    }

    private static async setLocation(browser: Browser) {
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
    private static async scrapeCatalog(page: Page, browser: Browser, category: Category) {

        // gets the items urls.
        const urls = await page.evaluate(async (category) => {
            let items: any[] = [];

            // in case of Kniwear, the query changes.
            if(category !== "KNITWEAR"){
                items = Array.from(document.querySelectorAll('div[class="grid-card category-product-card"]'));
            }else {
                items = Array.from(document.querySelectorAll('div[class="grid-card search-product-card"]'));
            }

            const urls = items.map(item => (item.querySelector('a') as HTMLAnchorElement).href);
            return urls;
        }, category);

        const content: ItemData[] = [];
        for(const url of urls) {
            try {
                const startTime = new Date();

                console.log("scraping " + (urls.indexOf(url) + 1) + " of " + urls.length)
                const page = await getPage(browser, url);
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
    private static async scrapeItem(page: any): Promise<ItemData> {
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