<template>
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-container">
        <div class="task-name-modal">
          <h2 contenteditable="true" @input="updateTaskName" >{{ task.taskName }}</h2>
        </div>
        <div class="modal-content">

          <div class="button-container">
            <button @click="closeModal">X</button>
          </div>
  
        <div class="task-description">
          <h3>Descripció:</h3>
          <p contenteditable="true" @input="updateTaskDescription">{{ task.description }}</p>
        </div>
        <div class="task-box-flex">
            <div class="props-task1">
              <h3>Estat:</h3>
                <select  class="custom-select" @change="handleInputChange('state', $event)" >
                  <option :value="task.state">{{ task.state }}</option>
                  <option v-for="option in filteredStatusOptions" :key="option" :value="option">{{ option }}</option>
                </select>
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
              <p v-if="task.team === 'PERSONAL'">{{ task.executor.name }}</p>
              <select v-else  class="custom-select" @change="handleInputChange2('executor', $event)" >
                  <option v-for="option in filteredExecutorOptions" :key="option.id" :value="JSON.stringify(option)">{{ option.name }}</option>
                </select>
            </div>
            <div class="props-task1">
              <h3>Data:</h3>
              <p contenteditable="true" @input="validateDateInput">{{ task.date }}</p>
            </div>
            <div class="props-task2">
              <h3>Prioritat:</h3>
              <select  class="custom-select2" @change="handleInputChange('priority', $event)" >
                  <option :value="task.priority">{{ task.priority }}</option>
                  <option v-for="option in filteredPriorityOptions" :key="option" :value="option">{{ option }}</option>
                </select>
            </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="butons-editar">
          <button class="buto-acceptar" @click="crearTasca">Crear</button>
        </div>
        </div>
      </div>
    </div>
  </template>

<script>
import { useStore as useEquipStore } from '../store/equips';
import { useStore as useUserStore } from '../store/user';


import axios from 'axios';

export default {
  name: 'TaskCreationModal',
  emits: ['close-modal','show-success'],
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
      errorMessage: '',
    };
  },
  computed: {
    filteredStatusOptions() {
      const filteredOptions = this.statusOptions.filter(option => option !== this.task.state);
      return filteredOptions;
      },
  filteredExecutorOptions() {

      const storeEquip = useEquipStore();
      const equips = storeEquip.equips;

      const selectedTeamId = this.task.team;

      const selectedTeam = equips.find((equip) => equip.name.toUpperCase() === selectedTeamId);

      const teamMembers = selectedTeam ? selectedTeam.members : [];

      const executorOptions = teamMembers.map((member) => ({
        id: member.id,
        name: member.name,
      }));

      const responsible = this.task.responsible;
      const executorIds = executorOptions.map((executor) => executor.id);
      
      if (responsible && !executorIds.includes(responsible.id)) {
        executorOptions.unshift({
          id: responsible.id,
          name: responsible.name,
        });
      }

      return executorOptions;
    },
    filteredPriorityOptions() {

      const taskPriority = parseInt(this.task.priority); 

      const priorityOptions = [1, 2, 3, 4, 5].filter(option => option !== taskPriority);

      return priorityOptions;
    }
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    },
    isUserResponsible() {
      const storeUser = useUserStore();
      const userId = storeUser.id; 
      return userId === this.task.responsible;
    },
    handleInputChange(fieldName, event) {
      const value = event.target.value;
      this.task[fieldName] = value;
    },
    handleInputChange2(fieldName, event) {
      const value = event.target.value;
      this.task[fieldName] = JSON.parse(value);
    },

    updateTaskName(event) {
      const value = event.target.textContent.trim();
      this.task.taskName = value;
    },
    updateTaskDescription(event) {
      const value = event.target.textContent.trim();
      this.task.description = value; 
    },
    validateDateInput(event) {
      const inputDate = event.target.textContent.trim();
      
      this.task.date = inputDate;
  
    },
    isValidDateFormat(dateString) {
      const regexDatePattern = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])$/;
      return regexDatePattern.test(dateString);
    },
    async crearTasca() {

      const inputDate = this.task.date.trim();
      const isValidDate = this.isValidDateFormat(inputDate);

      if (!isValidDate) {
        this.task.date = '';
        this.errorMessage = 'La data no té un format vàlid! Format esperat: DD-MM';
        return; 
      }
        try {
          const taskData = this.task; 

          const response = await axios.post('https://api-task-hub.onrender.com/api/tasks', taskData); 

          this.closeModal();

          this.$emit('show-success', 'Tasca creada amb èxit');
        } catch (error) {
          console.error('Error en crear la nova tasca:', error.message);
        }
      }
  },
};
</script>

<style scoped>

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); 
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999; 
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
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); 
    overflow-y: auto; 
    max-height: 80vh; 
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
  appearance: none; 
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
  appearance: none; 
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
  border-bottom: 3px solid #1565c0; 
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

.buto-acceptar {
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