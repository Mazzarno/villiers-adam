/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://hcaptcha.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https: http://localhost:*;
  media-src 'self' https: http://localhost:*;
  font-src 'self' data:;
  connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.villiers-adam.fr http://localhost:* ws://localhost:*;
  frame-src https://hcaptcha.com https://*.hcaptcha.com;
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
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
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
