<template>
  <q-layout view="lHh Lpr lFf" @scroll="scrollHandler">
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

<script setup>
import Navbar from 'src/components/navbar/Navbar.vue'
import { changeActiveMenuDesktopItem } from 'src/utils'

const scrollHandler = (e) => {
  if (document.querySelector('body').clientWidth >= 980) {
    changeActiveMenuDesktopItem(e.position)
  }
};
</script>

<style lang="scss">
@import url('./../css/container.scss');

body {
  font-family: 'Roboto', Open Sans, Arial, Helvetica, sans-serif;
}

.menudesktop__item--active {
  border-bottom: 2px solid $primary;
}
</style>
