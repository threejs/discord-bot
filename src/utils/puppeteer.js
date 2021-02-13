import { launch } from 'puppeteer';

const args = ['--no-sandbox', '--disable-setuid-sandbox'];

/**
 * Fetches and crawls a url and executes a callback
 */
export const puppeteer = async (url, callback) => {
  if (!url) return null;

  try {
    const browser = await launch({ args });
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

    const document = await page.evaluate(callback, url);

    await browser.close();

    return document;
  } catch (error) {
    console.error(error);
  }
};
