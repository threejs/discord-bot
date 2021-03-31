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

## Table of contents

- [Install and Run](#install--run)
- [Commands](#commands)
  - [Docs](#docs)
  - [Examples](#examples)
  - [Help](#help)

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

| Command   | Arguments        | Description                                                                                       |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| /docs     | `query or class` | Searches [https://threejs.org/docs](https://threejs.org/docs) for specified query or class.       |
| /examples | `tags`           | Searches [https://threejs.org/examples](https://threejs.org/examples) for examples matching tags. |
| /help     | _none_           | Displays this bot's commands.                                                                     |

## /docs

Searches [https://threejs.org/docs](https://threejs.org/docs) for specified query or class.

Usage: `/docs vector3#set`

## /examples

Searches [https://threejs.org/examples](https://threejs.org/examples) for examples matching tags.

Usage: `/examples physics`

## /help

Displays this bot's commands.

Usage: `/help`
