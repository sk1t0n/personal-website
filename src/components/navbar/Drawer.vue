<template>
  <transition name="slide">
    <div class="drawer" v-if="this.getDrawer">
      <ul>
        <li v-for="link in links" :key="link" @click="clickLink(link)">
          <a>{{ link }}</a>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import scrollTo from '../../utils'

export default {
  name: 'Drawer',

  data: () => ({
    links: [
      'about',
      'work',
      'education',
      'contact'
    ]
  }),

  computed: {
    ...mapGetters([
      'getDrawer'
    ])
  },

  methods: {
    ...mapMutations([
      'updateDrawerState'
    ]),

    clickLink (linkTitle) {
      const element = document.querySelector(`#${linkTitle}>h2`)
      scrollTo(element, this.updateDrawerState)
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer {
  width: 100%;
  background-color: $bg-navbar;
  position: fixed;
  top: 50px;
  left: 0;

  ul {
    display: flex;
    flex-direction: column;
    list-style-type: none;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    border-top: 1px solid #ccc;

    li {
      text-align: center;
      padding-top: 11px;
      padding-bottom: 11px;
      width: 100%;
      margin: 0;
      transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;

      &::before {
        display: none;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: height 0.5s ease-in-out;
}

.slide-enter,
.slide-leave-to {
  height: 0;

  li {
    opacity: 0;
    visibility: hidden;
  }
}

.slide-enter-to,
.slide-leave {
  height: 213px;

  li {
    opacity: 1;
    visibility: visible;
  }
}
</style>
