import app from './app'
import page from './page'
import component from './component'
import base from './base'
import util from './util'


export default {
    app: app,
    component: component,
    page: page,

    $createApp: base.$createApp,
    $createPage: base.$createPage
}