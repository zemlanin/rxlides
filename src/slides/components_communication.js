import range from 'lodash.range'

import {getNavigationStream} from '../navigation'

const opacity50Rule = `
  .gif-wrap {
    -webkit-filter: opacity(50%);
    -moz-filter: opacity(50%);
    -ms-filter: opacity(50%);
    -o-filter: opacity(50%);
  }
`
const opacityNoneRule = `
  .gif-wrap {
    -webkit-filter: none;
    -moz-filter: none;
    -ms-filter: none;
    -o-filter: none;
  }
`

export default () => {
  getNavigationStream(true)
    .subscribe(({acc, parts}) => {
      if (acc === 1) {
        document.styleSheets[1].insertRule(opacity50Rule, document.styleSheets[1].rules.length)
      } else if (!acc) {
        document.styleSheets[1].insertRule(opacityNoneRule, document.styleSheets[1].rules.length)
      }

      for (var index of range(1, parts+1)) {
        document.getElementById('part_'+index).style.color = (!acc || acc === index) ? 'black' : 'gray'
      }
    })
}
