const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Parse the environment variable for the custom domains for Next.js Image Optimization
 *
 * @returns {string[]}
 */
const getImageDomains = () => {
  try {
    return JSON.parse(process.env.STATIC_CONTENT_DOMAIN);
  } catch (err) {
    return [];
  }
};

/**
 * Create the configuration for Next.js Image Optimization
 *
 * @returns {import("next/dist/shared/lib/image-config").ImageConfig}
 */
const createImageConfig = () => {
  const isCloudflare = process.env.CF_PAGES === "1";
  // Cloudflare Pages doesn't support Image Optimization
  if (isCloudflare) {
    return { unoptimized: true };
  }

  return {
    domains: getImageDomains(),
  };
};

module.exports = withBundleAnalyzer({
  images: createImageConfig(),
  // eslint-disable-next-line require-await
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/saved",
        permanent: false,
      },
      {
        source: "/settings",
        destination: "/settings/general",
        permanent: false,
      },
    ];
  },
  webpack: config => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  productionBrowserSourceMaps: process.env.PRODUCTION_SOURCE_MAPS === "true",
});
