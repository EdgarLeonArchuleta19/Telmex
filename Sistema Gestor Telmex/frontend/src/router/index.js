import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import CrearTicket from '@/views/CrearTicket.vue';
import VerTickets from '@/views/VerTickets.vue';
import Perfil from '@/views/Perfil.vue'; // Vista de perfil
import DetallesTicket from '@/views/DetalleTicket.vue'; // Vista de detalles del ticket
import TicketsAsignados from '@/views/TicketsAsignados.vue'; // Vista de tickets asignados
import Configuraciones from '@/views/AreaConfiguraciones.vue'; // Vista de configuraciones (dispositivos)
import DetalleTicketCliente from '@/views/DetalleTicketCliente.vue';
import Personal from '@/views/Personal.vue';
import Problemas from '@/views/GestionDeProblemas.vue';


const routes = [
  { path: '/', name: 'Login', component: Login, meta: { showNavbar: false } },
  { path: '/crear-ticket', name: 'CrearTicket', component: CrearTicket, meta: { showNavbar: true } },
  { path: '/ver-tickets', name: 'VerTickets', component: VerTickets, meta: { showNavbar: true } },
  { path: '/perfil', name: 'Perfil', component: Perfil, meta: { showNavbar: true } },
  { path: '/detalles-ticket/:id', name: 'DetallesTicket', component: DetallesTicket, meta: { showNavbar: true } },
  { path: '/tickets-asignados', name: 'TicketsAsignados', component: TicketsAsignados, meta: { showNavbar: true } },
  { path: '/configuraciones', name: 'Configuraciones', component: Configuraciones, meta: { showNavbar: true } },
  { path: '/detalle-ticket-cliente/:id', name: 'DetalleTicketCliente', component : DetalleTicketCliente, meta: { showNavbar: true } },
  { path: '/personal', name: 'Personal', component : Personal, meta: { showNavbar: true } },
  { path: '/problemas', name: 'Problemas', component : Problemas, meta: { showNavbar: true } },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
