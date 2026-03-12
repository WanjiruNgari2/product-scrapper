const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp'
  });

  const page = await browser.newPage();
  await page.goto(
    'file:///D:/PYTHON-MINI-PROJECTS/YTSERIES/PUPPYTEER/jumia2/pageone Jumia Kenya.html'.replace(/ /g, '%20'),
    { waitUntil: 'domcontentloaded' }  // or 'networkidle0'
  );
  // await page.screenshot({ path: 'example.png' });

  // 6.create an arr of items to update and add to:
let items = [] 

  let isBtnDisabled = false;
  // while (!isBtnDisabled) {
    await page.waitForSelector('.core');

    //ACCESS THE PRODUCT INFO:
    //1. get the box with all products
    const productHandles = await page.$$('article.prd');


    //2.loop thru all products to get the title:
    for (const productHandle of productHandles) {

      let title = null;
      let price = null;
      let img = null;
      let rating = null;
      let reviews = null;


      //3.loop thru all products to get the title:
      try {
        title = await productHandle.$eval('.name',
          el => el.textContent.trim() );
      } catch (error) { console.log('error occurred in title') }

      try {
        //4.loop thru all products to get the price:
        price = await productHandle.$eval('.prc',
          el => el.textContent.trim() );
        } catch (error) { console.log('error occurred in price') }

      //5.loop thru all products to get the image
      try {
        img = await productHandle.$eval('img.img, img[src], .img, [data-src], .img-c, img',
          el.getattribute('data-src') || el.src);
      } catch (error) { console.log('error occurred in image'); }

      //5.loop thru all products to get the ratings
            try {
              rating = await productHandle.$eval('.stars._s',
              el => el.textContent.trim());
      } catch (error) { console.log('error occurred in ratings') }

//5.loop thru all products to get the reviews
            try {
              reviews = await productHandle.$eval('.rev',
  el => el.textContent.trim()); 
     } catch (error) { console.log('error occurred in reviews') }


      //7.add items to the arr created
      if (title ) {
        // items.push({ title, price, img })


        // 9.add the results to results.csv file
        fs.appendFile(
          'results.csv',
          `${title}, ${price}, ${img}, ${rating}, ${reviews}\n`,
          function (err) {
            if (err) throw err;
            // console.log('saved info!');

          });

      }



    }
    //8. PAGINATION PART:
    // await 30secs to find selector until its vsisble to the page
    // await page.waitForSelector(".pg", { visible: true });
    // const is_disabled = await page.$('span.pg._act') !== null;

    // isBtnDisabled = is_disabled;
    // if (!is_disabled) {
    //   await page.click('span.pg._act');
    //   page.waitForNavigation(); //

    // }

  }


  console.log(items.length)
  console.log(items)

  await browser.close();
})();



