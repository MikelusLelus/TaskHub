import { defineStore } from 'pinia'
import axios from 'axios';

export const useStore = defineStore('equips', {
  state: () => ({
    equips: [],
    userTeams: [],
  }),
  actions: {
    async fetchEquips(userID) {
        try {
          const response = await axios.get(`https://api-task-hub.onrender.com/api/equips?userId=${userID}`);
          this.equips = response.data;

        this.userTeams = response.data.map(team => ({
          id: team.id,
          name: team.name
        }));
        
        } catch (error) {
          throw error.response.data.error;
        }
      },
      async createTeam(teamData) {
        try {
          const response = await axios.post('https://api-task-hub.onrender.com/api/equips', teamData);
          const newTeam = response.data;
          this.equips.push(newTeam);
          
        } catch (error) {
          throw error.response.data.error;
        }
      },
      async updateTeam(equipId, updatedData) {
        try {
          const response = await axios.put(`https://api-task-hub.onrender.com/api/equips/${equipId}`, updatedData);


            const indexToUpdate = this.equips.findIndex(team => team.id === equipId);
        
            if (indexToUpdate !== -1) {
              this.equips[indexToUpdate] = { ...this.equips[indexToUpdate], ...updatedData };
            }
        } catch (error) {
          throw error.response.data.error; 
        }
      },
      async deleteTeam(equipId) {
        try {
          await axios.delete(`https://api-task-hub.onrender.com/api/equips/${equipId}`);
          this.equips = this.equips.filter(team => team.id !== equipId);
          this.userTeams = this.userTeams.filter(team => team.id !== equipId);
        } catch (error) {
          throw error.response.data.error;
        }
      },
  },
  getters: {
    getEquips() {
        return this.equips;
      },
      getUserTeams() {
        return this.userTeams;
      },
  }
})
