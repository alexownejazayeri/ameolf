import Component from '../classes/Component'

export default class AsyncLoad extends Component {
  observer: IntersectionObserver
  constructor ({ element, elements }) {
    super({ element, elements })

    this.createObserver()
  }

  createObserver () {
    this.observer = new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.element.src) {
          this.element.src = this.element.getAttribute('data-src')
          this.element.onload = _ => {
            this.element.classList.add('loaded')
          }
        }
      })
    })

    this.observer.observe(this.element)
  }
}
