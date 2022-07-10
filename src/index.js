import { createRequire } from 'module'
import { stringify, parse } from 'querystring'
import { fetch } from 'undici'
import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions'

// prettier-ignore
try{var data = createRequire(import.meta.url)('../api/data.json')}catch(_){}

/**
 * Fuzzy searches three.js source for a query.
 */
function search(source, query) {
  // Separate property/method from docs query
  const hasProperty = source === 'docs' && /\.|#/.test(query)
  const target = hasProperty ? query.split(/\.|#/)[0] : query

  if (typeof source === 'string') source = data[source]

  // Search for exact result and recursive search for properties
  const exactResult = source.find(({ name }) =>
    name.includes('_')
      ? name.toLowerCase() === target.replace(/\s/g, '_').toLowerCase()
      : name.toLowerCase() === target.toLowerCase(),
  )
  if (exactResult) return hasProperty ? search(exactResult.properties, query) : [exactResult]

  // Fuzzy search for related matches
  const fuzzySearch = new RegExp(`.*${target.split('').join('.*')}.*`, 'i')
  const results = source.filter((entry) => fuzzySearch.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name))

  return results
}

export const commands = [
  {
    name: 'docs',
    description: 'Searches https://threejs.org/docs for docs.',
    options: [
      {
        name: 'query',
        description: 'A query or class to search matching docs for',
        type: 3,
        max_length: 80,
        required: true,
        autocomplete: true,
      },
    ],
    run({ query }) {
      // Fuzzy search for matching docs
      const results = search('docs', query)

      switch (results.length) {
        // Handle no matches
        case 0:
          return {
            title: `Docs for "${query}"`,
            description: `No documentation was found for \`${query}\`.`,
          }
        // Handle single match
        case 1:
          return results[0]
        // Handle multiple matches
        default:
          return {
            title: `Docs for "${query}"`,
            description: `No documentation was found for \`${query}\`.\n\nRelated docs:`,
            entries: results.map(({ name, url }) => `**[${name}](${url})**`),
          }
      }
    },
  },
  {
    name: 'examples',
    description: 'Searches https://threejs.org/examples for examples.',
    options: [
      {
        name: 'query',
        description: 'A query or class to search matching docs for',
        type: 3,
        max_length: 80,
        required: true,
        autocomplete: true,
      },
    ],
    run({ query }) {
      // Fuzzy search for matching examples
      const results = search('examples', query)

      switch (results.length) {
        // Handle no matches
        case 0:
          return {
            title: `Examples for "${query}"`,
            description: `No examples were found for \`${query}\`.`,
          }
        // Handle single match
        case 1:
          return results[0]
        // Handle multiple matches
        default:
          return {
            title: `Examples for "${query}"`,
            description: `No example was found for \`${query}\`.\n\nRelated examples:`,
            entries: results.map(({ title, url }) => `**[${title}](${url})**`),
          }
      }
    },
  },
  {
    name: 'help',
    description: "Displays this bot's commands.",
    run() {
      const entries = commands.map(({ name, description }) => `**/${name}** - ${description}`)
      return { title: 'Commands', entries }
    },
  },
]

/**
 * Formats a command response into message data.
 */
function formatData(output, options = {}, page = 0) {
  // Format message string
  if (typeof output === 'string') return { content: output }

  // Format message entries into navigable pages of 10
  if (output.entries?.length) {
    const pageLength = Math.ceil(output.entries.length / 10)
    const pageIndex = page * 10
    output.entries = output.entries.slice(pageIndex, pageIndex + 10)

    Object.assign(output, {
      description: output.entries.reduce((acc, entry) => `${acc}\n• ${entry}`, output.description ?? ''),
      footer: { text: `Page ${page + 1} of ${pageLength}` },
      components: pageLength > 1 && [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              custom_id: `0${stringify({ ...options, page: 0 })}`,
              disabled: page === 0,
              label: '<<',
            },
            {
              type: 2,
              style: 2,
              custom_id: `1${stringify({ ...options, page: page - 1 })}`,
              disabled: page === 0,
              label: '← Back',
            },
            {
              type: 2,
              style: 2,
              custom_id: `2${stringify({ ...options, page: page + 1 })}`,
              disabled: page === pageLength - 1,
              label: 'Next →',
            },
            {
              type: 2,
              style: 2,
              custom_id: `3${stringify({ ...options, page: pageLength - 1 })}`,
              disabled: page === pageLength - 1,
              label: '>>',
            },
          ],
        },
      ],
    })
  }

  const { content, flags, title, description, url, thumbnail, footer, components } = output

  return {
    content,
    flags,
    embeds: title ? [{ title, description, url, thumbnail, footer }] : undefined,
    components: components?.length ? components : undefined,
  }
}

/**
 * Gets the latest three.js revision.
 */
export async function getRevision() {
  const response = await fetch('https://raw.githubusercontent.com/mrdoob/three.js/master/src/constants.js')
  if (!response.ok) throw new Error(response.statusText)

  const constants = await response.text()
  return constants.match(/(?!REVISION[^\d]+)(\d+)/)[0]
}

export default async (request, response) => {
  // Validate request signature
  const verified = verifyKey(
    JSON.stringify(request.body),
    request.headers['x-signature-ed25519'],
    request.headers['x-signature-timestamp'],
    process.env.PUBLIC_KEY,
  )
  if (!verified) return response.status(401).end()

  // Update in background on new release
  const revision = await getRevision()
  if (revision !== data.revision) await fetch(process.env.VERCEL_DEPLOY_WEBHOOK, { method: 'POST' })

  // Handle interactions
  switch (request.body.type) {
    case InteractionType.PING:
      return response.send({ type: InteractionResponseType.PONG })
    case InteractionType.APPLICATION_COMMAND: {
      const command = commands.find(({ name }) => name === request.body.data.name)
      if (!command) return response.status(400).send({ error: 'Unknown command' })

      const options = request.body.data.options?.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
      const output = command.run(options)
      const data = formatData(output, options)

      return response.send({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data })
    }
    case InteractionType.MESSAGE_COMPONENT: {
      const command = commands.find(({ name }) => name === request.body.message.interaction.name)
      if (!command) return response.status(400).send({ error: 'Unknown command' })

      const { page, ...options } = parse(request.body.data.custom_id.substring(1))
      const output = command.run(options)
      const data = formatData(output, options, Number(page))

      return response.send({ type: InteractionResponseType.UPDATE_MESSAGE, data })
    }
    case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
      const command = commands.find(({ name }) => name === request.body.data.name)
      if (!command) return response.status(400).send({ error: 'Unknown command' })

      const query = request.body.data.options.find(({ name }) => name === 'query')
      const results = search(request.body.data.name, query.value)
      const data = { choices: results.slice(0, 10).map(({ name }) => ({ name, value: name })) }

      return response.send({ type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, data })
    }
    default:
      return response.status(400).send({ error: 'Unknown interaction' })
  }
}
