import GSAP from 'gsap'

import Component from './Component'

export default class Button extends Component {
  timeline: gsap.core.Timeline
  path: any
  pathLength: any
  pathValue: any
  onMouseEnterEvent: any
  onMouseLeaveEvent: any
  constructor ({ element, elements }) {
    super({ element, elements })

    this.timeline = GSAP.timeline({ paused: true })
    this.createPath()
  }

  createPath () {
    this.path = this.element.querySelector('path:last-child')
    this.pathLength = this.path.getTotalLength()
    this.pathValue = this.pathLength

    GSAP.set(this.path, {
      strokeDashoffset: this.pathLength,
      strokeDasharray: `${this.pathLength} ${this.pathLength}`
    })
  }

  onMouseEnter () {
    this.pathValue -= this.pathLength

    GSAP.to(this.path, {
      duration: 1,
      // ease,
      strokeDashoffset: this.pathValue
    })

    this.timeline.play()
  }

  onMouseLeave () {
    this.pathValue -= this.pathLength

    GSAP.to(this.path, {
      duration: 1,
      strokeDashoffset: this.pathValue
    })

    this.timeline.reverse()
  }

  addEventListeners () {
    this.onMouseEnterEvent = this.onMouseEnter.bind(this)
    this.onMouseLeaveEvent = this.onMouseLeave.bind(this)

    this.element.addEventListener('mouseenter', this.onMouseEnterEvent)
    this.element.addEventListener('mouseleave', this.onMouseLeaveEvent)
  }

  removeEventListeners () {
    this.element.removeEventListener('mouseleave', this.onMouseLeaveEvent)
    this.element.removeEventListener('mouseenter', this.onMouseEnterEvent)
  }
}
