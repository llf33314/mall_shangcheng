// pages/user/user.js
var app = getApp();
var util = require('../../utils/util.js');
Page({
  data:{
    data: null,
    isAdvert: wx.getStorageSync('isAdvert'),
    memberId: wx.getStorageSync('memberId')
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
    var self = this;
    self.setData({ memberId: wx.getStorageSync('memberId') })
    if (!self.data.memberId)return false;
    wx.request({
      url: app.globalData.http + 'memberIndex.do',
      data: {
        memberId: wx.getStorageSync('memberId')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({data: res.data})
      }
    })
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
  userInfoHandler: function(){
    var self = this;
    util.login(app,function(){
      self.setData({ memberId: wx.getStorageSync('memberId') })
      wx.request({
        url: app.globalData.http + 'memberIndex.do',
        data: {
          memberId: wx.getStorageSync('memberId')
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          self.setData({ data: res.data })
        }
      })
    })
  }
})