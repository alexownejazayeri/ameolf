import GSAP from 'gsap'

import Button from '../../classes/Button'
import Page from '../../classes/Page'

export default class Detail extends Page {
  link: Button
  constructor () {
    super({
      id: 'detail',

      element: '.detail',
      elements: {
        button: '.detail__button'
      }
    })
  }

  create () {
    super.create()

    // @ts-ignore
    this.link = new Button({
      element: this.elements.button,
    })
  }

  show () {
    const timeline = GSAP.timeline({
      delay: 1
    })

    timeline.fromTo(this.element, {
      autoAlpha: 0
    }, {
      autoAlpha: 1
    })

    return super.show(timeline)
  }

  destroy () {
    super.destroy() // Extend, don't override
    this.link.removeEventListeners()
  }
}
