import Rx from 'rx'

import {wrapToDisplay, renderStream, accumutate} from '../vision'

const [UP, DOWN] = [38, 40]
const [Q, W, E, A, S, D] = [81, 87, 69, 65, 83, 68]
const keyCanvasData = {
  [Q]: ['Q', 1, 1],
  [W]: ['W', 111, 1],
  [E]: ['E', 221, 1],
  [A]: ['A', 41, 111],
  [S]: ['S', 151, 111],
  [D]: ['D', 261, 111],
}

export default () => {
  var canvas = document.querySelector('canvas')
  var ctx = canvas.getContext("2d")
  ctx.strokeStyle = "#00a500"
  ctx.fillStyle = ctx.strokeStyle
  ctx.font = document.body.style.font

  var keys = Rx.Observable.fromEvent(document.body, 'keydown').pluck('keyCode')
  var startStream = keys.filter(keyCode => keyCode === Q)
  var stopStream = keys.filter(keyCode => keyCode === E)

  var drawToCanvas = (keyCode) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (var key in keyCanvasData) {
      ctx.strokeRect(keyCanvasData[key][1], keyCanvasData[key][2], 100, 100)
      ctx.fillText(keyCanvasData[key][0], keyCanvasData[key][1]+20, keyCanvasData[key][2]+40)
    }

    if (keyCode && keyCanvasData[keyCode]) {
      ctx.fillRect(keyCanvasData[keyCode][1], keyCanvasData[keyCode][2], 100, 100)
      ctx.fillStyle = "#DFFEE3"
      ctx.fillText(keyCanvasData[keyCode][0], keyCanvasData[keyCode][1]+20, keyCanvasData[keyCode][2]+40)
      ctx.fillStyle = ctx.strokeStyle
    }
  }

  drawToCanvas()

  Rx.Observable.fromEvent(document.body, 'keyup').map(null).subscribe(drawToCanvas)
  startStream
    .map(q => keys.startWith(q).takeUntil(stopStream))
    .switch()
    .filter(keyCode => keyCanvasData[keyCode])
    .subscribe(drawToCanvas)

  Rx.Observable.fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .filter(keyCode => keyCode === UP || keyCode === DOWN)
    .map(keyCode => keyCode - 39) // UP = -1, DOWN = +1
    .scan(0, (acc, move) => {
      if (acc + move < 0) { return acc }
      if (acc + move > 6) { return 0 }
      return acc + move
    })
    .subscribe(acc => {
      for (var [index] of Array(7).entries()) {
        let part = document.querySelector('#part_'+index)
        if (part) {
          part.style.color = (!acc || acc === index) ? 'black' : 'gray'
        }
      }
    })
}
