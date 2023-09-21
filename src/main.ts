import { createApp } from 'vue'
import './style.css'
// import './assets/less/global.less'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import svgIcon from './assets/icons/svg-icon.vue'
import 'element-plus/theme-chalk/index.css'

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component('svg-icon', svgIcon);
app.mount('#app');