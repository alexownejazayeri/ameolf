import { Plane, Texture, Transform } from 'ogl-typescript'
import GSAP from 'gsap'
import Prefix from 'prefix'

import map from 'lodash/map'

import Media from './Media'

declare global {
  interface Window {
      ASSETS: string[];
      TEXTURES: Texture | {}; // TODO(alex): account for a dynamic object in this type
  }
}

export default class {
  id: string
  gl: any
  scene: any
  sizes: any
  transition: any
  transformPrefix: string
  group: any
  galleryElement: any
  galleryWrapperElement: any
  titlesElement: any
  collectionsElements: NodeListOf<Element>
  collectionsElementsActive: string
  mediasElements: NodeListOf<Element>
  scroll: { current: number; direction: string; target: number; start: number; last: number; lerp: number; limit: number; velocity: number }
  geometry: any
  medias: Media[]
  bounds: any
  index: any
  constructor ({ gl, scene, sizes, transition }) {
    this.id = 'collections'

    this.gl = gl
    this.scene = scene
    this.sizes = sizes
    this.transition = transition

    this.transformPrefix = Prefix('transform')

    this.group = new Transform()

    this.galleryElement = document.querySelector('.collections__gallery')
    this.galleryWrapperElement = document.querySelector('.collections__gallery__wrapper')

    this.titlesElement = document.querySelector('.collections__titles')

    this.collectionsElements = document.querySelectorAll('.collections__article')
    this.collectionsElementsActive = 'collections__article--active'

    this.mediasElements = document.querySelectorAll('.collections__gallery__media')

    this.scroll = {
      current: 0,
      direction: '',
      target: 0,
      start: 0,
      last: 0,
      lerp: 0.1,
      limit: 0,
      velocity: 1
    }

    this.createGeometry()
    this.createGallery()

    this.onResize({
      sizes: this.sizes
    })

    this.group.setParent(this.scene)

    this.show()
  }

  createGeometry () {
    this.geometry = new Plane(this.gl)
  }

  createGallery () {
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
  async show () {
    if (this.transition) {
      const { src } = this.transition.mesh.program.uniforms.tMap.value.image
      const texture = window.TEXTURES[src]
      const media = this.medias.find(media => media.texture === texture)
      const scroll = -media?.bounds.left - media?.bounds.width / 2 + window.innerWidth / 2

      this.update()

      this.transition.animate({
        position: { x: 0, y: media?.mesh.position.y, z: 0 },
        rotation: media?.mesh.rotation,
        scale: media?.mesh.scale
      }, _ => {

        if (media?.opacity.multiplier) {
          media.opacity.multiplier = 1
        }

        map(this.medias, item => {
          if (media !== item) {
            item.show()
          }
        })

        this.scroll.current = this.scroll.target = this.scroll.start = this.scroll.last = scroll
      })
    } else {
      map(this.medias, media => media.show())
    }
  }

  hide () {
    map(this.medias, media => media.hide())
  }

  onResize (event) {
    this.sizes = event.sizes

    this.bounds = this.galleryWrapperElement.getBoundingClientRect()

    this.scroll.last = this.scroll.target = 0

    map(this.medias, media => media.onResize(event, this.scroll))

    this.scroll.limit = this.bounds.width - this.medias[0].element.clientWidth
  }

  onTouchDown ({ x, y }) {
    this.scroll.last = this.scroll.current
  }

  onTouchMove ({ x, y }) {
    const distance = x.start - x.end

    this.scroll.target = this.scroll.last - distance
  }

  onTouchUp ({ x, y }) {

  }

  onWheel ({ pixelY }) {
    this.scroll.target += pixelY
  }

  /**
   * Changed.
   */
  onChange (index: number) {
    this.index = index

    const selectedCollection = parseInt(this.mediasElements[this.index].getAttribute('data-index') || '')

    map(this.collectionsElements, (element, elementIndex) => {
      if (elementIndex === selectedCollection) {
        element.classList.add(this.collectionsElementsActive)
      } else {
        element.classList.remove(this.collectionsElementsActive)
      }
    })

    this.titlesElement.style[this.transformPrefix] = `translateY(-${25 * selectedCollection}%) translate(-50%, -50%) rotate(-90deg)`
  }

  /**
   * Update.
   */
  update () {
    this.scroll.target = GSAP.utils.clamp(-this.scroll.limit, 0, this.scroll.target)

    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, this.scroll.lerp)

    this.galleryElement.style[this.transformPrefix] = `translateX(${this.scroll.current}px)`

    if (this.scroll.last < this.scroll.current) {
      this.scroll.direction = 'right'
    } else if (this.scroll.last > this.scroll.current) {
      this.scroll.direction = 'left'
    }

    this.scroll.last = this.scroll.current

    const index = Math.floor(Math.abs((this.scroll.current - (this.medias[0].bounds.width / 2)) / this.scroll.limit) * (this.medias.length - 1))

    console.log({index})
    if (this.index !== index && !Number.isNaN(index) && index !== Infinity) {
      this.onChange(index)
    }

    map(this.medias, (media, index) => {
      media.update(this.scroll.current, this.index)
    })
  }

  /**
   * Destroy.
   */
  destroy () {
    this.scene.removeChild(this.group)
  }
}
