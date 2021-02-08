const puppeteer = require('puppeteer');

(async () => {

    const waitTillHTMLRendered = async (page, timeout = 30000) => {
        const checkDurationMsecs = 1000;
        const maxChecks = timeout / checkDurationMsecs;
        let lastHTMLSize = 0;
        let checkCounts = 1;
        let countStableSizeIterations = 0;
        const minStableSizeIterations = 3;
      
        while(checkCounts++ <= maxChecks){
          let html = await page.content();
          let currentHTMLSize = html.length; 
      
          let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
      
          console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
      
          if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
            countStableSizeIterations++;
          else 
            countStableSizeIterations = 0; //reset the counter
      
          if(countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
          }
      
          lastHTMLSize = currentHTMLSize;
          await page.waitFor(checkDurationMsecs);
        }  
    };

    let itemUrl = 'https://www.farfetch.com/ae/shopping/women/the-attico-asymmetrical-wrap-dress-item-16149517.aspx?storeid=9359'; 
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    console.log("loading page...");
    await page.goto(itemUrl, { waitUntil: 'networkidle2' });
    console.log("page loaded! waiting rendering...");
    await waitTillHTMLRendered(page);

    console.log("rendered! waiting evaluation...");
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