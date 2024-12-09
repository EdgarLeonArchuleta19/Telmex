<template>
    <div class="container my-4">
      <h2 class="text-center mb-4">Área de Configuraciones - Dispositivos</h2>
  
      <!-- Filtro por categoría -->
      <div class="mb-3 d-flex justify-content-between">
        <div class="form-group w-50">
          <label for="categoria" class="form-label">Filtrar por Categoría</label>
          <select v-model="categoriaSeleccionada" id="categoria" class="form-select">
            <option value="">Todas las categorías</option>
            <option v-for="categoria in categorias" :key="categoria" :value="categoria">{{ categoria }}</option>
          </select>
        </div>
      </div>
  
      <!-- Tabla de Dispositivos -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dispositivo, index) in filteredDevices" :key="dispositivo.id">
              <td>{{ index + 1 }}</td>
              <td>{{ dispositivo.nombre }}</td>
              <td>{{ dispositivo.categoria }}</td>
              <td>{{ dispositivo.estado }}</td>
              <td>
                <button class="btn btn-info btn-sm" @click="mostrarDetalles(dispositivo)">
                  Ver Detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal de Detalles del Dispositivo -->
      <div class="modal fade" id="modalDetalles" tabindex="-1" aria-labelledby="modalDetallesLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalDetallesLabel">Detalles del Dispositivo</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Nombre:</strong> {{ dispositivoSeleccionado.nombre }}</p>
              <p><strong>Categoría:</strong> {{ dispositivoSeleccionado.categoria }}</p>
              <p><strong>Estado:</strong> {{ dispositivoSeleccionado.estado }}</p>
              <p><strong>Descripción:</strong> {{ dispositivoSeleccionado.descripcion }}</p>
              <p><strong>Fecha de Instalación:</strong> {{ dispositivoSeleccionado.fechaInstalacion }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // Dispositivos de ejemplo
        dispositivos: [
          {
            id: 1,
            nombre: 'Servidor Web',
            categoria: 'Hardware',
            estado: 'Activo',
            descripcion: 'Servidor principal de la empresa',
            fechaInstalacion: '2023-02-15',
          },
          {
            id: 2,
            nombre: 'Router Principal',
            categoria: 'Redes',
            estado: 'Inactivo',
            descripcion: 'Router central de la red interna',
            fechaInstalacion: '2022-06-23',
          },
          {
            id: 3,
            nombre: 'PC de Oficina',
            categoria: 'Hardware',
            estado: 'Activo',
            descripcion: 'PC de trabajo en la oficina administrativa',
            fechaInstalacion: '2023-01-10',
          },
          // Más dispositivos...
        ],
        categoriaSeleccionada: '', // Valor del filtro de categoría
        dispositivoSeleccionado: {}, // Dispositivo que se muestra en el modal
        categorias: ['Hardware', 'Redes', 'Software'], // Categorías disponibles
      };
    },
    computed: {
      filteredDevices() {
        if (!this.categoriaSeleccionada) {
          return this.dispositivos;
        }
        return this.dispositivos.filter(
          (dispositivo) => dispositivo.categoria === this.categoriaSeleccionada
        );
      },
    },
    methods: {
      mostrarDetalles(dispositivo) {
        this.dispositivoSeleccionado = dispositivo;
        const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
        modal.show();
      },
    },
  };
  </script>
  
  <style>
  .table-responsive {
    overflow-x: auto;
  }
  
  .modal-content {
    border-radius: 10px;
  }
  </style>
  