import { context } from 'fetch-h2';
import { PR_EMOJIS, time } from '../constants';

const ctx = context({
  httpProtocol: 'http1',
  accept: 'application/vnd.github.v3+json',
  userAgent: 'Three.js Discord Bot',
});

/**
 * @type {Map<number, APIResponse>}
 */
const cache = new Map();

/**
 * @param {number|string} number Pull number
 * @returns {Promise<APIResponse>}
 */
export async function getPull(number) {
  // @ts-ignore
  if (cache.has(number)) return cache.get(number);

  let res = await ctx.fetch(
    `https://api.github.com/repos/mrdoob/three.js/pulls/${number}`
  );

  if (!res.ok) throw false;

  // Rate-limits
  const rateLimit = {
    // @ts-ignore
    remaining: parseInt(res.headers.get('X-RateLimit-Remaining')),
    // @ts-ignore | Time in UTC epoch seconds
    reset: parseInt(res.headers.get('X-RateLimit-Reset')) * 1000,
  };

  if (!rateLimit.remaining) {
    if (rateLimit.reset - Date.now() > time.FIVE_MINUTES) throw false;

    // Wait for 5 minutes
    await /** @type {Promise<void>} */ (
      new Promise(r => setTimeout(() => r(), time.FIVE_MINUTES))
    );
    res = await ctx.fetch(`https://api.github.com/repos/mrdoob/three.js/pulls/${number}`);
  }

  // cache.set(number, await res.json())
  return await res.json();
}

/**
 * @param {string} str
 */
export function validateLinks(str) {
  return str
    .replaceAll(/\s#(\d+)\s?/gi, ' [#$1](https://github.com/mrdoob/three.js/issues/$1) ')
    .replaceAll(
      /\s(\w(?:\w|\d)+\/.+)#(\d+)\s/gi,
      ' [$1#$2](https://github.com/$1/issues/$2) '
    );
}

/**
 * @param {import('../utils/github').APIResponse} pull
 */
export function resolveEmoji(pull) {
  return `${
    pull.state === 'closed'
      ? pull.merged
        ? PR_EMOJIS.MERGED
        : PR_EMOJIS.CLOSED
      : pull.draft
      ? PR_EMOJIS.DRAFT
      : PR_EMOJIS.OPEN
  }`;
}

/**
 * @typedef APIResponse
 * @property {string} body
 * @property {string} title
 * @property {string} html_url
 * @property {number} number
 * @property {"closed"|"open"} state
 * @property {{login: string;
 *  avatar_url: string;
 *  html_url:string
 * }} user
 * @property {boolean} merged
 * @property {boolean} draft
 * @property {number} additions
 * @property {number} deletions
 * @property {number} changed_files
 */
