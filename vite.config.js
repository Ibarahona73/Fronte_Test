import path from 'path';

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      configFile: 'postcss.config.cjs',
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
};
