import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'; // https://github.com/hannoeru/vite-plugin-pages
import Components from 'unplugin-vue-components/vite'; // https://github.com/antfu/unplugin-vue-components
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
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
    Pages({
      nuxtStyle: true,
    }),
    Components({
      dts: true,
      extensions: ['vue', 'ts'],
      resolvers: [
        NaiveUiResolver(),
      ],
    }),
  ],
})
