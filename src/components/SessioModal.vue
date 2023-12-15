<template>
    <div class="modal-overlay" v-if="showModal" >
      <div class="modal-container">
        <div class="task-name-modal">
        <h2>{{ registerMode ? 'Registra\'t' : 'Identifica\'t' }}</h2>
      </div>
          
        <div class="modal-box">
        <div class="modal-content">
        <form v-if="!registerMode" @submit.prevent="validateLoginForm">
          <div class="form-group">
            <label for="email">Correu</label>
            <input type="email" id="email" v-model="email" placeholder="Escriu el teu correu" @keyup.enter="handleLogin()" />
          </div>
          <div class="form-group">
            <label for="password">Contrasenya</label>
            <input type="password" id="password" v-model="password" placeholder="Escriu la teva contrasenya" @keyup.enter="handleLogin()" />
          </div>
        </form>
        <form v-if="registerMode"  @submit.prevent="createAccount">
            <div class="form-group">
              <label for="name">Nom d'usuari</label>
              <input type="text" id="name" v-model="name" placeholder="Nom i Cognom" @keyup.enter="handleRegister()"  />
            </div>
            <div class="form-group">
              <label for="email">Correu</label>
              <input type="email" id="email" v-model="email" placeholder="Escriu el teu correu" @keyup.enter="handleRegister()" />
            </div>
            <div class="form-group">
              <label for="password">Contrasenya</label>
              <input type="password" id="password" v-model="password" placeholder="Escriu una contrasenya" @keyup.enter="handleRegister()" />
            </div>
            <div class="form-group">
              <label for="confirmPassword">Repetir Contrasenya</label>
              <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Repeteix la contrasenya" @keyup.enter="handleRegister()" />
            </div>
        </form>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <div class="butons-editar">
            <button class="buto-eliminar" @click="switchMode">
              {{ registerMode ? 'Entra' : `Registra't` }}
            </button>
           <button class="buto-acceptar" @click="registerMode ? handleRegister() : handleLogin()" >
              {{ registerMode ? 'Crear' : 'Entra' }}
            </button>
        </div>
          </div>
        </div>
        </div>
      </div>
  </template>
  
  <script>
import { useStore as useEquipStore } from '../store/equips';
import { useStore as useUserStore } from '../store/user';


  export default {
    name: 'SessioModal',
    props: {
      showModal: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
        registerMode: false,
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        errorMessage: '',
      };
    },
    methods: {
      switchMode() {
        this.name = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
        this.errorMessage = '';
        this.registerMode = !this.registerMode;
    },
    async handleLogin() {
      if (this.validateLoginForm()) {
          const store = useUserStore();
          try {
            await store.login(this.email, this.password);
              this.errorMessage = '';
              this.email = '';
              this.password = '';

              this.$emit('show-success', 'Has iniciat sessió correctament');

              const storeEquip = useEquipStore();

              const userId = store.id;

            await storeEquip.fetchEquips(userId);

          } catch (error) {
            // Mostrem el missatge d'error rebut de l'API al component
            this.errorMessage = error;
          }
        }
      },
    async handleRegister() {
      if (this.validateRegisterForm()) {
        const store = useUserStore();
        try {
          await store.register(this.name, this.email, this.password, this.confirmPassword);
          // Altres lògiques després del registre
          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          this.errorMessage = '';
          this.registerMode = false;

          this.$emit('show-success', 'T\'has registrat correctament');

        } catch (error) {
          this.errorMessage = error;
        }
      }
    },
    validateLoginForm() {
        if (!this.email || !this.password) {
          this.errorMessage = 'Els camps no poden estar buits';
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          this.errorMessage = 'El correu electrònic no és vàlid';
          return false;
        }

        if (this.password.length < 6) {
          this.errorMessage = 'La contrasenya ha de tenir com a mínim 6 caràcters';
          return false;
        }

        return true; // Retorna true si les validacions són correctes
      },
      validateRegisterForm() {
        if (!this.name || !this.email || !this.password || !this.confirmPassword) {
          this.errorMessage = 'Els camps no poden estar buits';
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          this.errorMessage = 'El correu electrònic no és vàlid';
          return false;
        }

        if (this.name.split(' ').length < 2) {
          this.errorMessage = 'El nom ha de contenir nom i cognom';
          return false;
        }

        if (this.password.length < 6) {
          this.errorMessage = 'La contrasenya ha de tenir com a mínim 6 caràcters';
          return false;
        }

        if (this.password !== this.confirmPassword) {
          this.errorMessage = 'Les contrasenyes no coincideixen';
          return false;
        }

        return true; // Retorna true si las validaciones son correctas
    }, 
    }
  };
  </script>
  
  <style scoped>

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Opacitat fons */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999; /* Asegura que el modal estigui per sobre de la resta del contingut */
  }

  .modal-container {
    width: 50%;
    
  }
 
  .task-name-modal {
    background-color: #fff;
    color: #1565c0;
    padding: 20px 20px 10px;
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    text-align: center;
    width: 65%;
    margin: 0 auto;
  }

  .modal-box {
    background-color: #fff;
    border-radius: 30px;
    padding: 20px 0px;
  }

  .modal-content {
    width: 65%;
    margin: 0 auto;
    overflow-y: auto; 
    max-height: 80vh; 
  }


  .form-group {
    display: flex;
    flex-direction: column;
    margin: 5px 0;
}

label {
    margin: 5px auto;
    padding: 10px;
    background-color: #b3e5fc;
    border-radius: 30px;
    text-align: center;
    width: 50%;
    color: #1565c0;
    font-weight: bold;
}

input {
    width: 100%;
    margin: 5px auto;
    padding: 10px;
    border-radius: 30px;
    border: 3px solid #b3e5fc;
}

 button {
    padding: 10px 35px;
    background-color: #1565c0;
    color: #fff;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    
  }

  button:hover {
    background-color: #b3e5fc;
    color: #1565c0;
  }

  .buto-eliminar {
    background-color: #b3e5fc;
    color: #1565c0;
    
  }

  .buto-eliminar:hover {
    background-color: #1565c0;
    color: #fff;

  }

  .butons-editar {
    display: flex;
    justify-content: space-evenly;
    padding: 10px;
  }


  @media screen and (max-width: 1024px) {
  .modal-container {
    width: 80%;    
  }

  .modal-content {
    width: 90%;
    margin: 0 auto;
  }

  .buto-acceptar, .buto-eliminar {
      width: 80%;
      margin: 10px auto;
    }
      .butons-editar{
        flex-direction: column;
      }

}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
  text-align: center;
}

  </style>
  