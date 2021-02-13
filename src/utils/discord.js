import { JSDOM } from 'jsdom';

/**
 * Parses HTML into Discord markdown
 */
export const transformMarkdown = (html, query) => {
  const { document } = new JSDOM(html).window;

  // Pre-processing for API docs
  const elements = Array.from(document.body.children);
  const element =
    query && elements.find(node => node.outerHTML.toLowerCase().includes(query));
  const methodText = element && elements[elements.indexOf(element) + 1];

  // Find query if specified and skip to descriptor if method
  const target = query
    ? /<a.+class="permalink">#<\/a>/.test(methodText?.innerHTML)
      ? element
      : methodText
    : document.querySelector('.desc') || document.body;

  // Convert HTML to markdown
  const markdown = target?.innerHTML
    .replace(/<\/?code>/g, '```')
    .replace(/<?\/h1>/g, '**')
    .replace(/<span.*?>([^<]*)<\/span>/gim, '$1')
    .replace(/<a.+class="permalink">#<\/a>/g, '')
    .replace(/<a.*?onclick=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '$2')
    .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
    .replace(/\s+/g, ' ')
    .replace(/(\n \n|\n\n)/g, '\n')
    .replace(/<\/?.>/g, '')
    .trim();

  return markdown;
};
