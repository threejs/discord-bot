# Threejs Discord Bot

<br />
<p align="center">
  <a href="https://threejs.org">
    <img src="https://github.com/mrdoob/three.js/blob/master/icon.png?raw=true" alt="three.js Logo" width="80" height="80">
  </a>

  <h3 align="center">Three.js Helper</h3>

  <p align="center">
    Discord bot for the <a href="https://discord.gg/HF4UdyF">three.js Discord server</a>.
    <br />
    <a href="https://github.com/threejs/discord-bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/threejs/discord-bot/issues">Request Feature</a>
    <br />
    <br />
    <a href="https://discord.gg/HF4UdyF">
      <img src="https://img.shields.io/discord/740090768164651008?style=flat&colorA=FFFFFF&colorB=FFFFFF&label=Discord&logo=discord" alt="Discord" />
    </a>
  </p>
</p>

## Install & run

Make sure you have nodejs and yarn installed. Install dependencies with:

```bash
yarn
```

Once it's done start up the bot with:

```bash
yarn start
```

To run tests:

```bash
yarn test
```

## Configure Credentials

Discord requires authentication in order to use bot/interaction features.

To setup a bot for local/production use, you will need to specify credentials in a file.

> **Note**: you will have to add the bot to a server with the `applications.commands` scope to invoke slash commands.

**.env** (do not commit)

```yaml
# Used for authentication with Discord
TOKEN="bot token"

# Used for local testing of slash commands
GUILD="guild ID"
```

## Creating a Command

Bot commands are invoked by user messages containing `!command` or via interaction with `/command`. Because of these two paths, commands have to run independently of their execution environment. Luckily, this is taken care of for you.

Commands are located in the [`src/commands`](https://github.com/threejs/discord-bot/tree/main/src/commands) folder, exporting an object exhibiting the following properties:

```js
// src/commands/Command.js

const Command = {
  // a lowercase name with no spaces
  name: 'command',
  // a description that defines output behaavior
  description: 'Generates a message response based on specified type.',
  // (optional) a list of user-specified options
  options: [
    {
      // lowercase option name with no spaces
      name: 'type',
      // option hint text to describe modified behavior
      description: 'Type of message to respond with',
      // Type of option (case-sensitive `ApplicationCommandOptionTypes`)
      type: 'STRING',
      // Whether to require a value to invoke
      required: true,
    },
  ],
  // Execution function to run whenever a user invokes the command
  execute({
    // Bot run-time variables
    events,
    commands,
    // Three.js variables
    docs,
    examples,
    // An array of stringified user-specified options
    options,
  }) {
    // Get message type from user input
    const [messageType] = options;

    if (messageType === 'embed') {
      // Send a message with a single embed (inline)
      return {
        title: 'Embed Title',
        description: 'Embed description.',
      };
    } else if (messageType === 'embeds') {
      // Send a message with multiple embeds
      return {
        embeds: [
          {
            title: 'Embed1 Title',
            description: 'Embed1 description.',
          },
          {
            title: 'Embed2 Title',
            description: 'Embed2 description.',
          },
        ],
      };
    } else if (messageType === 'ephemeral') {
      // Send an ephemeral message (supports markdown)
      return {
        content: 'Ephemeral response.',
        // Support for inline `MessageFlags` or explicit via `flags: Integer`
        ephemeral: true,
      };
    } else if (messageType === 'tts') {
      // Send a TTS (text-to-speech) message
      return {
        content: 'TTS response.',
        // Support for `APIMessage` options
        tts: true,
      };
    }

    // Send a basic response
    return 'Basic response.';
  },
};

export default Command;
```

For more command and embed properties, consult the [Discord developer docs](https://discord.com/developers/docs/intro).

## Creating an Event

Bot events are triggered by events emitted from a [Client](https://discord.js.org/#/docs/main/stable/class/Client). Each event exposes its own set of arguments, but you are always provided with the client context as the first argument. Events are located in [`src/events`](https://github.com/threejs/discord-bot/tree/main/src/events) and have a similar structure to commands:

```js
// src/events/Event.js

const Event = {
  // camelCase event name
  name: 'event',
  // Event execution function
  execute(
    // Current bot client context
    client,
    // Start of event-specific arguments
    ...eventArgs
  ) {
    // Event logic here
  },
};

export default Event;
```

For more information related to the Client and related events, consult the [Discord.js developer docs](https://discord.js.org/#/docs/main/stable/class/Client).

## How to Contribute

If you like or are interested in this project, consider investigating [current issues](https://github.com/threejs/discord-bot/issues) or [creating an issue](https://github.com/threejs/discord-bot/issues) and/or a [pull request](https://github.com/threejs/discord-bot/pulls).

A general checklist to make awesome contributions:

- Is my issue or feature presented in a clear and reproducible manner?
- If contributing, does my contribution pass the linter and tests? Is it covered?

All contributions are welcome, so feel free to ask questions or contribute directly.
