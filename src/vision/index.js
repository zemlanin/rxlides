export function renderStream(canvas) {
  var ctx = canvas.getContext("2d")
  ctx.font = '20px monospace'

  return keys => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (var {text, position} of keys) {
      ctx.fillStyle = "#000000"
      ctx.fillText(text, position > 0 ? position : canvas.width + position, canvas.height - 5)
    }
  }
}
