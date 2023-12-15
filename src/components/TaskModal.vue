<template>
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-container">
        <div class="task-name-modal">
          <h2 :contenteditable="isUserResponsible()" @input="updateTaskName" >{{ task.taskName }}</h2>
        </div>
        <div class="modal-content">

          <div class="button-container">
            <button @click="closeModal">X</button>
          </div>

        <div class="task-description">
          <h3>Descripció:</h3>
          <p :contenteditable="isUserResponsible()" @input="updateTaskDescription">{{ task.description }}</p>
        </div>
        <div class="task-box-flex">
            <div class="props-task1">
              <h3>Estat:</h3>
              <template v-if="isUserResponsible()">
                <select  class="custom-select" @change="handleInputChange('state', $event)" >
                  <option :value="task.state">{{ task.state }}</option>
                  <option v-for="option in filteredStatusOptions" :key="option" :value="option">{{ option }}</option>
                </select>
              </template>
              <template v-else>
                <p>{{ task.state }}</p>
              </template>
            </div>
            <div class="props-task2">
              <h3>Equip:</h3>
                <p>{{ task.team }}</p>
            </div>
            <div class="props-task2">
              <h3>Responsable:</h3>
              <p>{{ task.responsible.name }}</p>
            </div>
            <div class="props-task1">
              <h3>Executor: </h3>
              <template v-if="isUserResponsible() && this.editedTask.team !== 'PERSONAL' ">
                <select  class="custom-select" @change="handleInputChange2('executor', $event)" >
                  <option :value="JSON.stringify(task.executor)">{{ task.executor.name }}</option>
                  <option v-for="option in filteredMembers" :key="option.id" :value="JSON.stringify(option)">{{ option.name }}</option>
                </select>
              </template>
              <template v-else>
                <p>{{ task.executor.name }}</p>
              </template>
            </div>
            <div class="props-task1">
              <h3>Data:</h3>
              <p :contenteditable="isUserResponsible()" @input="validateDateInput">{{ task.date }}</p>
            </div>
            <div class="props-task2">
              <h3>Prioritat:</h3>
              <template v-if="isUserResponsible()">
              <select  class="custom-select2" @change="handleInputChange('priority', $event)" >
                  <option :value="task.priority">{{ task.priority }}</option>
                  <option v-for="option in filteredPriorityOptions" :key="option" :value="option">{{ option }}</option>
                </select>
              </template>
              <template v-else>
                <p>{{ task.priority }}</p>
              </template> 
            </div>
        </div>  

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="notes-div">
          <h3>Notes:</h3>
          <span class="ralla-span"></span>
          <p>Encara falta per fer</p>
        </div>
        <div class="butons-editar">
          <button class="buto-eliminar" @click="confirmDeletion">Eliminar</button>
          <button class="buto-acceptar" @click="confirmAcceptance">Acceptar</button>
        </div>

        <ConfirmModal
          :showModal="showConfirmModal"
          title="Confirmació"
          :message="confirmationMessage"
          @close-modal="handleModalClose"
        />
          
        </div>
      </div>
    </div>
  </template>
  
  <script>

  import axios from 'axios';

  import { useStore as useEquipStore } from '../store/equips';
  import { useStore as useUserStore } from '../store/user';


  import ConfirmModal from './ConfirmModal.vue';

  export default {
    name: 'TaskModal',
    emits: ['show-success','close-modal'],
    components: {
      ConfirmModal,
    },
    props: {
      task: {
        type: Object,
        required: true
      },
      showModal: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
        statusOptions: ['EN CURS', 'PER FER', 'ACABADES'],
        editedTask: { team: this.task.team},
        errorMessage: '',
        showConfirmModal: false,
        confirmationMessage: '',
      };
    },
    computed: {
      filteredStatusOptions() {
        // Elimina l'estat actual de les opcions d'estat disponibles
        const filteredOptions = this.statusOptions.filter(option => option !== this.task.state);
        return filteredOptions;
        },
      filteredPriorityOptions() {
        const taskPriority = parseInt(this.task.priority); // Converteix la prioritat de la tasca a enter

        // Crea un array amb els valors de prioritat de 2 a 5 (excloent la prioritat actual)
        const priorityOptions = [1, 2, 3, 4, 5].filter(option => option !== taskPriority);

        return priorityOptions;
        },
      filteredMembers() {
        
          const storeEquip = useEquipStore();
          const equips = storeEquip.equips;

          let selectedTeamId = this.task.team;
     

          const selectedTeam = equips.find((equip) => equip.name === selectedTeamId);


          const teamMembers = selectedTeam ? selectedTeam.members : [];

          const teamResponsibles = selectedTeam ? selectedTeam.responsable || [] : [];

          const combinedMembers = [...teamMembers, ...teamResponsibles];

          const filteredMembers = combinedMembers.filter(member => member.name !== this.task.executor.name);

          return filteredMembers;
        },
    },
    methods: {
      closeModal() {
        this.$emit('close-modal');
      },
      isUserResponsible() {
        const storeUser = useUserStore();
        const userId = storeUser.id; 
        return userId === this.task.responsible.id;
      },
      updateTaskField(fieldName, value) {
        this.editedTask = { ...this.editedTask, [fieldName]: value };
      },
      handleInputChange(fieldName, event) {
        const value = event.target.value;
        this.updateTaskField(fieldName, value);
      },
      handleInputChange2(fieldName, event) {
        const value = event.target.value;
        this.updateTaskField(fieldName, JSON.parse(value));
      },
      updateTaskName(event) {
        const value = event.target.textContent.trim();
        this.updateTaskField('taskName', value);
      },
        updateTaskDescription(event) {
        const value = event.target.textContent.trim();
        this.updateTaskField('description', value);
      },
      updateTaskDate(event) {
        const value = event.target.textContent.trim();
        this.updateTaskField('date', value);
      },
      validateDateInput(event) {
      const inputDate = event.target.textContent.trim();
      this.editedTask.date = inputDate;
      },
      isValidDateFormat(dateString) {
        const regexDatePattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // Format MES-DIA (MM-DD)
        return regexDatePattern.test(dateString);
      },
      confirmAcceptance() {
        
        if (!this.isUserResponsible()) {
          this.errorMessage = 'Només el responsable pot acceptar aquesta tasca.';
          return;
        }

        // Verifica si hay cambios realizados en editedTask
      if (Object.keys(this.editedTask).length === 0 && this.editedTask.constructor === Object) {
        this.errorMessage = 'No has realitzat cap canvi en cap terme.';
        return;
      }

      // Verifica si la fecha tiene un formato válido
      if (this.editedTask.date && !this.isValidDateFormat(this.editedTask.date.trim())) {
        this.errorMessage = 'La data no té un format vàlid! Format esperat: MM-DD';
        return;
      }
 
        // Si l'usuari és el responsable, obre el modal de confirmació
        this.confirmationMessage = 'Estàs segur que vols acceptar aquesta tasca?';
        this.showConfirmModal = true;
      },
      confirmDeletion() {
        if (!this.isUserResponsible()) {
          this.errorMessage = 'Només el responsable pot eliminar aquesta tasca.';
          return;
        }

        // Si l'usuari és el responsable, obre el modal de confirmació
        this.confirmationMessage = 'Estàs segur que vols eliminar aquesta tasca?';
        this.showConfirmModal = true;
      },
      async deleteTask() {
        try {
          const taskId = this.task.id; // ID de la tarea que quieres eliminar
          const response = await axios.delete(`https://api-task-hub.onrender.com/api/tasks/${taskId}`);

          this.closeModal();
          this.$emit('show-success', response.data.message);
          console.log(response.data); // Mensaje de confirmación de eliminación

          // Lógica adicional si es necesaria después de la eliminación
        } catch (error) {
          console.error('Error al eliminar la tarea:', error);
          // Manejo de errores si la solicitud falla
        }
      },

      async acceptTask() {
        try {
          const taskId = this.task.id; // ID de la tasca a actualitzar
          const response = await axios.put(`https://api-task-hub.onrender.com/api/tasks/${taskId}`, this.editedTask); // Crida a l'API amb les dades a actualitzar

          this.closeModal();
          this.$emit('show-success', response.data.message);

        } catch (error) {
          console.error('Error en actualitzar la tasca:', error);
      
        }
      },
      handleModalClose(confirmedAction) {
        if (confirmedAction) {
          // Si se confirma la acción en el modal de confirmación
          if (this.confirmationMessage === 'Estàs segur que vols eliminar aquesta tasca?') {
            // Si se confirma la eliminación, se llama a la función deleteTask
            this.deleteTask();
          } else if (this.confirmationMessage === 'Estàs segur que vols acceptar aquesta tasca?') {
            // Si se confirma la aceptación, se llama a la función acceptTask
            this.acceptTask();
          }
        }

        // Cerrar el modal de confirmación
        this.showConfirmModal = false;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Estils per al modal */

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Opacitat fons */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999; /* Asegura que el modal estigui per sobre de la resta del contingut */
  }
  
  .modal-container {
    padding: 20px;
    width: 55%;
    
  }

  .task-name-modal {
    background-color: #1565c0;
    color: #fff;
    padding: 20px 20px 10px;
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    text-align: center;
    width: 80%;
    margin: 0 auto;
  }
  
  .modal-content {
    background-color: #fff;
    border-radius: 30px;
    padding: 0px 0px 20px 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* Ombra */
    overflow-y: auto; /* Afegeix una barra d'scroll vertical si el contingut és més gran que la finestra */
    max-height: 80vh; /* Limita la mida del contingut per evitar que s'escapi de la finestra */
  }
 .task-description {
  margin: 0 auto;
  width: 80%;
 }

  h3 {
    color: #1565c0;
    margin-bottom: 10px;
    text-align: center;
    font-size: 15px;
    font-weight: 900;
}

.task-description p {
  border: 3px solid #b3e5fc;
  border-radius: 30px;
  color: #000;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  
}

.task-box-flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 80%;
  margin: 0 auto;
}

