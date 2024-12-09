<template>
  <div id="app">
    <Navbar v-if="$route.meta.showNavbar" />
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
};
</script>
