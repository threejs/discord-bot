import { config } from 'dotenv'
import { fetch } from 'undici'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { commands, getRevision } from './index.js'

// Sync node env
config()

// Update command meta
const response = await fetch(
  `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD}/commands`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${process.env.TOKEN}`,
    },
    body: JSON.stringify(commands),
  },
)
if (!response.ok) console.error(JSON.stringify(await response.json()))

// Fetch revision
const revision = await getRevision()

// Fetch docs
const DOCS_PATH = 'http://localhost:8080/docs' ?? 'https://threejs.org/docs'
const DOCS_PROPS_REGEX = /^\[(property|method):[^\s]+\s([^\]]+)\].*/gi

const flatten = (o) =>
  Object.keys(o).reduce((a, v) => ({ ...a, ...(typeof o[v] === 'object' ? flatten(o[v]) : { [v]: o[v] }) }), {})

const transform = ({ url, title, description, ...rest }) => ({
  url,
  title: title
    // Remove labels from bracket syntax
    .replace(/\[[^:]+:([^\s]+)\s([^\]]+)\s*\]/g, '$2: $1')
    // Move method return type to end
    .replace(/(\w+)(\:[^\(]+)(\([^\)]+\))/, '$1$3$2'),
  description: description
    .trim()
    // Trim whitespace
    .replace(/(\<br\>)+/g, ' ')
    .replace(/\s+/g, ' ')
    // Transform custom links
    .replace(/\[link:([^\s]+)\s([^\]]+)\]/g, '<a href="$1">$2</a>')
    // Cleanup inline links
    .replace(/\[[^:]+:([^\s\]]+\s)?([^\]]+)\]/g, '$2'),
  ...rest,
})

const docsEntries = await fetch(`${DOCS_PATH}/list.json`)
  .then((res) => res.json())
  .then((data) => flatten(data['en']))

const docs = await Promise.all(
  Object.entries(docsEntries).map(async ([name, endpoint]) => {
    const url = `${DOCS_PATH}/${endpoint}.html`

    // Fetch page source, reformat self-references
    const source = (await fetch(url).then((res) => res.text())).replace(/(:)this|\[name\]/g, `$1${name}`)
    const { document } = new JSDOM(source).window
    const elements = Array.from(document.body.children)

    // Parse constructor meta
    const constructor = elements.find((node) => node.outerHTML.includes('Constructor'))
    const title = constructor?.nextElementSibling.textContent ?? name
    const description = document.querySelector('.desc')?.textContent ?? ''

    const properties = []
    for (const element of document.querySelectorAll('h3')) {
      if (!DOCS_PROPS_REGEX.test(element.textContent)) continue

      const title = element.textContent.replace(/\n.*/g, '')
      const name = title.replace(DOCS_PROPS_REGEX, '$2')
      const type = title.startsWith('[property') ? 'property' : 'method'
      const description = element.nextElementSibling?.tagName === 'P' ? element.nextElementSibling.innerHTML : ''
      const url = `${DOCS_PATH}/#${endpoint}.${name}`

      properties.push(transform({ name, type, title, description, url }))
    }

    return transform({ url, name, title, description, properties })
  }),
)

// Fetch examples
const EXAMPLES_PATH = 'http://localhost:8080/examples' ?? 'https://threejs.org/examples'

const examplesEntries = await fetch(`${EXAMPLES_PATH}/files.json`).then((res) => res.json())
const examples = []

for (const key in examplesEntries) {
  const collection = examplesEntries[key]
  for (const name of collection) {
    examples.push({
      name,
      url: `${EXAMPLES_PATH}/#${name}`,
      title: name.replace(/_/g, ' '),
      thumbnail: {
        url: `${EXAMPLES_PATH}/screenshots/${name}.jpg`,
      },
    })
  }
}

// Write to disk
fs.writeFileSync(path.join(process.cwd(), 'api/data.json'), JSON.stringify({ revision, docs, examples }))
