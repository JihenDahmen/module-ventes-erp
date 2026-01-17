import QuotesView from '../views/QuotesView.vue'
import OrdersView from '../views/OrdersView.vue'
import DeliveriesView from '../views/DeliveriesView.vue'
import InvoicesView from '../views/InvoicesView.vue'
import PaymentsView from '../views/PaymentsView.vue'
import ReturnsView from '../views/ReturnsView.vue'
import ReportingView from '../views/ReportingView.vue'

const routes = [
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
        path: '/invoices',
        name: 'invoices',
        component: InvoicesView
    },
    {
        path: '/payments',
        name: 'payments',
        component: PaymentsView
    },
    {
        path: '/returns',
        name: 'returns',
        component: ReturnsView
    },
    {
        path: '/reporting',
        name: 'reporting',
        component: ReportingView
    }
]

export default routes

