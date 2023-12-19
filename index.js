const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({headless: false, devtools: true});
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://www.streak.tech/');


    let deserializedStorage = {
        "public_token": "BfdHWP551FmJuBjW4TuKQQJavV1v8jzP",
        "token": "ajJ5c1AyMVkxOXB2UWdvdTRSUTJUU2FxaVdiNVUzeE80aEhDUExCMElzaDVmSUVmS05hdXk3UHNmQ211ZUczcQ==",
        "id": "NmlzeXdvdnFjYmYxZHA3bDNyYTJvYXRmMHc1d2JvOHc=",
        "broker": "zerodha",
        "today": "27/10/2023"
    };
    // const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    // console.log(localStorage)

    await page.evaluate(deserializedStorage => {
        for (const key in deserializedStorage) {
            localStorage.setItem(key, deserializedStorage[key]);
        }

    }, deserializedStorage);

    // page.on('request', async (request) => {
    //     console.log( request.url(),'request.url()')
    // })
    page.on('load', async (response) => {
        const url = await page.url();
        console.log(url, 'url')
        // console.log( response.url(),'response.url()')

        await page.waitForSelector('#screen_header p', {timeout: 10000000});
        const header = await page.innerText('#screen_header p')
        console.log(header)
        if (header === 'Deployed') {
            // if(header.length != 0 && response.url().includes('deployed_count2')){
            // let i=0;
            const link = await page.$$('section div div div div div button p');
            console.log(link.length)
            for(let i=0;i<link.length;i++) {
                var txt = 'div [role="row"]:nth-of-type(' + (i + 1) + ') button p'
                console.log(txt)
                const txtm = await page.innerText(txt)
                await page.click(txt)
                await page.waitForSelector('.modal-slide');
                const txtp = await page.innerText('.modal-slide > div > div > div > p')
                if (txtm + (' Orderlog') === txtp) {
                    console.log(txtm)
                    const [download] = await Promise.all([
                        page.waitForEvent('download'),
                        page.locator('.modal-slide button .icon-arrow_down_filled').click(),
                    ]);
                    console.log(await download.path());
                    await download.saveAs('src/'+txtm + '.csv');
                    await page.click('.modal-slide button .icon-backward_head')
                }
            }
        }

        //console.log(response.url())
        //console.log(response.url().includes('tab=paper'),response.url())
        // if (response.url().includes('tab=paper')) {
        //     console.log( response.status())
        //  document.cookie = "token=REVxY3lJdmRpSlI2ekRjTkZkZHNqcUtaOWdVM3RYeDVJYTFsNW1JY1JCWnhMWDFLRmExT0Z3a0YzZGpudm1EWQ=="; document.cookie = "id=aTVsczE4bnZrbGtlMnozNmdlY3c3Y3F5anVjOHh2ZnQ=="

        // }
    })


    //  await page.goto('https://www.streak.tech/algos?tab=paper');


})();
