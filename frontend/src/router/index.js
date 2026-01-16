import { createRouter, createWebHistory } from 'vue-router'
import coreRoutes from '../modules/core/router'
import salesRoutes from '../modules/sales/router'
import LandingPage from '../views/LandingPage.vue'

const routes = [
    {
        path: '/',
        name: 'landing',
        component: LandingPage
    },
    ...coreRoutes,
    ...salesRoutes
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
