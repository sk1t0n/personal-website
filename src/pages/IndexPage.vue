<template>
  <q-page>
    <About />
    <hr />
    <Work />
    <hr />
    <Education />
    <hr />
    <Contact />
  </q-page>
</template>

<script setup>
import About from 'src/components/home-page/About.vue';
import Work from 'src/components/home-page/Work.vue'
import Education from 'src/components/home-page/Education.vue'
import Contact from 'src/components/home-page/Contact.vue'
</script>

<style lang="scss">
section {
  padding-left: 30px !important;
  padding-right: 30px !important;
}

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

hr {
  border: 1px solid #ddd;
}

@media screen and (max-width: 767px) {
  h2 {
    font-size: 2.9em;
    letter-spacing: 0.03em !important;
  }

  hr {
    margin-top: 30px;
    margin-bottom: 30px;
  }
}

@media screen and (min-width: 768px) {
  h2 {
    font-size: 3.25em;
    letter-spacing: 0.04em !important;
  }

  hr {
    margin-top: 65px;
    margin-bottom: 65px;
  }
}
</style>
