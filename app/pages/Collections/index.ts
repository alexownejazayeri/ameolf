import Page from '../../classes/Page'

export default class Collections extends Page {
  constructor () {
    super({
      id: 'collections',
      element: '.collections', // TODO(alex): consider renaming this 'selector'
      elements: {}
    })
  }
}
