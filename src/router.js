import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from './store/user.js';

import Home from './views/Home.vue';
import GestionarEquip from './views/GestionarEquip.vue';
import CrearEquip from './views/CrearEquip.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/gestionar-equip',
    name: 'GestionarEquip',
    component: GestionarEquip,
    beforeEnter: (to, from, next) => {
      const store = useStore(); 
      const isLogged = store.isLogged; 

      if (isLogged) {
        next(); 
      } else {
        next('/'); 
      }
    }
  },
  {
    path: '/crear-equip',
    name: 'CrearEquip',
    component: CrearEquip,
    beforeEnter: (to, from, next) => {
      const store = useStore(); 
      const isLogged = store.isLogged; 

      if (isLogged) {
        next(); 
      } else {
        next('/'); 
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
