<template>
      <input type="text" v-model="searchQuery" @input="search" :placeholder="placeholderText" class="input-field" />
      <ul v-if="showList">
        <li v-for="(item, index) in displayedItems" :key="index" @click="selectMember(item)" class="list-item">
          {{ item.name }}
        </li>
      </ul>
  </template>
  
  <script>
  export default {
    name: 'SearchBar',
    emits: ['member-selected'],
    props: {
      items: {
        type: Array,
        required: true
      },
      placeholderText: {
        type: String,
        default: 'Cerca...'
      }
    },
    data() {
      return {
        searchQuery: '',
        showList: false
      };
    },
    computed: {
      filteredItems() {
        return this.items.filter(item =>
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      displayedItems() {
        return this.filteredItems.slice(0, 4); 
      }
    },
    methods: {
      search() {
        this.showList = this.searchQuery.length > 0; 
      },
      selectMember(item) {
        this.$emit('member-selected', item);
        this.searchQuery = '';
        this.showList = false;
      }
    }
  };
  </script>
  
  <style scoped>  
  
  .input-field {
    width: 100%;
    margin: 5px auto;
    padding: 10px;
    border-radius: 30px;
    border: 3px solid #b3e5fc;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
   }
  
  .list-item {
    cursor: pointer;
    margin: 5px;
    padding: 10px;
    background-color: #b3e5fc;
    border-radius: 30px;
    text-align: center;
    color: #1565c0;
  }
  
  .list-item:hover {
    background-color: #1565c0;
    color: #fff;
  }
  </style>
  
  