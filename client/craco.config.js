// craco.config.js
const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure .mjs files are resolved
      if (!webpackConfig.resolve.extensions.includes(".mjs")) {
        webpackConfig.resolve.extensions.push(".mjs");
      }

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        vm: require.resolve("vm-browserify"),
        zlib: require.resolve("browserify-zlib"),
        process: require.resolve("process/browser.js"),
        fs: false,
        child_process: false,
        net: false,
        tls: false,
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /mock-aws-s3/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /aws-sdk/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /nock/,
        })
      );

      // Add a rule to null-load the HTML file in @mapbox/node-pre-gyp
      webpackConfig.module.rules.push({
        test: /\.html$/,
        // Use a regex that works on Windows and Unix:
        include: /@mapbox[\\/]node-pre-gyp[\\/]lib[\\/]util[\\/]nw-pre-gyp/,
        use: [
          {
            loader: require.resolve("null-loader"),
          },
        ],
      });

      return webpackConfig;
    },
  },
};
