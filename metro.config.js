const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Add proper MIME type configuration for web bundles
  config.resolver.assetExts.push('bundle');
  config.transformer.minifierConfig = {
    ...config.transformer.minifierConfig,
    compress: {
      ...config.transformer.minifierConfig?.compress,
      reduce_funcs: false,
    },
  };

  // Ensure proper content type headers for web bundles
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.endsWith('.bundle')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        return middleware(req, res, next);
      };
    },
  };

  return config;
})();