<template>
  <div class="container-fluid mt-4">
    <h2 class="mb-4">Panel de Visualización de Tickets</h2>
    
    <!-- Filtros de búsqueda -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Departamento</label>
            <select v-model="filtros.departamento" class="form-select">
              <option value="">Todos los departamentos</option>
              <option v-for="dept in departamentos" :key="dept.id" :value="dept.id">
                {{ dept.nombre }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Estado</label>
            <select v-model="filtros.estado" class="form-select">
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en proceso">En proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Prioridad</label>
            <select v-model="filtros.prioridad" class="form-select">
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Tickets -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Ticket #</th>
                <th>Solicitante</th>
                <th>Técnico Asignado</th>
                <th>Departamento</th>
                <th>Tema</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in ticketsFiltradosPaginados" :key="ticket.id">
                <td class="fw-bold">{{ ticket.id }}</td>
                <td>{{ ticket.usuario.nombre }}</td>
                <td>
                  <span v-if="ticket.tecnico">{{ ticket.tecnico.nombre }}</span>
                  <span v-else class="text-muted">Sin asignar</span>
                </td>
                <td>{{ ticket.departamento.nombre }}</td>
                <td>{{ ticket.tema.nombre }}</td>
                <td>
                  <span :class="getPrioridadBadgeClass(ticket.prioridad)">
                    {{ ticket.prioridad }}
                  </span>
                </td>
                <td>
                  <span :class="getEstadoBadgeClass(ticket.estado)">
                    {{ ticket.estado }}
                  </span>
                </td>
                <td>{{ formatDateTime(ticket.fecha_creacion) }}</td>
                <td>
                  <button 
                    @click="verDetallesTicket(ticket.id)" 
                    class="btn btn-sm btn-info"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <nav class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual - 1)">
                Anterior
              </a>
            </li>
            <li 
              v-for="pagina in totalPaginas" 
              :key="pagina" 
              class="page-item" 
              :class="{ active: paginaActual === pagina }"
            >
              <a class="page-link" href="#" @click.prevent="cambiarPagina(pagina)">
                {{ pagina }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual + 1)">
                Siguiente
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

   <!-- Modal de Detalles -->
   <div class="modal fade" id="modalDetalles" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              Detalles del Ticket #{{ ticketSeleccionado?.id }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="ticketSeleccionado">
            <div class="row g-3">
              <!-- Información General -->
              <div class="col-12">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Información General</h6>
                    <div class="row">
                      <div class="col-md-6">
                        <p class="mb-1"><strong>Solicitante:</strong> {{ ticketSeleccionado.usuario.nombre }}</p>
                        <p class="mb-1"><strong>Departamento:</strong> {{ ticketSeleccionado.departamento.nombre }}</p>
                        <p class="mb-1"><strong>Tema:</strong> {{ ticketSeleccionado.tema.nombre }}</p>
                        <p class="mb-1">
                          <strong>Prioridad:</strong> 
                          <span :class="getPrioridadBadgeClass(ticketSeleccionado.prioridad)">
                            {{ ticketSeleccionado.prioridad }}
                          </span>
                        </p>
                      </div>
                      <div class="col-md-6">
                        <p class="mb-1">
                          <strong>Estado:</strong>
                          <span :class="getEstadoBadgeClass(ticketSeleccionado.estado)">
                            {{ ticketSeleccionado.estado }}
                          </span>
                        </p>
                        <p class="mb-1"><strong>Fecha Creación:</strong> {{ formatDateTime(ticketSeleccionado.fecha_creacion) }}</p>
                        <p class="mb-1">
                          <strong>Fecha Cierre:</strong> 
                          {{ ticketSeleccionado.fecha_cierre ? formatDateTime(ticketSeleccionado.fecha_cierre) : 'No cerrado' }}
                        </p>
                        <p class="mb-1">
                          <strong>Técnico Asignado:</strong> 
                          {{ ticketSeleccionado.tecnico ? ticketSeleccionado.tecnico.nombre : 'Sin asignar' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Descripción del Ticket</h6>
                    <p class="card-text">{{ ticketSeleccionado.descripcion }}</p>
                  </div>
                </div>
              </div>

              <!-- Historial -->
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Historial de Cambios</h6>
                    <div class="timeline">
                      <div v-for="cambio in historialTicket" :key="cambio.id" class="border-start border-2 ps-3 pb-3">
                        <p class="mb-1 fw-bold">{{ formatDateTime(cambio.fecha) }}</p>
                        <p class="mb-1">{{ cambio.cambio }}</p>
                       
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminTicketsView',
  setup() {
    const todosLosTickets = ref([]);
    const departamentos = ref([]);
    const paginaActual = ref(1);
    const ticketSeleccionado = ref(null);
    const historialTicket = ref([]);
    const filtros = ref({
      departamento: '',
      estado: '',
      prioridad: ''
    });
    const itemsPorPagina = 10;
    let modalDetalles = null;

    // Filtrado de tickets en el frontend
    const ticketsFiltrados = computed(() => {
      return todosLosTickets.value.filter(ticket => {
        const cumpleDepartamento = !filtros.value.departamento || 
          ticket.departamento.id === parseInt(filtros.value.departamento);
        const cumpleEstado = !filtros.value.estado || 
          ticket.estado === filtros.value.estado;
        const cumplePrioridad = !filtros.value.prioridad || 
          ticket.prioridad === filtros.value.prioridad;

        return cumpleDepartamento && cumpleEstado && cumplePrioridad;
      });
    });

    // Paginación en el frontend
    const ticketsFiltradosPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * itemsPorPagina;
      const fin = inicio + itemsPorPagina;
      return ticketsFiltrados.value.slice(inicio, fin);
    });

    const totalPaginas = computed(() => {
      return Math.ceil(ticketsFiltrados.value.length / itemsPorPagina);
    });

    const obtenerTodosLosTickets = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/TodosLosTickets');
        todosLosTickets.value = response.data;
      } catch (error) {
        console.error('Error al obtener tickets:', error);
      }
    };

    const obtenerDepartamentos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/ListaDepartamentos');
        departamentos.value = response.data;
      } catch (error) {
        console.error('Error al obtener departamentos:', error);
      }
    };

    const verDetallesTicket = async (ticketId) => {
      try {
        const [ticketResponse, historialResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/admin/DetallesTicket/${ticketId}`),
          axios.get(`http://localhost:3000/api/admin/HistorialTicket/${ticketId}`)
        ]);
        ticketSeleccionado.value = ticketResponse.data;
        historialTicket.value = historialResponse.data;
        modalDetalles.show();
      } catch (error) {
        console.error('Error al obtener detalles del ticket:', error);
      }
    };

    const cambiarPagina = (pagina) => {
      if (pagina >= 1 && pagina <= totalPaginas.value) {
        paginaActual.value = pagina;
        obtenerTodosLosTickets(pagina);
      }
    };

    const buscarTickets = () => {
      paginaActual.value = 1;
      obtenerTodosLosTickets(1);
    };

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getPrioridadBadgeClass = (prioridad) => {
      const classes = {
        baja: 'badge bg-success',
        media: 'badge bg-warning text-dark',
        alta: 'badge bg-danger'
      };
      return classes[prioridad] || 'badge bg-secondary';
    };

    const getEstadoBadgeClass = (estado) => {
      const classes = {
        abierto: 'badge bg-success',
        'en proceso': 'badge bg-warning text-dark',
        resuelto: 'badge bg-info',
        cerrado: 'badge bg-secondary'
      };
      return classes[estado] || 'badge bg-secondary';
    };

    onMounted(() => {
      modalDetalles = new Modal(document.getElementById('modalDetalles'));
      obtenerTodosLosTickets();
      obtenerDepartamentos();
    });

    return {
      ticketsFiltradosPaginados,
      departamentos,
      paginaActual,
      totalPaginas,
      ticketSeleccionado,
      historialTicket,
      filtros,
      verDetallesTicket,
      cambiarPagina,
      formatDateTime,
      getPrioridadBadgeClass,
      getEstadoBadgeClass
    };
  }
};
</script>