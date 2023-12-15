<template>
  <div id="app" class="app">
    
    <header class="top-bar">
      <router-link to="/" class="nom_marca">TaskHub</router-link>
    </header>

    
    <main class="main-content">
      <div class="barra-nav">
        <NavBar 
        @selected-option="fetchTask"
        />
        <UsuariBoto />
        <SessioModal :showModal="!userLoggedIn" @show-success="showSuccessMessageLogin" />
        <SuccessMessage :show="showSuccess" :message="successMessage" @hide="hideSuccessMessage" />
      </div>
      <div class="general">
      <RouterView 
      :teamActual="teamActual"
      :tasksData="taskData"
      @show-success="showSuccessMessage" />
      </div>
    </main>
  </div>
</template>

<script>

import { RouterView } from 'vue-router';
import { useStore } from './store/user';
import axios from 'axios';

import NavBar from './components/NavBar.vue';
import UsuariBoto from './components/UsuariBoto.vue'
import SessioModal from './components/SessioModal.vue';
import SuccessMessage from './components/SuccessMessage.vue';

export default {
  name: 'App',
  emits: ['showSuccess', 'selected-options','hide'],
  components: {
    NavBar,
    UsuariBoto,
    RouterView,
    SessioModal,
    SuccessMessage
},
data() {
    return {
      showSuccess: false,
      successMessage: '',
      taskData: [],
      teamActual: {},
    };
  },
computed: {
      userLoggedIn() {
        const store = useStore();
        return store.isLogged; 
      }
  },
methods: {
  async fetchTask(typeID , option ) {
      const store = useStore();
      const userID = store.id;

      this.teamActual = { id: typeID, name: option };


      try {
        const response = await axios.get(`https://api-task-hub.onrender.com/api/tasks`, {
          params: {
            typeID: this.teamActual.id,
            userId: userID
          }
        });

        
        this.taskData = response.data;


      } catch (error) {
        console.error(error);
      }
    },
    
    showSuccessMessage(message) {

      this.successMessage = message;
      this.showSuccess = true;
      this.fetchTask(this.teamActual.id, this.teamActual.name);
      setTimeout(() => {
        this.hideSuccessMessage();
      }, 1000); 
    },
    showSuccessMessageLogin(message) {

      this.successMessage = message;
      this.showSuccess = true;

      const store = useStore();
      const userID = store.id;
      const personalTeamID = `USER${userID}`;

      this.fetchTask(personalTeamID, 'PERSONAL');

      setTimeout(() => {
        this.hideSuccessMessage();
      }, 1000); 
    },
    hideSuccessMessage() {
      this.showSuccess = false;
      this.successMessage = '';
    },
    
  },
};
</script>

<style scoped>

/* Estils de la barra superior */
.top-bar {
  background-color: #1565c0; 
  color: #ffffff; 
  padding: 20px;
}

.nom_marca {
  display: flex;
  margin-left: 5%;
  text-decoration: none;
  color: inherit;
  font-family: 'Roboto', sans-serif;
  font-size: 30px;
  font-weight: bold;
}

/* Estils del contingut principal */
#app {
  background-color: #b3e5fc; 
  min-height: 100vh;  
  padding: 0 0 10px;
}
.main-content {
  padding: 0 0 20px;
  margin: 4% 5%;
}

.barra-nav {
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 2%;
  z-index: 1000;
}


@media screen and (max-width: 1024px) {

  .nom_marca {
    display: flex;
    justify-content: center;
}

  .barra-nav {
    flex-direction: column;
  }
}

</style>

