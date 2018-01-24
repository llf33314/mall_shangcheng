// pages/navAddress/navAddress.js
var app = getApp();
Page({
  data:{
    addressList:[],
    isAdvert: wx.getStorageSync('isAdvert')
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var self = this;
    wx.request({
      url: app.globalData.http + 'addressList.do',
      data: {
        busUserId: app.globalData.busId,
        memberId: wx.getStorageSync('memberId')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({addressList: res.data.addressList})
      }
    })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  bindtapDefault: function(e){
    var defaule = e.currentTarget.dataset.defaule,
        id = e.currentTarget.dataset.id,
        index = e.currentTarget.dataset.index;

    var self = this;
    wx.request({
      url: app.globalData.http + 'addressDefault.do',
      data: {
        id: id,
        memberId: wx.getStorageSync('memberId')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 1){
          wx.request({
            url: app.globalData.http + 'addressList.do',
            data: {
              busUserId: app.globalData.busId,
              memberId: wx.getStorageSync('memberId')
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              self.setData({addressList: res.data.addressList})
              wx.navigateBack({delta: 1})
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.errorMsg,
            showCancel: false,
          })
        }
      }
    })
  },
  bindtapGoAdd: function(e){
    var self = this,
        id = e.currentTarget.dataset.id;
    wx.navigateTo({ url:'../addAddress/addAddress?id='+id})
  }
})