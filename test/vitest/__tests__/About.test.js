import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import About from 'src/components/home-page/About.vue'
import translations from 'src/i18n/en-US'

installQuasar()

describe('About.vue', () => {
  const wrapper = mount(About, {
    global: {
      mocks: {
        $t: (msg) => {
          const [k1, k2] = msg.split('.')
          return translations[k1][k2]
        },
      },
    },
  })

  it('header has correct text', () => {
    const text = 'About Me'
    expect(wrapper.find('h2').text()).toBe(text)
  })

  it('q-img has correct url', () => {
    const text = 'images/photo.jpeg'
    expect(wrapper.vm.photoUrl).toBe(text)
  })

  it('correct snapshot', () => {
    expect(wrapper.text()).toMatchSnapshot()
  })
})
