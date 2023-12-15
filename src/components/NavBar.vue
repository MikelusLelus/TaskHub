<template>
  <div class="navbar">
    <div class="navbar-left" :class="{ 'hidden': showRightBar }" >
      <div v-if="!showLeftBar" class="menu-btn" @click="toggleLeftBar">{{ selectedOption }}</div>
      <div class="options-container" @mouseleave="hideBars" v-else>
        <ul>  
          <li v-for="team in allTeamNames" :key="team">
          <router-link to="/" class="opcionsnav" @click="updateSelectedOption(team.name, team.id); hideBars()">{{ team.name }}</router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="navbar-right" :class="{ 'hidden': showLeftBar }" >
      <div v-if="!showRightBar" class="menu-btn" @click="toggleRightBar">···</div>
      <div class="options-container" @mouseleave="hideBars" v-else>
        <ul>  
          <li><router-link to="/crear-equip" class="opcionsnav" @click="hideBars" >CREAR EQUIP</router-link></li>
          <li><router-link to="/gestionar-equip" class="opcionsnav" @click="hideBars" >GESTIONAR EQUIP</router-link></li>
        </ul>
      </div>
    </div>  
  </div>
</template>

<script>

import { useStore as useEquipStore } from '../store/equips';
import { useStore as useUserStore } from '../store/user';

export default {
  name: 'NavBar',
  emits: ['selected-option'],
  data () {
    return {
      showLeftBar: false,
      showRightBar: false,
      selectedOption: 'PERSONAL'
    }
  },
  computed: {
    allTeamNames() {
      const storeEquips = useEquipStore(); 
      const userTeams = storeEquips.userTeams; 

      const userTeamswithID = userTeams.map(team => ({
        id: `EQUIP${team.id}`,
        name: team.name.toUpperCase() 
      }));

      const storeUser = useUserStore();
      const userID = storeUser.id;

      const personalTeamID = `USER${userID}`;

      const teamNamesWithPersonal = [{ id: personalTeamID, name: 'PERSONAL' }, ...userTeamswithID];

      return teamNamesWithPersonal;
    }
  },
  methods: {
    toggleLeftBar() {
      this.showLeftBar = !this.showLeftBar;
      if (this.showLeftBar) {
        this.showRightBar = false;
      }
    },
    toggleRightBar() {
      this.showRightBar = !this.showRightBar;
      if (this.showRightBar) {
        this.showLeftBar = false;
      }
    },
    hideBars() {
      this.showLeftBar = false;
      this.showRightBar = false;
    },
    updateSelectedOption(option, id) {

      this.selectedOption = option;
      this.$emit('selected-option', id, option);
    }
  }
};
</script>

<style>

.navbar {
  position: relative;
  display: flex;
  justify-content: space-around;
  width: 25%;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  font-size: 20px;
}

.navbar ul {
  list-style: none;
}

.navbar ul li a {
  text-decoration: none;
}

.navbar-left {
  border: 5px solid #fff;
  background-color: #1565c0;
  border-top-left-radius: 30px; 
  border-bottom-left-radius: 30px; 
  text-align: center;
  width: 70%; 
  padding: 5px 0;
}

.navbar-left:hover {
  background-color: #b3e5fc;
}


.navbar-right.hidden, .navbar-left.hidden {
  display: none; 
}

.navbar-right {
  border: 5px solid #fff;
  background-color: #1565c0;
  border-top-right-radius: 30px; 
  border-bottom-right-radius: 30px; 
  text-align: center;
  width: 30%; 
  padding: 5px 0;
}

.navbar-right:hover {
  background-color: #b3e5fc;
}
.menu-btn {
  border: none;
  padding: 5px;
  cursor: pointer;
  color: #fff;
  font-weight: medium;
  
}

.opcionsnav {
  display: flex;
  justify-content: center;
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  height: 100%;
  border: 5px solid #fff;
  background-color: #1565c0;
  color: #fff; 
}

.opcionsnav:hover {
  
  background-color: #b3e5fc;
  transition: all 0.3s ease;
}

.options-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}


@media screen and (max-width: 1024px) {
  .navbar {
    width: 90%;
    margin: 5px auto;
}
}

</style>
