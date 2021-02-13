import fetch from 'node-fetch';
import config from '../config';

/**
 * Returns a breakdown of the three.js docs in an optional locale
 */
export const getDocs = async locale => {
  try {
    const response = await fetch(config.docsEndpoint);
    const json = await response.json();

    const docs = Object.assign(
      {},
      ...(function _flatten(o) {
        return [].concat(
          ...Object.keys(o).map(v =>
            typeof o[v] === 'object' ? _flatten(o[v]) : { [v]: o[v] }
          )
        );
      })(locale ? json[locale] : json)
    );

    return docs;
  } catch (error) {
    console.error(error);
  }
};
