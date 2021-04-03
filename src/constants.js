/**
 * Root Discord API url.
 */
export const DISCORD_URL = 'https://discord.com/api/v8';

/**
 * Embed default properties.
 */
export const EMBED_DEFAULTS = {
  color: 0x049ef4,
};

/**
 * The type of interaction this request is.
 *
 * @readonly
 * @enum {Number}
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
 *
 * @readonly
 * @enum {Number}
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
 *
 * @readonly
 * @enum {Number}
 */
export const INTERACTION_RESPONSE_FLAGS = {
  /**
   * Show the message only to the user that performed the interaction. Message
   * does not persist between sessions.
   */
  EPHEMERAL: 1 << 6,
};

/**
 * Valid option `type` values.
 *
 * @readonly
 * @enum {Number}
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
