<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">Detalles del Ticket #{{ ticketId }}</h2>
      <button class="btn btn-primary" @click="volver">
        <i ></i>Volver
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button class="btn btn-link" @click="cargarDetalles">Intentar de nuevo</button>
    </div>

    <!-- Content -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <!-- Información General -->
        <div class="row g-4 mb-4">
          <div class="col-md-8">
            <div class="d-flex gap-2 mb-3">
              <span 
                class="badge"
                :class="{
                  'bg-success': ticket.estado === 'abierto',
                  'bg-primary': ticket.estado === 'en proceso',
                  'bg-warning': ticket.estado === 'resuelto',
                  'bg-secondary': ticket.estado === 'cerrado'
                }"
              >
                {{ ticket.estado?.toUpperCase() }}
              </span>
              <span 
                class="badge"
                :class="{
                  'bg-danger': ticket.prioridad === 'alta',
                  'bg-warning text-dark': ticket.prioridad === 'media',
                  'bg-info text-dark': ticket.prioridad === 'baja'
                }"
              >
                {{ ticket.prioridad?.toUpperCase() }}
              </span>
            </div>
            <h5>Descripción</h5>
            <p class="text-muted">{{ ticket.descripcion }}</p>
          </div>
          
          <div class="col-md-4">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Información</h6>
                <dl class="mb-0">
                  <dt>Cliente</dt>
                  <dd>{{ ticket.usuario_nombre }}</dd>
                  <dt>Técnico Asignado</dt>
                  <dd>{{ ticket.tecnico_nombre || 'Sin asignar' }}</dd>
                  <dt>Departamento</dt>
                  <dd>{{ ticket.departamento_nombre }}</dd>
                  <dt>Tema</dt>
                  <dd>{{ ticket.tema_nombre }}</dd>
                  <dt>Creado</dt>
                  <dd>{{ formatearFecha(ticket.fecha_creacion) }}</dd>
                  <dt v-if="ticket.fecha_cierre">Cerrado</dt>
                  <dd v-if="ticket.fecha_cierre">{{ formatearFecha(ticket.fecha_cierre) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de Actualizaciones y Historial -->
        <div class="row g-4">
          <!-- Columna de Formularios -->
          <div class="col-lg-6">
            <!-- Formulario de Actualización de Estado y Prioridad -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Actualizar Ticket</h5>
                <form @submit.prevent="handleUpdateSubmit">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Estado</label>
                      <select v-model="formData.estado" class="form-select" required>
                        <option value="abierto">Abierto</option>
                        <option value="en proceso">En Proceso</option>
                        <option value="resuelto">Resuelto</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Prioridad</label>
                      <select v-model="formData.prioridad" class="form-select" required>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="actualizandoEstado"
                      >
                        <span 
                          v-if="actualizandoEstado" 
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Formulario de Nueva Respuesta -->
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Nueva Respuesta</h5>
                <form @submit.prevent="handleResponseSubmit">
                  <div class="mb-3">
                    <textarea 
                      v-model="formData.respuesta" 
                      class="form-control" 
                      rows="3"
                      placeholder="Escribe una respuesta o actualización..."
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="enviandoRespuesta"
                  >
                    <span 
                      v-if="enviandoRespuesta" 
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    Enviar Respuesta
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Columna de Historial -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title mb-4">Historial del Ticket</h5>
                <div v-if="historial.length === 0" class="text-center text-muted py-4">
                  No hay registros en el historial
                </div>
                <div v-else class="timeline">
                  <div 
                    v-for="(entry, index) in historialOrdenado" 
                    :key="index"
                    class="timeline-item"
                  >
                    <div class="timeline-content">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong class="d-block">{{ entry.tecnico_nombre }}</strong>
                          <small class="text-muted">{{ formatearFecha(entry.fecha) }}</small>
                        </div>
                      </div>
                      <p class="mb-0" style="white-space: pre-line">{{ entry.cambio }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'DetallesTicket',
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const ticketId = ref(route.params.id);
    const ticket = ref({});
    const historial = ref([]);
    const cargando = ref(true);
    const error = ref(null);
    const actualizandoEstado = ref(false);
    const enviandoRespuesta = ref(false);
    
    const formData = ref({
      estado: '',
      prioridad: '',
      respuesta: ''
    });

    const historialOrdenado = computed(() => {
      return [...historial.value].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
    });

    const formatearFecha = (fecha) => {
      if (!fecha) return 'N/A';
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const cargarDetalles = async () => {
      try {
        cargando.value = true;
        error.value = null;
        
        const [detallesResponse, historialResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/tickets/${ticketId.value}/detalles`),
          axios.get(`http://localhost:3000/api/tickets/${ticketId.value}/historial`)
        ]);
        
        ticket.value = detallesResponse.data.ticket;
        historial.value = historialResponse.data.historial;
        
        // Inicializar formulario
        formData.value.estado = ticket.value.estado;
        formData.value.prioridad = ticket.value.prioridad;
        
      } catch (err) {
        error.value = 'Error al cargar los detalles del ticket. Por favor, intenta de nuevo.';
        console.error('Error cargando detalles:', err);
      } finally {
        cargando.value = false;
      }
    };

    const handleUpdateSubmit = async () => {
      try {
        actualizandoEstado.value = true;
        error.value = null;

        if (formData.value.estado !== ticket.value.estado || 
            formData.value.prioridad !== ticket.value.prioridad) {
          await axios.put(`http://localhost:3000/api/tickets/${ticketId.value}/actualizar`, {
            estado: formData.value.estado,
            prioridad: formData.value.prioridad
          });
          await cargarDetalles();
        }
      } catch (err) {
        error.value = 'Error al actualizar el estado del ticket. Por favor, intenta de nuevo.';
        console.error('Error actualizando estado:', err);
      } finally {
        actualizandoEstado.value = false;
      }
    };

    const handleResponseSubmit = async () => {
      try {
        enviandoRespuesta.value = true;
        error.value = null;

        if (formData.value.respuesta.trim()) {
          await axios.post(`http://localhost:3000/api/tickets/${ticketId.value}/responder`, {
            respuesta: formData.value.respuesta.trim()
          });
          await cargarDetalles();
          formData.value.respuesta = ''; // Limpiar respuesta
        }
      } catch (err) {
        error.value = 'Error al enviar la respuesta. Por favor, intenta de nuevo.';
        console.error('Error enviando respuesta:', err);
      } finally {
        enviandoRespuesta.value = false;
      }
    };

    const volver = () => {
      router.back();
    };

    onMounted(cargarDetalles);

    return {
      ticketId,
      ticket,
      historial,
      historialOrdenado,
      cargando,
      error,
      actualizandoEstado,
      enviandoRespuesta,
      formData,
      formatearFecha,
      handleUpdateSubmit,
      handleResponseSubmit,
      cargarDetalles,
      volver
    };
  }
};
</script>

<style scoped>
.timeline {
  position: relative;
  padding: 1rem 0;
}

.timeline-item {
  padding: 1rem 1.5rem;
  border-left: 2px solid #e9ecef;
  position: relative;
  margin-bottom: 1rem;
}

.timeline-item:before {
  content: '';
  position: absolute;
  left: -7px;
  top: 1.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #007bff;
}

.timeline-content {
  margin-left: 1rem;
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
}

dt {
  font-weight: 600;
  color: #6c757d;
}

dd {
  margin: 0;
}

.badge {
  padding: 0.5em 1em;
  font-size: 0.875em;
  font-weight: 500;
}
</style>