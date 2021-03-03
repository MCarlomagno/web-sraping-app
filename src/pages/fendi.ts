import { BasePage } from "../core/base-page";
import { ItemData } from "../models/item-data.model";
import { ScrapingParameters } from "../models/scrape-catalog-params";

export class Fendi extends BasePage{

    async scrapeCatalog(params: ScrapingParameters): Promise<ItemData[]> {
        const content = await params.page.evaluate(async () => {
            const items = Array.from(document.querySelectorAll('div[role="listitem"]'));
            const itemsData = [];
            for(const item of items) {
                try {
                    const itemUrl = (item.querySelector('a') as HTMLAnchorElement).href;
                    const pictureURL = item.querySelector('img').src;
                    const title = (item.querySelector('[class="description"]') as HTMLElement).innerText;
                    const price = (item.querySelector('span[class="price "]') as HTMLElement).innerText;
                    const cost = price.match(/\d+[\,\d+]+(\.\d+)/g).join('');
                    const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "").split(".").join("");

                    const newRow = {
                        title,
                        url: itemUrl,
                        cost,
                        currency,
                        pictureURL
                    };
                    itemsData.push(newRow);
                }
                catch (err) {
                    console.log(err);
                }
            }
            return itemsData;
        });

        return content;
    }

}