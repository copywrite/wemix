import util from './util'

const Props = {
  format ($wxpage, $mappingProps, props, events) {
    let newProps = {}
    for (let key in props) {
      if (props[key]['static']){
        if (util.isNoValue(props[key]['value'])) {
          newProps[key] = props[key]['defaultValue']
        } else {
          newProps[key] = props[key]['value']
        }
      } else {
        $mappingProps[key] = props[key]['value']
        let actValue
        try {
          actValue = new Function(`return ${$wxpage.data[props[key]['value']]}`)()
          newProps[key] = actValue
        } catch (e) {
          let actDefaultValue
          try {
            actDefaultValue = new Function(`return ${$wxpage.data[props[key]['defaultValue']]}`)()
            newProps[key] = actDefaultValue
          } catch (e) {
            
          }
        }
      }
    }
    for (let k in events) {
      newProps[k] = $wxpage[events[k]]
    }
    return newProps
  }
}

export default class {
  $com = {}
  $isComponent = true
  $prefix = ''
  $mappingProps = {}
  data = {}
  props = {}

  $init ($wxpage, $root, $parent) {
    let self = this
    this.$wxpage = $wxpage
    
    if (this.$isComponent) {
      this.$root = $root || this.$root
      this.$parent = $parent || this.$parent
      this.$wxapp = this.$root.$parent.$wxapp
      this.props = Props.format(this.$wxpage, this.$mappingProps, this.$root.$props[this.$name], this.$root.$events[this.$name])

    }

    this.setData(this.data, 'init')
    let coms = Object.getOwnPropertyNames(this.$com)
    if (coms.length) {
      coms.forEach((name) => {
        this.$com[name].$init(this.getWxPage(), $root, this)
      })
    }
  }
  getWxPage () {
    return this.$wxpage
  }
  setData (obj, callback) {
    let init = false
    if (callback === 'init') {
      init = true
      callback = null
    }
    if (this.$isComponent) {
      let data = {}
      for (let k in obj) {
        data[`${this.$prefix}${k}`] = obj[k]
        this.data[k] = obj[k]
      }
      this.$wxpage.setData(data, callback)
    } else {
      this.$wxpage.setData(obj, callback)
    }
    if (!init) {
      for (let k in this.props) {
        if (this.$mappingProps[k]) {
          let split = this.$mappingProps[k].split('.')
          if (split.length > 1) {
            let actValue = this.$wxpage.data
            for (let i = 0; i < split.length; i++) {
              actValue = actValue[split[i]]
            }
            this.props[k] = actValue
          } else {
            this.props[k] = this.$wxpage.data[this.$mappingProps[k]]
          }
        }
      }
    }
  }
  setGlobalData (obj) {
    this.$wxapp.globalData = obj
  }
  getGlobalData () {
    return this.$wxapp.globalData
  }
}
