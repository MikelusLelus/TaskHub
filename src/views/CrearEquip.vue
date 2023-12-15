<template>
  <div class="modal-container">
      <div class="task-name-modal">
        <h2>Crear Equip</h2>
      </div>
    <div class="modal-box">
    <div class="modal-content">
      
      <div class="form-group">
        <label for="team-name">Nom de l'equip</label>
        <input type="text" id="team-name" v-model="teamName" placeholder="Tria un Nom" />
      </div>
  
        <div class="form-group">
          <label for="search-members">Membres</label>
          <SearchBar :items="allMembers"
           placeholderText="Buscar els membres"
           @member-selected="addSelectedMember" />
        </div>
        <div class="form-group">
          <label>Seleccionats</label>
          <PersonaBox
            v-for="(user, index) in selectedMembers"
            :key="index"
            :personName="user"
            @remove-person="removePersonFromList"
          />
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="button-container">
        <button class="create-button" @click="createTeam">Crear</button>
        </div>
      </div>
    </div>
    </div>

  </template>

<script>
import axios from 'axios';
import { useStore as useEquipStore } from '../store/equips';
import { useStore as useUserStore } from '../store/user';

import SearchBar from '../components/SearchBar.vue';
import PersonaBox from '../components/PersonaBox.vue';


export default {
    name: "CrearEquip",
    emits: ['show-success'],
    components: {
        SearchBar,
        PersonaBox,
    },
    data() {
      return {
        allMembers: [], 
        teamName: '',
        searchQuery: '',
        selectedMembers: [],
        errorMessage: '',
      };
    },
    created() {
      this.fetchUsers();
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
      addSelectedMember(member) {

        const responsableUserId = useUserStore().id;

        if (responsableUserId === member.id) {
          this.errorMessage = 'No pots afegir-te a tu mateix';
          return;
        } 

        const isAlreadySelected = this.selectedMembers.some(
          selected => selected.id === member.id
        );

        if (!isAlreadySelected) {
          this.selectedMembers.push({
            id: member.id,
            name: member.name 
          });
        } else {
          this.errorMessage = 'Aquest usuari ja està a la llista';
        }
    },
    removePersonFromList(personId) {
      const indexToRemove = this.selectedMembers.findIndex(user => user.id === personId);
      if (indexToRemove !== -1) {
        this.selectedMembers.splice(indexToRemove, 1);
      }
    },
    validateEquip() {
      if(this.teamName.trim() === '') {
        this.errorMessage = 'Cal ficar un nom a l\'equip.';
        return false; 
      }
      if (this.selectedMembers.length === 0) {
        this.errorMessage = 'Cal seleccionar almenys un membre.';
        return false; 
      }
      return true; 
    },
    async createTeam() {
      if (this.validateEquip()) {

        const responsableUserId = useUserStore().id;
        const responsableUserName = useUserStore().name;

        const responsable =[ { id: responsableUserId, name: responsableUserName }, ];

        const newTeam = {
          name: this.teamName.toUpperCase(),
          members: this.selectedMembers,
          responsable: responsable,
        };

        try {
          const store = useEquipStore();
          await store.createTeam(newTeam);
          this.searchQuery = '',
          this.selectedMembers = [],
          this.teamName = '',
          this.errorMessage = '',
          
          this.$emit('show-success', "L'equip s'ha creat amb èxit!");
          this.$router.push('/gestionar-equip');
        } catch (error) {
          this.errorMessage = error;
        }
      }
    },
  },
 };

    
</script>

<style scoped>
/* Estils per a la vista de creació d'equip */

.modal-container {
    width: 40%;
    margin: 20px auto;
    
  }

.task-name-modal {
    background-color: #fff;
    color: #1565c0;
    padding: 20px 20px 10px;
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    text-align: center;
    width: 65%;
    margin: 0 auto;
  }

  .modal-box {
    background-color: #fff;
    border-radius: 30px;
    padding: 20px 0;
  }

  .modal-content {
    width: 65%;
    margin: 0 auto;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    margin: 5px 0;
}

label {
    margin: 5px auto;
    padding: 10px;
    background-color: #b3e5fc;
    border-radius: 30px;
    text-align: center;
    width: 50%;
    color: #1565c0;
    font-weight: bold;
}

input {
    width: 100%;
    margin: 5px auto;
    padding: 10px;
    border-radius: 30px;
    border: 3px solid #b3e5fc;
}


.members-selection,
.selected-members {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}


.button-container {
  display: flex;
  justify-content: center;
}

.create-button {
    padding: 10px 35px;
    background-color: #1565c0;
    color: #fff;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
}

.create-button:hover {
  background-color: #b3e5fc;
    color: #1565c0;
}



@media screen and (max-width: 1024px) {
  .modal-container {
    width: 90%;    
  }

  .modal-content {
    width: 90%;
    margin: 0 auto;
  }
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
  margin-bottom: 20px;
  text-align: center;
}


</style>