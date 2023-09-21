import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnpluginVueComponents from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import IconsResolver from 'unplugin-icons/resolver';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({ 
      compiler: 'vue3',
      autoInstall: true,
      customCollections: {
        home: FileSystemIconLoader('src/assets/svg', svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')),
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver(), IconsResolver()],
    }),
    UnpluginVueComponents({
      dts: true,
      resolvers: [ElementPlusResolver(), IconsResolver({
        customCollections: ['home']
      })],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${path.resolve('src/assets/less/global.less')}";`,
        },
        javascriptEnabled: true,
      }
      // scss: {
      //   additionalData: `$injectedColor: orange;`
      // }
    }
  }
})
