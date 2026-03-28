import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateBlogPostOG } from '../../../utils/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { id: post.id },
    props: {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      version: post.data.version,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await generateBlogPostOG({
    title: props.title as string,
    description: props.description as string,
    date: props.date as Date,
    version: props.version as string | undefined,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
