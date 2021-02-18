import { parse } from "json2csv";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import fs from 'fs';
import { autoScroll } from "../utils/autoscroll";
import { getPage } from "../utils/browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { Category } from "../enum/category.enum";
import { ItemData } from "../models/item-data.model";

export class MaxMara {
    static async scrap(browser: Browser, category: Category) {

        // CSV definitions.
        const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
        const content: ItemData[] = [];
        const opts = { fields };
        let pageNumber = 1;

        console.log("pages quantity: " + this.getPagesQuantity(category));
        console.log("page url: " + this.getUrl(category, pageNumber));
        const startTime = new Date();

        while(pageNumber <= this.getPagesQuantity(category)) {
            try {
                console.log("scraping page number: " + pageNumber);
                const start = new Date();
                const url = this.getUrl(category, pageNumber);

                // loads the current page in browser
                const catalogPage: Page = await getPage(browser, url);
                await autoScroll(catalogPage);

                content.push(... await this.scrapeMaxMaraCatalog(catalogPage, category));
                await catalogPage.close();

                // save the data in a csv
                // in data folder.
                const csv = parse(content, opts);
                fs.writeFileSync(this.getFilePath(category), csv);

                // displays the page duration.
                const end = new Date();
                const pageDuration = (end.valueOf() - start.valueOf()) / 1000;
                console.log("page duration in seconds: " + pageDuration);
            } catch (err) {
                console.error(err);
            }
            pageNumber++;
        }
        // To display total duration
        const endTime = new Date();
        const duration = (endTime.valueOf() - startTime.valueOf()) / 1000;
        console.log("duration in seconds: " + duration);
    }

    private static getUrl(category: Category, pageNumber: number) {
        let url = "";

        if(category === Category.SKIRTS) url = `https://world.maxmara.com/clothing/skirts?page=${pageNumber}`;
        else if(category === Category.TOPS) url = `https://world.maxmara.com/clothing/womens-tops-and-t-shirts?page=${pageNumber}`;
        else if(category === Category.PANTS) url = `https://world.maxmara.com/clothing/womens-trousers-and-jeans?page=${pageNumber}`;
        else if(category === Category.DRESSES) url = `https://world.maxmara.com/clothing/womens-dresses?page=${pageNumber}`;
        else if(category === Category.BLAZERS) url = `https://world.maxmara.com/coats-and-jackets/womens-jackets-and-blazers?page=${pageNumber}`;
        else if(category === Category.ACCESSORIES) url = `https://world.maxmara.com/accessories?page=${pageNumber}`;
        else if(category === Category.OUTWEAR) url = `https://world.maxmara.com/coats-and-jackets/womens-down-jackets-and-padded-jackets?page=${pageNumber}`;
        else if(category === Category.KNITWEAR) url = `https://world.maxmara.com/clothing/womens-knitwear-sweaters?page=${pageNumber}`;
        else if(category === Category.SHOES) url = `https://world.maxmara.com/bags-and-shoes/womens-shoes?page=${pageNumber}`;
        else if(category === Category.JEANS) url = `https://world.maxmara.com/search?text=jeans`; // no pagination.
        else throw new Error("Not implemented.");

        return url;
    }

    private static getPagesQuantity(category: Category) {
        let pagesQuantity = 1;

        if(category === Category.SKIRTS) pagesQuantity = 2;
        else if (category === Category.TOPS) pagesQuantity = 2;
        else if (category === Category.PANTS) pagesQuantity = 7;
        else if (category === Category.DRESSES) pagesQuantity = 7;
        else if (category === Category.BLAZERS) pagesQuantity = 4;
        else if (category === Category.ACCESSORIES) pagesQuantity = 1;
        else if (category === Category.OUTWEAR) pagesQuantity = 2;
        else if (category === Category.KNITWEAR) pagesQuantity = 7;
        else if (category === Category.SHOES) pagesQuantity = 1;
        else if (category === Category.JEANS) pagesQuantity = 1; // no pagination
        else pagesQuantity = 1;

        return pagesQuantity;
    }

    private static getFilePath(category: Category) {
        let path = "";

        if(category === Category.SKIRTS) path = "data/maxmara/data-skirts-maxmara.csv";
        else if(category === Category.TOPS) path = "data/maxmara/data-tops-maxmara.csv";
        else if(category === Category.PANTS) path = "data/maxmara/data-pants-maxmara.csv";
        else if(category === Category.DRESSES) path = "data/maxmara/data-dresses-maxmara.csv";
        else if(category === Category.BLAZERS) path = "data/maxmara/data-blazers-maxmara.csv";
        else if(category === Category.ACCESSORIES) path = "data/maxmara/data-accessories-maxmara.csv";
        else if(category === Category.OUTWEAR) path = "data/maxmara/data-outwear-maxmara.csv";
        else if(category === Category.KNITWEAR) path = "data/maxmara/data-knitwear-maxmara.csv";
        else if(category === Category.SHOES) path = "data/maxmara/data-shoes-maxmara.csv";
        else if(category === Category.JEANS) path = "data/maxmara/data-jeans-maxmara.csv";
        else path = "data/maxmara-default.csv";

        return path;
    }

    // scraps catalog page
    static async scrapeMaxMaraCatalog(page: Page, category: Category) {
        const content: ItemData[] = await page.evaluate(async (category) => {
            const items = Array.from(document.querySelectorAll('a[class="product-card"]'));
            const itemsData: ItemData[] = [];
            for(const item of items) {
                const itemUrl = (item as HTMLLinkElement).href;

                // In some cases the item doesnt
                // have the 2nd picture.
                const images = item.querySelectorAll('img');
                let pictureURL = "";


                if(images && images.length > 0) {
                    // in case of accessories or one-image item
                    // assign the first image.
                    if(category === "ACCESSORIES" || category === "SHOES" || images.length < 2) {
                        pictureURL = (images[0] as HTMLImageElement).src;
                    } else {
                        pictureURL = (images[1] as HTMLImageElement).src;
                    }
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

                if(!modelElement || model === "sum_base") {
                    // if the model name does not exist,
                    // then pass without saving.
                    continue;
                }

                const title = `${brand}(${model})`;

                // no price displayed
                const cost = "";
                const currency = "";

                const newRow: ItemData = {
                    title,
                    url: itemUrl,
                    cost,
                    currency,
                    pictureURL
                };
                itemsData.push(newRow);
            }
            return itemsData;
        }, category);
        return content;
    }

}



