<template>
  <nav class="navbar navbar-expand-lg" style="background-color: #4b7ba9;">
    <div class="container-fluid">
      <!-- Logo y título -->
      <div class="d-flex align-items-center">
        <img 
          src="@/assets/LogoTelmex.jpg" 
          alt="Logo Telmex" 
          class="rounded-circle border me-4"
          style="max-height: 50px; max-width: 50px; object-fit: cover;"
        >
        <a class="navbar-brand text-white fw-bold" href="#">Sistema Gestor de Reportes</a>
      </div>

      <!-- Botón para colapsar menú en móviles -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Contenido del menú -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <!-- Opciones comunes -->

          <li class="nav-item" v-if="esUsuarioNormal">
            <router-link class="nav-link text-white" to="/crear-ticket">Crear Ticket</router-link>
          </li>
          <li class="nav-item" v-if="esSoporteTecnico">
            <router-link class="nav-link text-white" to="/tickets-asignados">Tickets Asignados</router-link>
          </li>

          <li class="nav-item" v-if="esAdministrador">
            <router-link class="nav-link text-white" to="/ver-tickets">Control de Tickets</router-link>
          </li>

          

          <!-- Menú Gestiones (visible solo para Administradores) -->
          <li class="nav-item dropdown" v-if="esAdministrador">
            <a 
              class="nav-link dropdown-toggle text-white" 
              href="#" 
              id="gestionesDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              Gestiones
            </a>
            <ul class="dropdown-menu" aria-labelledby="gestionesDropdown">
           
              <li>
                <router-link class="dropdown-item" to="/configuraciones">Área de Configuraciones</router-link>
              </li>
              <li >
            <router-link class="dropdown-item" to="/personal">Gestion de Personal</router-link>
             </li>


            </ul>
          </li>
        </ul>

        <!-- Menú desplegable para perfil -->
        <div class="dropdown">
          <button
            class="btn btn-outline-light dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Opciones
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li>
              <router-link class="dropdown-item" to="/perfil">Perfil</router-link>
            </li>
            <li>
              <button class="dropdown-item" @click="cerrarSesion">Cerrar Sesión</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      usuario: JSON.parse(localStorage.getItem("usuario")) || null,
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
    cerrarSesion() {
      localStorage.removeItem("usuario");
      this.$router.push("/");
    },
  },
};
</script>

<style>
/* Ajustes de diseño */
.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.5);
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 30 30'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

.rounded-circle {
  border: 2px solid white;
}
</style>
