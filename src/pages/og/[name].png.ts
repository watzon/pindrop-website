import type { APIRoute, GetStaticPaths } from 'astro';
import { generateSectionOG } from '../../utils/og';

const cards = {
  blog: {
    label: 'Blog',
    title: 'Stories behind the',
    accent: 'releases.',
    description: 'Release deep-dives, design notes, and where Pindrop is headed.',
    path: '/blog',
  },
  changelog: {
    label: 'Changelog',
    title: 'Every release,',
    accent: 'in order.',
    description: 'New engines, new languages, fixes, and the occasional full redesign.',
    path: '/changelog',
  },
  community: {
    label: 'Community',
    title: 'Built in the',
    accent: 'open.',
    description: 'Get help, report bugs, and help shape what Pindrop ships next.',
    path: '/community',
  },
} as const;

type CardName = keyof typeof cards;

function isCardName(value: string): value is CardName {
  return Object.hasOwn(cards, value);
}

export const getStaticPaths: GetStaticPaths = () => (
  Object.keys(cards).map((name) => ({ params: { name } }))
);

export const GET: APIRoute = async ({ params }) => {
  const name = params.name;
  if (!name || !isCardName(name)) {
    return new Response('Not found', { status: 404 });
  }

  const png = await generateSectionOG(cards[name]);
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
