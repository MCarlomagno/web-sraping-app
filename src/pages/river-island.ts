import { parse } from "json2csv";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import fs from 'fs';
import { getPage } from "../utils/browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { Category } from "../enum/category.enum";
import { ItemData } from "../models/item-data.model";

export class RiverIsland {
    // scraps farfetch skirts page.
    static async scrap(browser: Browser, category: Category) {

        // CSV definitions.
        const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
        const content: any[] = [];
        const opts = { fields };
        let pageNumber = 1;
        console.log("pages quantity: " + this.getPagesQuantity(category));
        console.log("page url: " + this.getUrl(category, pageNumber));

        while(pageNumber <= this.getPagesQuantity(category)) {
            const url = this.getUrl(category, pageNumber);
            console.log("scraping page number: " + pageNumber);

            try{
                const startTime = new Date();
                // loads the current page in browser
                const catalogPage: Page = await getPage(browser, url);

                // extracts the urls
                const itemUrls = await this.getCatalogItems(catalogPage);
                catalogPage.close();
                // iterates in each one of the
                // urls previously extracted from catalog.
                for(const itemUrl of itemUrls) {
                    try {
                        const itemPage: Page = await getPage(browser, itemUrl);
                        const itemData = await this.scrapeItem(itemPage, category);
                        await itemPage.close();
                        itemData.url = itemUrl;
                        content.push(itemData);
                    } catch (err) {
                        console.log(err);
                    }

                }

                // save the data in a csv
                // in data folder.
                const csv = parse(content, opts);
                fs.writeFileSync(this.getFilePath(category), csv);

                // To display duration
                const endTime = new Date();
                const duration = (endTime.valueOf() - startTime.valueOf()) / 1000;
                console.log("duration in seconds: " + duration);

            } catch (err) {
                console.error(err);
            }
            pageNumber++;
        }
    }

    private static getUrl(category: Category, pageNumber: number) {
        let url = "";

        if(category === Category.SKIRTS) url = `https://www.riverisland.com/search?keyword=skirts&f-division=women&pg=${pageNumber}`;
        else if(category === Category.TOPS) url = `https://www.riverisland.com/c/women/tops?pg=${pageNumber}`;
        else if(category === Category.PANTS) url = `https://www.riverisland.com/search?keyword=pants&search-submit=&f-cat=nightwear-and-slippers&f-cat=trousers&f-division=women&pg=${pageNumber}`;
        else if(category === Category.DRESSES) url = `https://www.riverisland.com/c/women/dresses?pg=${pageNumber}`;
        else if(category === Category.BLAZERS) url = `https://www.riverisland.com/c/women/coats-and-jackets?f-cat=blazers&pg=${pageNumber}`;
        else if(category === Category.ACCESSORIES) url = `https://www.riverisland.com/c/women/accessories?pg=${pageNumber}`;
        else if(category === Category.OUTWEAR) url = `https://www.riverisland.com/c/women/coats-and-jackets?pg=${pageNumber}`;
        else if(category === Category.KNITWEAR) url = `https://www.riverisland.com/search?keyword=knitwear&f-division=women&pg=${pageNumber}`;
        else if(category === Category.SHOES) url = `https://www.riverisland.com/search?keyword=shoes&search-submit=&f-division=women&pg=${pageNumber}`;
        else if(category === Category.JEANS) url = `https://www.riverisland.com/c/women/jeans?pg=${pageNumber}`;
        else throw new Error("Not implemented.");

        return url;
    }

    private static getPagesQuantity(category: Category) {
        let pagesQuantity = 1;

        if(category === Category.SKIRTS) pagesQuantity = 1;
        else if (category === Category.TOPS) pagesQuantity = 6;
        else if (category === Category.PANTS) pagesQuantity = 4;
        else if (category === Category.DRESSES) pagesQuantity = 2;
        else if (category === Category.BLAZERS) pagesQuantity = 1;
        else if (category === Category.ACCESSORIES) pagesQuantity = 2;
        else if (category === Category.OUTWEAR) pagesQuantity = 2;
        else if (category === Category.KNITWEAR) pagesQuantity = 5;
        else if (category === Category.SHOES) pagesQuantity = 6;
        else if (category === Category.JEANS) pagesQuantity = 3;
        else pagesQuantity = 1;

        return pagesQuantity;
    }

    private static getFilePath(category: Category) {
        let path = "";

        if(category === Category.SKIRTS) path = "data/data-skirts-riverisland.csv";
        else if(category === Category.TOPS) path = "data/data-tops-riverisland.csv";
        else if(category === Category.PANTS) path = "data/data-pants-riverisland.csv";
        else if(category === Category.DRESSES) path = "data/data-dresses-riverisland.csv";
        else if(category === Category.BLAZERS) path = "data/data-blazers-riverisland.csv";
        else if(category === Category.ACCESSORIES) path = "data/data-accessories-riverisland.csv";
        else if(category === Category.OUTWEAR) path = "data/data-outwear-riverisland.csv";
        else if(category === Category.KNITWEAR) path = "data/data-knitwear-riverisland.csv";
        else if(category === Category.SHOES) path = "data/data-shoes-riverisland.csv";
        else if(category === Category.JEANS) path = "data/data-jeans-riverisland.csv";
        else path = "data/riverisland-default.csv";

        return path;
    }

    private static async getCatalogItems(page:Page) {
        const urls = await page.evaluate(async () => {
            const items: HTMLLinkElement[] = Array.from(document.querySelectorAll('a[data-qa="product-card"]'));
            return items.map(i => i.href);
        });
        return urls;
    }

    // scraps
    private static async scrapeItem(page: Page, category: Category) {
        const content: ItemData = await page.evaluate(async (category) => {
            let pictureURLIndex = document.querySelectorAll('li[role="presentation"]').length - 1;

            // in cases of no image, accessories or shoes, takes the
            // first image.
            if(!document.querySelector(`img[data-index="${pictureURLIndex}"]`) || category === "ACCESSORIES" || category === "SHOES") {
                pictureURLIndex = 0;
            }

            // sometimes the src of the image is not
            // in src attribute, but instead in data-src.
            let pictureURL = (document.querySelector(`img[data-index="${pictureURLIndex}"]`) as HTMLImageElement).getAttribute("src");
            if(!pictureURL) {
                pictureURL = (document.querySelector(`img[data-index="${pictureURLIndex}"]`) as HTMLImageElement).getAttribute("data-src");
            }

            let price = (document.querySelector('div[class="price ui-headline"]') as HTMLElement).innerText;
            // if the product has a sales offer.
            if(document.querySelector('div[class="price ui-headline"]').children.length > 1) {
                // the second chid is the actual price.
                price = (document.querySelector('div[class="price ui-headline"]').children[1] as HTMLElement).innerText
            }

            const cost = price.match(/\d+(\.\d+)/g).join('');
            const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");
            const title = (document.querySelector('h2[class="product-title ui-product-title"]') as HTMLElement).innerText;

            const itemData: ItemData = {
                pictureURL,
                title,
                cost,
                currency,
                url: ""
            };
            return itemData;
        }, category);
        return content;
    }
}

