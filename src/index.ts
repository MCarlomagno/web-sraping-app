import puppeteer from 'puppeteer';
import { Category } from './enum/category.enum';
import { Pages } from './enum/pages.enum';
import { Bershka } from './pages/bershka';
import { Farfetch } from './pages/farfetch';
import { MaxMara } from './pages/max-mara';
import { RiverIsland } from './pages/river-island';
import { SteveMadden } from './pages/steve-madden';

(async () => {

    // to measure time.
    const start = new Date();
    const browser = await puppeteer.launch();

    const selectedPage: number = Pages.BERSHKA;
    const selectedCategory: Category = Category.PANTS;

    switch(selectedPage) {
        case Pages.FARFETCH: {
            await Farfetch.scrap(browser, selectedCategory);
            break;
        }
        case Pages.RIVERISLAND: {
           await RiverIsland.scrap(browser, selectedCategory);
           break;
        }
        case Pages.MAXMARA: {
            await MaxMara.scrap(browser, selectedCategory);
            break;
        }
        case Pages.STEVEMADDEN: {
            await SteveMadden.scrap(browser, selectedCategory);
            break;
        }
        case Pages.BERSHKA: {
            await Bershka.scrap(browser, selectedCategory);
            break;
        }
        default: {
           console.log("no option selected")
           break;
        }
    }

    const end = new Date();
    const duration = (end.valueOf() - start.valueOf()) / 1000;
    console.log("total duration in seconds: " + duration);

    await browser.close();
})();
