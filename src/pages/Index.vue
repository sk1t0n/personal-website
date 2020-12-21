<template>
  <q-page>
    <section id="about" class="about-me">
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
    <hr />
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',

  data: () => ({
    photoUrl: 'images/photo.jpeg'
  })
}
</script>

<style lang="scss">
h2 {
  font-weight: 400;
  line-height: 1.25em;
  text-transform: uppercase;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0;

  span {
    color: $primary;
  }
}

.about-me {
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
  h2 {
    font-size: 2.9em;
    letter-spacing: 0.03em !important;
  }

  .about-me {
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

    & + hr {
      margin-top: 30px;
    }
  }
}

@media screen and (min-width: 768px) {
  h2 {
    font-size: 3.25em;
    letter-spacing: 0.04em !important;
  }

  .about-me {
    .row {
      .q-img {
        margin-right: 30px;
      }

      p:first-child {
        margin-top: 17px;
      }
    }

    & + hr {
      margin-top: 65px;
    }
  }
}

.about-me + hr {
  border: 1px solid #ddd;
}
</style>
