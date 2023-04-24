<template>
  <div class="lt-lg">
    <div ref="hamburger" class="hamburger" @click="hamburgerHandler">
      <div class="first"></div>
      <div class="second"></div>
      <div class="third"></div>
    </div>

    <Drawer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDrawerStore } from 'src/stores/drawer'
import Drawer from 'src/components/navbar/Drawer.vue'

const store = useDrawerStore()

const hamburger = ref(null)

function hamburgerHandler() {
  hamburger.value.classList.toggle('close')
  if (store.drawer) {
    store.updateDrawer(false)
  } else {
    store.updateDrawer(true)
  }
}
</script>

<style lang="scss" scoped>
.hamburger {
  width: 34px;
  height: 26px;
  cursor: pointer;

  div {
    height: 2px;
    width: 22px;
    background-color: #fff;
    transition: all 0.5s ease;
    position: relative;
  }

  .first {
    top: 6px;
    left: 6px;
  }

  .second {
    top: 10px;
    left: 6px;
  }

  .third {
    top: 14px;
    left: 6px;
  }
}

.close {
  .first {
    transform: translateY(6px) rotate(45deg);
    transition: transform 0.5s ease;
  }

  .second {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .third {
    transform: translateY(-6px) rotate(-45deg);
    transition: transform 0.5s ease;
  }
}
</style>
