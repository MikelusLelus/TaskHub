<template>
    <div class="modal-container">
      <div class="task-name-modal">
        <h3
        v-if="isResponsable"
        contenteditable="true"
        @input="equip.name = $event.target.textContent"
        ref="editableName"
      >
        {{ equip.name }}
      </h3>
      <h3 v-else>{{ equip.name }}</h3>
      </div>
    
    <div class="modal-box">
    <div class="modal-content">
    <div class="titol-h4">Responsables</div>
      <SearchBar
          :items="equip.members" 
          placeholderText="Afegeix responsable"
          @member-selected="addResponsable" 
          />
    <div class="flex-container">
        <div class="flex-item" v-for="(responsable, index) in equip.responsable" :key="index">
          <PersonaBox :personName="responsable" @remove-person="removeResponsable(responsable)" />
        </div>
    </div>
    <div class="titol-h4">Membres</div>
        <SearchBar
        :items="allMembers" 
        placeholderText="Afegeix responsable"
        @member-selected="addMember" />
    <div class="flex-container">
        <div class="flex-item" v-for="(membre, index) in equip.members" :key="index">
          <PersonaBox :personName="membre" @remove-person="removeMember(membre)" />
        </div>
    </div>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="butons-editar">
            <button class="buto-eliminar" @click="confirmAction('eliminar')">Eliminar</button>
           <button class="buto-acceptar" @click="confirmAction('actualitzar')" >Actualitzar</button>
        </div>
        
        <ConfirmModal
          :showModal="showConfirmation"
          :title="confirmationTitle"
          :message="confirmationMessage"
          @close-modal="handleConfirmationClose"
        />

        
      </div>
    </div>
    </div>

  </template>
  
  <script>

