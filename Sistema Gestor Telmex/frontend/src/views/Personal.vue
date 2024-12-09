<template>
    <div class="container mt-4">
      <!-- Tabs para diferentes tipos de usuarios -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'tecnicos' }" 
             @click.prevent="activeTab = 'tecnicos'" href="#">
            Técnicos
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'usuarios' }" 
             @click.prevent="activeTab = 'usuarios'" href="#">
            Usuarios Normales
          </a>
        </li>
      </ul>
  
      <!-- Panel de Técnicos -->
      <div v-show="activeTab === 'tecnicos'">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>Técnicos</h3>
          <button class="btn btn-primary" @click="openModal('tecnico')">
            Nuevo Técnico
          </button>
        </div>
  
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Departamento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in tecnicos" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.nombre }}</td>
                <td>{{ user.departamento_nombre }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-2" @click="editUser(user)">
                    Editar
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteUser(user.id)">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Panel de Usuarios Normales -->
      <div v-show="activeTab === 'usuarios'">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>Usuarios Normales</h3>
          <button class="btn btn-primary" @click="openModal('usuarioNormal')">
            Nuevo Usuario
          </button>
        </div>
  
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usuariosNormales" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.nombre }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-2" @click="editUser(user)">
                    Editar
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteUser(user.id)">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Modal para crear/editar usuario -->
      <div class="modal fade" id="userModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Editar' : 'Nuevo' }} 
                {{ currentUser.tipo === 'tecnico' ? 'Técnico' : 'Usuario' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveUser">
                <div class="mb-3">
                  <label class="form-label">Usuario:</label>
                  <input type="text" class="form-control" v-model="currentUser.username" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nombre:</label>
                  <input type="text" class="form-control" v-model="currentUser.nombre" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Contraseña:</label>
                  <input type="password" class="form-control" v-model="currentUser.password" 
                         :required="!isEditing">
                </div>
                <div class="mb-3" v-if="currentUser.tipo === 'tecnico'">
                  <label class="form-label">Departamento:</label>
                  <select class="form-select" v-model="currentUser.departamento_id" required>
                    <option value="">Seleccione un departamento</option>
                    <option v-for="dept in departamentos" :key="dept.id" :value="dept.id">
                      {{ dept.nombre }}
                    </option>
                  </select>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Modal } from 'bootstrap'
  
  export default {
    name: 'UserManagement',
    data() {
      return {
        activeTab: 'tecnicos',
        usuarios: [],
        departamentos: [],
        currentUser: {
          username: '',
          nombre: '',
          password: '',
          tipo: '',
          departamento_id: null
        },
        isEditing: false,
        modal: null
      }
    },
    computed: {
      tecnicos() {
        return this.usuarios.filter(user => user.tipo === 'tecnico')
      },
      usuariosNormales() {
        return this.usuarios.filter(user => user.tipo === 'usuarioNormal')
      }
    },
    async created() {
      await this.loadUsers()
      await this.loadDepartamentos()
      this.modal = new Modal(document.getElementById('userModal'))
    },
    methods: {
      async loadUsers() {
        try {
          const response = await fetch('http://localhost:3000/api/usuarios')
          this.usuarios = await response.json()
        } catch (error) {
          console.error('Error al cargar usuarios:', error)
          alert('Error al cargar los usuarios')
        }
      },
      
      async loadDepartamentos() {
        try {
          const response = await fetch('http://localhost:3000/api/admin/ListaDepartamentos')
          this.departamentos = await response.json()
        } catch (error) {
          console.error('Error al cargar departamentos:', error)
          alert('Error al cargar los departamentos')
        }
      },
  
      openModal(tipo) {
        this.isEditing = false
        this.currentUser = {
          username: '',
          nombre: '',
          password: '',
          tipo: tipo,
          departamento_id: null
        }
        this.modal.show()
      },
  
      editUser(user) {
        this.isEditing = true
        this.currentUser = { 
          ...user,
          password: '' // Limpiamos la contraseña por seguridad
        }
        this.modal.show()
      },
  
      async saveUser() {
        try {
          const url = this.isEditing ? 
            `http://localhost:3000/api/usuarios/${this.currentUser.id}` : 
            'http://localhost:3000/api/CrearUsuarios'
          
          const method = this.isEditing ? 'PUT' : 'POST'
          
          // Si es un usuario normal y no tiene departamento, enviamos null
          if (this.currentUser.tipo === 'usuarioNormal') {
            this.currentUser.departamento_id = null
          }
          
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.currentUser)
          })
  
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Error al guardar')
          }
  
          await this.loadUsers()
          this.modal.hide()
        } catch (error) {
          console.error('Error al guardar usuario:', error)
          alert(error.message || 'Error al guardar el usuario')
        }
      },
  
      async deleteUser(id) {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return
  
        try {
          const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
            method: 'DELETE'
          })
  
          if (!response.ok) throw new Error('Error al eliminar')
  
          await this.loadUsers()
        } catch (error) {
          console.error('Error al eliminar usuario:', error)
          alert('Error al eliminar el usuario')
        }
      }
    }
  }
  </script>