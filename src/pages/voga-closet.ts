import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { getPage } from '../utils/browser';
import { BasePage } from '../core/base-page';
import { ScrapingParameters } from '../models/scrape-catalog-params';
import { Category } from '../enum/category.enum';
import { ItemData } from '../models/item-data.model';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { PageData } from '../models/page-data';
import { delay } from '../utils/delay';

export class VogaCloset extends BasePage{

    async scrapeCatalog(params: ScrapingParameters) {
        const itemUrls = await this.getCatalogItems(params.page);
        console.log('item urls');
        console.log(itemUrls);

        const itemsData: ItemData[] = [];
        for(const itemUrl of itemUrls) {
            try {
                const itemPage: Page = await getPage(params.browser, itemUrl);
                const itemData = await this.scrapeItem(itemPage);
                await itemPage.close();
                itemData.url = itemUrl;
                itemsData.push(itemData);
            } catch (err) {
                console.log(err);
            }

        }
        return itemsData;
    }

    private async getCatalogItems(page: Page) {
        await page.screenshot({path: 'data/vogacloset/screen.png'});
        const urls = await page.evaluate(async () => {

            // Ensures to close the select country popup
            const countries: HTMLElement[] = Array.from(document.querySelectorAll('[class="country-popup_store-switcher__link__3rS9P"]'));
            if(countries.length > 0) {
                const last: HTMLElement = countries[countries.length - 1];
                last.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const catalogSection = document.querySelector('section[class="category_products__72pfE"]');
            const items: HTMLAnchorElement[] = Array.from(catalogSection.querySelectorAll('a[class="item_productc__preview-link__zw0Vk"]'));
            return items.map(i => i.href);
        });
        return urls;
    }

    private async scrapeItem(page: Page) {
        const content: ItemData = await page.evaluate(async () => {
            const images = Array.from(document
                            .querySelector('[class="product-thumbnails_product__thumbnails__1Y4e1"]')
                            .querySelectorAll('img'));

            // selects the last image
            const pictureURL = images[images.length - 1].src;
            const title = document.querySelector('h1').innerText;

            let price;
            let priceElement: HTMLElement = document.querySelector('[class="product-info_product__price-regular__30UQx"]');

            // If the price element does not exist,
            // then is for sales price.
            if(priceElement) {
                price = priceElement.innerText;
            }else {
                priceElement = document.querySelector('[class="product-info_product__price-special__2mBeG"]');
                price = priceElement.innerText.split('(')[0].trim();
            }

            const cost = price.match(/\d+(\.\d+)/g).join('');
            const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");

            const itemData: ItemData = {
                pictureURL,
                title,
                cost,
                currency,
                url: ""
            };
            return itemData;
        });
        return content;
    }


}