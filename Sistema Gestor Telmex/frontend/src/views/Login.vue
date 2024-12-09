<template>
  <div class="login-page bg-light">
    <div class="container">
      <div class="row vh-100 align-items-center justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <!-- Card principal -->
          <div class="card border-0 shadow-lg">
            <!-- Header con logo -->
            <div class="card-header text-center border-0 bg-white pt-4 pb-2">
              <img src="@/assets/LogoTelmex.jpg" 
                   alt="Logo Telmex" 
                   class="img-fluid mb-2" 
                   style="max-height: 80px;">
              <h4 class=" fw-bold mb-0" style="color: #4b7ba9;" >Sistema Gestor</h4>
              <p class="text-muted small">Ingresa tus credenciales para continuar</p>
            </div>

            <div class="card-body px-4 py-4">
              <!-- Formulario con animaciones -->
              <form @submit.prevent="iniciarSesion" class="login-form">
                <!-- Campo de usuario -->
                <div class="form-floating mb-3">
                  <input
                    type="text"
                    id="usuario"
                    v-model="usuario"
                    class="form-control"
                    :class="{ 'is-invalid': error }"
                    placeholder="Usuario"
                    required
                  />
                  <label for="usuario">
                    <i class="bi bi-person-fill me-2"></i>Usuario
                  </label>
                </div>

                <!-- Campo de contraseña -->
                <div class="form-floating mb-4">
                  <input
                    :type="mostrarPassword ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    class="form-control"
                    :class="{ 'is-invalid': error }"
                    placeholder="Contraseña"
                    required
                  />
                  <label for="password">
                    <i class="bi bi-lock-fill me-2"></i>Contraseña
                  </label>
                  <!-- Botón para mostrar/ocultar contraseña -->
                  <button 
                    type="button"
                    class="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3"
                    @click="togglePassword"
                    style="z-index: 5;">
                    <i class="bi" :class="mostrarPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                  </button>
                </div>

                <!-- Mensaje de error -->
                <div v-if="error" 
                     class="alert alert-danger d-flex align-items-center" 
                     role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ error }}
                </div>

                <!-- Botón de ingreso -->
                <button type="submit" 
                        class="btn btn-primary w-100 py-2 mb-3"
                        :disabled="cargando">
                  <span v-if="cargando" class="spinner-border spinner-border-sm me-2" 
                        role="status" aria-hidden="true"></span>
                  {{ cargando ? 'Iniciando sesión...' : 'Ingresar al Sistema' }}
                </button>

          
              </form>
            </div>

            <!-- Footer del card -->
            <div class="card-footer bg-white border-0 text-center py-3">
              <small class="text-muted">
                © 2024 Telmex. Todos los derechos reservados
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      usuario: "",
      password: "",
      error: null,
      cargando: false,
      mostrarPassword: false
    };
  },
  methods: {
    togglePassword() {
      this.mostrarPassword = !this.mostrarPassword;
    },
    async iniciarSesion() {
  this.error = null;
  this.cargando = true;

  try {
    const respuesta = await axios.post("http://localhost:3000/api/login", {
      username: this.usuario,
      password: this.password,
    });

    // Guardar datos del usuario
    localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

    // Obtener tipo y departamento
    const tipo = respuesta.data.usuario.tipo;
    const departamento = respuesta.data.usuario.departamento_id;

    // Redirigir según tipo y departamento
    if (tipo === "tecnico" && departamento === 4) {
      this.$router.push("/problemas");
    } else if (tipo === "tecnico") {
      this.$router.push("/tickets-asignados");
    } else if (tipo === "administrador") {
      this.$router.push("/ver-tickets");
    } else if (tipo === "usuarioNormal") {
      this.$router.push("/crear-ticket");
    } else {
      this.error = "Tipo de usuario no válido";
    }
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          this.error = "Usuario o contraseña incorrectos";
          break;
        case 429:
          this.error = "Demasiados intentos. Por favor, espera unos minutos";
          break;
        default:
          this.error = "Error al conectar con el servidor";
      }
    } else {
      this.error = "Error de conexión. Verifica tu internet";
    }
  } finally {
    this.cargando = false;
  }
},
  },
  mounted() {
    // Focus en el campo de usuario al cargar
    this.$nextTick(() => {
      document.getElementById('usuario').focus();
    });
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.card {
  transition: transform 0.3s ease;
  border-radius: 1rem;
}

.card:hover {
  transform: translateY(-5px);
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
}

.alert {
  border-radius: 0.5rem;
}

/* Animación para el mensaje de error */
.alert-danger {
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Estilo para los inputs flotantes */
.form-floating > .form-control:focus ~ label,
.form-floating > .form-control:not(:placeholder-shown) ~ label {
  color: #0d6efd;
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .card {
    border-radius: 0;
    box-shadow: none;
  }
  
  .login-page {
    background: white;
  }
}
</style>