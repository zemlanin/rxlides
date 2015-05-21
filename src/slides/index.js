import mapFilterFlatmap from './map_filter_flatmap.js'
import keyboardDemo from './keyboard_demo.js'
import singleSubscribe from './single_subscribe.js'

export default page => {
  switch (page) {
    case "map_filter_flatmap":
      mapFilterFlatmap()
      break;
    case "keyboard_demo":
      keyboardDemo()
      break;
    case "single_subscribe":
      singleSubscribe()
      break;
  }
}
