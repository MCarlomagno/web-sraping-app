import puppeteer from 'puppeteer';
import { parse } from 'json2csv';
import { autoScroll } from'./utils/autoscroll';
import {scrapeItem, scrapeCatalog} from './utils/scraper';
import { getPage } from './utils/browser';
import fs from 'fs';

(async () => {

    // CSV definitions.
    const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
    const content = [];
    const opts = { fields };

    // to measure time.
    const start = new Date();

    let pageNumber = 1;

    const browser = await puppeteer.launch();

    while(pageNumber <= 41) {
        const url = `https://www.farfetch.com/ae/shopping/women/skirts-1/items.aspx?page=${pageNumber}&view=90`;
        console.log("scraping page number: " + pageNumber);
        try {
            const startTime = new Date();

            // loads the current page in browser
            // scrolls and collects and collects the data
            const page = await getPage(browser, url);
            await autoScroll(page);
            content.push(...await scrapeCatalog(page));
            await page.close();

            // save the data in a csv
            // at the project root.
            const csv = parse(content, opts);
            fs.writeFileSync('data/data-skirts-farfetch.csv', csv);

            // To display every
            // page duration
            const endTime = new Date();
            const pageDuration = (endTime.valueOf() - startTime.valueOf()) / 1000;
            console.log("page duration in seconds: " + pageDuration);
        } catch (err) {
            console.error(err);
        }

        pageNumber++;
    }



    const end = new Date();
    const duration = (end.valueOf() - start.valueOf()) / 1000;
    console.log("total duration in seconds: " + duration);

    await browser.close();
})();
