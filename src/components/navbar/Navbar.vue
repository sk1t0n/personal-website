<template>
  <q-toolbar>
    <q-toolbar-title class="logo">
      <span>{{ $t('navbar.firstName') }}</span>
      <span>{{ $t('navbar.lastName') }}</span>
    </q-toolbar-title>

    <ul class="gt-md">
      <li
        v-for="(link, i) in links" :key="i"
        @click="clickLink(link.translateKey.split('.')[1])"
      >
        {{ $t(link.translateKey) }}
      </li>
    </ul>

    <q-btn-dropdown
      flat unelevated :dropdown-icon="fasAngleDown"
      :label="langLabel" class="languages"
    >
      <q-list>
        <q-item
          v-for="(lang, i) in languages" :key="i"
          clickable v-close-popup @click="changeLanguage(lang)"
        >
          <q-item-section>
            <q-item-label>{{ getLangText(lang) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

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
import { farMoon, farSun, fasAngleDown } from '@quasar/extras/fontawesome-v5'

export default {
  name: 'Navbar',

  components: {
    MobileMenu
  },

  created () {
    this.farMoon = farMoon
    this.farSun = farSun
    this.fasAngleDown = fasAngleDown

    // set dark mode
    const darkMode = Boolean(getCookie('darkMode'))
    this.$q.dark.set(darkMode)

    // set locale
    const locale = getCookie('locale')
    this.$i18n.locale = locale
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

  data () {
    return {
      links: [
        { translateKey: 'navbar.about' },
        { translateKey: 'navbar.work' },
        { translateKey: 'navbar.education' },
        { translateKey: 'navbar.contact' }
      ],
      languages: [
        'en-us',
        'ru'
      ],
      langLabel: this.getLangText(getCookie('locale'))
    }
  },

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
    },

    getLangText (lang) {
      if (lang) {
        return lang.substr(0, 2).toUpperCase()
      } else {
        return 'EN'
      }
    },

    changeLanguage (lang) {
      this.langLabel = this.getLangText(lang)
      this.$i18n.locale = lang
      setCookie('locale', lang, 7)
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
    font-size: 1em !important;

    &:last-child {
      margin-left: 6px !important;
    }
  }
}

@media screen and (max-width: 767px) {
  .logo span {
    font-size: 0.9em !important;
  }
}

.navbar-dark {
  background-color: #fff;

  .logo > span, .logo + ul > li, .logo + ul + button, .drawer li, .btn-dark-mode {
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

  .logo > span, .logo + ul > li, .logo + ul + button, .drawer li, .btn-dark-mode {
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
    font-family: Arial;
  }

  span:last-child {
    color: $primary;
    margin-left: 8px;
  }
}

.btn-dark-mode {
  font-size: 10px;
  margin-left: -5px;

  &:hover {
    color: $primary !important;
  }
}

@media screen and (max-width: 991px) {
  .btn-dark-mode {
    margin-right: 7px;
  }
}

button.languages {
  height: 0px;

  svg {
    display: none;
  }

  span.block {
    font-family: Open Sans, Arial, Helvetica, sans-serif;
    margin-top: -35px;

    &:hover {
      color: $primary;
    }
  }
}

.q-menu {
  margin-top: 15px !important;

  .q-item:not(:last-child) {
    border-bottom: 1px solid #777;
  }
}
</style>
