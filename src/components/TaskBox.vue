<template>
  <div class="task-item" @click="openModal">
    <div class="task-name">
      <p>{{ task.taskName }}</p>
    </div>
    <div v-if="showDate || showPriority" class="task-info" :style="{ backgroundColor: calculateBackgroundColor(task.priority) }">
      <p v-if="showDate">{{ task.date }}</p>
      <p v-else-if="showPriority">{{ task.priority }}</p>
    </div>
  </div>
  <TaskModal 
    :task="task" 
    :showModal="isModalOpen" 
    @close-modal="closeModal"
    @show-success="handleSuccessMessage" 
  />
</template>
  
  <script>
  import TaskModal from './TaskModal.vue';

  export default {
    name: 'TaskBox',
    emits: ['show-success'],
    components: {
      TaskModal
    },
    props: {
      task: {
        type: Object,
        required: true
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
    data() {
      return {
        isModalOpen: false
      };
    },
    methods: {
    calculateBackgroundColor(priority) {
      const opacityMax = 1; // Opacitat màxima corresponent a la prioritat màxima (1 és opacitat completa)
      const opacityMin = 0.2; // Opacitat mínima corresponent a la prioritat mínima (0.2 és opacitat reduïda)
      const priorityMax = 5; // Prioritat màxima
      const priorityMin = 1; // Prioritat mínima
      
      // Càlcul de l'opacitat basat en la prioritat de la tasca
      const opacity = opacityMin + ((priority - priorityMin) * (opacityMax - opacityMin)) / (priorityMax - priorityMin);
      
      // Retorna el color de fons amb l'opacitat aplicada utilitzant rgba()
      return `rgba(21, 101, 192, ${opacity})`; // Ajusta els valors de color (en aquest cas és blau) segons la teva preferència
    },
    openModal() {
      // Obre la finestra modal
      this.isModalOpen = true;
    },
    closeModal() {
      // Tanca la finestra modal
      this.isModalOpen = false;
    },
    handleSuccessMessage(message) {
        this.$emit('show-success', message);
    },
  }
  };
  </script>
  
  <style scoped>
  .task-item {
    display: flex;
    background-color: #b3e5fc;
    cursor: pointer;
    text-align: center;
    border-radius: 30px; 
    margin: 10px auto; 
    width: 75%;
}

.task-item:hover {
  opacity: 50%;
}

.task-info {
  background-color: #1565c0;
  padding: 15px;
  border-radius: 30px; /* Bord arrodonit */
  width: 25%;
  color: #fff;
  font-weight: bold;
}

.task-name {
  padding: 15px;
  background-color: #b3e5fc;
  margin: 0 auto;
  border-radius: 30px; /* Bord arrodonit */
  width: 80%;
  font-weight: 600;
}

@media screen and (max-width: 1024px) {
  .task-item {
    width: 95%;
}
}
  </style>
  