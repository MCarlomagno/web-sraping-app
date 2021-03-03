import { getPage } from "../utils/browser";
import { Category } from "../enum/category.enum";
import { ItemData } from "../models/item-data.model";
import { BasePage } from "../core/base-page";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { ScrapingParameters } from "../models/scrape-catalog-params";

export class RiverIsland extends BasePage {

    async scrapeCatalog(params: ScrapingParameters): Promise<ItemData[]> {
        // extracts the urls
        const itemUrls = await this.getCatalogItems(params.page);

        // iterates in each one of the
        // urls previously extracted from catalog.
        const itemsData = [];
        for(const itemUrl of itemUrls) {
            try {
                const itemPage: Page = await getPage(params.browser, itemUrl);
                const itemData = await this.scrapeItem(itemPage, params.category);
                await itemPage.close();
                itemData.url = itemUrl;
                itemsData.push(itemData);
            } catch (err) {
                console.log(err);
            }

        }
        return itemsData;
    }

    private async getCatalogItems(page:Page) {
        const urls = await page.evaluate(async () => {
            const items: HTMLLinkElement[] = Array.from(document.querySelectorAll('a[data-qa="product-card"]'));
            return items.map(i => i.href);
        });
        return urls;
    }

    // scraps
    private async scrapeItem(page: Page, category: Category) {
        const content: ItemData = await page.evaluate(async (category) => {
            let pictureURLIndex = document.querySelectorAll('li[role="presentation"]').length - 1;

            // in cases of no image, accessories or shoes, takes the
            // first image.
            if(!document.querySelector(`img[data-index="${pictureURLIndex}"]`) || category === "accessories" || category === "shoes") {
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

