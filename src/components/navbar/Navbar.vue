<template>
  <q-toolbar>
    <q-toolbar-title class="logo">
      <span>{{ $t('navbar.firstName') }}</span>
      <span>{{ $t('navbar.lastName') }}</span>
    </q-toolbar-title>

    <ul class="gt-md">
      <li v-for="(link, i) in links" :key="i" @click="linkHandler(link.translateKey.split('.')[1])">
        {{ $t(link.translateKey) }}
      </li>
    </ul>

    <q-btn-dropdown :ripple="false" unelevated :label="langLabel" class="languages">
      <q-list>
        <q-item v-for="(lang, i) in languages" :key="i" clickable v-close-popup @click="changeLanguage(lang)">
          <q-item-section>
            <q-item-label class="language-label">{{ getLangText(lang) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn round flat :icon="darkModeIcon" class="btn-dark-mode" @click="changeDarkMode" />

    <MobileMenu />
  </q-toolbar>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { farMoon, farSun } from '@quasar/extras/fontawesome-v5'
import { useDrawerStore } from 'src/stores/drawer'
import { scrollTo, getCookie, setCookie } from 'src/utils'
import MobileMenu from 'src/components/navbar/MobileMenu.vue'

const links = [
  { translateKey: 'navbar.about' },
  { translateKey: 'navbar.work' },
  { translateKey: 'navbar.education' },
  { translateKey: 'navbar.contact' }
]

const store = useDrawerStore()
const $q = useQuasar()

const { locale } = useI18n({ useScope: 'global' })
const langLabel = ref(getLangText(getCookie('locale')))

const languages = [
  'en-us',
  'ru'
]

const darkModeIcon = computed(() => {
  return $q.dark.isActive ? farSun : farMoon
})

onBeforeMount(() => {
  // set dark mode
  $q.dark.set(Boolean(getCookie('darkMode')))

  // set locale
  locale.value = getCookie('locale')
})

onMounted(() => {
  // set navbar theme
  const navbar = document.querySelector('.q-header')
  if ($q.dark.isActive) {
    navbar.classList.remove('navbar-light')
    navbar.classList.add('navbar-dark')
  } else {
    navbar.classList.remove('navbar-dark')
    navbar.classList.add('navbar-light')
  }

  // disable hover button.languages
  document.querySelector('button.languages span.q-focus-helper').style = 'display: none'

  // add class to navbar About item
  const menu = document.querySelector('.q-toolbar ul').childNodes
  const classActive = 'menudesktop__item--active'
  menu[1].classList.add(classActive)
})

function linkHandler(linkTitle) {
  const element = document.querySelector(`#${linkTitle}>h2`)
  scrollTo(element, store.updateDrawer)
}

function changeDarkMode() {
  const navbar = document.querySelector('.q-header')

  if ($q.dark.isActive) {
    navbar.classList.remove('navbar-dark')
    navbar.classList.add('navbar-light')

    setCookie('darkMode', '', 7)
  } else {
    navbar.classList.remove('navbar-light')
    navbar.classList.add('navbar-dark')

    setCookie('darkMode', 'true', 7)
  }

  $q.dark.toggle()
}

function getLangText(lang) {
  return lang ? lang.substr(0, 2).toUpperCase() : 'EN'
}

function changeLanguage(lang) {
  langLabel.value = getLangText(lang)
  locale.value = lang
  setCookie('locale', locale.value, 7)
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

  .logo>span,
  .logo+ul>li,
  .logo+ul+button,
  .drawer li,
  .btn-dark-mode {
    color: #000;
  }

  .logo+ul>li:not(:first-child)::before,
  .hamburger div {
    background-color: #000;
  }

  .drawer {
    background-color: #fff;
  }
}

.navbar-light {
  background-color: $bg-navbar;

  .logo>span,
  .logo+ul>li,
  .logo+ul+button,
  .drawer li,
  .btn-dark-mode {
    color: #fff;
  }

  .logo+ul>li:not(:first-child)::before,
  .hamburger div {
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
      -moz-border-radius: 50%; // Firefox
      -webkit-border-radius: 50%; // Safari
      border-radius: 50%; // other
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

.language-label {
  text-align: center;
}

button.languages {
  margin-right: -8px;

  span:hover {
    color: $primary;
  }

  span.block {
    font-family: Open Sans, Arial, Helvetica, sans-serif;
  }
}

.q-menu {
  margin-top: 15px !important;

  .q-item:not(:last-child) {
    border-bottom: 1px solid #777;
  }
}
</style>
