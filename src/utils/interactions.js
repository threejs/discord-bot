import nacl from 'tweetnacl';
import { readdirSync } from 'fs';
import { join } from 'path';
import config from 'config';

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

/**
 * @typedef Choice
 * @property {String} name
 * @property {String} value
 */

/**
 * @typedef Option
 * @property {String} name
 * @property {String} description
 * @property {Number} type
 * @property {Boolean} required
 * @property {Choice[]} choices
 */

/**
 * @typedef Command
 * @property {String} id
 * @property {String} name
 * @property {String} description
 * @property {Option[]} options
 */

/**
 * Interaction option object.
 *
 * @typedef InteractionOption
 * @property {String} name
 * @property {String | Number} value
 */

/**
 * Interaction payload object.
 *
 * @typedef InteractionData
 * @property {String} id
 * @property {String} name
 * @property {InteractionOption[]} [options]
 */

const COMMANDS_PATH = join(__dirname, '../commands');

/**
 * Handles a ping or command interaction.
 *
 * @param {Number} type Interaction type.
 * @param {InteractionData} data Interaction payload object.
 */
export const handleInteraction = async (type, data) => {
  switch (type) {
    case INTERACTION_TYPE.PING:
      return { type: 1 };
    case INTERACTION_TYPE.APPLICATION_COMMAND: {
      const { name, options } = data;

      // Find target command
      const command = readdirSync(COMMANDS_PATH).reduce((target, file) => {
        const command = require(join(COMMANDS_PATH, file)).default;
        if (command?.name === name) target = command;

        return target;
      }, null);
      if (!command) return;

      const query = options?.[0].value;
      const output = await command.execute({ query });

      return {
        type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: output?.embed ? { embeds: [output.embed] } : { content: output },
      };
    }
  }
};

// Use built-in TextEncoder if available, otherwise import from node util.
const LocalTextEncoder =
  typeof TextEncoder === 'undefined' ? require('util').TextEncoder : TextEncoder;

/**
 * Converts different types to Uint8Array.
 *
 * @param {Uint8Array | ArrayBuffer | Buffer | String} value - Value to convert. Strings are parsed as hex.
 * @param {String} [format] - Format of value. Valid options: 'hex'. Defaults to utf-8.
 * @returns {Uint8Array} Value in Uint8Array form.
 */
export const valueToUint8Array = (value, format) => {
  if (!value) return new Uint8Array();

  if (typeof value === 'string') {
    if (format === 'hex') {
      const matches = value.match(/.{1,2}/g);
      if (!matches) throw new Error('Value is not a valid hex string');

      const hexVal = matches.map(byte => parseInt(byte, 16));
      return new Uint8Array(hexVal);
    } else {
      return new LocalTextEncoder('utf-8').encode(value);
    }
  }

  if (Buffer.isBuffer(value)) {
    return new Uint8Array(value);
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  }
};

/**
 * Merge two arrays.
 *
 * @param {Uint8Array} arr1 - First array
 * @param {Uint8Array} arr2 - Second array
 * @returns {Uint8Array} Concatenated arrays
 */
export const concatUint8Arrays = (arr1, arr2) => {
  const merged = new Uint8Array(arr1.length + arr2.length);
  merged.set(arr1);
  merged.set(arr2, arr1.length);

  return merged;
};

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param {Uint8Array | ArrayBuffer | Buffer | String} rawBody - The raw payload data
 * @param {Uint8Array | ArrayBuffer | Buffer | String} signature - The signature from the `X-Signature-Ed25519` header
 * @param {Uint8Array | ArrayBuffer | Buffer | String} timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param {Uint8Array | ArrayBuffer | Buffer | String} clientPublicKey - The public key from the Discord developer dashboard
 * @returns {Boolean} Whether or not validation was successful
 */
function verifyKey(body, signature, timestamp, clientPublicKey) {
  try {
    const timestampData = valueToUint8Array(timestamp);
    const bodyData = valueToUint8Array(body);
    const message = concatUint8Arrays(timestampData, bodyData);

    const signatureData = valueToUint8Array(signature, 'hex');
    const publicKeyData = valueToUint8Array(clientPublicKey, 'hex');
    return nacl.sign.detached.verify(message, signatureData, publicKeyData);
  } catch (error) {
    console.error('Invalid verifyKey parameters', error);
    return false;
  }
}

/**
 * Middleware function for serverless Discord routes
 */
export const middleware = (req, res, next) => {
  const timestamp = req.header('X-Signature-Timestamp') || '';
  const signature = req.header('X-Signature-Ed25519') || '';

  /**
   * Handles validation completion, passes to route
   *
   * @param {Buffer} rawBody
   */
  function onBodyComplete(rawBody) {
    if (!verifyKey(rawBody, signature, timestamp, config.key)) {
      return res.status(401).end('Invalid signature');
    }

    const body = JSON.parse(rawBody.toString('utf-8')) || {};
    if (body.type === INTERACTION_TYPE.PING) {
      return res.json(
        JSON.stringify({
          type: INTERACTION_RESPONSE_TYPE.PONG,
        })
      );
    }

    req.body = body;
    next();
  }

  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      onBodyComplete(req.body);
    } else if (typeof req.body === 'string') {
      onBodyComplete(Buffer.from(req.body, 'utf-8'));
    } else {
      // Attempt to reconstruct the raw buffer
      onBodyComplete(Buffer.from(JSON.stringify(req.body), 'utf-8'));
    }
  } else {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      onBodyComplete(rawBody);
    });
  }
};
