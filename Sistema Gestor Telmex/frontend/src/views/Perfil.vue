<template>
    <div class="container my-4">
      <h2 class="text-center mb-4">Perfil de Usuario</h2>
      <div class="card shadow p-4">
        <form @submit.prevent="guardarCambios">
          <!-- Nombre -->
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre</label>
            <input
              type="text"
              id="nombre"
              v-model="perfil.nombre"
              class="form-control"
              :disabled="!puedeEditarCampo('nombre')"
            />
          </div>
  
  
          <!-- Área asignada -->
          <div class="mb-3" v-if="esAdministrador || esSoporteTecnico">
            <label for="area" class="form-label">Área Asignada</label>
            <select
              id="area"
              v-model="perfil.area"
              class="form-select"
              :disabled="!puedeEditarCampo('area')"
            >
              <option value="">Selecciona un área</option>
              <option value="Incidencias">Incidencias</option>
              <option value="Configuraciones">Configuraciones</option>
              <option value="Cambios">Cambios</option>
            </select>
          </div>
  
          <!-- Tipo de usuario (solo para Administradores) -->
          <div class="mb-3" v-if="esAdministrador">
            <label for="tipoUsuario" class="form-label">Tipo de Usuario</label>
            <select
              id="tipoUsuario"
              v-model="perfil.tipoUsuario"
              class="form-select"
              :disabled="!puedeEditarCampo('tipoUsuario')"
            >
              <option value="usuarioNormal">Usuario Normal</option>
              <option value="soporteTecnico">Soporte Técnico</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
  
      
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        usuario: JSON.parse(localStorage.getItem("usuario")) || null,
        perfil: {
          nombre: "",
          correo: "",
          area: "",
          tipoUsuario: "",
        },
      };
    },
    computed: {
      esAdministrador() {
        return this.usuario?.tipo === "administrador";
      },
      esSoporteTecnico() {
        return this.usuario?.tipo === "soporteTecnico";
      },
      esUsuarioNormal() {
        return this.usuario?.tipo === "usuarioNormal";
      },
    },
    methods: {
      cargarDatosPerfil() {
        // Simula cargar los datos del perfil del usuario logueado
        this.perfil = {
          nombre: this.usuario.nombre || "",
          correo: this.usuario.correo || "",
          area: this.usuario.area || "",
          tipoUsuario: this.usuario.tipo || "",
        };
      },
      puedeEditarCampo(campo) {
        // Define si un campo es editable según el tipo de usuario
        if (this.esAdministrador) return true; // Admin puede editar todo
        if (this.esSoporteTecnico) return campo !== "tipoUsuario";
        if (this.esUsuarioNormal) return campo === "nombre" || campo === "correo";
        return false;
      },
      guardarCambios() {
        // Simula guardar los cambios en el perfil
        alert("Cambios guardados correctamente.");
        localStorage.setItem("usuario", JSON.stringify(this.perfil));
      },
    },
    mounted() {
      this.cargarDatosPerfil();
    },
  };
  </script>
  
  <style>
  .card {
    border-radius: 10px;
  }
  </style>
  