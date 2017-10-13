import util from './util'
const PAGE_EVENT = {
  pcCountUp: ['onLoad', 'onReady', 'onShow', 'onPullDownRefresh', 'onReachBottom', 'onPageScroll'],
  pcCountDown: ['onHide', 'onUnload'],
  page: ['onShareAppMessage']
}
const APP_EVENT = ['onLaunch', 'onShow', 'onHide', 'onError']


let $bindEvt = (page, config, com, prefix) => {
  com.$prefix = util.camelize(prefix || '')
  Object.getOwnPropertyNames(com.components || {}).forEach((name) => {
    let cClass = com.components[name]
    let child = new cClass()
    PAGE_EVENT['pcCountUp'].forEach((v) => {
      if (child[v]) {
        let funcV = (...args) => {
          return child[v].apply(child, args)
        }
        if (page.$coms[v]) {
          page.$coms[v].push(funcV)
        } else {
          page.$coms[v] = [funcV]
        }
      }
    })
    PAGE_EVENT['pcCountDown'].forEach((v) => {
      if (child[v]) {
        let funcV = (...args) => {
          return child[v].apply(child, args)
        }
        if (page.$coms[v]) {
          page.$coms[v].unshift(funcV)
        } else {
          page.$coms[v] = [funcV]
        }
      }
    })
    child.$name = name
    let comPrefix = '$' + child.$name + '$'

    com.$com[name] = child

    $bindEvt(page, config, child, comPrefix)
  })

  Object.getOwnPropertyNames(com.methods || []).forEach((method, i) => {
    if (method !== 'length') {
      // 不用箭头符，this为原生Page的作用域
      config[com.$prefix + method] = function (e, ...args) {
        let comfn = com.methods[method]
        return comfn && comfn.apply(com, [e].concat(args))
      }
    }
  })
  return config
}


export default {
  $createApp (appClass) {
    let config = {}
    let app = new appClass()

    if (!this.$instance) {
      this.$instance = app
    }

    config.globalData = app.globalData

    Object.getOwnPropertyNames(app.constructor.prototype || []).forEach((v) => {
      if (v !== 'constructor') {
        config[v] = (...args) => {
          return app[v] && app[v].apply(app, args)
        }
      }
    })
    return config
  },
  $createPage (pageClass, pagePath) {
    let self = this
    let config = {}
    let page = new pageClass()
    if (typeof pagePath === 'string') {
      this.$instance.$pages['/' + pagePath] = page
    }
    // 不用箭头符，this为原生Page的作用域
    config.onLoad = function (...args) {
      page.$name = pageClass.name || 'unnamed'
      page.$init(this, self.$instance)
      page.onLoad && page.onLoad.apply(page, args)
      if (page.$coms['onLoad'] && page.$coms['onLoad'].length) {
        page.$coms['onLoad'].forEach((load) => {
          load(...args)
        })
      }
    }
    config = $bindEvt(page, config, page, '')

    PAGE_EVENT['pcCountUp'].forEach((v) => {
      if (v !== 'onLoad') {
        config[v] = (...args) => {
          page[v] && page[v].apply(page, args)
          page.$coms[v] && page.$coms[v].forEach((func) => {
            func(...args)
          })
        }
      }
    })
    PAGE_EVENT['pcCountDown'].forEach((v) => {
      if (page.$coms[v] && page.$coms[v].length) {
        config[v] = (...args) => {
          page[v] && page[v].apply(page, args)
          page.$coms[v] && page.$coms[v].forEach((func) => {
            func(...args)
          })
        }
      }
    })

    if (page.onShareAppMessage) {
      config.onShareAppMessage = function (...args) {
        page.onShareAppMessage.apply(page, args)
      }
    }

    return config
  }
}
