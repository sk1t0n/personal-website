<template>
  <section id="contact" class="container">
    <h2>Contact <span>me</span></h2>
    <div>
      <q-btn
        v-for="(icon, i) in icons" :key="i"
        type="a" :href="icon.url" target="_blank"
        :icon="icon.name" unelevated
      />
    </div>
  </section>
</template>

<script>
import { fasEnvelope, fabGithub, fabGitlab } from '@quasar/extras/fontawesome-v5'

export default {
  name: 'Contact',

  created () {
    this.fabGithub = fabGithub
    this.fabGitlab = fabGitlab
    this.fasEnvelope = fasEnvelope
  },

  data: () => ({
    icons: [
      { name: fasEnvelope, url: 'mailto:agrabovsky2020@gmail.com' },
      { name: fabGithub, url: 'https://github.com/sk1t0n' },
      { name: fabGitlab, url: 'https://gitlab.com/woolster' }
    ]
  })
}
</script>

<style lang="scss">
#contact {
  margin-bottom: 70px;

  h2 {
    margin-bottom: 20px;
  }

  div {
    margin-left: auto;
    margin-right: auto;
    text-align: center;

    a {
      color: #111;
      margin: auto 10px;
      font-size: 30px;
      padding: 3px 0px;
      border-radius: 0;

      &:hover {
        background-color: $primary;
      }
    }
  }
}

@media screen and (max-width: 767px) {
  #contact {
    margin-bottom: 35px;

    h2 {
      margin-bottom: 10px;
    }

    a {
      margin: auto 5px;
      font-size: 20px !important;
      padding: 7.5px 0px !important;
    }
  }
}
</style>
