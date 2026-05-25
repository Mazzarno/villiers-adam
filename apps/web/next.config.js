/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('node:path');

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const outputFileTracingRoot = path.join(__dirname, '../..');

function getUrlOrigin(value) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getRemotePattern(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
    };
  } catch {
    return null;
  }
}

const apiOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_API_URL);
const adminOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_ADMIN_URL);
const siteOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_SITE_URL);
const mediaOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_MEDIA_URL || process.env.MINIO_PUBLIC_URL);
const cspConnectSources = Array.from(
  new Set(
    [
      "'self'",
      'https://hcaptcha.com',
      'https://*.hcaptcha.com',
      'https://www.facebook.com',
      'https://*.villiers-adam.fr',
      'http://localhost:*',
      'ws://localhost:*',
      apiOrigin,
      adminOrigin,
      mediaOrigin,
      siteOrigin,
    ].filter(Boolean),
  ),
);
const mediaSources = Array.from(
  new Set(
    [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'http://localhost:*',
      apiOrigin,
      mediaOrigin,
      siteOrigin,
    ].filter(Boolean),
  ),
);
const ContentSecurityPolicy = `default-src 'self';
  script-src 'self' 'unsafe-inline' ${isProduction ? '' : "'unsafe-eval'"} https://js.hcaptcha.com https://hcaptcha.com https://connect.facebook.net;
  script-src-attr 'none';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src ${mediaSources.join(' ')};
  media-src ${mediaSources.filter((value) => value !== 'data:').join(' ')};
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src ${cspConnectSources.join(' ')};
  frame-src https://hcaptcha.com https://*.hcaptcha.com https://www.facebook.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
];

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot,
  transpilePackages: ['@villiers-adam/shared'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.villiers-adam.fr',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      getRemotePattern(process.env.NEXT_PUBLIC_API_URL),
      getRemotePattern(process.env.NEXT_PUBLIC_MEDIA_URL || process.env.MINIO_PUBLIC_URL),
      getRemotePattern(process.env.NEXT_PUBLIC_SITE_URL),
    ].filter(Boolean),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/mairie/conseil-municipal', destination: '/conseil-municipal', permanent: true },
      { source: '/mairie/services', destination: '/services-municipaux', permanent: true },
      { source: '/mairie/demarches', destination: '/demarches', permanent: true },
      { source: '/mairie/publications', destination: '/publications', permanent: true },
      {
        source: '/mairie/publications/:path*',
        destination: '/publications/:path*',
        permanent: true,
      },
      {
        source: '/vie-quotidienne/infos-pratiques',
        destination: '/infos-pratiques',
        permanent: true,
      },
      { source: '/vie-quotidienne/transports', destination: '/transports', permanent: true },
      { source: '/vie-quotidienne/commerces', destination: '/commerces', permanent: true },
      { source: '/vie-quotidienne/urbanisme', destination: '/urbanisme', permanent: true },
      { source: '/vie-quotidienne/ecole', destination: '/ecole', permanent: true },
      { source: '/vie-quotidienne/ecole/:path*', destination: '/ecole/:path*', permanent: true },
      {
        source: '/vie-quotidienne/transports/transport-scolaire',
        destination: '/ecole/transport-scolaire',
        permanent: true,
      },
      { source: '/culture-loisirs/associations', destination: '/associations', permanent: true },
      { source: '/culture-loisirs/sports', destination: '/sports', permanent: true },
      { source: '/culture-loisirs/patrimoine', destination: '/patrimoine', permanent: true },
      { source: '/culture-loisirs/bibliotheque', destination: '/bibliotheque', permanent: true },
    ];
  },
};

module.exports = nextConfig;
