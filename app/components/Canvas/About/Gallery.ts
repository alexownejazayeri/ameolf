import { Transform } from 'ogl-typescript'

import map from 'lodash/map'
import GSAP from 'gsap'

import Media from './Media'

export default class Gallery {
  element: any
  elementWrapper: any
  geometry: any
  index: any
  gl: any
  scene: any
  sizes: any
  group: Transform
  scroll: { current: number; target: number; start: number; last: number; lerp: number; velocity: number }
  mediasElements: any
  medias: Media[]
  bounds: any
  width: number
  direction: string
  constructor ({ element, geometry, index, gl, scene, sizes }: {element: any; geometry: any; index: any; gl: any; scene: any; sizes: any;}) {
    this.element = element
    this.elementWrapper = element.querySelector('.about__gallery__wrapper')

    this.geometry = geometry
    this.index = index
    this.gl = gl
    this.scene = scene
    this.sizes = sizes

    this.group = new Transform()

    this.scroll = {
      current: 0,
      target: 0,
      start: 0,
      last: 0,
      lerp: 0.1,
      velocity: 1
    }

    this.createMedias()

    this.onResize({
      sizes: this.sizes
    })

    this.group.setParent(this.scene)
  }

  createMedias () {
    this.mediasElements = this.element.querySelectorAll('.about__gallery__media')

    this.medias = map(this.mediasElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        gl: this.gl,
        scene: this.group,
        sizes: this.sizes
      })
    })
  }

  /**
   * Animations.
   */
  show () {
    map(this.medias, media => media.show())
  }

  hide () {
    map(this.medias, media => media.hide())
  }

  /**
   * Events.
   */
  onResize (event) {
    this.bounds = this.elementWrapper.getBoundingClientRect()

    this.sizes = event.sizes

    this.width = this.bounds.width / window.innerWidth * this.sizes.width

    this.scroll.current = this.scroll.target = 0

    map(this.medias, media => media.onResize(event, this.scroll.current))
  }

  onTouchDown ({ x, y }) {
    this.scroll.start = this.scroll.current
  }

  onTouchMove ({ x, y }) {
    const distance = x.start - x.end

    this.scroll.target = this.scroll.start - distance
  }

  onTouchUp ({ x, y }) {

  }

  /**
   * Update.
   */
  update (scroll) {
    const distance = (scroll.current - scroll.target) * 0.1
    const y = scroll.current / window.innerHeight

    if (this.scroll.current < this.scroll.target) {
      this.direction = 'right'

      this.scroll.velocity = -1
    } else if (this.scroll.current > this.scroll.target) {
      this.direction = 'left'

      this.scroll.velocity = 1
    }

    this.scroll.target -= this.scroll.velocity
    this.scroll.target += distance

    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, this.scroll.lerp)

    map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2 + 0.25

      if (this.direction === 'left') {
        const x = media.mesh.position.x + scaleX

        if (x < -this.sizes.width / 2) {
          media.extra += this.width
        }
      } else if (this.direction === 'right') {
        const x = media.mesh.position.x - scaleX

        if (x > this.sizes.width / 2) {
          media.extra -= this.width
        }
      }

      media.update(this.scroll.current)
    })

    this.group.position.y = y * this.sizes.height
  }

  /**
   * Destroy.
   */

  destroy () {
    this.scene.removeChild(this.group)
  }
}
