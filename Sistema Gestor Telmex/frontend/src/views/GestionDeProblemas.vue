<template>
    <div class="container-fluid py-4">
      <div class="row mb-3 align-items-center">
        <div class="col-md-6">
          <h2 class="mb-0">Gestión de Problemas</h2>
        </div>
        <div class="col-md-6 text-end">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              v-model="busqueda" 
              placeholder="Buscar problemas..."
            >
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
          </div>
        </div>
      </div>
  
      <!-- Tabla de Problemas -->
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Técnico Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="problema in problemasPaginados" :key="problema.id">
                <td>#{{ problema.id }}</td>
                <td>{{ problema.titulo }}</td>
                <td>
                  <span 
                    class="badge"
                    :class="{
                      'bg-warning': problema.estado === 'Abierto',
                      'bg-info': problema.estado === 'En Análisis',
                      'bg-success': problema.estado === 'Resuelto'
                    }"
                  >
                    {{ problema.estado }}
                  </span>
                </td>
                <td>{{ formatearFecha(problema.fecha_creacion) }}</td>
                <td>{{ problema.tecnico_nombre || 'No asignado' }}</td>
                <td>
                  <button 
                    class="btn btn-primary btn-sm"
                    @click="verDetalleProblema(problema)"
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
  
      <!-- Estado de carga -->
      <div v-if="cargando" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
  
      <!-- Estado vacío -->
      <div v-if="!cargando && problemasFiltrados.length === 0" class="text-center py-4">
        <p class="text-muted">No hay problemas para mostrar</p>
      </div>
  
      <!-- Paginación -->
      <nav v-if="problemasFiltrados.length > 0" class="mt-4" aria-label="Navegación de páginas">
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
  
      <!-- Modal de Detalles de Problema -->
      <div 
        class="modal fade" 
        id="modalDetalleProblema" 
        tabindex="-1" 
        ref="modalDetalleProblema"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles del Problema #{{ problemaSeleccionado?.id }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="problemaSeleccionado">
              <div class="row">
                <div class="col-md-6">
                  <h6>Información del Problema</h6>
                  <p><strong>Título:</strong> {{ problemaSeleccionado.titulo }}</p>
                  <p><strong>Descripción:</strong> {{ problemaSeleccionado.descripcion }}</p>
                  <p>
                    <strong>Estado:</strong> 
                    <span 
                      class="badge"
                      :class="{
                        'bg-warning': problemaSeleccionado.estado === 'Abierto',
                        'bg-info': problemaSeleccionado.estado === 'En Análisis',
                        'bg-success': problemaSeleccionado.estado === 'Resuelto'
                      }"
                    >
                      {{ problemaSeleccionado.estado }}
                    </span>
                  </p>
                  <p><strong>Fecha Creación:</strong> {{ formatearFecha(problemaSeleccionado.fecha_creacion) }}</p>
                  <p><strong>Técnico Asignado:</strong> {{ problemaSeleccionado.tecnico_nombre || 'No asignado' }}</p>
                </div>
                <div class="col-md-6">
                  <h6>Tickets Relacionados</h6>
                  <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Descripción</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="ticket in problemaSeleccionado.tickets" :key="ticket.id">
                          <td>#{{ ticket.id }}</td>
                          <td>{{ ticket.descripcion }}</td>
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
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
  
              <div class="mt-3" v-if="problemaSeleccionado.estado !== 'Resuelto'">
                <h6>Añadir Solución</h6>
                <form @submit.prevent="enviarSolucion">
                  <div class="mb-3">
                    <textarea 
                      class="form-control" 
                      v-model="solucion" 
                      rows="4" 
                      placeholder="Describe la solución al problema..."
                      required
                    ></textarea>
                  </div>
                  <div class="text-end">
                    <button type="submit" class="btn btn-success">
                      <i class="bi bi-check-circle me-2"></i>
                      Enviar Solución
                    </button>
                  </div>
                </form>
              </div>
              <div v-else class="alert alert-success mt-3">
                <strong>Solución:</strong> {{ problemaSeleccionado.solucion }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap';
  
  export default {
    name: 'GestionProblemas',
    setup() {
      const problemas = ref([]);
      const cargando = ref(true);
      const busqueda = ref('');
      const paginaActual = ref(1);
      const itemsPorPagina = 10;
      const problemaSeleccionado = ref(null);
      const solucion = ref('');
  
      const problemasFiltrados = computed(() => {
        let resultado = problemas.value;
  
        // Filtrar por búsqueda
        if (busqueda.value) {
          const busquedaLower = busqueda.value.toLowerCase();
          resultado = resultado.filter(p => 
            p.titulo.toLowerCase().includes(busquedaLower) ||
            p.estado.toLowerCase().includes(busquedaLower)
          );
        }
  
        return resultado;
      });
  
      const totalPaginas = computed(() => {
        return Math.ceil(problemasFiltrados.value.length / itemsPorPagina);
      });
  
      const problemasPaginados = computed(() => {
        const inicio = (paginaActual.value - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        return problemasFiltrados.value.slice(inicio, fin);
      });
  
      const cargarProblemas = async () => {
        try {
          cargando.value = true;
          const { data } = await axios.get('http://localhost:3000/api/problemas');
          problemas.value = data;
        } catch (error) {
          console.error('Error al cargar problemas:', error);
        } finally {
          cargando.value = false;
        }
      };
  
      const verDetalleProblema = async (problema) => {
        try {
          const { data } = await axios.get(`http://localhost:3000/api/problemas/${problema.id}/detalles`);
          problemaSeleccionado.value = data;
          
          const modal = new Modal(document.getElementById('modalDetalleProblema'));
          modal.show();
        } catch (error) {
          console.error('Error al cargar detalles del problema:', error);
        }
      };
  
      const enviarSolucion = async () => {
        try {
          const usuario = JSON.parse(localStorage.getItem('usuario'));
          
          await axios.post(`http://localhost:3000/api/problemas/${problemaSeleccionado.value.id}/resolver`, {
            solucion: solucion.value,
            tecnicoId: parseInt(usuario.id, 10)
          });
  
          // Recargar problemas
          await cargarProblemas();
  
          // Cerrar modal
          const modal = Modal.getInstance(document.getElementById('modalDetalleProblema'));
          modal.hide();
  
          // Limpiar solución
          solucion.value = '';
        } catch (error) {
          console.error('Error al enviar solución:', error);
        }
      };
  
      const cambiarPagina = (pagina) => {
        if (pagina >= 1 && pagina <= totalPaginas.value) {
          paginaActual.value = pagina;
        }
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
  
      onMounted(() => {
        cargarProblemas();
      });
  
      return {
        problemas,
        cargando,
        busqueda,
        paginaActual,
        problemasFiltrados,
        totalPaginas,
        problemasPaginados,
        problemaSeleccionado,
        solucion,
        cargarProblemas,
        verDetalleProblema,
        enviarSolucion,
        cambiarPagina,
        formatearFecha
      };
    }
  };
  </script>
  
  <style scoped>
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
  
  .btn-sm {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  </style>