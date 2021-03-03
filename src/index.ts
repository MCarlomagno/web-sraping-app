import puppeteer from 'puppeteer';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { Category } from './enum/category.enum';
import { Pages } from './enum/pages.enum';
import { sourceData } from './sources/source-data';
import { PageData } from './models/page-data';
import { Bershka } from './pages/bershka';
import { Farfetch } from './pages/farfetch';
import { Fendi } from './pages/fendi';
import { MaxMara } from './pages/max-mara';
import { RiverIsland } from './pages/river-island';
import { SteveMadden } from './pages/steve-madden';
import { ChiaraFerragni } from './pages/chiara-ferragni';
import { HudaBeauty } from './pages/huda-beauty';

(async () => {

    const start = new Date();
    const browser = await puppeteer.launch();

    const scrapAll = true;
    const selectedCategory: Category = Category.BEAUTY;
    const selectedPage: string = Pages.FARFETCH;

    if(scrapAll) {
        await scrapAllPages();
    }else {
        await scrapSinglePage(selectedPage, selectedCategory);
    }

    async function scrapAllPages() {
        const pages = Object.values(Pages);
        const categories = Object.values(Category);
        for(const page of pages) {
            for(const category of categories) {
                console.log(`Running Category: "${category}", Page: "${page}"...`)
                await scrapSinglePage(page, category);
                console.log(`Finished Category: "${category}", Page: "${page}"...`)
            }
        }
    }

    async function scrapSinglePage(page: string, category: Category) {

        const pageData: PageData = sourceData[page][category];

        if(pageData) {
            switch(selectedPage) {
                case Pages.FARFETCH: {
                    const page = new Farfetch();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                case Pages.RIVERISLAND: {
                    const page = new RiverIsland();
                    await page.scrap(browser, category, pageData);
                   break;
                }
                case Pages.MAXMARA: {
                    const page = new MaxMara();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                case Pages.STEVEMADDEN: {
                    const page = new SteveMadden();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                case Pages.BERSHKA: {
                    const page = new Bershka();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                case Pages.FENDI: {
                    const page = new Fendi();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                case Pages.CHIARAFERRAGNI: {
                    const page = new ChiaraFerragni();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                case Pages.HUDABEAUTY: {
                    const page = new HudaBeauty();
                    await page.scrap(browser, category, pageData);
                    break;
                }
                default: {
                   console.log("no option selected")
                   break;
                }
            }
        } else {
            console.log(`The category "${category}" does not exist in "${page}" page.`);
        }

    }


    const end = new Date();
    const duration = (end.valueOf() - start.valueOf()) / 1000;
    console.log("total duration in seconds: " + duration);

    await browser.close();
})();
