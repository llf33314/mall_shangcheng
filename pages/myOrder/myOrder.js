// pages/myOrder/myOrder.js
var app = getApp();
var option = {};
var scrollBool = false;
Page({
  data:{
    subList: [],
    curPage: 1,
    pageCount: 1,
    navIndex: 0,
    is_lower: false,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    option = options;
    self.setData({ navIndex: options.page || 0 })
    wx.request({
      url: app.globalData.http + 'orderList.do',
      data: {
        memberId: wx.getStorageSync('memberId'), 
        busUserId: app.globalData.busId,
        curPage: self.data.curPage,
        type: options.page || 0
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          subList: res.data.page.subList,
          curPage: res.data.page.curPage,
          pageCount: res.data.page.pageCount
        })
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
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
  bindscrolltolowerAddData: function(){
    var self = this;
    
    if (scrollBool) return;
    scrollBool = true;
    self.setData({ is_lower: false })
    self.data.curPage += 1;
    if (self.data.curPage > self.data.pageCount) {
      self.setData({ is_lower: true })
      scrollBool = false;
      return false
    }
    wx.request({
      url: app.globalData.http + 'orderList.do',
      data: {
        memberId: wx.getStorageSync('memberId'),
        busUserId: app.globalData.busId,
        curPage: self.data.curPage,
        type: option.page || 0
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var subList = res.data.page.subList || [];
        self.setData({
          subList: self.data.subList.concat(subList),
          curPage: self.data.curPage,
          pageCount: res.data.page.pageCount
        })
        scrollBool = false;
      }
    })
  },
  bindtapChangeNav: function(e){
    var self = this,
        page = e.currentTarget.dataset.page;
    scrollBool = false;
    if(page == self.data.navIndex)return;
    if(page)
    self.setData({navIndex: page});
    wx.request({
      url: app.globalData.http + 'orderList.do',
      data: {
        memberId: wx.getStorageSync('memberId'), 
        busUserId: app.globalData.busId,
        type: page
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          subList: res.data.page.subList,
          curPage: res.data.page.curPage,
          pageCount: res.data.page.pageCount
        })
      }
    })
  },
  bindtapPay: function(e){
    //去支付
    var self = this;
    wx.request({
      url: app.globalData.http + 'orderGoPay.do',
      data: {
        order_id: e.currentTarget.dataset.id, 
        memberId: wx.getStorageSync('memberId'), 
        appid: wx.getStorageSync('appid'), 
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 1){
          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.prepay_id,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function (res) {
              wx.showModal({
                title: '提示',
                content: '支付成功！',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 3
                    })
                  }
                }
              })
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
  bindtapConfirm: function(e){
    //确认收货
    var self = this;
    wx.showModal({
      title: '提示',
      content: '确定已收到货？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + 'confirmReceipt.do',
            data: {
              order_id: e.currentTarget.dataset.id,
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if(res.data.code == 1){
                wx.request({
                  url: app.globalData.http + 'orderList.do',
                  data: {
                    memberId: wx.getStorageSync('memberId'),
                    busUserId: app.globalData.busId,
                  },
                  method: 'GET',
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    self.setData({
                      subList: res.data.page.subList,
                      curPage: res.data.page.curPage,
                      pageCount: res.data.page.pageCount
                    })
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
        }
      }
    })
  }
})