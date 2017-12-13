import util from './util'

const Props = {
  checkComListeners (_class, listenerName, args) {
    let coms = Object.getOwnPropertyNames(_class.$com)
    if (coms.length) {
      coms.forEach((name) => {
        _class.$com[name]['listeners'] &&
        _class.$com[name]['listeners'][listenerName] &&
        _class.$com[name]['listeners'][listenerName].apply(_class.$com[name], args)
        this.checkComListeners(_class.$com[name], listenerName, args)
      })
    }
  },
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

    if (!this.__data__ && !this.__customerData__) {
      this.__data__ = util.$copy(this.data || {}, true)
      this.__customerData__ = util.$copy(this.customerData || {}, true)
    }

    this.data = util.$copy(this.__data__ || {}, true)
    this.customerData = util.$copy(this.__customerData__ || {}, true)
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
  setData (obj = {}, callback) {
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
      let data = {}
      for (let k in obj) {
        this.data[k] = obj[k]
      }
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
  $emit (config = {listenCurrentRoute: false, listenStackRoutes: true}, ...args) {
    let pages, appClass = this.$parent
    while (!pages) {
      if (appClass.$pages) {
        pages = appClass.$pages
      } else {
        appClass  =appClass.$parent
      }
    }
    let loadPages = getCurrentPages()

    if (config.listenCurrentRoute) {
      let route = loadPages[loadPages.length - 1].route || loadPages[loadPages.length - 1].__route__
      pages['/' + route]['listeners'] &&
      pages['/' + route]['listeners'][config.listenerName] &&
      pages['/' + route]['listeners'][config.listenerName].apply(pages['/' + route], args)
      Props.checkComListeners(pages['/' + route], config.listenerName, args)
    } else {
      loadPages.map((item) => {
        let route = item.route || item.__route__
        pages['/' + route]['listeners'] &&
        pages['/' + route]['listeners'][config.listenerName] &&
        pages['/' + route]['listeners'][config.listenerName].apply(pages['/' + route], args)
        Props.checkComListeners(pages['/' + route], config.listenerName, args)
      })
    }
  }
}
