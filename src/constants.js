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
  COMPONENT_ID_LENGTH: 100,
  COMPONENT_LABEL_LENGTH: 80,
};

/**
 * Discord message component types.
 */
export const MESSAGE_COMPONENT_TYPES = {
  /**
   * A container for other components.
   */
  ACTION_ROW: 1,
  /**
   * A clickable button.
   */
  BUTTON: 2,
};

/**
 * Discord message component styles.
 */
export const MESSAGE_COMPONENT_STYLES = {
  /**
   * Blurple button. Requires `custom_id` to be specified.
   */
  PRIMARY: 1,
  /**
   * Grey button. Requires `custom_id` to be specified.
   */
  SECONDARY: 2,
  /**
   * Green button. Requires `custom_id` to be specified.
   */
  SUCCESS: 3,
  /**
   * Red button. Requires `custom_id` to be specified.
   */
  DANGER: 4,
  /**
   * Grey link button. Requires `url` to be specified.
   */
  LINK: 5,
};

/**
 * The type of interaction this request is.
 */
export const INTERACTION_TYPE = {
  /**
   * A ping.
   */
  PING: 1,
  /**
   * A command invocation.
   */
  APPLICATION_COMMAND: 2,
};

/**
 * The type of response that is being sent.
 */
export const INTERACTION_RESPONSE_TYPE = {
  /**
   * Acknowledge a `PING`.
   */
  PONG: 1,
  /**
   * Respond with a message, showing the user's input.
   */
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  /**
   * Acknowledge a command without sending a message, showing the user's input. Requires follow-up.
   */
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
};

/**
 * Flags that can be included in an Interaction Response.
 */
export const INTERACTION_RESPONSE_FLAGS = {
  /**
   * Show the message only to the user that performed the interaction. Message
   * does not persist between sessions.
   */
  EPHEMERAL: 64, // 1 << 6
};

/**
 * Valid option `type` values.
 */
export const COMMAND_OPTION_TYPES = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
};
