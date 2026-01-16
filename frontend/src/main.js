import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Global styles
import './style.css'

console.log('Starting App...');
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
console.log('App Mounted');
