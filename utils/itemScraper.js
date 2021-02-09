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

module.exports = scrapeItem;

