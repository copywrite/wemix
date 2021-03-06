import app from './app'
import page from './page'
import component from './component'
import base from './base'
import util from './util'
import native from './native'

let RequestMQ = {
  map: {},
  mq: [],
  running: [],
  MAX_REQUEST: 5,
  push (param) {
    param.t = +new Date()
    while ((this.mq.indexOf(param.t) > -1 || this.running.indexOf(param.t) > -1)) {
      param.t += Math.random() * 10 >> 0
    }
    this.mq.push(param.t)
    this.map[param.t] = param
  },
  next () {
    let me = this

    if (this.mq.length === 0)
      return

    if (this.running.length < this.MAX_REQUEST - 1) {
      let newone = this.mq.shift()
      let obj = this.map[newone]
      let oldComplete = obj.complete
      obj.complete = (...args) => {
        me.running.splice(me.running.indexOf(obj.t), 1)
        delete me.map[obj.t]
        oldComplete && oldComplete.apply(obj, args)
        me.next()
      }
      this.running.push(obj.t)
      return wx.request(obj)
    }
  },
  request (obj) {
    let me = this

    obj = obj || {}
    obj = (typeof(obj) === 'string') ? {url: obj} : obj

    this.push(obj)

    return this.next()
  }
}
let wemix = {
  app: app,
  component: component,
  page: page,

  $createApp: base.$createApp,
  $createPage: base.$createPage,

  $isEmpty: util.$isEmpty,
  $isEqual: util.$isEqual,
  $isDeepEqual: util.$isDeepEqual,
  $has: util.$has,
  $extend: util.$extend,
  $isPlainObject: util.$isPlainObject,
  $copy: util.$copy
}
Object.keys(wx).forEach((key) => {
  if (key === 'request') {
    Object.defineProperty(native, key, {
      get () { return (obj) => RequestMQ.request(obj) }
    })
    wemix[key] = native[key]
  } else {
    Object.defineProperty(native, key, {
      get () { return (...args) => wx[key].apply(wx, args) }
    })
    wemix[key] = native[key]
  }
})

export default wemix
