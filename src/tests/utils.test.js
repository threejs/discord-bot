import { transformMarkdown, embed, crawl, getDocs, getExamples } from '../utils';
import config from '../config';

describe('utils/discord', () => {
  it('transforms HTML to markdown', () => {
    const output = transformMarkdown(
      '<a href="#">Link</a><h1>Header</h1><strong>Bold</strong><b>Bold</b><italic>Italic</italic><i>Italic</i>'
    );

    expect(output).toBe('[Link](#)**Header****Bold****Bold***Italic**Italic*');
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
    expect(output.embed.timestamp).toBeDefined();
  });
});

describe('utils/puppeteer', () => {
  it('crawls a webpage and callsback', async () => {
    const output = await crawl('about:blank');

    expect(output).toBe('');
  });
});

describe('utils/three', () => {
  it('gets three.js docs', async () => {
    const output = await getDocs();

    expect(output.length).not.toBe(0);
  });

  it('gets localized three.js docs', async () => {
    const output = await getDocs(config.locale);

    expect(output.length).not.toBe(0);
  });

  it('gets tagged three.js examples', async () => {
    const output = await getExamples();

    expect(output[0].tags.length).not.toBe(0);
    expect(output.length).not.toBe(0);
  });
});
