import { ItemData } from "../models/item-data.model";
import { ScrapingParameters } from "../models/scrape-catalog-params";
import { BasePage } from "../core/base-page";
import { autoScroll } from "../utils/autoscroll";
import { delay } from "../utils/delay";


export class HudaBeauty extends BasePage {

    async scrapeCatalog(params: ScrapingParameters): Promise<ItemData[]> {
        console.log("scrolling...");
        await autoScroll(params.page);
        await delay(2000)

        console.log("scraping...");
        const content = await params.page.evaluate(async () => {
            const items = Array.from(document.querySelectorAll('[class="product h-100"]'));
            const allItemsData = [];
            for(const item of items) {
                try {
                    const url = (item.querySelector('[class="link"]') as HTMLAnchorElement).href;
                    const title = (item.querySelector('[class="link"]') as HTMLElement).innerText;

                    let pictureURL = (item.querySelector('picture > source') as HTMLSourceElement).srcset;
                    if(pictureURL.includes(',')) {
                        pictureURL = pictureURL.split(',')[0];
                        if(pictureURL.endsWith('2x') || pictureURL.endsWith('1x')) {
                            pictureURL = pictureURL.slice(0, -2).trim();
                        }
                    }

                    const price = (item.querySelector('[class="sales"]') as HTMLElement).innerText;
                    const cost = price? price.match(/\d+(\.\d+)/g).join(''): "";
                    const currency = price? price.match(/[^\d,]/g).join('').replace(/\s+/, "").split('.').join("").trim(): "";
                    const data: ItemData = {url, title, pictureURL, cost, currency};
                    allItemsData.push(data);
                }catch(err) {
                    console.log(err);
                }

            }
            return allItemsData;
        });

        return content;
    }

}

