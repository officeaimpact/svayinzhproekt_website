import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { articles } from '../data/journal';
import { articleBodies } from '../lib/article-bodies';

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const GET: APIRoute = async () => {
  const parts: string[] = [];

  parts.push('# СвайИнжПроект — полный текстовый дамп сайта');
  parts.push('');
  parts.push(`Сайт: ${site.url}`);
  parts.push(`Юридическое лицо: ${site.legalName}`);
  parts.push(
    `ОГРНИП: ${site.legal.ogrnip}, ИНН: ${site.legal.inn}`,
  );
  parts.push(`Юридический адрес: ${site.legal.address}`);
  parts.push(`Телефон: ${site.contacts.phoneFormatted} (звонок · WhatsApp · Telegram)`);
  parts.push(`E-mail: ${site.contacts.email}`);
  parts.push('');
  parts.push('## Тезис');
  parts.push(
    'Сваи — первый и самый ответственный этап любой стройки. От нашего этапа зависит вся стройка дальше.',
  );
  parts.push('');

  parts.push('## Услуги');
  for (const s of site.services) {
    parts.push(`### ${s.title}`);
    parts.push(s.tagline);
    parts.push(s.summary);
    parts.push('');
  }

  parts.push('## Реализованные проекты');
  for (const c of site.cases) {
    parts.push(`### ${c.title}`);
    parts.push(`Локация: ${c.location}`);
    if (c.period) parts.push(`Период: ${c.period}`);
    if (c.client) parts.push(`Заказчик: ${c.client}`);
    if (c.generalContractor) parts.push(`Генподрядчик: ${c.generalContractor}`);
    parts.push(`Категория: ${c.category}`);
    parts.push(c.summary);
    parts.push(`Наша часть работ: ${c.workDone}`);
    if (c.metrics?.length) {
      parts.push('Технические параметры:');
      for (const m of c.metrics) parts.push(`- ${m.label}: ${m.value}`);
    }
    parts.push('');
  }

  parts.push('## Дополнительные объекты опыта команды');
  for (const c of site.shortCases) {
    parts.push(`- ${c.title} (${c.location}${c.period ? `, ${c.period}` : ''}): ${c.detail}`);
  }
  parts.push('');

  parts.push('## Партнёрская группа компаний');
  for (const p of site.partners) {
    parts.push(`### ${p.name}`);
    parts.push(`Роль: ${p.role}`);
    parts.push(p.summary);
    if (p.address) parts.push(`Адрес: ${p.address}`);
    if (p.phone) parts.push(`Телефон: ${p.phone}`);
    if (p.email) parts.push(`Email: ${p.email}`);
    if (p.inn) parts.push(`ИНН: ${p.inn}`);
    if (p.kpp) parts.push(`КПП: ${p.kpp}`);
    if (p.ogrn) parts.push(`ОГРН: ${p.ogrn}`);
    if (p.keyProjects?.length) {
      parts.push('Ключевые проекты:');
      for (const proj of p.keyProjects) parts.push(`- ${proj}`);
    }
    parts.push('');
  }

  parts.push('## Заказчики и партнёры верхнего уровня');
  for (const t of site.trustedBy) {
    parts.push(`- ${t.name} — ${t.role}`);
  }
  parts.push('');

  parts.push('## Техника и база');
  parts.push('Собственный парк буровых установок:');
  for (const rig of site.equipment.drillingRigs) {
    parts.push(`- ${rig.model} — ${rig.count} ед. (${rig.role})`);
  }
  parts.push('');
  parts.push('Вспомогательная и грузоподъёмная техника:');
  for (const item of site.equipment.support) {
    parts.push(`- ${item.model} — ${item.count} ед. (${item.role})`);
  }
  parts.push('');
  parts.push('Оснастка:');
  for (const item of site.equipment.rigging) parts.push(`- ${item}`);
  parts.push(
    'Производственная база — Москва, район Зорге (МЦК Зорге). Механический цех, склад обсадных и бетонолитных труб, воронок, сварочного оборудования.',
  );
  parts.push('Команда: 2 машиниста буровой установки + 5 помощников бурильщиков. На каждом объекте — прораб с инженерным образованием.');
  parts.push('');

  parts.push('## Формат работы');
  parts.push(
    'Работаем по договорам субподряда у генеральных подрядчиков с действующим СРО. Также выходим на прямые подряды по 223-ФЗ и 44-ФЗ — основные рамки государственных и корпоративных закупок в Российской Федерации. Стратегический генподрядчик — ООО «Мосты и Тоннели».',
  );
  parts.push('');

  parts.push('## Журнал — публикации');
  for (const a of articles) {
    parts.push(`### ${a.title}`);
    parts.push(`Категория: ${a.category}`);
    parts.push(`Опубликовано: ${a.publishedAt}${a.updatedAt ? `, обновлено ${a.updatedAt}` : ''}`);
    parts.push(`Подзаголовок: ${a.subtitle}`);
    parts.push(`Главный ответ: ${a.keyAnswer}`);
    parts.push('');
    const body = articleBodies[a.slug];
    if (body) {
      parts.push(stripHtml(body));
      parts.push('');
    }
  }

  return new Response(parts.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
