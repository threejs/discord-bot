import { JSDOM } from 'jsdom';

const metaDelimiter = 'META';

/**
 * Queries for an element and its properties
 */
const getQueryElement = (document, query) => {
  // Early return if we're not scraping
  const elements = Array.from(document.body.children);
  const element = elements.find(
    node =>
      ['H1', 'H3'].includes(node.tagName) &&
      node.outerHTML.toLowerCase().includes(query?.toLowerCase())
  );
  if (!element) return;

  // Property meta
  const propertyTitle = `${document.querySelector('h1').innerHTML}${element.innerHTML}`;
  const propertyDesc =
    element.nextElementSibling.tagName === 'H3' ? element : element.nextElementSibling;
  const isProperty = !!element.querySelector('a.permalink');

  // Constructor meta
  const constructor = elements.find(node => node.outerHTML.includes('Constructor'));
  const constructorTitle = constructor?.nextElementSibling.innerHTML;
  const constructorDesc = document.querySelector('.desc');

  // Class meta
  const title = `${isProperty ? propertyTitle : constructorTitle}`;
  const description = `${(isProperty ? propertyDesc : constructorDesc).innerHTML}`;
  const trim = isProperty || constructorDesc.nextElementSibling === constructor;

  return `${title}${metaDelimiter}${description}${trim ? '' : '...'}`;
};

/**
 * Parses HTML into Discord markdown
 */
export const transformMarkdown = (html, query) => {
  const { document } = new JSDOM(html).window;

  // Find element by query if specified
  const target = getQueryElement(document, query) || document.body.innerHTML;

  // Convert HTML to markdown
  const markdown = target
    .replace(/<\/?code>/gi, '```')
    .replace(/<\/?h[0-9]>/gi, '**')
    .replace(/<span.*?>([^<]*)<\/span>/gim, '$1')
    .replace(/<a.*?class="permalink">#<\/a>/gim, '')
    .replace(/<a.*?onclick=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '$2')
    .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
    .replace(/\s+/g, ' ')
    .replace(/(\s\.)+/, '.')
    .replace(/(\n\s?\n|<br\/?>)/gi, '\n')
    .replace(/<\/?(br|li|div)>/gi, '')
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
