// scraps the data for a
// given item page.
export async function scrapeItem(page: any) {
    const dataFromPage = await page.evaluate(async () => {
        const brand = (document.querySelector("#bannerComponents-Container > h1").children[0] as HTMLElement).innerText;
        const model = (document.querySelector("#bannerComponents-Container > h1").children[1] as HTMLElement).innerText;
        const title = `${brand}(${model})`;
        const price = (document.querySelector('[data-tstid=priceInfo-original]') as HTMLElement).innerText;
        const cost = price.match(/\d/g).join('');
        const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");
        const pictureURL = (document.querySelector('img[data-test="imagery-img0"]') as HTMLImageElement).src;

        return {
            title,
            cost,
            currency,
            pictureURL
        };
    });
    return dataFromPage;
}

export async function scrapeCatalog(page: any) {
    const content = await page.evaluate(async () => {
        const items = Array.from(document.querySelectorAll('a[itemprop="itemListElement"]'));
        const itemsData = [];
        for(const item of items) {
            const itemUrl = (item as HTMLLinkElement).href;
            const pictureURL = item.querySelector('img').src;
            const brand = item.querySelector('h3').innerText;
            const model = item.querySelector('p').innerText;
            const title = `${brand}(${model})`;
            const price = (item.querySelector('span[data-test="price"]') as HTMLElement).innerText;
            const cost = price.match(/\d/g).join('');
            const currency = price.match(/[^\d,]/g).join('').replace(/\s+/, "");

            const newRow = {
                title,
                url: itemUrl,
                cost,
                currency,
                pictureURL
            };
            itemsData.push(newRow);
        }
        return itemsData;
    });
    return content;
}

