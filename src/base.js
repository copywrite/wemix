import util from './util'
const PAGE_EVENT = {
  pcCountUp: ['onLoad', 'onReady', 'onShow', 'onPullDownRefresh', 'onReachBottom', 'onPageScroll'],
  pcCountDown: ['onHide', 'onUnload'],
  page: ['onShareAppMessage']
}
const APP_EVENT = ['onLaunch', 'onShow', 'onHide', 'onError']


let $bindEvt = (app, page, config, com, prefix) => {
  com.$prefix = util.camelize(prefix || '')
  Object.getOwnPropertyNames(com.components || {}).forEach((name) => {
    let cClass = com.components[name]
    let child = new cClass(app, page)
    PAGE_EVENT['pcCountUp'].concat(['onRoute']).forEach((v) => {
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

    $bindEvt(app, page, config, child, comPrefix)
  })

  Object.getOwnPropertyNames(com.methods || []).forEach((method, i) => {
    if (method !== 'length') {
      com.methods[method] = com.methods[method].bind(com)
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

    config.onLaunch = function (...args) {
      app.$init(this)
      return app['onLaunch'] && app['onLaunch'].apply(app, args)
    }

    Object.getOwnPropertyNames(app.constructor.prototype || []).forEach((v) => {
      if (v !== 'constructor' && v !== 'onLaunch') {
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
    let page = new pageClass(self.$instance)
    if (typeof pagePath === 'string') {
      this.$instance.$pages['/' + pagePath] = page
    }
    // 不用箭头符，this为原生Page的作用域
    config.onLoad = function (...args) {
      page.$preLocation = self.$instance.__location__

      page.$name = pageClass.name || 'unnamed'
      page.$init(this, self.$instance)
      page.onLoad && page.onLoad.apply(page, args)
      if (page.$coms['onLoad'] && page.$coms['onLoad'].length) {
        page.$coms['onLoad'].forEach((load) => {
          load(...args)
        })
      }
    }

    config.onShow = function (...args) {
      let pages = getCurrentPages()
      let pageId = pages[pages.length - 1].route || pages[pages.length - 1].__route__

      if (self.$instance.__route__ !== pageId) {
        self.$instance.__route__ = pageId

        self.$instance.__location__ = {
          route: '/' + pageId,
          search: util.parseSearch(pages[pages.length - 1].options)
        }
        self.$instance.$wxapp.onRoute && self.$instance.$wxapp.onRoute.apply(self.$instance.$wxapp, args)
        page.onRoute && page.onRoute.apply(page, args)
        if (page.$coms['onRoute'] && page.$coms['onRoute'].length) {
          page.$coms['onRoute'].forEach((load) => {
            load(...args)
          })
        }
      }

      page.onShow && page.onShow.apply(page, args)
      if (page.$coms['onShow'] && page.$coms['onShow'].length) {
        page.$coms['onShow'].forEach((load) => {
          load(...args)
        })
      }
    }

    config = $bindEvt(self.$instance, page, config, page, '')

    PAGE_EVENT['pcCountUp'].forEach((v) => {
      if (v !== 'onLoad' && v !== 'onShow') {
        config[v] = (...args) => {
          page[v] && page[v].apply(page, args)
          page.$coms[v] && page.$coms[v].forEach((func) => {
            func(...args)
          })
        }
      }
    })

    PAGE_EVENT['pcCountDown'].forEach((v) => {
      config[v] = (...args) => {
        page[v] && page[v].apply(page, args)
        page.$coms[v] && page.$coms[v].forEach((func) => {
          func(...args)
        })
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
