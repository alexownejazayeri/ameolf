import Button from '../../classes/Button'
import Page from '../../classes/Page'

export default class Home extends Page {
  link: Button
  constructor () {
    super({
      id: 'home',

      element: '.home',
      elements: {
        navigation: document.querySelector('.navigation'),
        link: '.home__link'
      }
    })
  }

  create () {
    super.create()

    const elements = this.elements

    if (elements) {

      this.link = new Button({
        element: this.elements.link,
        elements
      })
    }
  }

  destroy () {
    super.destroy() // Extend, don't override
    this.link.removeEventListeners()
  }
}
