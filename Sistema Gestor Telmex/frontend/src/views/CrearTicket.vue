<template>
  <div class="container-fluid py-4 px-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <h2 class="card-title mb-0" style="color: #4b7ba9;">Gestión de Tickets</h2>
            <button class="btn btn-primary" @click="mostrarModal = true">
              <i class="bi bi-plus-circle me-2"></i>Crear Ticket
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <div v-if="mensaje" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle me-2"></i>{{ mensaje }}
      <button type="button" class="btn-close" @click="mensaje = null"></button>
    </div>

    <!-- Tabs y Tabla de Tickets -->
    <div class="card shadow-sm">
      <div class="card-body">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: estadoActivo === 'abiertos' }" 
               href="#" @click.prevent="cambiarEstado('abiertos')">
              Abiertos
              <span class="badge bg-primary ms-2">{{ ticketsAbiertos.length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: estadoActivo === 'cerrados' }" 
               href="#" @click.prevent="cambiarEstado('cerrados')">
              Cerrados
              <span class="badge bg-secondary ms-2">{{ ticketsCerrados.length }}</span>
            </a>
          </li>
        </ul>

        <div class="table-responsive mt-3">
          <table class="table table-hover">
            <thead class="bg-primary text-white">
              <tr>
                <th>ID</th>
                <th>Departamento</th>
                <th>Tema</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in ticketsFiltrados" :key="ticket.id">
                <td><span class="badge bg-light text-dark">#{{ ticket.id }}</span></td>
                <td>{{ ticket.departamento }}</td>
                <td>{{ ticket.tema }}</td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 200px">
                    {{ ticket.descripcion }}
                  </span>
                </td>
                <td>{{ formatDate(ticket.fecha_creacion) }}</td>
                <td>
                  <span 
  class="badge" 
  :class="{
    'bg-success': ticket.estado === 'abierto',
    'bg-warning': ticket.estado === 'en proceso',
    'bg-info': ticket.estado === 'resuelto',
    'bg-secondary': ticket.estado === 'cerrado'
  }"
>
  {{ ticket.estado }}
