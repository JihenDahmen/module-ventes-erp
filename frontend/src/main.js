import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// IMPORTANT : Bootstrap doit être importé dans cet ordre
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  // AJOUTER CETTE LIGNE
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/css/main.css';

const app = createApp(App);

app.use(store);
app.use(router);

app.mount('#app');