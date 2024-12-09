<template>
  <div class="container my-4">
    <h2 class="text-center mb-4">Mis Tickets Asignados</h2>
    
    <!-- Búsqueda y Reportar Problema -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            v-model="busqueda" 
            placeholder="Buscar por descripción o cliente..."
          >
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <button 
          class="btn btn-warning"
          @click="abrirModalReportarProblema"
          title="Reportar un problema recurrente"
        >
          <i class="bi bi-exclamation-triangle me-2"></i>
          Reportar Problema
        </button>
      </div>
    </div>

    <!-- Modal Reportar Problema -->
    <div class="modal fade" id="modalReportarProblema" tabindex="-1" ref="modalReportarProblema">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reportar Problema Recurrente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="reportarProblema">
              <div class="mb-3">
                <label class="form-label">Título del Problema</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="nuevoProblema.titulo"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea 
                  class="form-control"
                  v-model="nuevoProblema.descripcion"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Tickets Relacionados</label>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Seleccionar</th>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="ticket in ticketsFiltrados" :key="ticket.id">
                        <td>
                          <input 
                            type="checkbox"
                            class="form-check-input"
                            v-model="nuevoProblema.ticketsRelacionados"
                            :value="ticket.id"
                          >
                        </td>
                        <td>#{{ ticket.id }}</td>
                        <td>{{ ticket.cliente }}</td>
                        <td class="text-truncate" style="max-width: 200px;">
                          {{ ticket.descripcion }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Reportar Problema
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" v-for="estado in estados" :key="estado.valor">
        <button 
          class="nav-link" 
          :class="{ active: filtroEstado === estado.valor }"
          @click="cambiarFiltro(estado.valor)"
        >
          {{ estado.nombre }}
          <span class="badge bg-secondary ms-2">{{ contarTicketsPorEstado(estado.valor) }}</span>
        </button>
      </li>
    </ul>

    <!-- Tabla de Tickets -->
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in ticketsPaginados" :key="ticket.id">
              <td>#{{ ticket.id }}</td>
              <td>{{ ticket.cliente }}</td>
              <td class="text-truncate" style="max-width: 200px;">
                {{ ticket.descripcion }}
              </td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-success': ticket.estado === 'abierto',
                    'bg-primary': ticket.estado === 'en proceso',
                    'bg-info': ticket.estado === 'resuelto',
                    'bg-secondary': ticket.estado === 'cerrado'
                  }"
                >
                  {{ ticket.estado.toUpperCase() }}
                </span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-danger': ticket.prioridad === 'alta',
                    'bg-warning text-dark': ticket.prioridad === 'media',
                    'bg-info text-dark': ticket.prioridad === 'baja'
                  }"
                >
                  {{ ticket.prioridad.toUpperCase() }}
                </span>
              </td>
              <td>{{ formatearFecha(ticket.fecha_creacion) }}</td>
              <td>
                <button 
                  class="btn btn-primary btn-sm"
                  @click="verDetalles(ticket.id)"
                  title="Ver detalles"
                >
                  <i class="bi bi-eye me-1"></i>
                  Ver detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="cargando" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!cargando && ticketsFiltrados.length === 0" class="text-center py-4">
      <p class="text-muted">No hay tickets que mostrar</p>
    </div>

    <!-- Paginación -->
    <nav v-if="ticketsFiltrados.length > 0" class="mt-4" aria-label="Navegación de páginas">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
          <button class="page-link" @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        <li 
          v-for="pagina in totalPaginas" 
          :key="pagina" 
          class="page-item"
          :class="{ active: pagina === paginaActual }"
        >
          <button class="page-link" @click="cambiarPagina(pagina)">
            {{ pagina }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
          <button class="page-link" @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>


<script>
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';

export default {
  name: 'TicketsAsignados',
  setup() {
    const router = useRouter();
    const tickets = ref([]);
    const cargando = ref(true);
    const filtroEstado = ref('todos');
    const busqueda = ref('');
    const paginaActual = ref(1);
    const itemsPorPagina = 10;

    const estados = [
      { valor: 'todos', nombre: 'Todos' },
      { valor: 'abierto', nombre: 'Abiertos' },
      { valor: 'en proceso', nombre: 'En Proceso' },
      { valor: 'resuelto', nombre: 'Resueltos' },
      { valor: 'cerrado', nombre: 'Cerrados' }
    ];

    const ticketsFiltrados = computed(() => {
      let resultado = tickets.value;

      // Filtrar por estado
      if (filtroEstado.value !== 'todos') {
        resultado = resultado.filter(t => t.estado === filtroEstado.value);
      }

      // Filtrar por búsqueda
      if (busqueda.value) {
        const busquedaLower = busqueda.value.toLowerCase();
        resultado = resultado.filter(t => 
          t.descripcion.toLowerCase().includes(busquedaLower) ||
          t.cliente.toLowerCase().includes(busquedaLower)
        );
      }

      return resultado;
    });

    const totalPaginas = computed(() => {
      return Math.ceil(ticketsFiltrados.value.length / itemsPorPagina);
    });

    const ticketsPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * itemsPorPagina;
      const fin = inicio + itemsPorPagina;
      return ticketsFiltrados.value.slice(inicio, fin);
    });

    const contarTicketsPorEstado = (estado) => {
      if (estado === 'todos') return tickets.value.length;
      return tickets.value.filter(t => t.estado === estado).length;
    };

    const cambiarFiltro = (estado) => {
      filtroEstado.value = estado;
      paginaActual.value = 1; // Reset a primera página al cambiar filtro
    };

    const cambiarPagina = (pagina) => {
      if (pagina >= 1 && pagina <= totalPaginas.value) {
        paginaActual.value = pagina;
      }
    };

    const cargarTickets = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario?.id) throw new Error('No hay sesión de usuario');

        cargando.value = true;
        const { data } = await axios.get(`http://localhost:3000/api/tickets/asignados/${usuario.id}`);
        tickets.value = data;
      } catch (error) {
        console.error('Error al cargar tickets:', error);
      } finally {
        cargando.value = false;
      }
    };

    const verDetalles = (ticketId) => {
      router.push(`/detalles-ticket/${ticketId}`);
    };

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    const modalReportarProblema = ref(null);
    const nuevoProblema = ref({
      titulo: '',
      descripcion: '',
      ticketsRelacionados: [],
    });

    const abrirModalReportarProblema = () => {
      const modal = new Modal(modalReportarProblema.value);
      modal.show();
    };

    const reportarProblema = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario?.id) throw new Error('No hay sesión de usuario');

        const problemaData = {
          ...nuevoProblema.value,
          reportadoPor: usuario.id,
          fechaReporte: new Date().toISOString()
        };

        // Llamada a la API para crear el problema
        await axios.post('http://localhost:3000/api/problemas', problemaData);


        // Cerrar modal y resetear form
        const modal = Modal.getInstance(modalReportarProblema.value);
        modal.hide();
        nuevoProblema.value = {
          titulo: '',
          descripcion: '',
          ticketsRelacionados: [],
        };

        // Recargar tickets
        await cargarTickets();
      } catch (error) {
        console.error('Error al reportar problema:', error);
        // Aquí podrías agregar una notificación de error
      }
    };

    onMounted(() => {
      cargarTickets();
    });

    // Return additional properties and methods
    return {
      tickets,
      cargando,
      filtroEstado,
      busqueda,
      estados,
      paginaActual,
      totalPaginas,
      ticketsFiltrados,
      ticketsPaginados,
      verDetalles,
      formatearFecha,
      cambiarFiltro,
      cambiarPagina,
      contarTicketsPorEstado,
      modalReportarProblema,
      nuevoProblema,
      abrirModalReportarProblema,
      reportarProblema
    };
  }
};
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #495057;
  border: 1px solid transparent;
  margin-bottom: -1px;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease-in-out;
}

.nav-tabs .nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.table th {
  font-weight: 600;
  color: #495057;
}

.badge {
  font-weight: 500;
  padding: 0.5em 0.75em;
}

.table-responsive {
  min-height: 300px;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.375rem 0.75rem;
}

.btn-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-tabs .badge {
  font-size: 0.75em;
}
</style>


