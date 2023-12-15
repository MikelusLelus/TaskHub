<template>
    <div class="container-box">
      <div class="box-h2">
        <h2>{{ title }}</h2>
      </div>
      <div class="tasks-box">
      <div v-for="task in tasks" :key="task.id">
        <TaskBox :task="task" :showDate="showDate" :showPriority="showPriority" @show-success="handleSuccessMessage" />
      </div>
      </div>
      <div class="button-container">
      <button v-if="showButton" @click="handleButtonClick">+</button>
      </div>
    </div>
    <TaskCreationModal :task="newTaskObject" :showModal="isModalOpen" @close-modal="closeModal" @show-success="handleSuccessMessage" />
  </template>
  
  <script>
  import { useStore as useEquipStore } from '../store/equips';
  import { useStore as useUserStore } from '../store/user';

  import TaskBox from './TaskBox.vue'
  import TaskCreationModal from './TaskCreationModal.vue';

  

  export default {
    name: 'TaskComponent',
    emits: ['show-success'],
    components: {
        TaskBox,
        TaskCreationModal
    },
    data() {
      return {
        isModalOpen: false,
        newTaskObject: {}
      };
    },
    props: {
      title: {
        type: String,
        required: true
      },
      teamActual: {
        type: Object,
      },
      tasks: {
        type: Array,
        required: true
      },
      showButton: {
        type: Boolean,
        default: false
      },
      showDate: {
        type: Boolean,
        default: false
      },
      showPriority: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      handleButtonClick() {

        const storeUser = useUserStore();
        const userId = storeUser.id;
        const userName = storeUser.name;

        const storeEquip = useEquipStore();
        const equips = storeEquip.equips;   
        
        console.log(this.teamActual);

        const userObject = {
          id: userId,
          name: userName
        };

        let isResponsible = false;

        if (this.teamActual.id.startsWith('USER')) {
          const userPart = this.teamActual.id.substring(4); 
          if (parseInt(userPart) === userId) {
            isResponsible = true;
            console.log('funciono tot ok');
          }
        } else if (this.teamActual.id.startsWith('EQUIP')) {
          const equipId = this.teamActual.id.substring(5); 
          const equip = equips.find(equip => equip.id === parseInt(equipId));
          if (equip) {
            isResponsible = equip.responsable.some(responsable => responsable.id === userId);
          }
        }

       if (isResponsible) {

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${day}-${month}`;

        
          const defaultTask = {
            taskName: 'Tria el títol',
            description: 'Aquí has de ficar la descripció',
            state: this.title,
            team: this.teamActual.name,
            responsible: userObject,
            executor: userObject,
            date: formattedDate,
            priority: '1',
            typeID: this.teamActual.id
          };

          this.newTaskObject = { ...defaultTask };
          this.isModalOpen = true;
        } else {
          console.error('No ets el responsable de l\'equip, no pots crear una tasca.');
        }
      },
      closeModal() {
        this.isModalOpen = false;
      },
      handleSuccessMessage(message) {
        this.$emit('show-success', message);
    },
    }
  };
  </script>
  
  <style scoped>


  .container-box {
    margin: 100px 0;
    width: 32%;
  }

  .box-h2 {
    background-color: #fff;
    color: #1565c0;
    padding: 20px 20px 10px;
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    text-align: center;
    width: 50%;
    margin: 0 auto;
}


  .tasks-box {
    background-color: #fff;
    border-radius: 30px;
    padding: 25px 10px;
  }

  .button-container {
    display: flex;
    justify-content: center;
    background-color: #fff;
    position: relative;
}

  button {
    padding: 10px 25px;
    background-color: #1565c0;
    color: #fff;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    position: absolute;
    transform: translateY(-50%);
    font-size: 30px;
    font-weight: bold;
  }

  button:hover {
    background-color: #b3e5fc;
    color: #1565c0;
  }
  

  @media screen and (max-width: 1024px) {
    .container-box {
    margin: 50px auto;
    width: 090%;
  }
}
  

  </style>
  