import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home.vue'
import NewPassword from './views/NewPassword.vue'
import VerifyEmail from './views/VerifyEmail.vue'

Vue.use(Router);

export default new Router({
  routes: [
    {
      name: 'home',
      path: '/',
      component: Home
    },
    {
      name: 'new-password',
      path: '/newPassword/:user_id/:recovery_key',
      component: NewPassword
    },
    {
      name: 'verify-email',
      path: '/verifyEmail/:user_id/:recovery_key/:email',
      component: VerifyEmail
    },
    {
      path: '*',
      redirect: '/'
    }
  ],
  mode: 'history',
  scrollBehavior: function (to, from, savedPosition) {
    return savedPosition || {x: 0, y: 0};
  }
})
