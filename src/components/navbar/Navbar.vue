<template>
  <q-toolbar>
    <q-toolbar-title class="logo">
      <span>Anton</span>
      <span>Grabovsky</span>
    </q-toolbar-title>

    <ul class="gt-md">
      <li v-for="link in links" :key="link" @click="clickLink(link)">
        {{ link }}
      </li>
    </ul>

    <q-btn
      round flat :icon="darkModeIcon" class="btn-dark-mode"
      @click="changeDarkMode"
    />

    <MobileMenu />
  </q-toolbar>
</template>

<script>
import MobileMenu from './MobileMenu'
import { scrollTo, getCookie, setCookie } from '../../utils'
import { farMoon, farSun } from '@quasar/extras/fontawesome-v5'

export default {
  name: 'Navbar',

  components: {
    MobileMenu
  },

  created () {
    this.farMoon = farMoon
    this.farSun = farSun

    // set dark mode
    const darkMode = Boolean(getCookie('darkMode'))
    this.$q.dark.set(darkMode)
  },

  mounted () {
    // set navbar theme
    const navbar = document.querySelector('.q-header')
    if (this.$q.dark.isActive) {
      navbar.classList.remove('navbar-light')
      navbar.classList.add('navbar-dark')
    } else {
      navbar.classList.remove('navbar-dark')
      navbar.classList.add('navbar-light')
    }
  },

  data: () => ({
    links: [
      'about',
      'work',
      'education',
      'contact'
    ]
  }),

  computed: {
    darkModeIcon () {
      if (this.$q.dark.isActive) {
        return this.farSun
      } else {
        return this.farMoon
      }
    }
  },

  methods: {
    clickLink (linkTitle) {
      const element = document.querySelector(`#${linkTitle}>h2`)
      scrollTo(element, this.updateDrawerState)
    },

    changeDarkMode () {
      const navbar = document.querySelector('.q-header')

      if (this.$q.dark.isActive) {
        navbar.classList.remove('navbar-dark')
        navbar.classList.add('navbar-light')

        setCookie('darkMode', '', 7)
      } else {
        navbar.classList.remove('navbar-light')
        navbar.classList.add('navbar-dark')

        setCookie('darkMode', 'true', 7)
      }

      this.$q.dark.toggle()
    }
  }
}
</script>

<style lang="scss">
@media screen and (min-width: 992px) {
  .q-toolbar {
    padding-top: 20px !important;
    padding-bottom: 20px !important;
  }
}

@media screen and (max-width: 991px) {
  .logo span {
    font-size: 1.1em !important;

    &:last-child {
      margin-left: 6px !important;
    }
  }
}

.navbar-dark {
  background-color: #fff;

  .logo > span, .logo + ul > li, .logo + ul + button, .drawer li {
    color: #000;
  }
  .logo + ul > li:not(:first-child)::before, .hamburger div {
    background-color: #000;
  }
  .drawer {
    background-color: #fff;
  }
}

.navbar-light {
  background-color: $bg-navbar;

  .logo > span, .logo + ul > li, .logo + ul + button, .drawer li {
    color: #fff;
  }
  .logo + ul > li:not(:first-child)::before, .hamburger div {
    background-color: #fff;
  }
  .drawer {
    background-color: $bg-navbar;
  }
}

.q-toolbar {
  ul {
    display: flex;
    list-style-type: none;
  }

  li:last-child {
    margin-right: 0px;
  }

  li {
    font-family: Open Sans, Arial, Helvetica, sans-serif;
    font-size: 14px;
    text-transform: uppercase;
    cursor: pointer;
    margin-left: 10px;
    margin-right: 10px;
    position: relative;
    transition: color 0.5s ease;

    &:not(:first-child)::before {
      content: '';
      display: inline-block;
      position: absolute;
      top: 9px;
      left: -13px;
      width: 4px;
      height: 4px;
      -moz-border-radius: 50%;     // Firefox
      -webkit-border-radius: 50%;  // Safari
      border-radius: 50%;          // other
      background-color: #fff;
    }

    &:hover {
      color: $primary !important;
      transition: color 0.5s ease;
    }
  }
}

.logo {
  span {
    text-transform: uppercase;
    font-size: 1.4em;
    font-weight: 500;
    cursor: pointer;
  }

  span:last-child {
    color: $primary;
    margin-left: 8px;
  }
}

.btn-dark-mode {
  font-size: 10px;
  margin-left: 10px;

  &:hover {
    color: $primary !important;
  }
}
</style>
