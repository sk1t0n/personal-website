<template>
  <section id="about">
    <h2>{{ $t('about.word1') }} <span>{{ $t('about.word2') }}</span></h2>
    <div class="row">
      <q-img :src="photoUrl" />
      <div>
        <p>{{ $t('about.p1') }}</p>
        <p>{{ $t('about.p2') }}</p>
        <p>{{ $t('about.p3') }}</p>
        <p>{{ $t('about.p4') }}</p>
        <p>{{ $t('about.p5') }}</p>
        <p>{{ $t('about.p6') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const photoUrl = 'images/photo.jpeg'
</script>

<style lang="scss">
#about {
  .row {
    margin-top: 20px;
    justify-content: center;

    .q-img {
      max-width: 256px;
      max-height: 256px;
    }

    div {
      padding-top: 0.6em;
    }

    p {
      font-size: 1em;
      margin-top: 10px;
      margin-bottom: 10px;
    }
  }
}

@media screen and (max-width: 767px) {
  #about {
    .row {
      flex-direction: column;
      justify-content: center;
      margin-left: 2em;
      margin-right: 2em;

      .q-img,
      div {
        margin: 0 auto;
      }

      p:first-child {
        margin-top: 20px;
      }
    }
  }
}

@media screen and (min-width: 768px) {
  #about {
    .row {
      .q-img {
        margin-right: 30px;
      }

      p:first-child {
        margin-top: 17px;
      }
    }
  }
}
</style>
