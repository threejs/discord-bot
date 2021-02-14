import puppeteer from 'puppeteer';

/**
 * Fetches and crawls a url, executing a callback
 */
export const crawl = async (url, callback, args) => {
  if (!url) return null;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', request => {
      switch (request.resourceType()) {
        case 'image':
        case 'stylesheet':
          return request.abort();
        default:
          return request.continue();
      }
    });

    await page.goto(url);

    const document = await page.evaluate(
      () =>
        (document.querySelector('iframe')?.contentWindow.document || document).body
          .innerHTML
    );

    await browser.close();

    return callback(document, args);
  } catch (error) {
    console.error(error);
  }
};
