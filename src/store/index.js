import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    drawer: false
  },

  getters: {
    getDrawer: state => state.drawer
  },

  mutations: {
    updateDrawerState: (state, opened) => {
      state.drawer = opened
    }
  }
})
