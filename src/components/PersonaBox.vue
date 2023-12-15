<template>
    <div class="person-box">
      <div class="initials">{{ personName.name.slice(0, 2) }}</div>
      <div class="full-name">{{ personName.name }}</div>
      <button @click="removePerson">-</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PersonaBox',
    emits: ['remove-person'],
    props: {
      personName: {
        type: Object,
        required: true
      }
    },
    methods: {
        removePerson() {
            this.$emit('remove-person', this.personName.id); 
        }
    }
  };
  </script>
  
  <style scoped>
  .person-box {
    display: flex;
    align-items: center;
    border-radius: 30px;;
    border: 3px solid #1565c0;
    margin: 10px 0;
  }
  
  .initials {
    width: 50px;
    height: 40px;
    border-radius: 30px;
    background-color: #1565c0;
    border: none;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
  }
  
  .full-name {
    flex-grow: 1;
    text-align: center;

  }
  
  button {
    width: 50px;
    height: 40px;
    border-radius: 30px;
    background-color: #1565c0;
    cursor: pointer;
    border: none;
    color: #fff;
  }

  button:hover {
    background-color: #b3e5fc;
    color: #1565c0;
  }
  </style>
  