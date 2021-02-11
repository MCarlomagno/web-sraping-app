// scraps the data for a 
// given item page.
async function scrapeItem(page) {
    let dataFromPage = await page.evaluate(async () => {
        const brand = document.querySelector("#bannerComponents-Container > h1").children[0].innerText;
        const model = document.querySelector("#bannerComponents-Container > h1").children[1].innerText;
        const title = `${brand}(${model})`;
        const price = document.querySelector('[data-tstid=priceInfo-original]').innerText;
        const cost = price.match(/\d/g).join('');
        const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");
        const pictureURL = document.querySelector('img[data-test="imagery-img0"]').src;

        return {
            title,
            cost,
            currency,
            pictureURL
        };
    });
    return dataFromPage;
}

async function scrapeCatalog(page) {
    let content = await page.evaluate(async () => {
        const items = Array.from(document.querySelectorAll('a[itemprop="itemListElement"]'));
        let itemsData = [];
        for(let item of items) {
            const itemUrl = item.href;
            const pictureURL = item.querySelector('img').src;
            const brand = item.querySelector('h3').innerText;
            const model = item.querySelector('p').innerText;
            const title = `${brand}(${model})`;
            const price = item.querySelector('span[data-test="price"]').innerText;
            const cost = price.match(/\d/g).join('');
            const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");

            const newRow = {
                title: title, 
                url: itemUrl,
                cost: cost,
                currency: currency,
                pictureURL: pictureURL
            };
            itemsData.push(newRow);
        }
        return itemsData;
    });
    return content;
}

module.exports = {scrapeItem, scrapeCatalog};

