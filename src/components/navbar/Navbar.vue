<template>
  <q-toolbar>
    <q-toolbar-title class="logo">
      <span>Anton</span>
      <span>Grabovsky</span>
    </q-toolbar-title>

    <ul class="gt-md">
      <li v-for="link in links" :key="link" @click="clickLink(link)">
        <a>{{ link }}</a>
      </li>
    </ul>

    <MobileMenu />
  </q-toolbar>
</template>

<script>
import MobileMenu from './MobileMenu'
import scrollTo from '../../utils'

export default {
  name: 'Navbar',

  components: {
    MobileMenu
  },

  data: () => ({
    links: [
      'about',
      'work',
      'education',
      'contact'
    ]
  }),

  methods: {
    clickLink (linkTitle) {
      const element = document.querySelector(`#${linkTitle}>h2`)
      scrollTo(element, this.updateDrawerState)
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
      color: $primary;
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

a {
  text-decoration: none;

  &:link, &:visited, &:active {
    color: #fff;
  }

  &:hover {
    color: $primary;
  }
}
</style>