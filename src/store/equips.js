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
          const response = await axios.get(`http://localhost:3000/api/equips?userId=${userID}`);
          this.equips = response.data;

            // Afegeix IDs dels equips de l'usuari a la propietat userTeams
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
          const response = await axios.post('http://localhost:3000/api/equips', teamData);
          const newTeam = response.data;
          this.equips.push(newTeam);
          console.log('Equip creat:', newTeam);
          // Pots afegir més lògica aquí després de crear l'equip, com reiniciar els camps o redirigir a una altra pàgina
          
        } catch (error) {
          console.error('Error en crear l\'equip:', error);
          throw error.response.data.error;
        }
      },
      async updateTeam(equipId, updatedData) {
        try {
          const response = await axios.put(`http://localhost:3000/api/equips/${equipId}`, updatedData);
          console.log(response.data); // Missatge de confirmació d'actualització
          // Si cal, actualitza l'state dels equips després de l'èxit de l'actualització
          // Exemple: this.fetchEquips();

            const indexToUpdate = this.equips.findIndex(team => team.id === equipId);
        
            if (indexToUpdate !== -1) {
              // Actualitza l'equip corresponent a l'índex amb les noves dades
              this.equips[indexToUpdate] = { ...this.equips[indexToUpdate], ...updatedData };
              console.log('Equip actualitzat amb èxit');
            }
        } catch (error) {
          console.error('Error en actualitzar l\'equip:', error);
          throw error; // Potser vols gestionar l'error des del component que crida a aquesta acció
        }
      },
      async deleteTeam(equipId) {
        try {
          await axios.delete(`http://localhost:3000/api/equips/${equipId}`);
          this.equips = this.equips.filter(team => team.id !== equipId);
          this.userTeams = this.userTeams.filter(team => team.id !== equipId);
        } catch (error) {
          console.error('Error en eliminar l\'equip:', error);
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
