import { JSDOM } from 'jsdom';

const metaDelimiter = 'META';

/**
 * Parses HTML into Discord markdown
 */
export const transformMarkdown = (html, query) => {
  const { document } = new JSDOM(html).window;

  // Queries for an element and its properties
  const getTargetElement = () => {
    // Early return if we're not scraping
    const elements = Array.from(document.body.children);
    const element = elements.find(node =>
      node.outerHTML.toLowerCase().includes(query?.toLowerCase())
    );
    if (!element) return document.body.innerHTML;

    // Class defaults
    const title = document.querySelector('h1');
    const description = document.querySelector('.desc');

    // Method properties
    const methodText = element.nextElementSibling;
    const methodArgs = `${title.innerHTML}${element.innerHTML}`;
    const isMethod = /<a.+class="permalink">#<\/a>/.test(element.innerHTML);

    // Constructor properties
    const constructor = elements.find(node => node.outerHTML.includes('Constructor'));
    const constructorArgs = constructor?.nextElementSibling.innerHTML;

    const args = `${isMethod ? methodArgs : constructorArgs}${metaDelimiter}`;

    return `${args}${(isMethod ? methodText : description).innerHTML}`;
  };

  // Find element by query if specified and skip to descriptor if method
  const target = getTargetElement();

  // Convert HTML to markdown
  const markdown = target
    .replace(/<\/?code>/g, '```')
    .replace(/<\/?h1>/g, '**')
    .replace(/<span.*?>([^<]*)<\/span>/gim, '$1')
    .replace(/<a.*?class="permalink">#<\/a>/g, '')
    .replace(/<a.*?onclick=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '$2')
    .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
    .replace(/\s+/g, ' ')
    .replace(/(\n \n|\n\n)/g, '\n')
    .replace(/<\/?.>/g, '')
    .trim();

  if (markdown.includes(metaDelimiter)) {
    const [title, description] = markdown.split(metaDelimiter);

    return { title, description };
  }

  return markdown;
};
