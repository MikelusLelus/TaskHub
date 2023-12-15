import { defineStore } from 'pinia'
import axios from 'axios';

export const useStore = defineStore('user', {
  state: () => ({
    logged: false,
    name: '',
    id: '',
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:3000/api/login', { email, password });
        const { name, id } = response.data.user;
        this.logged = true;
        this.name = name;
        this.id = id;
        console.log('Inici de sessió correcte');
      } catch (error) {
        throw error.response.data.error; // Retorna el missatge d'error rebut de l'API
      }
    },
    logout() {
      this.logged = false;
      this.name = '';
      this.id = '';
      console.log('Sessió tancada');
    },
  async register(name, email, password, confirmPassword) {
      try {
        const response = await axios.post('http://localhost:3000/api/register', {
          name,
          email,
          password,
          confirmPassword 
        });        
      } catch (error) {
        throw error.response.data.error;
      }
    }
  },
  getters: {
    isLogged() {
      return this.logged;
    },
    getName() {
      return this.name;
    },
    getId() {
      return this.id;
    },
    getInitials() {
      if (this.name) {
        return this.name.substring(0, 2);
      }
      return '-';
    },
  }
})
