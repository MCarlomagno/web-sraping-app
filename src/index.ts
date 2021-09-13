import { Category } from "./enum/category.enum";
import { Pages } from "./enum/pages.enum";
import { sourceData } from "./sources/source-data";
import { PageData } from "./models/page-data";
import { Bershka } from "./pages/bershka";
import { Farfetch } from "./pages/farfetch";
import { Fendi } from "./pages/fendi";
import { MaxMara } from "./pages/max-mara";
import { RiverIsland } from "./pages/river-island";
import { SteveMadden } from "./pages/steve-madden";
import { ChiaraFerragni } from "./pages/chiara-ferragni";
import { HudaBeauty } from "./pages/huda-beauty";
import { launchPuppeteer } from "./utils/browser";
import { BasePage } from "./core/base-page";
import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";

class Main {

	private browser: Browser;

  public async run() {
    const start = new Date();
		this.browser = await launchPuppeteer();

    const scrapAll = false;
    const selectedCategory: Category = Category.JEANS;
		const selectedPage: string = Pages.CHIARAFERRAGNI;

    if (scrapAll) {
      await this.scrapAllPages();
    } else {
      await this.scrapSinglePage(selectedPage, selectedCategory);
		}

		await this.browser.close();

    const end = new Date();
    const duration = (end.valueOf() - start.valueOf()) / 1000;
    console.log("total duration in seconds: " + duration);
  }

  getPageByName = (pageName: string) => {
    switch (pageName) {
      case Pages.FARFETCH:
        return new Farfetch();
      case Pages.RIVERISLAND:
        return new RiverIsland();
      case Pages.MAXMARA:
        return new MaxMara();
      case Pages.STEVEMADDEN:
        return new SteveMadden();
      case Pages.BERSHKA:
        return new Bershka();
      case Pages.FENDI:
        return new Fendi();
      case Pages.CHIARAFERRAGNI:
        return new ChiaraFerragni();
      case Pages.HUDABEAUTY:
        return new HudaBeauty();
      default:
        throw Error("no page selected");
    }
  };

  scrapAllPages = async () => {
    for (const page of Object.values(Pages)) {
      await Promise.all([
        this.scrapSinglePage(page, Category.ACCESSORIES).catch(error => error ),
				this.scrapSinglePage(page, Category.BEAUTY).catch(error => error ),
				this.scrapSinglePage(page, Category.BLAZERS).catch(error => error ),
				this.scrapSinglePage(page, Category.DRESSES).catch(error => error ),
				this.scrapSinglePage(page, Category.JEANS).catch(error => error ),
				this.scrapSinglePage(page, Category.KNITWEAR).catch(error => error ),
				this.scrapSinglePage(page, Category.OUTWEAR).catch(error => error ),
				this.scrapSinglePage(page, Category.PANTS).catch(error => error ),
				this.scrapSinglePage(page, Category.SHOES).catch(error => error ),
				this.scrapSinglePage(page, Category.SKIRTS).catch(error => error ),
				this.scrapSinglePage(page, Category.TOPS).catch(error => error ),
			]);
    }
  };

  scrapSinglePage = async (
    pageName: string,
    category: Category
  ) => {
		console.log(`Scraping Category: "${category}", Page: "${pageName}"...`)
    const pageData: PageData = sourceData[pageName][category];
    if (pageData) {
			try {
				const pageSelected: BasePage = this.getPageByName(pageName);
				await pageSelected.scrap(this.browser, category, pageData, pageName);
			} catch(err) {
				console.log(`An error ocurred scraping "${category}" category in "${pageName}" page.`);
			}

    } else {
      console.log(`The category "${category}" does not exist in "${pageName}" page.`);
    }
  };
}

const main = new Main();
main.run();
