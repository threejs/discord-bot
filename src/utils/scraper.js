import chalk from 'chalk';
import fetch from 'node-fetch';

// Re-usable results cache.
const cachedResults = {};

/**
 * Fetches a url, returning its HTML markup.
 */
export const crawl = async url => {
  // Early return if already fetched
  if (cachedResults[url]) return cachedResults[url];

  try {
    // Request page
    const response = await fetch(url);
    if (response.status !== 200) throw new Error(response.statusText);

    // Parse and cache response
    const html = await response.text();
    cachedResults[url] = html;

    return html;
  } catch (error) {
    console.error(chalk.red(`scraper/crawl >> ${error.stack}`));
  }
};
