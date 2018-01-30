//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var self =  this;
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    if (wx.getExtConfig) {
      wx.getExtConfig({
        success: function (res) {
          self.globalData.http = res.extConfig.subDomain + '/mallApplet/79B4DE7C/'
          self.globalData.busId = res.extConfig.busId
          self.globalData.picUrl = res.extConfig.upload
          self.globalData.appid = res.extConfig.appid
          self.globalData.style = res.extConfig.style
          self.globalData.socketdomain = res.extConfig.socketdomain
          self.globalData.domain = res.extConfig.domain
        }
      })
    }

    // self.globalData.http = 'http://192.168.2.100:8081/mallApplet/79B4DE7C/'
    // // self.globalData.http = 'https://mall.deeptel.com.cn/mallApplet/79B4DE7C/'
    // // self.globalData.busId = 42
    // self.globalData.busId = 36
    // // self.globalData.picUrl = 'http://maint.yifriend.net/upload/'
    // self.globalData.picUrl = 'http://maint.deeptel.com.cn/upload/'
    // self.globalData.appid = "wx8b43ff3bf42b4988"
    // self.globalData.style = "3"
    // self.globalData.socketdomain = "wss:socket.duofriend.com",
    // self.globalData.domain = 'http://yifriend.net'
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    //userInfo:null,
    //  http: "http://192.168.2.100:8081/mallApplet/79B4DE7C/",
      // http: "https://deeptel.com.cn/mallApplet/79B4DE7C/",
      // picUrl: "http://maint.yifriend.net/upload/",
      // busId: 42,
      // appid:123456,

    userInfo: null,
    http: "",
    picUrl: "",
    busId: "",
    appid: "",
    style: "",
    domain: "",
    socketdomain: "" 
  }
})