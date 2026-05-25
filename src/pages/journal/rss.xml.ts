import type { APIRoute } from 'astro';
import { articles } from '../../data/journal';
import { site } from '../../data/site';

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const sorted = [...articles].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  const items = sorted
    .map((a) => {
      const link = new URL(`/journal/${a.slug}/`, site.url).toString();
      const pubDate = new Date(a.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(a.intro)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.category)}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.brand} — Журнал`)}</title>
    <link>${site.url}/journal/</link>
    <description>Технологии буровых и свайных работ, расчёты и кейсы инженерной команды СвайИнжПроект.</description>
    <language>ru-RU</language>
    <atom:link href="${site.url}/journal/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
