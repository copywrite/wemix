```
   __    ____  __  __  _  _   _ 
( \/\/ )(____)(  \/  )( )( \_/ )
 )    (  )__)  )    ( ( ) ) _ ( 
(__/\__)(____)( /\/\ )(_)(_/ \_)
                                
```
#<font color=#34495e>小程序wemix框架使用指南</font>
##<font color=#34495e>项目创建</font>

###<font color=#34495e>安装**wemix**工具</font>
```
npm install wemix-cli -g
```
###<font color=#34495e>进入开发目录生成空项目并开启实时编译</font>
```
cd xxx
wemix new projectName
cd projectName
wemix build --watch //开发
wemix build -p --no-cache //线上
```
####<font color=#34495e>目录结构</font>
```
|-- dist                     微信开发者工具指定的目录
|-- node_modules
|-- src                      开发目录
|   |-- pages                页面文件夹(文件夹名不允许改动)
|   |   |-- index.js
|   |   |-- index.html
|   |   |-- index.less 
|   |-- components           页面依赖的组件文件夹(文件夹名不允许改动)
|   |   |-- com.js
|   |   |-- com.html
|   |   |-- com.less
|   |-- app.js
|   |-- app.less
|-- package-lock.json
|-- package.json
```
⚠️<font color=#FF5E45>注：命名为pages和components的文件夹请勿更改</font>
###<font color=#FF5E45>`重要`</font><font color=#34495e>微信开发者工具设置</font>
1. 本地开发选择`dist`目录
2. 详情-->项目设置-->取消勾选ES6转ES5
3. 详情-->项目设置-->取消勾选上传代码时样式自动补全
4. 详情-->项目设置-->取消勾选代码上传时自动压缩

##<font color=#34495e>开发前阅读</font>
1. 变量与方法使用尽量使用驼峰式命名，避免使用$开头。
2. 小程序repeat组件内部<font color=#FF5E45>禁止使用自定义组件(暂时)</font>。

##<font color=#34495e>使用**wemix**的优点</font>
在原有的小程序的开发模式下进行再次封装：

1. Page实例增加onRoute生命周期避免onShow方法多次执行。
2. 增加组件化开发，使组件间交互更加贴近于react的实现。
3. 支持加载外部NPM包。
4. 默认使用babel编译，具体默认配置参见wemix.config.js。
5. 针对wx.request并发问题进行优化。

##<font color=#34495e>实战说明</font>
###<font color=#34495e>关于编译及插件</font>
* 当前仅支持less编译
* babel使用的preset为babel-preset-env，默认配置为(自定义配置需更改wemix.config.js)：

  ```
  {
      sourceMap: !production,
      'presets': [
        [
          'env', config.env || {}
        ]
      ],
      'plugins': [
        [
          'transform-runtime', config.transformRuntime || {
            'helpers': false,
            'polyfill': true,
            'regenerator': false,
            'moduleName': 'babel-runtime'
          }
        ],
        ['transform-class-properties']
      ]
    } 
  ```
* 线上构建的时候指定以下插件进行压缩，暂时不可配置：

  ```
  {
      filemin: {
        filter: /\.(wxml|xml|json)$/,
        config: {}
      },
      uglifyjs: {
        filter: /\.js$/,
        config: {
          toplevel: true
        }
      },
      imagemin: {
        filter: /\.(jpg|png|jpeg)$/,
        config: {
          jpg: {
            quality: 80
          },
          png: {
            quality: 80
          }
        }
      }
    }
  ```
  
###<font color=#34495e>HTML说明</font>
#####<font color=#34495e>基于编译效率优先原则，所有变量的引用均需要加入<font color=#FF5E45>`#{}`</font>包围</font>

```
<view class='container'>
  <view class='title'>Hello Wemix</view>
  <view class='sub-title'>{{#{text}}}</view>
  <button bindtap='#{viewTap}' data-from='page'>set page</button>
</view>
<view>This is component:</view>
<view class='component'>
  <com v-on:viewTap='#{viewTap}' text='{{#{text}}}'></com>
</view>
```

###<font color=#34495e>实例</font>
#####<font color=#34495e>App实例</font>
```
import wemix from 'wemix'

export default class extends wemix.app {
  config = {
    pages: [
      'pages/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#FFFFFF',
      navigationBarTitleText: 'WEMIX',
      navigationBarTextStyle: 'black'
    }
  }
  // only define in app
  globalData = {
    data: 'I am global data'
  }
  onLaunch (options) {
    // Do something initial when launch.
  }
  onShow (options) {
    // Do something when show.
  }
  onHide () {
    // Do something when hide.
  }
  onError (msg) {
    console.log(msg)
  }
}

```
#####<font color=#34495e>Page和Component实例</font>


