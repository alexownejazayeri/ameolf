import { Mesh, Program, Texture } from 'ogl-typescript'

import GSAP from 'gsap'

// @ts-ignore
import fragment from '../../../shaders/plane-fragment.glsl'
//@ts-ignore
import vertex from '../../../shaders/plane-vertex.glsl'

import Detection from '../../../classes/Detection'

declare global {
  interface Window {
      ASSETS: string[];
      TEXTURES: Texture | {}; // TODO(alex): account for a dynamic object in this type
  }
}

export default class {
  element: any
  geometry: any
  gl: any
  index: any
  scene: any
  sizes: any
  extra: number;
  texture: any
  program: Program
  mesh: Mesh
  bounds: any
  height: number
  width: number
  x: number
  y: number
  constructor ({ element, geometry, gl, index, scene, sizes }) {
    this.element = element
    this.geometry = geometry
    this.gl = gl
    this.index = index
    this.scene = scene
    this.sizes = sizes

    this.createTexture()
    this.createProgram()
    this.createMesh()
    this.createBounds({
      sizes: this.sizes
    })

  }

  createTexture () {
    const image = this.element.querySelector('img')

    this.texture = window.TEXTURES[image.getAttribute('data-src')]
  }

  createProgram () {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        tMap: { value: this.texture }
      }
    })
  }

  createMesh () {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })

    this.mesh.setParent(this.scene)
  }

  createBounds ({ sizes }) {
    this.sizes = sizes

    this.bounds = this.element.getBoundingClientRect()

    this.updateScale()
    this.updateX()
    this.updateY()
  }

  /**
   * Animations.
   */
  show () {
    GSAP.fromTo(this.program.uniforms.uAlpha, {
      value: 0
    }, {
      value: 1
    })
  }

  hide () {
    GSAP.to(this.program.uniforms.uAlpha, {
      value: 0
    })
  }

  /**
   * Events.
   */
  onResize (sizes, scroll) {
    this.extra = 0

    this.createBounds(sizes)
    this.updateX(scroll)
    this.updateY(0)
  }

  /**
   * Loop.
   */
  updateRotation () {
    this.mesh.rotation.z = GSAP.utils.mapRange(
      -this.sizes.width / 2,
      this.sizes.width / 2,
      Math.PI * 0.1,
      -Math.PI * 0.1,
      this.mesh.position.x
    )
  }

  updateScale () {
    this.height = this.bounds.height / window.innerHeight
    this.width = this.bounds.width / window.innerWidth

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height
  }

  updateX (x = 0) {
    this.x = (this.bounds.left + x) / window.innerWidth

    this.mesh.position.x = (-this.sizes.width / 2) + (this.mesh.scale.x / 2) + (this.x * this.sizes.width) + this.extra
  }

  updateY (y = 0) {
    this.y = (this.bounds.top + y) / window.innerHeight

    const extra = Detection.isPhone() ? 15 : 40

    this.mesh.position.y = (this.sizes.height / 2) - (this.mesh.scale.y / 2) - (this.y * this.sizes.height)
    this.mesh.position.y += Math.cos((this.mesh.position.x / this.sizes.width) * Math.PI * 0.1) * extra - extra
  }

  update (scroll) {
    this.updateRotation()
    this.updateScale()
    this.updateX(scroll)
    this.updateY(0)
  }
}