</span>

                </td>
                <td>
                  <button class="btn btn-sm btn-primary" @click="verTicket(ticket.id)">
                    <i class="bi bi-eye me-1"></i>Ver
                  </button>
                </td>
              </tr>
              <tr v-if="ticketsFiltrados.length === 0">
                <td colspan="7" class="text-center py-4">
                  <i class="bi bi-inbox text-muted fs-1 d-block mb-2"></i>
                  No hay tickets {{ estadoActivo }} para mostrar
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Crear Ticket -->
    <div class="modal fade" :class="{ show: mostrarModal }" 
         tabindex="-1" 
         :style="{ display: mostrarModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header text-white" style="background-color: #4b7ba9;">
            <h5 class="modal-title">Crear Nuevo Ticket</h5>
            <button type="button" 
                    class="btn-close btn-close-white" 
                    @click="cerrarModal">
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="crearTicket" class="needs-validation" novalidate>
              <div class="mb-3">
                <label class="form-label">Departamento</label>
                <select v-model="nuevoTicket.departamento_id" 
                        class="form-select" 
                        required 
                        :disabled="cargando"
                        @change="cargarTemas">
                  <option value="">Seleccione un departamento</option>
                  <option v-for="dept in departamentos" 
                          :key="dept.id" 
                          :value="dept.id">
                    {{ dept.nombre }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  Por favor seleccione un departamento
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tema</label>
                <select v-model="nuevoTicket.tema_id" 
                        class="form-select" 
                        required
                        :disabled="!nuevoTicket.departamento_id || cargando">
                  <option value="">Seleccione un tema</option>
                  <option v-for="tema in temas" 
                          :key="tema.id" 
                          :value="tema.id">
                    {{ tema.nombre }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  Por favor seleccione un tema
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Descripción del Problema</label>
                <textarea v-model="nuevoTicket.descripcion" 
                         class="form-control" 
                         rows="4" 
                         required
                         :disabled="cargando"
                         minlength="10"></textarea>
                <div class="invalid-feedback">
                  La descripción debe tener al menos 10 caracteres
                </div>
              </div>

              <div class="d-grid">
                <button type="submit" 
                        class="btn btn-primary"
                        :disabled="cargando">
                  <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-send me-2"></i>
                  {{ cargando ? 'Creando...' : 'Crear Ticket' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop para el modal -->
    <div class="modal-backdrop fade show" v-if="mostrarModal"></div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TicketManager',
  data() {

   
    return {
      estadoActivo: 'abiertos',
      mostrarModal: false,
      departamentos: [],
      temas: [],
      tickets: [],
      cargando: false,
      error: null,
      mensaje: null,
      usuario: null,
      nuevoTicket: {
        departamento_id: '',
        tema_id: '',
        descripcion: ''
      }
    };
  },

  computed: {
    ticketsAbiertos() {
  return this.tickets.filter(
    ticket => 
      ticket.estado === 'abierto' || 
      ticket.estado === 'en proceso' || 
      ticket.estado === 'resuelto'
  );
},
    ticketsCerrados() {
      return this.tickets.filter(ticket => ticket.estado === 'cerrado');
    },
    ticketsFiltrados() {
      return this.estadoActivo === 'abiertos' ? this.ticketsAbiertos : this.ticketsCerrados;
    }
  },

  methods: {
    async inicializarDatos() {
      try {
        await this.verificarUsuario();
        await Promise.all([
          this.cargarDepartamentos(),
          this.cargarTickets()
        ]);
      } catch (error) {
        this.manejarError(error);
      }
    },

    verificarUsuario() {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (!usuarioGuardado) {
        throw new Error('No hay sesión de usuario activa');
      }
      this.usuario = JSON.parse(usuarioGuardado);
    },

    async cargarDepartamentos() {
      try {
        const response = await axios.get('http://localhost:3000/api/departamentos');
        this.departamentos = response.data.departamentos;
      } catch (error) {
        throw new Error('Error al cargar departamentos');
      }
    },

    async cargarTemas() {
      if (!this.nuevoTicket.departamento_id) {
        this.temas = [];
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/temas/${this.nuevoTicket.departamento_id}`
        );
        this.temas = response.data.temas;
        this.nuevoTicket.tema_id = ''; // Reset tema selection
      } catch (error) {
        this.manejarError('Error al cargar temas');
      }
    },

    async cargarTickets() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/tickets/${this.usuario.id}`
        );
        this.tickets = response.data.tickets;
      } catch (error) {
        throw new Error('Error al cargar tickets');
      }
    },

    async crearTicket() {
  if (!this.validarFormulario()) return;

  this.cargando = true;
  try {
    // Realizar la solicitud POST al backend con los datos del ticket
    const response = await axios.post('http://localhost:3000/api/tickets', {
      usuario_id: this.usuario.id, // ID del usuario que crea el ticket
      departamento_id: this.nuevoTicket.departamento_id, // Departamento seleccionado
      tema_id: this.nuevoTicket.tema_id, // Tema seleccionado
      descripcion: this.nuevoTicket.descripcion // Descripción del problema
    });

    // Recibir datos del ticket creado y técnico asignado desde el backend
    const { ticket_id, tecnico_asignado } = response.data;

    // Mostrar un mensaje de éxito con información del técnico asignado
    this.mensaje = `Ticket creado exitosamente con ID ${ticket_id}. Asignado al técnico ${tecnico_asignado.nombre}.`;

    // Actualizar la lista de tickets
    await this.cargarTickets();

    // Cerrar el modal de creación
    this.cerrarModal();
  } catch (error) {
    // Manejar errores
    this.manejarError(error.response?.data?.error || 'Error al crear el ticket');
  } finally {
    this.cargando = false;
  }
},

    validarFormulario() {
      const form = document.querySelector('.needs-validation');
      form.classList.add('was-validated');
      return form.checkValidity();
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.nuevoTicket = {
        departamento_id: '',
        tema_id: '',
        descripcion: ''
      };
      document.querySelector('.needs-validation').classList.remove('was-validated');
      document.body.classList.remove('modal-open');
    },

    cambiarEstado(estado) {
      this.estadoActivo = estado;
    },

    verTicket(ticketId) {
  this.$router.push(`/detalle-ticket-cliente/${ticketId}`);
},

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    manejarError(error) {
      this.error = typeof error === 'string' ? error : error.message;
      setTimeout(() => {
        this.error = null;
      }, 5000);
    }
  },

  mounted() {
    this.inicializarDatos();
  },

  beforeDestroy() {
    document.body.classList.remove('modal-open');
  }
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 0.5rem;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  padding: 0.75rem 1rem;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: var(--bs-primary);
  border-bottom: 2px solid var(--bs-primary);
  background: none;
}

.btn-primary {
  background-color: #4b7ba9;
  border-color: #4b7ba9;
}

.btn-primary:hover {
  background-color: #3d6387;
  border-color: #3d6387;
}

.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
}

.modal.show .modal-dialog {
  transform: none;
}

.modal-open {
  overflow: hidden;
}

.invalid-feedback {
  display: none;
}

.was-validated .form-control:invalid,
.was-validated .form-select:invalid {
  border-color: #dc3545;
}

.was-validated .form-control:invalid ~ .invalid-feedback,
.was-validated .form-select:invalid ~ .invalid-feedback {
  display: block;
}
</style>