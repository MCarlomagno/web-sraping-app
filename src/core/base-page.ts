import { parse } from "json2csv";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { autoScroll } from "../utils/autoscroll";
import { getPage } from "../utils/browser";
import { Category } from "../enum/category.enum";
import { ItemData } from "../models/item-data.model";
import { PageData } from "../models/page-data";
import fs from 'fs';
import { ScrapingParameters } from "../models/scrape-catalog-params";

export abstract class BasePage {
    content: ItemData[] = [];
    opts = { fields: ['title', 'url', 'cost', 'currency', 'pictureURL'] };

    async scrap(browser: Browser, category: Category, pageData: PageData) {
        let pageNumber = 1;

        console.log("pages quantity: " + pageData.pagesQuantity);
        console.log("page urls: " + pageData.urls);

        await this.beforeScraping(browser, pageData);

        while(pageNumber <= pageData.pagesQuantity) {
            try {
                const startTime = new Date();
                const urls = pageData.urls;

                for(let url of urls) {
                    if(pageData.hasPagination) {
                        url = url + pageNumber;
                    }

                    const page: Page = await getPage(browser, url);

                    if(pageData.requireAutoScroll) {
                        console.log("scrolling");
                        await autoScroll(page);
                    }

                    this.content.push(... await this.scrapeCatalog({page, browser, category}));
                    await page.close();

                    const csv = parse(this.content, this.opts);
                    fs.writeFileSync(pageData.filePath, csv);

                    const endTime = new Date();
                    const pageDuration = (endTime.valueOf() - startTime.valueOf()) / 1000;
                    console.log("page duration in seconds: " + pageDuration);
                }
            } catch (err) {
                console.error(err);
            }

            pageNumber++;
        }
    }

    abstract scrapeCatalog(params: ScrapingParameters): Promise<ItemData[]>;
    beforeScraping(browser: Browser, pageData: PageData): Promise<void> {return;};
}