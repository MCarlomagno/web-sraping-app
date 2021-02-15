import puppeteer from 'puppeteer';
import { Pages } from './enums/pages-enum';
import { scrapeFatfetch } from './pages/farfetch';
import { scrapeRiverIsland } from './pages/river-island';

(async () => {

    // to measure time.
    const start = new Date();

    const browser = await puppeteer.launch();

    const selectedPage: number = Pages.RIVERISLAND;

    switch(selectedPage) {
        case Pages.FARFETCH: {
            await scrapeFatfetch(browser);
           break;
        }
        case Pages.RIVERISLAND: {
           await scrapeRiverIsland(browser);
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
