<template>
    <div v-if="show" class="overlay" @click="hideMessage">
      <div class="success-message">
        {{ message }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SuccessMessage',
    emit: ['hide'],
    props: {
      show: {
        type: Boolean,
        required: true
      },
      message: {
        type: String,
        required: true
      }
    },
    methods: {
      hideMessage() {
        this.$emit('hide');
      }
    }
  };
  </script>
  
  <style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Fons amb opacitat */
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .success-message {
    padding: 30px;
    background-color: #fff; 
    color: #1565c0;
    border-radius: 10px;
    font-size: 20px;
  }
  </style>
  