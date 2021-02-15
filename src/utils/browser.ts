// recieves the browser and the
// url and returns the page.
export async function getPage(browser: any, url: string) {
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1200,
        height: 800
    });
    return page;
}