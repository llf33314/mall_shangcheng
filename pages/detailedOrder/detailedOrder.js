// pages/detailedOrder/detailedOrder.js
var app = getApp();
var option = {};
Page({
  data:{
    data: {},

    isAdvert: wx.getStorageSync('isAdvert')
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    option = options;
    wx.request({
      url: app.globalData.http + 'orderDetail.do',
      data: {
        orderId: option.orderId, 
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data;
        self.setData({
          data: data,
          
        })
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var self = this;
    wx.request({
      url: app.globalData.http + 'orderDetail.do',
      data: {
        orderId: option.orderId,
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data;
        self.setData({
          data: data,

        })
      }
    })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  bindtapRevoke: function(e){
    var self = this;
    wx.showModal({
      title: '提示',
      content: '如您主动关闭正在处理的退款后，您将无法再次发起退款申请，请务必谨慎操作。',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + 'closeReturnOrder.do',
            data: {
              order_id: option.orderId,
              order_detail_id: e.currentTarget.dataset.id
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if (res.data.code == 1){
                wx.showToast({ title: '撤销成功!', icon: 'success', duration: 800 })
                wx.request({
                  url: app.globalData.http + 'orderDetail.do',
                  data: {
                    orderId: option.orderId,
                  },
                  method: 'GET',
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    var data = res.data;
                    self.setData({
                      data: data,
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
  },
  bindtapPay: function (e) {
    let payWay = e.currentTarget.dataset.payway;//支付方式
    if (payWay != 5) {//非扫码支付跳到提交订单页面
      //去支付
      wx.navigateTo({
        url: '../order/order?from=3&orderId=' + e.currentTarget.dataset.id
      });
    } else {//扫码支付   直接立即支付 
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
          if (res.data.code == 1) {
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
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.errorMsg,
              showCancel: false,
            })
          }
        }
      });
    }
  },
  bindtapConfirm: function (e) {
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
              if (res.data.code == 1) {
                wx.request({
                  url: app.globalData.http + 'orderDetail.do',
                  data: {
                    orderId: option.orderId,
                  },
                  method: 'GET',
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    var data = res.data;
                    self.setData({
                      data: data,

                    })
                  }
                })
              } else {
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