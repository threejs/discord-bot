import chalk from 'chalk';
import fetch from 'node-fetch';
import config from 'config';

/**
 * Returns a list of the three.js docs in an optional locale.
 */
export const getDocs = async () => {
  try {
    const json = await fetch(config.docs.list).then(res => res.json());

    const endpoints = Object.assign(
      {},
      ...(function _flatten(o) {
        return [].concat(
          ...Object.keys(o).map(k =>
            typeof o[k] === 'object' ? _flatten(o[k]) : { [k]: o[k] }
          )
        );
      })(json[config.locale])
    );

    const docs = Object.keys(endpoints).map(key => ({
      name: key,
      url: `${config.docs.url}${endpoints[key]}`,
    }));

    return docs;
  } catch (error) {
    console.error(chalk.red(`three/getDocs >> ${error.stack}`));
  }
};

/**
 * Returns a list of the three.js examples.
 */
export const getExamples = async () => {
  try {
    const json = await fetch(config.examples.list).then(res => res.json());
    const tags = await fetch(config.examples.tags).then(res => res.json());

    const docs = Object.keys(json)
      .map(key => json[key])
      .flat()
      .map(key => ({
        name: key,
        url: `${config.examples.url}#${key}`,
        tags: Array.from(new Set([key.split('_'), tags[key]].filter(Boolean))).flat(),
        thumbnail: {
          url: `${config.examples.url}screenshots/${key}.jpg`,
        },
      }));

    return docs;
  } catch (error) {
    console.error(chalk.red(`three/getExamples >> ${error.stack}`));
  }
};
