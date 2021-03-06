// components/content.js
const app = getApp()

let offset = 1000

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isshowtop: {
        type: Boolean,
        value: false
    },
    background: {
        type: String,
        value: "#f5f5f5",
    },
    scrollTop: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal, changedPath) {
          this.setData({
            scrollTop: newVal
          })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: { 
    scrollTop: 0
  },
  ready(){
     this.setData({
       ...this.properties
     })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    scroll2top(e){
       this.setData({
          scrollTop: 0
       })
    },
    scroll(e){
      if (this.properties.isshowtop){
        var rpx = e.detail.scrollTop * 750 / app.systemInfo.windowWidth
        this.setData({
            isShowTop: rpx >= offset
        })
      }
      this.triggerEvent('scroll', e.detail) 
    },
    scrolltolower(e){
      this.triggerEvent('scrolltolower', e)
    },
    scrolltoupper(e){
      this.triggerEvent('scrolltoupper', e)
    }
  }
})
