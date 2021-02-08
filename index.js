const puppeteer = require('puppeteer');

(async () => {
    let itemUrl = 'https://www.farfetch.com/ae/shopping/women/the-attico-asymmetrical-wrap-dress-item-16149517.aspx?storeid=9359'; 
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    console.log("loading page...");
    await page.goto(itemUrl, { waitUntil: 'networkidle2' });
    console.log("waiting evaluation...");
    let dataFromPage = await page.evaluate(async () => {
        let title = document.querySelector("#bannerComponents-Container > h1").children[0].innerText;
        let subtitle = document.querySelector("#bannerComponents-Container > h1").children[1].innerText;
        let priceAndCurrency = document.querySelector('[data-tstid=priceInfo-original]').innerText;
        let [currency, price] = priceAndCurrency.split(' ');

        let imgUrl = document.querySelector('img[data-test="imagery-img0"]').src;

        return {
            title,
            subtitle,
            currency,
            price,
            imgUrl
        };
    });

    console.log(dataFromPage);
    await browser.close();
})();