import { useStore as useEquipStore } from '../store/equips';
import { useStore as useUserStore } from '../store/user';

  import SearchBar from './SearchBar.vue'; 
  import PersonaBox from './PersonaBox.vue'; 
  import ConfirmModal from './ConfirmModal.vue';
  
  export default {
    name: 'EquipBox',
    emit: ['show-success'],
    components: {
      SearchBar,
      PersonaBox,
      ConfirmModal,
    },
    props: {
      equip: {
        type: Object,
        required: true
      },
      allMembers: {
        type: Object,
        required: true
      },
    },
    data () {
        return {
          errorMessage: '',
          isResponsable: false,
          showConfirmation: false,
          confirmationTitle: '',
          confirmationMessage: '',
          confirmationAction: '',
        }
    },
    created() {
      this.checkIfCurrentUserIsResponsible();
    },
    methods: {
      checkIfCurrentUserIsResponsible() {
        const userStore = useUserStore(); 
        const userId = userStore.id; 
        const isCurrentUserResponsible = this.equip.responsable.some(responsable => responsable.id === userId);
        if(isCurrentUserResponsible) {
          this.isResponsable = true;
        } else {
          console.log('No ets un dels responsables d\'aquest equip');
        }
      },
      addResponsable(person) {
        if (this.isResponsable) {

          const isAlreadyResponsible = this.equip.responsable.some(responsable => responsable.id === person.id);
          
          if (this.equip.members.length > 1) {

            if (!isAlreadyResponsible) {
              this.equip.responsable.push(person);
              this.removeMember(person);
              this.errorMessage = '';
            } else {
              this.errorMessage = 'Aquest usuari ja és un responsable a l\'equip';
            }

          } else {
            this.errorMessage = 'L\'equip no es pot quedar sense membres';
          }
          
        } else {
          this.errorMessage = 'No ets un dels responsables d\'aquest equip';
        }
      },
      removeResponsable(person) {

        const userStore = useUserStore(); 
        const userId = userStore.id;


        if (this.isResponsable) {
          const index = this.equip.responsable.findIndex(responsable => responsable.id === person.id);
          if (index !== -1) {
              if (person.id === userId) {
              this.errorMessage = 'No pots eliminar-te com a responsable de l\'equip';
              return;
            }
            if (this.equip.responsable.length > 1) {
              this.equip.responsable.splice(index, 1);
              this.errorMessage = '';
            } else {
              this.errorMessage = 'Ha de haver almenys un responsable a l\'equip';
            }
          } else {
            this.errorMessage = 'No s\'ha trobat aquest responsable a l\'equip';
          }
        } else {
          this.errorMessage = 'No ets un dels responsables d\'aquest equip';
        }     
      },
      addMember(person) {
        if (this.isResponsable) {
          const isAlreadyResponsible = this.equip.responsable.some(responsable => responsable.id === person.id);
          const isAlreadyMember = this.equip.members.some(member => member.id === person.id);

          if (!isAlreadyResponsible && !isAlreadyMember) {
            this.equip.members.push(person);
            this.errorMessage = '';
          } else {
            this.errorMessage = isAlreadyResponsible
              ? 'Aquest usuari ja és un responsable a l\'equip'
              : 'Aquest usuari ja és un membre a l\'equip';
          }
        } else {
          this.errorMessage = 'No ets un dels responsables d\'aquest equip';
        }
      },
      removeMember(person) {
        if (this.isResponsable) {
          const index = this.equip.members.findIndex(member => member.id === person.id);
          if (index !== -1) {
            if (this.equip.members.length > 1) {
              this.equip.members.splice(index, 1);
              this.errorMessage = '';
            } else {
              this.errorMessage = 'Ha de haver almenys un membre a l\'equip';
            }
          } else {
            this.errorMessage = 'No s\'ha trobat aquest membre a l\'equip';
          }
        } else {
          this.errorMessage = 'No ets un dels responsables d\'aquest equip';
        }    
      },
      confirmAction(action) {
        if (this.isResponsable) {
          this.confirmationAction = action;
          this.confirmationTitle = this.confirmationAction === 'eliminar' ? 'Eliminar Equip' : 'Actualitzar Equip';
          this.confirmationMessage = this.confirmationAction === 'eliminar' ? 'Estàs segur que vols eliminar aquest equip?' : 'Estàs segur que vols actualitzar aquest equip?';
          this.showConfirmation = true;
        } else {
          this.errorMessage = 'No ets un dels responsables d\'aquest equip';
        }
      },
      handleConfirmationClose(confirmed) {
      if (confirmed) {
        if (this.confirmationAction === 'eliminar') {

          this.eliminarEquip();
          
        } else if (this.confirmationAction === 'actualitzar') {

          this.actualitzarEquip();
          
        }

        this.showConfirmation = false;
      } else {
        this.showConfirmation = false;
      }
    },

    async actualitzarEquip() {
      try {

          const equipStore = useEquipStore();

          const equipId = this.equip.id;

          const updatedData = this.equip;


          await equipStore.updateTeam(equipId, updatedData);

          this.$emit('show-success', 'Equip actualitzat amb èxit');


      } catch (error) {
        this.errorMessage = error;
      }
    },

    async eliminarEquip() {
      try {

          const equipStore = useEquipStore();

          const equipId = this.equip.id;

          await equipStore.deleteTeam(equipId);

          this.$emit('show-success', 'Equip eliminat amb èxit');


      } catch (error) {
        this.errorMessage = error;
      }
    },
    }
  };
  </script>
  
  <style scoped>
  .modal-container {
    width: 60%;
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
    width: 80%;
    margin: 0 auto;
  }

.titol-h4 {
    margin: 5px;
    padding: 10px;
    background-color: #b3e5fc;
    border-radius: 30px;
    text-align: center;
    width: 30%;
    color: #1565c0;
    font-weight: bold;
}



.flex-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.flex-item {
  width: 49%;
}



button {
    padding: 10px 35px;
    margin: 0 10px;
    background-color: #1565c0;
    color: #fff;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
    width: 30%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    
  }

  button:hover {
    background-color: #b3e5fc;
    color: #1565c0;
  }

  .buto-eliminar {
    background-color: #b3e5fc;
    color: #1565c0;
    
  }

  .buto-eliminar:hover {
    background-color: #1565c0;
    color: #fff;

  }

  .butons-editar {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }

@media screen and (max-width: 1024px) {
    .modal-container {
        width: 90%;
    }

    .titol-h4 {
      width: 80%;
      margin: 0 auto;
    }

    .flex-container {
      flex-direction: column;
    }

    .flex-item {
      width: 100%;
    }
    .buto-acceptar, .buto-eliminar {
      width: 80%;
      margin: 10px auto;
    }
      .butons-editar{
        flex-direction: column;
      }

}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
  text-align: center;
}

  </style>
  