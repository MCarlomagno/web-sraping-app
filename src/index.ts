import puppeteer from 'puppeteer';
import { Category } from './enums/category.enum';
import { Pages } from './enums/pages.enum';
import { Farfetch } from './pages/farfetch';
import { scrapeMaxMara } from './pages/max-mara';
import { scrapeRiverIsland } from './pages/river-island';

(async () => {

    // to measure time.
    const start = new Date();

    const browser = await puppeteer.launch();

    const selectedPage: number = Pages.FARFETCH;
    const selectedCategory: Category = Category.TOPS;

    switch(selectedPage) {
        case Pages.FARFETCH: {
            await Farfetch.scrap(browser, selectedCategory);
            break;
        }
        case Pages.RIVERISLAND: {
           await scrapeRiverIsland(browser);
           break;
        }
        case Pages.MAXMARA: {
            await scrapeMaxMara(browser);
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
