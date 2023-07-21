import GSAP from 'gsap'

import Animation from '../classes/Animation'

export default class Title extends Animation {
  constructor ({ element, elements }: {element: any; elements: any}) {
    super({
      element,
      elements
    })
  }

  animateIn () {
    GSAP.fromTo(this.element, {
      autoAlpha: 0,
      delay: 0.5
    },
    {
      autoAlpha: 1,
      duration: 1.5
    })
  }

  animateOut () {
    GSAP.set(this.element, {
      autoAlpha: 0
    })
  }
}
