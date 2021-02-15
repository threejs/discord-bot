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
    const element = elements.find(
      node =>
        ['H1', 'H3'].includes(node.tagName) &&
        node.outerHTML.toLowerCase().includes(query?.toLowerCase())
    );
    if (!element) return document.body.innerHTML;

    // Class defaults
    const title = document.querySelector('h1');
    const description = document.querySelector('.desc');

    // Method properties
    const methodDesc =
      element.nextElementSibling.tagName === 'H3' ? element : element.nextElementSibling;
    const methodArgs = `${title.innerHTML}${element.innerHTML}`;
    const isMethod = !!element.querySelector('a.permalink');

    // Constructor properties
    const constructor = elements.find(node => node.outerHTML.includes('Constructor'));
    const constructorArgs = constructor?.nextElementSibling.innerHTML;

    const args = `${isMethod ? methodArgs : constructorArgs}${metaDelimiter}`;

    return `${args}${(isMethod ? methodDesc : description).innerHTML}${
      isMethod || description.nextElementSibling.outerHTML.includes('Constructor')
        ? ''
        : '...'
    }`;
  };

  // Find element by query if specified and skip to descriptor if method
  const target = getTargetElement();

  // Convert HTML to markdown
  const markdown = target
    .replace(/<\/?code>/gi, '```')
    .replace(/<\/?h1>/gi, '**')
    .replace(/<span.*?>([^<]*)<\/span>/gim, '$1')
    .replace(/<a.*?class="permalink">#<\/a>/gim, '')
    .replace(/<a.*?onclick=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '$2')
    .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
    .replace(/\s+/g, ' ')
    .replace(/(\s\.)+/, '.')
    .replace(/(\n\s?\n|<br\/?>)/gi, '\n')
    .replace(/<\/?.>/g, '')
    .trim();

  if (query) {
    const [title, description] = markdown.split(metaDelimiter) || [markdown];

    // Split properties from title
    if (/^[a-zA-Z0-9_-]+\./.test(title)) {
      const [object, ...props] = title.split('.');

      const property = props
        .join('.')
        .replace(/(\(|:).+/, '')
        .trim();
      const classTitle = `${object}.${property}`;

      return { title: classTitle, property, description };
    }

    return { title, description };
  }

  return markdown;
};
