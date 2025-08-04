import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './firebase'; 
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'; 
import './styles/main.css'; // Убедитесь, что эта строка есть
import i18n from './i18n';

const pinia = createPinia(); 

createApp(App)
  .use(router)
  .use(vuetify)
  .use(pinia)
  .use(i18n)
  .mount('#app')