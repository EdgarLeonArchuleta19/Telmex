<template>
  <div class="container-fluid py-4 px-4">
    <!-- Header del Ticket -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h2 class="card-title mb-0" style="color: #4b7ba9;">
                  Ticket #{{ ticket.id }}
                  <span class="badge ms-2" 
                        :class="getEstadoBadgeClass">
                    {{ ticket.estado }}
                  </span>
                </h2>
                <p class="text-muted mb-0">
                  Creado el {{ formatDate(ticket.fecha_creacion) }}
                </p>
              </div>
              <button class="btn btn-primary" @click="$router.go(-1)">
                <i></i>Volver
              </button>
            </div>
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

    <!-- Detalles del Ticket -->
    <div class="row">
      <div class="col-md-8">
        <!-- Información Principal -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">Información del Ticket</h5>
            <div class="row mb-3">
              <div class="col-md-4">
                <p class="text-muted mb-1">Departamento</p>
                <p class="fw-bold">{{ ticket.departamento }}</p>
              </div>
              <div class="col-md-4">
                <p class="text-muted mb-1">Tema</p>
                <p class="fw-bold">{{ ticket.tema }}</p>
              </div>
            </div>
            <div class="mb-4">
              <p class="text-muted mb-1">Descripción Original</p>
              <p class="border-start border-4 border-primary ps-3 py-2 bg-light">
                {{ ticket.descripcion }}
              </p>
            </div>
          </div>
        </div>

        <!-- Historial de Seguimiento -->
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Historial de Seguimiento</h5>
            <div class="timeline">
              <div v-for="(hist, index) in historial" 
                   :key="index" 
                   class="timeline-item">
                <div class="timeline-badge bg-primary">
                  <i class="bi bi-clock"></i>
                </div>
                <div class="timeline-content">
                  <small class="text-muted d-block">
                    {{ formatDate(hist.fecha) }}
                  </small>
                  <p class="mb-0">{{ hist.cambio }}</p>
                  <p v-if="hist.tecnico_nombre" class="text-muted mb-0">
                    Por: {{ hist.tecnico_nombre }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Lateral de Acciones -->
      <div class="col-md-4">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">Acciones Disponibles</h5>
            
            <!-- Confirmación de Resolución -->
            <div v-if="ticket.estado === 'resuelto'" class="mb-4">
              <div class="alert alert-info">
                <h6 class="alert-heading">
                  <i class="bi bi-question-circle me-2"></i>
                  ¿Está satisfecho con la resolución?
                </h6>
                <p class="mb-0">Por favor, indique si la solución proporcionada resuelve su problema.</p>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-success" 
                        @click="confirmarResolucion(true)"
                        :disabled="cargando">
                  <i class="bi bi-check-circle me-2"></i>Sí, resolver ticket
                </button>
                <button class="btn btn-danger" 
                        @click="mostrarModalRechazo = true"
                        :disabled="cargando">
                  <i class="bi bi-x-circle me-2"></i>No, necesito más ayuda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Rechazo de Resolución -->
    <div class="modal fade" 
         :class="{ show: mostrarModalRechazo }" 
         tabindex="-1" 
         :style="{ display: mostrarModalRechazo ? 'block' : 'none' }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">¿Por qué no está conforme con la solución?</h5>
            <button type="button" 
                    class="btn-close btn-close-white" 
                    @click="cerrarModalRechazo">
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmarResolucion(false)" class="needs-validation" novalidate>
              <div class="mb-3">
                <label class="form-label">Motivo de Inconformidad</label>
                <textarea v-model="motivoRechazo" 
                         class="form-control" 
                         rows="4" 
                         required
                         :disabled="cargando"
                         placeholder="Por favor, explique por qué la solución no resuelve su problema..."
                         minlength="10"></textarea>
                <div class="invalid-feedback">
                  Por favor, explique el motivo de su inconformidad (mínimo 10 caracteres)
                </div>
              </div>
              <div class="d-grid">
                <button type="submit" 
                        class="btn btn-danger"
                        :disabled="cargando">
                  <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-send me-2"></i>
                  Enviar y Reabrir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop para el modal -->
    <div class="modal-backdrop fade show" v-if="mostrarModalRechazo"></div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TicketDetail',
  
  data() {
    return {
      ticket: {},
      historial: [],
      error: null,
      mensaje: null,
      cargando: false,
      mostrarModalRechazo: false,
      motivoRechazo: '',
      usuario: null
    };
  },

  computed: {
    getEstadoBadgeClass() {
      const classes = {
        'abierto': 'bg-success',
        'en proceso': 'bg-warning',
        'resuelto': 'bg-info',
        'cerrado': 'bg-secondary'
      };
      return classes[this.ticket.estado] || 'bg-secondary';
    }
  },

  methods: {
    async cargarTicket() {
      try {
        const ticketId = this.$route.params.id;
        const response = await axios.get(`http://localhost:3000/api/DetallesTickets/${ticketId}`);
        this.ticket = response.data.ticket;
        await this.cargarHistorial();
      } catch (error) {
        this.manejarError('Error al cargar los detalles del ticket');
      }
    },

    async cargarHistorial() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/tickets/${this.ticket.id}/historial`
        );
        this.historial = response.data.historial;
      } catch (error) {
        this.manejarError('Error al cargar el historial');
      }
    },

    async confirmarResolucion(aceptada) {
  this.cargando = true;
  try {
    if (aceptada) {
      await axios.post(`http://localhost:3000/api/tickets/${this.ticket.id}/cerrar`);
      this.mensaje = 'Ticket cerrado exitosamente';
    } else {
      if (!this.validarFormulario()) return;
      
      await axios.post(`http://localhost:3000/api/tickets/${this.ticket.id}/rechazar`, {
        motivo: this.motivoRechazo // Se envía el motivo al backend
      });
      this.mensaje = 'Ticket reabierto para revisión adicional';
      this.cerrarModalRechazo();
    }
    await this.cargarTicket();
  } catch (error) {
    this.manejarError('Error al procesar la resolución');
  } finally {
    this.cargando = false;
  }
},

    validarFormulario() {
      const form = document.querySelector('.needs-validation');
      form.classList.add('was-validated');
      return form.checkValidity();
    },

    cerrarModalRechazo() {
      this.mostrarModalRechazo = false;
      this.motivoRechazo = '';
      document.querySelector('.needs-validation')?.classList.remove('was-validated');
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    this.cargarTicket();
  },

  beforeDestroy() {
    if (this.mostrarModalRechazo) {
      document.body.classList.remove('modal-open');
    }
  }
};
</script>

<style scoped>
.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  position: relative;
  padding-left: 50px;
  margin-bottom: 30px;
}

.timeline-badge {
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  color: white;
  line-height: 30px;
}

.timeline-content {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  position: relative;
}

.timeline-content:before {
  content: '';
  position: absolute;
  left: -8px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #f8f9fa;
}

.btn-primary {
  background-color: #4b7ba9;
  border-color: #4b7ba9;
}

.btn-primary:hover {
  background-color: #3d6387;
  border-color: #3d6387;
}

.modal-open {
  overflow: hidden;
}
</style>