```
// 可在page和component组件内通过以下设置改变globalData
this.setGlobalData({})
this.getGlobalData()
```

```
import wemix from 'wemix'

export default class Com extends wemix.component {
  defaultProps = {
    text: 'page text'
  }
  data = {
    text: 'This is component data.'
  }
  customerData = {

  }
  methods = {
    viewTapPage (e) {
      this.props.viewTap(e)
    },
    viewTapComponent (e) {
      this.setData({
        text: 'This is component data. from current'
      })
    }
  }
  onLoad (options) {
    // Do some initialize when page load.
  }
  onReady () {
    // Do something when page ready.
  }
  onShow () {
    // Do something when page show.
  }
  onRoute () {
    // Do something when route change.
  }
  onHide () {
    // Do something when page hide.
  }
  onUnload () {
    // Do something when page close.
  }
  onPullDownRefresh () {
    // Do something when pull down.
  }
  onReachBottom () {
    // Do something when page reach bottom.
  }
}
```
```
import wemix from 'wemix'
import Com from '../components/com'

export default class Index extends wemix.page {
  config = {
    navigationBarTitleText: '首页'
  }
  components = {
    com: Com
  }
  data = {
    text: 'This is page data.'
  }
  // methods包括小程序的bindtap,catchtap等事件，及props对应的事件
  methods = {
    viewTap (e) {
      this.setData({
        text: 'This is page data. from ' + e.currentTarget.dataset.from
      }, () => {
        // this is setData callback
      })
    }
  }
  customerData = {
    hi: 'MINA'
  }
  onLoad (options) {
    // Do some initialize when page load.
  }
  onReady () {
    // Do something when page ready.
  }
  onShow () {
    // Do something when page show.
  }
  onRoute () {
    // Do something when route change.
  }
  onHide () {
    // Do something when page hide.
  }
  onUnload () {
    // Do something when page close.
  }
  onPullDownRefresh () {
    // Do something when pull down.
  }
  onReachBottom () {
    // Do something when page reach bottom.
  }
  onShareAppMessage  () {
    // return custom share data when user share.
  }
  onPageScroll () {
    // Do something when page scroll
  }
}

```
###<font color=#34495e>组件</font>
小程序支持js模块化，但彼此独立，业务代码与交互事件仍需在页面处理。无法实现组件化的松耦合与复用的效果。 例如模板A中绑定一个bindtap='#{myclick}'，模板B中同样绑定一样bindtap='#{myclick}'，那么就会影响同一个页面事件。对于数据同样如此。因此只有通过改变变量或者事件方法，或者给其加不同前缀才能实现绑定不同事件或者不同数据。当页面复杂之后就十分不利于开发维护。 因此wepy让小程序支持组件化开发，组件的所有业务与功能在组件本身实现，组件与组件之间彼此隔离，上述例子在wepy的组件化开发过程中，A组件只会影响到A绑定的myclick，B也如此。

####<font color=#34495e>组件间通讯</font>
* 传递事件需要在变量名前添加<font color=#FF5E45>`v-on:`</font>来标记事件
* 传递静态值需要在变量名前添加<font color=#FF5E45>`static:`</font>来标记静态参数

⚠️<font color=#FF5E45>注：组件属性请勿添加 || && 等操作，只传递单一静态或动态值进去</font>


```
<com v-on:viewTap='#{viewTap}' text='{{#{text}}}' static:show='{{true}}'></com>
```

可在js中通过this.props.xxx获取事件或变量值

```
export default class Com extends wemix.component {
  defaultProps = {
    text: 'page text'
  }
}
```

```
<view>
  <view wx:if='{{#{props.show}}}' class='title'>{{#{props.text}}}</view>
  <button bindtap='#{props.viewTap}' data-from='page(1)'>set page(1)</button>
</view>
```

⚠️<font color=#FF5E45>注：wemix中的组件都是静态组件，是以组件ID作为唯一标识的，每一个ID都对应一个组件实例，当页面引入两个相同ID组件时，这两个组件共用同一个实例与数据，当其中一个组件数据变化时，另外一个也会一起变化。 如果需要避免这个问题，则需要分配多个组件ID和实例</font>

```
import wemix from 'wemix'
import Com from '../components/com'

export default class Index extends wemix.page {
  components = {
    com: Com
    com1: Com
  }
}
```
