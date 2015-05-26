import Rx from 'rx'
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
const [inactiveStar, activeStar] = ['☆', '★']

export default () => {
  var favsStream = new Rx.Subject()

  Rx.Observable.fromEvent(document.body, 'click')
    .filter(e => e.target.classList.contains('star'))
    .map(e => ({
      id: parseInt(e.path.find(p => p.dataset.id !== undefined).dataset.id, 10),
      active: e.target.textContent === inactiveStar
    }))
    .scan(new Set([1, 2, 4]), (acc, v) => {
      if (v.active) {
        return acc.add(v.id)
      } else {
        acc.delete(v.id)
        return acc
      }
    })
    .subscribe(favsStream)

  favsStream
    .subscribe(favs => {
      for (var gifCell of document.querySelectorAll('.gif_cell')) {
        gifCell.querySelector('.star').textContent = (
          favs.has(parseInt(gifCell.dataset.id, 10)) ? activeStar : inactiveStar
        )
      }
    })

  favsStream
    .pluck('size')
    .subscribe(count => document.querySelector('.star_count').textContent = count)

  getNavigationStream(true)
    .do(({acc}) => {
      if (!acc || acc === 1) {
        document.styleSheets[1].insertRule(
          acc ? opacity50Rule : opacityNoneRule,
          document.styleSheets[1].rules.length
        )
      }
    })
    .subscribe(({acc, parts}) => {
      for (var index of range(1, parts+1)) {
        document.getElementById('part_'+index).style.color = (!acc || acc === index) ? 'black' : 'gray'
      }
    })
}
