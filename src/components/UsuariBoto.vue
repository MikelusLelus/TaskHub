<template>
  <div class="buto-container">
  <button @click="changeModal" >
    {{ userInitials }}
  </button>
  </div> 
  <ConfirmModal
      :showModal="isModalOpen"
      :title="'Tancar sessió'"
      :message="'Estàs segur que vols tancar la sessió?'"
      @close-modal="onModalClose"
    />

  </template>
  
  <script>

  import { useStore } from '../store/user';
  import ConfirmModal from './ConfirmModal.vue';

  export default {
    name: 'UsuariBoto',
    components: {
      ConfirmModal,
    },
    data() {
      return {
        isModalOpen: false
      };
    },
    computed: {
      userInitials() {
        const store = useStore();
        return store.getInitials; 
    },
  },
  methods: {
    changeModal() {
      this.isModalOpen = !this.isModalOpen;
    },
    onModalClose(confirmed) {
      if (confirmed) {
        const store = useStore();
        store.logout(); 
      }
      this.isModalOpen = false; 
    },
  }
};
  </script>
  
  <style scoped>
  /* Aquí pots afegir estils al teu botó si és necessari */
  button {
    border: 5px solid #fff;
    background-color: #1565c0;
    border-radius: 30px; 
    padding: 10px 20px;
    max-width: 90px;
    text-align: center;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
  }

  button:hover{
    background-color: #b3e5fc;
  }

  @media screen and (max-width: 1024px) {
    .buto-container {
    display: flex;
    justify-content: flex-end;
    width: 95%;
  }
}
  
  </style>
  