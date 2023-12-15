<template>
    <div class="contanidor-flex">
      <TaskComponent :title="boxTitleInProgress" :tasks="tasksInProgress" :teamActual="teamActual" :showButton="true" :showDate="true" @show-success="handleSuccessMessage" />
      <TaskComponent :title="boxTitleToDo" :tasks="tasksToDo" :teamActual="teamActual" :showButton="true" :showPriority="true" @show-success="handleSuccessMessage" />
      <TaskComponent :title="boxTitleDone" :tasks="tasksDone" @show-success="handleSuccessMessage" />
  </div>
</template>

<script>

import TaskComponent from '../components/TaskComponent.vue';

export default {
    name: "Home",
    emits: ['show-success'],
    components: {
        TaskComponent,
  },
  props: {
      tasksData: {
        type: Array,
        required: true
      },
      teamActual: {
        type: Object,
      },
  },
  data() {
    return {
      boxTitleInProgress: 'EN CURS', 
      boxTitleToDo: 'PER FER', 
      boxTitleDone: 'ACABADES', 
    };
  },
  computed: {
    tasksInProgress() {
      return this.filterTasksByCategory('EN CURS');
    },
    tasksToDo() {
      return this.filterTasksByCategory('PER FER');
    },
    tasksDone() {
      return this.filterTasksByCategory('ACABADES');
    }
  },
  methods: {
    filterTasksByCategory(category) {
      const filteredByCategory = this.tasksData.filter(task => task.state === category);

      return filteredByCategory.sort((a, b) => b.priority - a.priority);

    },
    handleSuccessMessage(message) {
        this.$emit('show-success', message);
    },
  },
    };
</script>

<style scoped>

.contanidor-flex {
  display: flex;
  justify-content: space-between;
}

@media screen and (max-width: 1024px) {
  .contanidor-flex {
    flex-direction: column;
  }
}



</style>
