import {Component, DOM} from 'react'

export default class actionsClass extends Component {
  render() {
    if (!this.props.actions) { return DOM.div(null, 12) }
    return DOM.div(
      {},
      this.props.actions.map(action => DOM.span(
        {key: action.name},
        action.name
      ))
    );
  }
}
