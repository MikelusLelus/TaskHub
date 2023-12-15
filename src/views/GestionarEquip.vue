<template>
    <div>
      <h2>Els teus equips</h2>
      <div v-for="(equip, index) in userEquips" :key="index">
        <EquipBox :equip="equip" :allMembers="allMembers" @show-success="handleSuccessMessage" />
      </div>
    </div>
  </template>

<script>

import axios from 'axios';

import { useStore as useEquipStore } from '../store/equips';
import { useStore as useUserStore } from '../store/user';

import EquipBox from '../components/EquipBox.vue';
   
export default {
    name: "GestionarEquip",
    emits: ['show-success'],
    components: {
        EquipBox,
    },
    data() {
        return {
            allMembers: [],
        }
    },    
    created() {
      this.fetchUsers();
      this.fetchEquip();
   },
   computed: {
      userEquips() {
        const equipStore = useEquipStore();
        return equipStore.equips; 
      },
    },
    methods: {
      fetchUsers() {
        axios.get('http://localhost:3000/api/users')
          .then(response => {
            const users = response.data; 

            const formattedUsers = users.map(user => ({
              id: user.id,
              name: user.name
            }));
            this.allMembers = formattedUsers;
          })
          .catch(error => {
            console.error('Error al obtenir els usuaris:', error);
          });
      },
      async fetchEquip() {
        try {

          const userStore = useUserStore();
          const equipStore = useEquipStore();

        if (userStore.isLogged) {
          const userId = userStore.id; 
          
          await equipStore.fetchEquips(userId); 

        } else {
          console.log('Usuari no loggejat');
        }
          
        } catch (error) {
          console.error('Error en obtenir els equips:', error);
        }
      },
      handleSuccessMessage(message) {
        this.$emit('show-success', message);
    },
    },
    };

</script>

<style scoped>

h2 {
    background-color: #fff;
    border-radius: 30px;
    padding: 5px;
    margin: 20px 0;
    width: 32%;
    text-align: center;
    color: #1565c0;
}


@media screen and (max-width: 1024px) {
  h2 {
    margin: 10px auto;
    width: 90%;
}
}

</style>