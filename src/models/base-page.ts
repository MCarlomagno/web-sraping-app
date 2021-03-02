import { parse } from "json2csv";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { autoScroll } from "../utils/autoscroll";
import { getPage } from "../utils/browser";
import { Category } from "../enum/category.enum";
import { ItemData } from "./item-data.model";
import { PageData } from "./page-data";
import fs from 'fs';
import { ScrapingParameters } from "./scrape-catalog-params";

export abstract class BasePage {

    // CSV definitions.
    content: ItemData[] = [];
    opts = { fields: ['title', 'url', 'cost', 'currency', 'pictureURL'] };

    async scrap(browser: Browser, category: Category, pageData: PageData) {
        let pageNumber = 1;

        console.log("pages quantity: " + pageData.pagesQuantity);
        console.log("page urls: " + pageData.urls);

        this.beforeScraping(browser);

        while(pageNumber <= pageData.pagesQuantity) {
            try {
                const startTime = new Date();

                // if require pagination
                const urls = pageData.urls;

                for(let url of urls) {
                    if(pageData.hasPagination) {
                        url = url + pageNumber;
                    }

                    // loads the current page in browser
                    const page: Page = await getPage(browser, url);

                    // if the page requires scroll to
                    // load resources.
                    if(pageData.requireAutoScroll) {
                        await autoScroll(page);
                    }

                    this.content.push(... await this.scrapeCatalog({page, browser, category}));
                    await page.close();

                    // save the data in a csv
                    // in data folder.
                    const csv = parse(this.content, this.opts);
                    fs.writeFileSync(pageData.filePath, csv);


                    // To display every
                    // page duration.
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
    beforeScraping(browser: Browser): Promise<void> {return;};
}