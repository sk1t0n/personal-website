<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <div class="container">
        <Navbar />
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import Navbar from 'components/navbar/Navbar'

export default {
  name: 'MainLayout',

  components: {
    Navbar
  }
}
</script>

<style lang="scss">
@import url('./../css/container.scss');

body {
  font-family: 'Roboto', Open Sans, Arial, Helvetica, sans-serif;
}

.q-header {
  background-color: $bg-navbar;
}
</style>
