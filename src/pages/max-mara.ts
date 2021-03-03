import { ItemData } from "../models/item-data.model";
import { BasePage } from "../core/base-page";
import { ScrapingParameters } from "../models/scrape-catalog-params";

export class MaxMara extends BasePage {

    // scraps catalog page
    async scrapeCatalog(params: ScrapingParameters) {
        const content: ItemData[] = await params.page.evaluate(async (category) => {
            const items = Array.from(document.querySelectorAll('a[class="product-card"]'));
            const itemsData: ItemData[] = [];
            for(const item of items) {
                const itemUrl = (item as HTMLLinkElement).href;

                // In some cases the item doesnt
                // have the 2nd picture.
                const images = item.querySelectorAll('img');
                let pictureURL = "";


                if(images && images.length > 0) {
                    // in case of accessories, shoes or one-image item
                    // assign the first image.
                    if(category === "accessories" || category === "shoes" || images.length < 2) {
                        pictureURL = (images[0] as HTMLImageElement).src;
                    } else {
                        pictureURL = (images[1] as HTMLImageElement).src;
                    }
                }

                // if the image is not https, we don't use it.
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
        }, params.category);
        return content;
    }

}



