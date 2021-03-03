import chalk from 'chalk';
import puppeteer from 'puppeteer';

/**
 * Fetches and crawls a url, returning html
 * @param {string} url URL to fetch and crawl
 */
export const crawl = async url => {
  if (!url) return null;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // await page.setRequestInterception(true);

    // page.on('request', request => {
    //   switch (request.resourceType()) {
    //     case 'image':
    //     case 'stylesheet':
    //       return request.abort();
    //     default:
    //       return request.continue();
    //   }
    // });

    await page.goto(url);

    const html = await page.evaluate(
      () =>
        // eslint-disable-next-line no-undef
        (document.querySelector('iframe')?.contentWindow.document || document).body
          .innerHTML
    );

    await browser.close();

    return html;
  } catch (error) {
    console.error(chalk.red(`puppeteer/crawl >> ${error.stack}`));
  }
};
