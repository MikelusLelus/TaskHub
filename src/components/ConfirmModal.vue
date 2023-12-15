<template>
    <div class="modal-overlay" v-if="showModal" @click.self="cancelAction">
      <div class="modal-container">
        <div class="task-name-modal">
          <h2>{{ title }}</h2>
        </div>
        <div class="modal-box">
          <div class="modal-content">
            <p>{{ message }}</p>
            <div class="butons-editar">
              <button class="buto-eliminar" @click="cancelAction">
                Cancelar
              </button>
              <button class="buto-acceptar" @click="confirmAction" >
                Acceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ConfirmModal',
    emits: ['close-modal'],
    props: {
      showModal: {
        type: Boolean,
        required: true
      },
      title: {
        type: String,
        default: 'Confirmació'
      },
      message: {
        type: String,
        default: 'Estàs segur que vols realitzar aquesta acció?'
      },
    },
    methods: {
        cancelAction() {
        this.$emit('close-modal', false); 
        },
        confirmAction() {
        this.$emit('close-modal', true); 
        }
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
    background-color: rgba(0, 0, 0, 0.5); 
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999; 
  }

  .modal-container {
    width: 40%;
    
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

  p {
    text-align: center;
    padding: 10px;
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


  </style>