.props-task1, .props-task2 {
  width: 48%;
  padding: 10px;
}


.props-task1 p {
  margin-top: 5px;
  padding: 10px;
  background-color: #1565c0;
  border-radius: 30px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.props-task2 p {
  margin-top: 5px;
  padding: 10px;
  background-color: #b3e5fc;
  border-radius: 30px;
  text-align: center;
  color: #1565c0;
  font-size: 16px;
  font-weight: bold;
}


.custom-select {
  border-radius: 30px;
  border: none;
  color: #fff;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  background-color: #1565c0;
  appearance: none; /* Elimina l'estil estàndard dels selects del navegador */
  width: 100%;
  height: auto;
  font-weight: bold;
}

.custom-select2 {
  border-radius: 30px;
  border: none;
  color: #1565c0;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  background-color: #b3e5fc;
  appearance: none; /* Elimina l'estil estàndard dels selects del navegador */
  width: 100%;
  height: auto;
  font-weight: bold;
}

.custom-select option {
  background-color: #b3e5fc;
  color: #1565c0;
  padding: 10px;
}

.button-container {
    display: flex;
    justify-content: flex-end;
    margin: 0;
}

  button {
    padding: 10px 25px;
    margin: 10px;
    background-color: #1565c0;
    color: #fff;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    font-size: 25px;
    font-weight: bold;

    
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
    justify-content: space-around;
    width: 80%;
    margin: 0 auto;
  }


  .notes-div {
  text-align: center;
  padding: 20px;
  margin-bottom: 10px;
}

.ralla-span {
  display: block;
  width: 80%;
  margin: 10px auto;
  border-bottom: 3px solid #1565c0; /* Color de la ralla */
}

@media screen and (max-width: 1024px) {

  .modal-container{
    width: 90%;
  }

  .task-box-flex {
    flex-direction: column;
  }

  .props-task1, .props-task2 {
    width: 100%;
  }

  
.props-task1 p {
  background-color: #b3e5fc;
  color: #1565c0;

}

.custom-select {
  background-color: #b3e5fc;
  color: #1565c0;

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
  