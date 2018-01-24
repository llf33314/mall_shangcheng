// pages/listShop/listShop.js
var app = getApp();
var utils = require("../../utils/util.js")
Page({
  data:{
    shopList: [],
    isAdvert: wx.getStorageSync('isAdvert')
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
    var latitude, longitude, self = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        latitude = res.latitude
        longitude = res.longitude
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('longitude', longitude);
        wx.request({
          url: app.globalData.http + 'shopList.do',
          data: {
            userId: app.globalData.busId,
            longitude: longitude,
            latitude: latitude
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            self.setData({ shopList: res.data.shopList })
            if (res.data.shopList.length <= 1) {
              wx.setStorageSync('shopId', res.data.shopList[0].id);
              wx.switchTab({ url: '../index/index?id=1' })
            }
          }
        })
      }, fail: function () {
        latitude = -1;
        longitude = -1;
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('longitude', longitude);
        wx.request({
          url: app.globalData.http + 'shopList.do',
          data: {
            userId: app.globalData.busId,
            longitude: longitude,
            latitude: latitude
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            self.setData({ shopList: res.data.shopList })
            if (res.data.shopList.length <= 1) {
              wx.setStorageSync('shopId', res.data.shopList[0].id);
              wx.switchTab({ url: '../index/index?id=1' })
            }
          }
        })
      }
    })

  },
  onShareAppMessage: function (res) {

  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  bindtapHrefHome: function(e){
    wx.setStorageSync('shopId', e.currentTarget.dataset.id);
    wx.switchTab({url: '../index/index'})
  }
})