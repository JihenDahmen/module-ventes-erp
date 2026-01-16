import { createRouter, createWebHistory } from 'vue-router'
import QuotesView from '../views/QuotesView.vue'
import OrdersView from '../views/OrdersView.vue'
import DeliveriesView from '../views/DeliveriesView.vue'
import ReportingView from '../views/ReportingView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/quotes'
        },
        {
            path: '/quotes',
            name: 'quotes',
            component: QuotesView
        },
        {
            path: '/orders',
            name: 'orders',
            component: OrdersView
        },
        {
            path: '/deliveries',
            name: 'deliveries',
            component: DeliveriesView
        },
        {
            path: '/reporting',
            name: 'reporting',
            component: ReportingView
        }
    ]
})

export default router

