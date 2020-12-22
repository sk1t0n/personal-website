<template>
  <section id="work" class="container">
    <h2>Work <span>experience</span></h2>
    <q-timeline :layout="timelineLayout">
      <q-timeline-entry
        title="Komi Republican Agroindustrial College (Russia, Komi Republic, Vylgort)"
        subtitle="September 2017 - October 2018"
        side="right"
      >
        <div>
          Support of the technical school website. Development of various projects:
          <ul>
            <li>KraptTaskManager - a program for compressing a folder with pictures for a site (made in Java, JavaFX, Gulp)</li>
            <li>krapt-news.herokuapp.com - archived news site from krapt-rk.ru (made with Ruby on Rails, Bootstrap 4)</li>
            <li>PublishNews - a program for publishing news to the sites krapt-rk.ru and krapt-news.herokuapp.com (made on NodeJs, Electron)</li>
            <li>Dobrodey11 - Android application for volunteers: news, promotions (information and google map), chat, feedback (sending an email) (made in Java, Android SDK, Firebase)</li>
            <li>AdminPanelDobrodey11 - a program for publishing news with sending push notifications and changing data about collecting things in the database (made on NodeJS, Electron)</li>
            <li>Helper scripts for changing links to images when transferring them to another hosting (php, python3, ruby, bash)</li>
          </ul>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        title="SYKGEYMLAB LLC (Russia, Komi Republic, Syktyvkar)"
        subtitle="November 2018 - August 2019"
        side="left"
      >
        <div>
          Development of mobile games on the Unity engine.
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

  .q-timeline__content ul {
    list-style-type: disc;
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
