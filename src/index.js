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
  const target = typeof source === 'string' ? data[source] : source

  // Early return with exact match if found
  const exactResult = target.find(({ name }) =>
    name.includes('_')
      ? name.toLowerCase() === query.replace(/\s/g, '_').toLowerCase()
      : name.toLowerCase() === query.toLowerCase(),
  )
  if (exactResult) return [exactResult]

  // Fuzzy search for related matches
  const fuzzySearch = new RegExp(`.*${query.split('').join('.*')}.*`, 'i')

  const results = []
  for (const entry of target) if (fuzzySearch.test(entry.name)) results.push(entry)

  // Return alphabetically sorted matches
  return results.sort()
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
      },
    ],
    run({ query }) {
      // Separate property/method from base class
      const [object, property] = query.split(/\.|#/)

      // Fuzzy search for matching docs
      const results = search('docs', object)

      // Handle no matches
      if (!results.length) {
        return {
          title: `Docs for "${query}"`,
          description: `No documentation was found for \`${query}\`.`,
        }
      }

      // Handle single match
      if (results.length === 1) {
        // Early return if no properties specified
        const result = results[0]
        if (!property) return result

        // Fuzzily search result for property
        const properties = search(result.properties, property)

        // Handle unknown property
        if (!properties.length) {
          // Otherwise, fallback to error
          return {
            title: `Docs for "${query}"`,
            description: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).`,
          }
        }

        // Handle matching property
        if (properties.length === 1) return properties[0]

        // Handle multiple matching properties
        return {
          title: `Docs for "${query}"`,
          description: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).\n\nDid you mean:`,
          entries: properties.map(({ title, url }) => `**[${title}](${url})**`),
        }
      }

      // Handle multiple matches
      return {
        title: `Docs for "${query}"`,
        description: `No documentation was found for \`${query}\`.\n\nRelated docs:`,
        entries: results.map(({ name, url }) => `**[${name}](${url})**`),
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
      },
    ],
    run({ query }) {
      // Fuzzy search for matching examples
      const results = search('examples', query)

      // Handle no matches
      if (!results.length) {
        return {
          title: `Examples for "${query}"`,
          description: `No examples were found for \`${query}\`.`,
        }
      }

      // Handle single match
      if (results.length === 1) return results[0]

      // Handle multiple matches
      return {
        title: `Examples for "${query}"`,
        description: `No example was found for \`${query}\`.\n\nRelated examples:`,
        entries: results.map(({ title, url }) => `**[${title}](${url})**`),
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

  // Format items into navigable pages of 10
  if (output.entries?.length) {
    const pages = []

    output.entries.forEach((entry, index) => {
      const pageIndex = Math.trunc(index / 10)
      const line = `\n• ${entry}`

      if (pages[pageIndex]) pages[pageIndex] += line
      else pages[pageIndex] = `${output.description ?? ''}${line}`
    })

    Object.assign(output, {
      description: pages[page],
      footer: { text: `Page ${page + 1} of ${pages.length}` },
      components: pages.length > 1 && [
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
              custom_id: `1${stringify({ ...options, page: Math.max(page - 1, 0) })}`,
              disabled: page === 0,
              label: '← Back',
            },
            {
              type: 2,
              style: 2,
              custom_id: `2${stringify({ ...options, page: page + 1 })}`,
              disabled: page === pages.length - 1,
              label: 'Next →',
            },
            {
              type: 2,
              style: 2,
              custom_id: `3${stringify({ ...options, page: pages.length - 1 })}`,
              disabled: page === pages.length - 1,
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
    default:
      return response.status(400).send({ error: 'Unknown interaction' })
  }
}
