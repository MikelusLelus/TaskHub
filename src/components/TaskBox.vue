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
      const opacityMax = 1; 
      const opacityMin = 0.2; 
      const priorityMax = 5; 
      const priorityMin = 1; 
      
      const opacity = opacityMin + ((priority - priorityMin) * (opacityMax - opacityMin)) / (priorityMax - priorityMin);
      
      return `rgba(21, 101, 192, ${opacity})`;
    },
    openModal() {
      this.isModalOpen = true;
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
  border-radius: 30px; 
  width: 25%;
  color: #fff;
  font-weight: bold;
}

.task-name {
  padding: 15px;
  background-color: #b3e5fc;
  margin: 0 auto;
  border-radius: 30px; 
  width: 80%;
  font-weight: 600;
}

@media screen and (max-width: 1024px) {
  .task-item {
    width: 95%;
}
}
  </style>
  