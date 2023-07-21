import GSAP from 'gsap'
import Prefix from 'prefix'

import each from 'lodash/each'
import map from 'lodash/map'

import Label from '../animations/Label'
import Paragraph from '../animations/Paragraph'
import Title from '../animations/Title'
import Highlight from '../animations/Highlight'

import AsyncLoad from '../classes/AsyncLoad'

import { ColorsManager } from '../classes/Colors'

export default class Page {
  selector: any
  selectorChildren: any
  id: any
  transformPrefix: any
  element: any
  scroll: { current: number; target: number; last: number; limit: number }
  elements: any
  animations: (Label | Paragraph | Title | Highlight)[]
  animationsHighlights: Highlight[]
  animationsTitles: Title[]
  animationsParagraphs: any
  animationsLabels: any
  preloaders: AsyncLoad[]
  animationIn: any
  animationOut: gsap.core.Timeline
  constructor ({
    element,
    elements,
    id
  }) {
    this.selector = element
    this.selectorChildren = {
      ...elements,
      animationsHighlights: '[data-animation="highlights"]',
      animationsLabels: '[data-animation="label"]',
      animationsParagraphs: '[data-animation="paragraph"]',
      animationsTitles: '[data-animation="title"]',

      preloaders: '[data-src]'
    }

    this.id = id
    this.transformPrefix = Prefix('transform')
  }

  create () {
    this.element = document.querySelector(this.selector)
    this.element = {}

    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0
    }

    each(this.selectorChildren, (entry, key) => {
      if (this.elements && (entry instanceof window.HTMLElement || entry instanceof window.NodeList)) {
        console.log({key})
        this.elements[key] = entry
      } else if (this.elements) {
        this.elements[key] = document.querySelectorAll(entry)

        if (this.elements[key].length === 0) {
          this.elements[key] = null
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry)
        }
      }
    })

    this.createAnimations()
    this.createPreloader()
  }

  createAnimations () {
    if (this.elements) {

      this.animations = []

      // Highlights
      this.animationsHighlights = map(this.elements.animationsHighlights, element => {
        const elements = this.elements;

        return new Highlight({
          element,
          elements
        })
      })

      this.animations.push(...this.animationsHighlights)

      // Titles
      this.animationsTitles = map(this.elements.animationsTitles, element => {
        const elements = this.elements

        return new Title({
          element,
          elements
        })
      })

      this.animations.push(...this.animationsTitles)

      // Paragraphs
      this.animationsParagraphs = map(this.elements.animationsParagraphs, element => {
        const elements = this.elements


        return new Paragraph({
          element,
          elements
        })
      })
      this.animations.push(...this.animationsParagraphs)

      // Labels
      this.animationsLabels = map(this.elements.animationsLabels, element => {
        const elements = this.elements

        return new Label({
          element,
          elements
        })
      })

      this.animations.push(...this.animationsLabels)
    }
  }

  createPreloader () {
    if (this.elements) {

      this.preloaders = map(this.elements.preloaders, element => {
        const elements = this.elements
        return new AsyncLoad({ element, elements })
      })
    }
  }

  /**
   * Animations
   */
  show (animation?: gsap.core.Timeline) {
    return new Promise<void>(resolve => {
      if (this.element.getAttribute) {

        ColorsManager.change({
          backgroundColor: this.element.getAttribute('data-background'),
          color: this.element.getAttribute('data-color')
        })
      }

      if (animation) {
        this.animationIn = animation
      } else {
        this.animationIn = GSAP.timeline()

        this.animationIn.fromTo(this.element, {
          autoAlpha: 0
        }, {
          autoAlpha: 1
        })
      }

      this.animationIn.call(_ => {
        this.addEventListeners()

        resolve()
      })
    })
  }

  hide () {
    return new Promise(resolve => {
      this.destroy()

      this.animationOut = GSAP.timeline()

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve
      })
    })
  }

  /**
   * Events
   */

  onResize () {
    if (this.elements?.wrapper) {
      this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
    }

    each(this.animations, animation => animation.onResize())
  }

  onWheel ({ pixelY }) {
    this.scroll.target += pixelY
  }

  /**
   * Loops
   */
  update () {
    // Can do the math of lerping manually, but GS has a util
    this.scroll.target = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.target)

    // Help JS handle small values
    if (this.scroll.current < 0.01) {
      this.scroll.current = 0
    }

    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.1) // Lower easing is smoother, but at the cost of performance

    if (this.elements?.wrapper) {
      this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`
    }
  }

  /**
   * Listeners
   */
  addEventListeners () {
  }

  removeEventListeners () {
  }

  /**
   * Destroy
   */
  destroy () {
    this.removeEventListeners()
  }
}
