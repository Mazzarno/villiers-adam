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
const webOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_WEB_URL);
const mediaOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_MEDIA_URL || process.env.MINIO_PUBLIC_URL);
const cspConnectSources = Array.from(
  new Set(
    [
      "'self'",
      'https://*.villiers-adam.fr',
      'http://localhost:*',
      'ws://localhost:*',
      apiOrigin,
      webOrigin,
      mediaOrigin,
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
      webOrigin,
      mediaOrigin,
    ].filter(Boolean),
  ),
);
const ContentSecurityPolicy = `default-src 'self';
  script-src 'self' 'unsafe-inline' ${isProduction ? '' : "'unsafe-eval'"};
  script-src-attr 'none';
  style-src 'self' 'unsafe-inline';
  img-src ${mediaSources.join(' ')};
  media-src ${mediaSources.filter((value) => value !== 'data:').join(' ')};
  font-src 'self' data:;
  frame-src 'self' https: http://localhost:*;
  connect-src ${cspConnectSources.join(' ')};
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.villiers-adam.fr',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      getRemotePattern(process.env.NEXT_PUBLIC_API_URL),
      getRemotePattern(process.env.NEXT_PUBLIC_WEB_URL),
      getRemotePattern(process.env.NEXT_PUBLIC_MEDIA_URL || process.env.MINIO_PUBLIC_URL),
    ].filter(Boolean),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
