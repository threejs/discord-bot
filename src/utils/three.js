import chalk from 'chalk';
import fetch from 'node-fetch';
import { THREE } from 'constants';

/**
 * Flattens a deeply nested object to root-level.
 *
 * @param {Object} object Deep-nested object to flatten.
 */
export const flatten = object =>
  Object.assign(
    {},
    ...(function _flatten(root) {
      return [].concat(
        ...Object.keys(root).map(key =>
          typeof root[key] === 'object' ? _flatten(root[key]) : { [key]: root[key] }
        )
      );
    })(object)
  );

/**
 * Returns a list of three.js docs in an optional locale.
 */
export const getDocs = async () => {
  try {
    const json = await fetch(THREE.DOCS_LIST).then(res => res.json());

    const endpoints = flatten(json[THREE.LOCALE]);
    const docs = Object.keys(endpoints).map(key => ({
      name: key,
      url: `${THREE.DOCS_URL}${endpoints[key]}`,
    }));

    return docs;
  } catch (error) {
    console.error(chalk.red(`three/getDocs >> ${error.stack}`));
  }
};

/**
 * Returns a list of three.js examples.
 */
export const getExamples = async () => {
  try {
    const json = await fetch(THREE.EXAMPLES_LIST).then(res => res.json());
    const tags = await fetch(THREE.EXAMPLES_TAGS).then(res => res.json());

    const examples = Object.keys(json).reduce((results, group) => {
      const items = json[group].map(key => ({
        name: key,
        url: `${THREE.EXAMPLES_URL}#${key}`,
        tags: tags[key]
          ? Array.from(new Set([...key.split('_'), ...tags[key]]))
          : key.split('_'),
        thumbnail: {
          url: `${THREE.EXAMPLES_URL}screenshots/${key}.jpg`,
        },
      }));

      results.push(...items);

      return results;
    }, []);

    return examples;
  } catch (error) {
    console.error(chalk.red(`three/getExamples >> ${error.stack}`));
  }
};
