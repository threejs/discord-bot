import { transformMarkdown, embed, crawl, getDocs } from '../utils';
import config from '../config';

describe('utils/discord', () => {
  it('transforms HTML to markdown', () => {
    const output = transformMarkdown('<h1><a href="#">link</link></h1>');

    expect(output).toBe('**[link](#)**');
  });

  it('transforms HTML meta to markdown meta', () => {
    const { title, description } = transformMarkdown(
      '<h1>class</h1><h2>Constructor</h2><h3>title</h3><p class="desc">description</p>',
      'class'
    );

    expect(title).toBe('title');
    expect(description).toBe('description');
  });
});

describe('utils/embed', () => {
  it('generates an embed template', () => {
    const output = embed({ title: 'title', description: 'description' });

    expect(output).toStrictEqual({
      embed: {
        title: 'title',
        description: 'description',
        color: config.color,
        timestamp: new Date(),
      },
    });
  });
});

describe('utils/puppeteer', () => {
  it('crawls a webpage and callsback', async () => {
    const output = await crawl('about:blank', res => res + 'callback');

    expect(/callback$/.test(output)).toBe(true);
  });
});

describe('utils/three', () => {
  it('gets three.js docs', async () => {
    const output = await getDocs();

    expect(Object.keys(output).length).not.toBe(0);
  });

  it('gets localized three.js docs', async () => {
    const output = await getDocs('en');

    expect(Object.keys(output).length).not.toBe(0);
  });
});
