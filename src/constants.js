import { Intents } from 'discord.js';

/**
 * Three.js settings, links, endpoints, and data files.
 */
export const THREE = {
  LOCALE: 'en', // en, ar, zh, ko, ja
  DOCS_URL: 'https://threejs.org/docs/',
  EXAMPLES_URL: 'https://threejs.org/examples/',
};

/**
 * Default bot intents and permission scopes.
 */
export const CLIENT_INTENTS = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];

/**
 * Embed default properties.
 */
export const EMBED_DEFAULTS = {
  color: 0x049ef4,
};

/**
 * Discord-enforced message character and size limits.
 */
export const MESSAGE_LIMITS = {
  CONTENT_LENGTH: 2000,
  TITLE_LENGTH: 256,
  DESC_LENGTH: 2048,
  FIELD_LENGTH: 25,
  FIELD_NAME_LENGTH: 256,
  FIELD_VALUE_LENGTH: 1024,
};
