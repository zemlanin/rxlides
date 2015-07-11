import {Component, DOM} from 'react'

export default class actionsClass extends Component {
  render() {
    if (!this.props.actions) { return DOM.div() }
    return DOM.div(
      {},
      this.props.actions.map(action => DOM.span(
        {
          key: action.name,
          onClick: this.props.actionOnClick(action),
          style: {
            cursor: 'pointer',
          }
        },
        action.name
      ))
    )
  }
}
