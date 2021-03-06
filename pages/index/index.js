//index.js
//获取应用实例
const app = getApp()

const regeneratorRuntime = global.regeneratorRuntime = require('../../libs/runtime')
const co = require('../../libs/co')
const kkservice = require("../../libs/yc/yc-service.js")
const kkconfig = require("../../libs/yc/yc-config.js")
const kkcommon = require("../../libs/yc/yc-common.js")

Page({
  data: {
    top: 0,
    navopacity: 0,
    state: 0,

    index: 0,
    tabInfos: [{
        text: '精选',
        iconPath: '../../assets/images/tab-index.png',
        selectedIconPath: '../../assets/images/tab-index-selected.png'
      },
      {
        text: '我的',
        iconPath: '../../assets/images/tab-my.png',
        selectedIconPath: '../../assets/images/tab-my-selected.png',
      }
    ],
    isswitch: false,

    topItemInfos: [{
      animation: {},
      zindex: 2
    }, {
      animation: {},
      zindex: 1
    }, {
      animation: {},
      zindex: 0
    }],
    animationInfos: [{
        duration: 150,
        left: "0rpx",
        top: "0rpx",
        height: "120rpx",
        index: 2
      },
      {
        duration: 250,
        left: "20rpx",
        top: "10rpx",
        height: "100rpx",
        index: 1
      },
      {
        duration: 350,
        left: "35rpx",
        top: "20rpx",
        height: "80rpx",
        index: 0
      }
    ],
    zindex1: 2,
    zindex2: 1,
    zindex3: 0,

    appInfo: {},

    iscanusenavigator: false,
    you_like: [],
    floatImg: '../../assets/images/float_img.png',
    isUse: true,
    share_title: '',
    share_img: '',
    show_new_app:false
  },
  onLoad: function() {
    let thiz = this
    app.index = this
    co(function*() {
      let value = wx.getStorageSync("constellation")
      thiz.data.starInfo = value
      thiz.setData({
        iscanusenavigator: getApp().canUseNavigator(),
        isswitch: value ? true : false,
        starInfo: value
      })
      var [status, res] = yield [kkservice.authPermission("scope.userInfo"), yield kkservice.getAppInfo()]
      if (status == kkconfig.status.authStatus.authOK) {
        app.login()
      }
      if (res && res.data && res.data.code == 1) {
        let appInfo = res.data.data
        appInfo.day_commend_list.forEach((v, k) => {
          thiz.data.topItemInfos[k] = { ...thiz.data.topItemInfos[k],
            ...v
          }
        })
        let starLuckInfo = {}
        if (thiz.data.starInfo) {
          let userInfo = wx.getStorageSync("userInfo")
          res = yield kkservice.starIndex(thiz.data.starInfo.name, "today", userInfo && userInfo.gender == 1 ? "boy" : "girl").catch(()=>{
            thiz.setData({
              state: kkconfig.status.stateStatus.NORMAL,
              appInfo: appInfo,
              topItemInfos: appInfo.day_commend_list,
              you_like: appInfo.you_like,
              new_app_id: appInfo.more_app_info[0].url,
              share_img_url: '../../assets/images/share_icon.png',
              share_img: simgs && simgs.length > 1 ? simgs[index] : '',
              share_title: stitles && stitles.length > 1 ? stitles[index] : '',
              show_new_app: appInfo.more_app_info[0].status == 0 ? false : true
            })
          });
          if(res){
            starLuckInfo = res.data.data
            if (starLuckInfo && starLuckInfo.intro) {
              starLuckInfo.intro.forEach((v, k) => {
                starLuckInfo.intro[k] = v.split("：")[1]
              })
            }
          }
        }

        var index = Math.floor(Math.random() * 2);
        var simgs = appInfo.share_ico;
        var stitles = appInfo.share_title;
        thiz.setData({
          state: kkconfig.status.stateStatus.NORMAL,
          appInfo: appInfo,
          topItemInfos: appInfo.day_commend_list,
          starLuckInfo: starLuckInfo,
          you_like: appInfo.you_like,
          new_app_id: appInfo.more_app_info[0].url,
          share_img_url: '../../assets/images/share_icon.png',
          share_img: simgs && simgs.length > 1 ? simgs[index] : '',
          share_title: stitles && stitles.length > 1 ? stitles[index]:'',
          show_new_app: appInfo.more_app_info[0].status==0?false:true
        })

      } else {
        thiz.setData({
          state: kkconfig.status.stateStatus.NODATA
        })
      }
    })

    wx.getSystemInfo({
      success: function(res) {
        var result = app.compareVersion(res.SDKVersion, '2.0.7')
        thiz.setData({
          isUse: result >= 0 ? true : false
        })
      },
    })
  },
  switchConstellation(obj) {
    let thiz = this
    let starLuckInfo = {}
    thiz.data.starInfo = obj
    co(function*() {
      if (thiz.data.starInfo) {
        let userInfo = wx.getStorageSync("userInfo")
        let res = yield kkservice.starIndex(thiz.data.starInfo.name, "today", userInfo && userInfo.gender == 1 ? "boy" : "girl").catch(()=>{
              
        });
        if(res){
            starLuckInfo = res.data.data
            if (starLuckInfo && starLuckInfo.intro) {
              starLuckInfo.intro.forEach((v, k) => {
                starLuckInfo.intro[k] = v.split("：")[1]
              })
            }
        }
      }
      console.log(obj)
      thiz.setData({
        isswitch: true,
        starInfo: obj,
        starLuckInfo: starLuckInfo
      })
    })
  },
  onShow(e) {
    this.startAnimation()
  },
  nav2category(e) {
    let id = e.currentTarget.dataset.index
    let title = e.currentTarget.dataset.title
    wx.navigateTo({
      url: '/pages/category/category?id=' + id + "&title=" + title,
    })
  },
  tab(e) {
    let index = e.currentTarget.dataset.index
    if (index == app.tabIndex) return
    app.tabIndex = index
    this.setData({
      index: index,
      tabInfos: this.data.tabInfos
    })
  },
  scroll(e) {
    let top = (e.detail.scrollTop)
    console.log(top)
    this.setData({
      navopacity: top / app.titleBarHeight,
      top: top
    })
  },
  touchmove(e) {
    if (!this.moving) {
      this.moving = true
    }
    this.epageX = e.touches[0].pageX
  },
  touchstart(e) {
    this.spageX = e.touches[0].pageX
  },
  touchend(e) {
    if (this.moving && Math.abs(this.spageX - this.epageX) > 20) {
      if (this.clear) {
        clearTimeout(this.clear)
      }
      this.clearAnimation()
      this.topAnimate()
      this.moving = false
      this.clear = setTimeout(() => {
        this.startAnimation()
      }, 500)
    }
  },
  startAnimation() {
    if (!this.animationTimer) {
      this.animationTimer = setInterval(() => {
        this.topAnimate()
      }, 3000)
    }
  },
  clearAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer)
      this.animationTimer = undefined
    }
  },
  onHide() {
    this.clearAnimation()
  },
  topAnimate() {
    this.animations = []
    let animationInfos = this.data.animationInfos
    animationInfos.forEach(v => {
      var animation = wx.createAnimation({
        duration: v.duration,
        timingFunction: 'ease',
      })
      animation.height(v.height).top(v.top).left(v.left).step()
      this.animations.push(animation.export())
    })
    let topItemInfos = this.data.topItemInfos
    topItemInfos.forEach((v, k) => {
      if (k == 0) {
        if (this.data.zindex1 == 2) {
          this.data.zindex1 = 0
          v.animation = this.animations[2]
        } else if (this.data.zindex1 == 1) {
          this.data.zindex1 = 2
          v.animation = this.animations[0]
        } else if (this.data.zindex1 == 0) {
          this.data.zindex1 = 1
          v.animation = this.animations[1]
        }
      } else if (k == 1) {
        if (this.data.zindex2 == 2) {
          this.data.zindex2 = 0
          v.animation = this.animations[2]
        } else if (this.data.zindex2 == 1) {
          this.data.zindex2 = 2
          v.animation = this.animations[0]
        } else if (this.data.zindex2 == 0) {
          this.data.zindex2 = 1
          v.animation = this.animations[1]
        }
      } else if (k == 2) {
        if (this.data.zindex3 == 2) {
          this.data.zindex3 = 0
          v.animation = this.animations[2]
        } else if (this.data.zindex3 == 1) {
          this.data.zindex3 = 2
          v.animation = this.animations[0]
        } else if (this.data.zindex3 == 0) {
          this.data.zindex3 = 1
          v.animation = this.animations[1]
        }
      }
    })
    this.setData({
      zindex1: this.data.zindex1,
      zindex2: this.data.zindex2,
      zindex3: this.data.zindex3
    })
    setTimeout(() => {
      this.setData({
        topItemInfos: topItemInfos
      })
    }, 20)
  },
  previewImg(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.img],
    })
  },
  natiageToMiniProgram(e) {
    console.log(e.currentTarget.dataset.appid)
    wx.navigateToMiniProgram({
      appId: e.currentTarget.dataset.appid,
    })
  },
  nav2like(e) {
    let thiz = this
    console.log(thiz.top)
    co(function*() {
      let res = yield kkservice.testClassInfoList(-1)
      if (res && res.data && res.data.code == 1) {
        thiz.setData({
          you_like: res.data.data,
        })
      }
    })
  },
  nav2top(e) {
    wx.navigateTo({
      url: "/pages/category/category?status=2&title=每日推荐"
    })
  },
  nav2more(e) {
    wx.navigateTo({
      url: "/pages/category/category?status=1&title=精选热门"
    })
  },
  nav2test(e) {
    let item = e.currentTarget.dataset.obj
    app.nav2test(item)
  },
  nav2constellation(res) {
    if (res.detail && res.detail.userInfo) {
      app.userInfo = res.detail.userInfo
      wx.setStorageSync("userInfo", res.detail.userInfo)
    }
    wx.navigateTo({
      url: "/pages/constellation/constellation"
    })
  },
  nav2constellationdetail(e) {
    wx.navigateTo({
      url: '/pages/constellationdetail/constellationdetail',
    })
  },
  newApp: function(e) {
    var that = this
    wx.navigateToMiniProgram({
      appId: that.data.new_app_id
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this
    console.log(that.data.share_img)
    return {
      title: that.data.share_title,
      path: '/pages/index/index',
      imageUrl: that.data.share_img
    }
  },
})