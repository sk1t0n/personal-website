<template>
  <section id="education" class="container">
    <h2>My <span>education</span></h2>
    <q-card class="my-card">
      <q-img :src="image">
        <div class="absolute-top text-subtitle2 text-center">
          Plate deflection
        </div>
      </q-img>

      <q-card-section>
        <div class="text-h6">2013 - 2017</div>
        <div class="text-subtitle2">Pitirim Sorokin Syktyvkar State University</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Bachelor of mathematics
      </q-card-section>
    </q-card>
  </section>
</template>

<script>
export default {
  name: 'Education',

  data: () => ({
    image: '/images/education.png'
  })
}
</script>

<style lang="scss">
#education {
  .q-card {
    width: 600px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 50px;

    .q-img__content > div {
      background: none;
      color: #000
    }
  }
}

@media screen and (max-width: 767px) {
  #education {
    .q-card {
      width: 100%;
      margin-top: 25px;
      margin-bottom: 40px;
    }
  }
}
</style>
