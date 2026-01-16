import type { VercelConfig } from '@vercel/node';

const admin = process.env.ADMIN_HOST;
const app = process.env.APP_HOST;
const enabled = process.env.REDIRECT_ADMIN_TO_APP === 'true';

const config: VercelConfig = {
  redirects: enabled && admin && app
    ? [
        {
          source: '/(.*)',
          has: [{ type: 'host', value: admin }],
          destination: `https://${app}/admin/$1`,
          permanent: true, // Vercel uses 308 for permanent redirects
        },
      ]
    : [],
};

export default config;

