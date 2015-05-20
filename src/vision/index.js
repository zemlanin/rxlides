export function renderStream(canvas) {
  var ctx = canvas.getContext("2d")
  ctx.font = '32px monospace'

  return keys => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (var {text, position, mirror} of keys) {
      ctx.fillStyle = "#000000"
      ctx.fillText(text, mirror ? canvas.width - position : position, canvas.height - 7)
    }
  }
}

export function accumutate(acc, [value, shift]) {
  if (value) {
    acc = [value, ...acc]
  }

  return acc
    .filter(({position}) => position <= 500)
    .map(({text, position, mirror}) => ({text, position: position+shift, mirror}))
}

export function wrapToDisplay(ctx) {
  return text => [{text, position: parseInt(ctx.measureText(text).width, 10), mirror: true}, 0]
}
