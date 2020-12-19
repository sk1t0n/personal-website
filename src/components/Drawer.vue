<template>
  <transition name="slide">
    <div class="drawer" v-if="this.getDrawer">
      <ul>
        <li v-for="link in links" :key="link.title">
          <a>{{ link.title }}</a>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Drawer',

  data: () => ({
    links: [
      { title: 'About' },
      { title: 'Work' },
      { title: 'Education' },
      { title: 'Contact' }
    ]
  }),

  computed: {
    ...mapGetters([
      'getDrawer'
    ])
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
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
    border-top: 1px solid #ccc;

    li {
      text-align: center;
      padding-top: 11px;
      padding-bottom: 11px;
      width: 100%;
      margin: 0;
      border-bottom: 1px solid rgba($color: #fff, $alpha: 0.5);
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: height 0.5s ease-in-out;

  li {
    transition: opacity 0.5s ease-in-out;
  }
}

.slide-enter,
.slide-leave-to {
  height: 0;

  li {
    opacity: 0;
  }
}

.slide-enter-to,
.slide-leave {
  height: 177px;

  li {
    opacity: 1;
  }
}
</style>
