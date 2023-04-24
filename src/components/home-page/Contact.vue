<template>
  <section id="contact" class="container">
    <h2>{{ $t('contact.word1') }} <span>{{ $t('contact.word2') }}</span></h2>
    <div>
      <q-btn v-for="(icon, i) in icons" :key="i" type="a" :href="icon.url" target="_blank" :icon="icon.name" unelevated
        fab class="btnIcon" />
    </div>
  </section>
</template>

<script setup>
import { fasEnvelope, fabGithub, fabGitlab } from '@quasar/extras/fontawesome-v5'

const icons = [
  { name: fasEnvelope, url: 'mailto:agrabovsky2020@gmail.com' },
  { name: fabGithub, url: 'https://github.com/sk1t0n' },
  { name: fabGitlab, url: 'https://gitlab.com/woolster' }
]
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

.btnIcon {
  span.q-icon {
    font-size: 1.7em;

    svg {
      padding: 0.1em;
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
