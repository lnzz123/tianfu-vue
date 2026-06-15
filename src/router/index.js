import Vue from 'vue'
import VueRouter from 'vue-router'
import AdminView from '../views/admin/AdminView.vue'
import LoginView from '../views/admin/LoginView.vue'
import NotFound from '../views/NotFound.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/404',
    name: 'notFound',
    component: NotFound
  },
  {
    path: '*',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
