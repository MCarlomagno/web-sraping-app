const puppeteer = require('puppeteer');
const { parse } = require('json2csv');
const autoScroll = require('./utils/autoscroll');
const {scrapeItem, scrapeCatalog} = require('./utils/scraper');
const getPage = require('./utils/browser');
const fs = require('fs');

(async () => {

    // CSV definitions.
    const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
    const content = [];
    const opts = { fields };

    // to measure time.
    const start = new Date();

    let pageNumber = 1;
    
    let browser = await puppeteer.launch();

    while(pageNumber <= 1) {
        let url = `https://www.farfetch.com/ae/shopping/women/skirts-1/items.aspx?page=${pageNumber}&view=90`;
        console.log("scraping page number: " + pageNumber);
        try {
            let startTime = new Date();

            // loads the current page in browser
            // scrolls and collects and collects the data
            let page = await getPage(browser, url);
            await autoScroll(page);
            content.push(...await scrapeCatalog(page));
            await page.close();

            // save the data in a csv 
            // at the project root.
            const csv = parse(content, opts);
            fs.writeFileSync('data/data-skirts-farfetch.csv', csv);

            // To display every
            // page duration
            let endTime = new Date();
            let pageDuration = (endTime - startTime) / 1000;
            console.log("page duration in seconds: " + pageDuration);
        } catch (err) {
            console.error(err);
        }
        
        pageNumber++;
    }



    const end = new Date();
    const duration = (end - start) / 1000;
    console.log("total duration in seconds: " + duration);

    await browser.close();
})();
