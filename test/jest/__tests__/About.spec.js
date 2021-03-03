import { config, mount, createLocalVue } from '@vue/test-utils'
import About from '../../../src/components/home-page/About.vue'
import translations from '../../../src/i18n/en-us'
import * as All from 'quasar'
// import langEn from 'quasar/lang/en-us' // change to any language you wish! => this breaks wallaby :(
const { Quasar } = All

const components = Object.keys(All).reduce((object, key) => {
  const val = All[key]
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {})

config.mocks['$t'] = (msg) => {
  const arr = msg.split('.')
  return translations[arr[0]][arr[1]]
}

describe('About.vue', () => {
  const localVue = createLocalVue()
  localVue.use(Quasar, { components }) // lang: langEn

  const wrapper = mount(About, {
    localVue
  })
  const vm = wrapper.vm

  it('header has correct text', () => {
    const text = 'About Me'
    expect(wrapper.find('h2').text()).toBe(text)
  })

  it('q-img has correct url', () => {
    const text = 'images/photo.jpeg'
    expect(vm.photoUrl).toBe(text)
  })

  it('correct snapshot', () => {
    expect(wrapper.text()).toMatchSnapshot()
  })
})
