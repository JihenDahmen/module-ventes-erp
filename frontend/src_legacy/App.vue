<template>
  <div id="app">
    <Navbar />
    <div class="container-fluid">
      <div class="row">
        <Sidebar />
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 pt-3">
          <router-view />
        </main>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import Footer from '@/components/layout/Footer.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    Footer
  }
};
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  min-height: calc(100vh - 56px - 60px);
}
</style>