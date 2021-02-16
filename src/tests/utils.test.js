import { transformMarkdown, embed, crawl, getDocs } from '../utils';
import config from '../config';

describe('utils/discord', () => {
  it('transforms HTML to markdown', () => {
    const output = transformMarkdown('<h1><a href="#">link</link></h1>');

    expect(output).toBe('**[link](#)**');
  });

  it('transforms HTML meta to markdown meta', () => {
    const { title, description } = transformMarkdown(
      '<h1>Class</h1><p class="desc">Class description.</p><h2>Constructor</h2><h3>Class()</h3>',
      'class'
    );

    expect(title).toBe('Class()');
    expect(description).toBe('Class description.');
  });

  it('shows a trail if HTML meta is trimmed', () => {
    const { title, description } = transformMarkdown(
      '<h1>Class</h1><p class="desc">Class description.</p><p>More stuff.</p><h2>Constructor</h2><h3>Class()</h3>',
      'class'
    );

    expect(title).toBe('Class()');
    expect(description).toBe('Class description....');
  });
});

describe('utils/embed', () => {
  it('generates an embed template', () => {
    const output = embed({ title: 'title', description: 'description' });

    expect(output.embed.title).toBe('title');
    expect(output.embed.description).toBe('description');
    expect(output.embed.color).toBe(config.color);
  });
});

describe('utils/puppeteer', () => {
  it('crawls a webpage and callsback', async () => {
    const output = await crawl('about:blank', res => res + 'callback');

    expect(output).toBe('callback');
  });
});

describe('utils/three', () => {
  it('gets three.js docs', async () => {
    const output = await getDocs();

    expect(Object.keys(output).length).not.toBe(0);
  });

  it('gets localized three.js docs', async () => {
    const output = await getDocs(config.locale);

    expect(Object.keys(output).length).not.toBe(0);
  });
});
