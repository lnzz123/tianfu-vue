import Vue from 'vue'
import VueRouter from 'vue-router'
import AdminView from '../views/admin/AdminView.vue'
import LoginView from '../views/admin/LoginView.vue'

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
  }
]

const router = new VueRouter({
  routes
})

export default router
