import { ItemData } from "../models/item-data.model";
import { ScrapingParameters } from "../models/scrape-catalog-params";
import { BasePage } from "../core/base-page";
import { autoScroll } from "../utils/autoscroll";
import { getPage } from "../utils/browser";
import { Category } from "../enum/category.enum";
import { getCategoryName } from "../utils/format";
import { getBrandName } from "../utils/format";
import { Pages } from "../enum/pages.enum";

export class ChiaraFerragni extends BasePage {
  async scrapeCatalog(params: ScrapingParameters): Promise<ItemData[]> {
    await autoScroll(params.page);

    const urls = await params.page.evaluate(async () => {
      const items = Array.from(
        document.querySelector('div[id="gf-products"]').children
      ).filter(
        (item) => !Array.from(item.classList).includes("product-item--sold-out")
      );
      const urls = [];
      for (const item of items) {
        urls.push(item.querySelector("a").href);
      }
      return urls;
    });

    const content = [];
    for (const url of urls) {
      const itemPage = await getPage(params.browser, url);
      const itemData = await itemPage.evaluate(async () => {
        const title = (document.querySelector(
          '[class="product__title"]'
        ) as HTMLElement).innerText;
        const pictureURL =
          "https:" +
          document
            .querySelector("img[data-product-image]")
            .getAttribute("data-zoom-touch");
        const price = (document.querySelector(
          "[data-product-price]"
        ) as HTMLElement).innerText;
        const cost = price ? price.match(/\d+(\,\d+)/g).join("") : "";
        const currency = price
          ? price
              .match(/[^\d,]/g)
              .join("")
              .replace(/\s+/, "")
          : "";
        const data: ItemData = { title, url: "", pictureURL, cost, currency };
        return data;
      });
      itemData.url = url;
      content.push(itemData);
    }

    this.upload(content, params.category, Pages.CHIARAFERRAGNI);

    return content;
  }

  async upload(items: ItemData[], category: Category, pageName: string) {
    const categoryName = getCategoryName(category);
    const brandName = getBrandName(pageName);
    items.forEach((item) => {
      item.brandName = brandName;
      item.categoryName = categoryName;
    });
    await this.api.uploadItems(items);
  }
}
