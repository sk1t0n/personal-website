<template>
  <section id="work" class="container">
    <h2>{{ $t('work.word1') }} <span>{{ $t('work.word2') }}</span></h2>
    <q-timeline :layout="timelineLayout">
      <q-timeline-entry :title="$t('work.timeline1.title') + ''" :subtitle="$t('work.timeline1.subtitle')" side="right">
        <h6 class="location">{{ $t('work.timeline1.location') }}</h6>
        <div>
          {{ $t('work.timeline1.div') }}
          <ul>
            <li><a @click="updateProjectDialog('KraptTaskManager')" class="dialog__link">KraptTaskManager</a> -
              {{ $t('work.timeline1.li1') }}</li>
            <li>{{ $t('work.timeline1.li2') }}</li>
            <li><a @click="updateProjectDialog('PublishNews')" class="dialog__link">PublishNews</a> -
              {{ $t('work.timeline1.li3') }}</li>
            <li><a @click="updateProjectDialog('Dobrodey11')" class="dialog__link">Dobrodey11</a> -
              {{ $t('work.timeline1.li4') }} <a
                href="http://krapt-rk.ru/apk/dobrodey11.apk">http://krapt-rk.ru/apk/dobrodey11.apk</a></li>
            <li><a @click="updateProjectDialog('AdminPanelDobrodey11')" class="dialog__link">AdminPanelDobrodey11</a> -
              {{ $t('work.timeline1.li5') }}</li>
            <li>{{ $t('work.timeline1.li6') }}</li>
          </ul>
        </div>
      </q-timeline-entry>

      <q-timeline-entry :title="$t('work.timeline2.title')" :subtitle="$t('work.timeline2.subtitle')" side="left">
        <h6 class="location">{{ $t('work.timeline2.location') }}</h6>
        <div>
          {{ $t('work.timeline2.div') }}
        </div>
      </q-timeline-entry>

      <q-timeline-entry :title="$t('work.timeline3.title')" :subtitle="$t('work.timeline3.subtitle')" side="right">
        <h6 class="location">{{ $t('work.timeline3.location') }}</h6>
        <div>
          {{ $t('work.timeline3.div') }}
        </div>
      </q-timeline-entry>
    </q-timeline>
    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div>{{ titleDialog }}</div>
          <q-space />
          <q-btn :icon="fasTimes" size="10px" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section :style="{ width: widthDialog + 'px' }">
          <q-img :src="imageDialog" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { fasTimes } from '@quasar/extras/fontawesome-v5'

const dialog = ref(false)
const imageDialog = ref('')

const imagesDialog = {
  KraptTaskManager: 'images/KraptTaskManager.png',
  PublishNews: 'images/PublishNews.png',
  Dobrodey11: 'images/Dobrodey11.png',
  AdminPanelDobrodey11: 'images/AdminPanelDobrodey11.png'
}

const $q = useQuasar()

const timelineLayout = computed(() => {
  return $q.platform.is.mobile ? 'dense' : 'loose'
})

const widthDialog = computed(() => {
  return window.innerWidth >= 460 ? 400 : window.innerWidth - 60
})

const titleDialog = computed(() => {
  return imageDialog.value.length > 0 ? imageDialog.value.split('/')[1].split('.')[0] : ''
})

function updateProjectDialog(name) {
  imageDialog.value = imagesDialog[name]
  dialog.value = true
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

  a:link,
  a:visited,
  a:focus,
  a:active {
    color: $primary;
  }

  a:hover {
    color: darken($color: $primary, $amount: 20)
  }

  .dialog__link {
    text-decoration: underline;
    color: $primary;

    &:hover {
      cursor: pointer;
    }
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
