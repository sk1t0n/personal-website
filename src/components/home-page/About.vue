<template>
  <section id="about">
    <h2>About <span>Me</span></h2>
    <div class="row">
      <q-img :src="photoUrl" transition="rotate" />
      <div>
        <p>Fullstack Developer</p>
        <p>Programming languages: Python, JavaScript</p>
        <p>Backend: Django, Django REST framework, FastAPI</p>
        <p>Databases: PostgreSQL, MongoDB</p>
        <p>Frontend: Vue.js, Vuex, Quasar Framework, Buefy, Nuxt.js</p>
        <p>DevOps: Docker, Ansible</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'About',

  data: () => ({
    photoUrl: 'images/photo.jpeg'
  })
}
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
      padding-top: 1.5em;
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

      .q-img, div {
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
