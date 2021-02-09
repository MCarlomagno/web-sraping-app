const puppeteer = require('puppeteer');
const { parse } = require('json2csv');
const autoScroll = require('./utils/autoscroll');
const scrapeItem = require('./utils/itemScraper');
const getPage = require('./utils/browser');
const fs = require('fs');

(async () => {

    // CSV definitions.
    const fields = ['title', 'url', 'cost', 'currency', 'pictureURL'];
    const content = [];
    const opts = { fields };

    // to measure time.
    const start = new Date();

    let url = 'https://www.farfetch.com/ae/shopping/women/skirts-1/items.aspx'; 
    let browser = await puppeteer.launch();

    console.log("loading items page...");
    let page = await getPage(browser, url);

    // gets the links from each item.
    let links = await page.evaluate(async () => {
        let links = Array.from(document.querySelectorAll('a[itemprop="itemListElement"]')).map(el => el.href);
        return links;
    });

    for(let itemUrl of links) {
        console.log(`scraping item: ${links.indexOf(itemUrl) + 1}/${links.length}`);
        try {
            let itemPage = await getPage(browser, itemUrl);
            await autoScroll(itemPage);
            const itemData = await scrapeItem(itemPage);
            await itemPage.close();

            const newRow = {
                title: itemData.title, 
                url: itemUrl,
                cost: itemData.cost,
                currency: itemData.currency,
                pictureURL: itemData.pictureURL
            };
            content.push(newRow);

            // save the data in a csv 
            // at the project root.
            const csv = parse(content, opts);
            fs.writeFileSync('data.csv', csv);
        } catch (err) {
            console.error(err);
        }
    }


    const end = new Date();
    const duration = (end - start) / 1000;
    console.log("total duration in seconds: " + duration);

    await browser.close();
})();
