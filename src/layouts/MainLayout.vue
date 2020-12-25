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

<script>
import Navbar from 'components/navbar/Navbar'
import { changeActiveMenuDesktopItem } from '../utils'

export default {
  name: 'MainLayout',

  components: {
    Navbar
  },

  methods: {
    scrollHandler (e) {
      if (document.querySelector('body').clientWidth >= 980) {
        changeActiveMenuDesktopItem(e.position)
      }
    }
  }
}
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
