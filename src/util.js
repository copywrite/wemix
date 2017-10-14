export default {
  camelize (str) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
  },
  isNoValue (value) {
    if (typeof(value) === 'undefined' || (typeof(value) === 'object' && !value)) {
      return true
    } else {
      return false
    }
  }
}
