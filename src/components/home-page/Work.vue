<template>
  <section id="work" class="container">
    <h2>{{ $t('work.word1') }} <span>{{ $t('work.word2') }}</span></h2>
    <q-timeline :layout="timelineLayout">
      <q-timeline-entry
        :title="$t('work.timeline1.title') + ''"
        :subtitle="$t('work.timeline1.subtitle')"
        side="right"
      >
        <h6 class="location">{{ $t('work.timeline1.location') }}</h6>
        <div>
          {{ $t('work.timeline1.div') }}
          <ul>
            <li>{{ $t('work.timeline1.li1') }}</li>
            <li>{{ $t('work.timeline1.li2') }}</li>
            <li>{{ $t('work.timeline1.li3') }}</li>
            <li>{{ $t('work.timeline1.li4') }} <a href="http://krapt-rk.ru/apk/dobrodey11.apk">http://krapt-rk.ru/apk/dobrodey11.apk</a></li>
            <li>{{ $t('work.timeline1.li5') }}</li>
            <li>{{ $t('work.timeline1.li6') }}</li>
          </ul>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        :title="$t('work.timeline2.title')"
        :subtitle="$t('work.timeline2.subtitle')"
        side="left"
      >
        <h6 class="location">{{ $t('work.timeline2.location') }}</h6>
        <div>
          {{ $t('work.timeline2.div') }}
        </div>
      </q-timeline-entry>
    </q-timeline>
  </section>
</template>

<script>
export default {
  name: 'Work',

  computed: {
    timelineLayout () {
      if (this.$q.platform.is.mobile) {
        return 'dense'
      } else {
        return 'loose'
      }
    }
  }
}
</script>

<style lang="scss">
#work {
  h2 {
    margin-bottom: 60px
  }

  .location {
    margin-top: -10px;
    font-size: 1.2em;
  }

  .q-timeline__content ul {
    list-style-type: disc;
  }

  a:link, a:visited, a:focus, a:active {
    color: $primary;
  }

  a:hover {
    color: darken($color: $primary, $amount: 20)
  }
}

@media screen and (max-width: 767px) {
  #work {
    h2 {
      margin-bottom: 20px;
    }
  }
}
</style>
