import {Component, DOM} from 'react'

export default class actionsClass extends Component {
  render() {
    if (!this.props.actions) { return DOM.div() }
    return DOM.div(
      {},
      this.props.actions.map(action => DOM.div(
        {
          key: action.name,
          onClick: this.props.actionOnClick(action),
          className: 'action-button'
        },
        action.name
      ))
    )
  }
}
