import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'; // https://github.com/antfu/unplugin-vue-components
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../public',
  },
  server: {
    port: 3001,
  },
  base: '/',
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/index.scss";`
      }
    }
  },
  plugins: [
    Vue(),
    Components({
      dts: true,
      extensions: ['vue', 'ts'],
      resolvers: [
        NaiveUiResolver(),
      ],
    }),
  ],
})
