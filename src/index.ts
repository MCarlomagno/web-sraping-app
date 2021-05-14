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

    const scrapAll = true;
    const selectedCategory: Category = Category.JEANS;
		const selectedPage: string = Pages.FARFETCH;

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
		// TODO: do something more efficient here
    for (const page of Object.values(Pages)) {
      for (const category of Object.values(Category)) {
        try {
					console.log(`Running Category: "${category}", Page: "${page}"...`);
          await this.scrapSinglePage(page, category);
        } catch (e) {
          console.log(`An error ocurred scraping "${category}" category in "${page}" page.`);
          console.log(e);
        }
				console.log(
					`Finished Category:
					"${category}", Page: "${page}"...`
				);
      }
    }
  };

  scrapSinglePage = async (
    pageName: string,
    category: Category
  ) => {
    const pageData: PageData = sourceData[pageName][category];
    if (pageData) {
      const pageSelected: BasePage = this.getPageByName(pageName);
      await pageSelected.scrap(this.browser, category, pageData);
    } else {
      console.log(`The category "${category}" does not exist in "${pageName}" page.`);
    }
  };
}

const main = new Main();
main.run();
