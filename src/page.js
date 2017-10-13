import component from './component'
import util from './util'

export default class extends component {
  $coms = {}
  $isComponent = false
  
  $init ($wxpage, $parent) {
    this.$parent = $parent
    this.$root = this
    if (!$parent.$wxapp) {
      $parent.$wxapp = getApp()
    }
    this.$wxapp = $parent.$wxapp
    super.$init($wxpage, this)
  }
}