<template>
  <section id="education" class="container">
    <h2>{{ $t('education.word1') }} <span>{{ $t('education.word2') }}</span></h2>
    <q-card>
      <q-carousel v-model="slide" vertical swipeable animated transition-prev="slide-up" transition-next="slide-down"
        :height="heightSlider" control-color="primary" navigation-position="right" navigation infinite>
        <q-carousel-slide name="DeflectionPlate" img-src="images/DeflectionPlate.png">
          <div class="deflection-plate__title">
            <div class="text-caption text-center" :style="{ color: '#26A69A' }">{{ $t('education.image_title1') }}</div>
          </div>
        </q-carousel-slide>
        <q-carousel-slide name="Kollokvium" img-src="images/Kollokvium.png">
          <div class="kollokvium__title">
            <div class="text-caption text-center" :style="{ color: '#26A69A' }">{{ $t('education.image_title2') }}</div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <q-card-section>
        <div class="text-h6">{{ $t('education.title') }}</div>
        <div class="subtitle">{{ $t('education.subtitle1') }}</div>
        <div class="subtitle">{{ $t('education.subtitle2') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ $t('education.content') }}
      </q-card-section>
    </q-card>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const slide = ref('DeflectionPlate')

const heightSlider = computed(() => {
  if (window.innerWidth <= 575) {
    return `${Math.ceil(window.innerWidth / 1.31) - 45}px`
  } else if (window.innerWidth <= 767) {
    return '345px'
  } else {
    return '460px'
  }
})
</script>

<style lang="scss">
#education {
  .q-card {
    width: 600px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 50px;

    .q-img__content>div {
      background: none;
      color: #000
    }

    .subtitle {
      font-weight: 600;
    }

    .kollokvium__title {
      margin-top: -8px;
    }
  }
}

@media screen and (max-width: 767px) {
  #education {
    .q-card {
      width: 100%;
      margin-top: 25px;
      margin-bottom: 40px;

      .deflection-plate__title {
        margin-top: -10px;
      }

      .kollokvium__title {
        margin-top: -16px;
      }
    }
  }
}
</style>
