import type { APIRoute } from 'astro';
import { generateHomeOG } from '../../utils/og';

export const GET: APIRoute = async () => {
  const png = await generateHomeOG();
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
