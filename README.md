# Discord Bot

Discord bot for the [three.js Discord server](https://discord.gg/HF4UdyF).

## Table of contents

- [Install and Run](#install--run)
- [Commands](#commands)
  - [Help](#help)
  - [Docs](#docs)

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

## Commands

| Command | Arguments        | Description                                                                                 |
| ------- | ---------------- | ------------------------------------------------------------------------------------------- |
| !docs   | `query or class` | Searches [https://threejs.org/docs](https://threejs.org/docs) for specified query or class. |
| !help   | _none_           | Displays this bot's commands.                                                               |
| !uptime | _none_           | Responds with this bot's current uptime.                                                    |

## !docs

Searches [https://threejs.org/docs](https://threejs.org/docs) for specified query or class.

Usage: `!docs vector3#set`

## !help

Displays this bot's commands.

Usage: `!help`

## !uptime

Responds with this bot's current uptime.

Usage: `!uptime`
