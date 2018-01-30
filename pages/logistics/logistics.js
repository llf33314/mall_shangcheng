// pages/refund/refund.js
var app = getApp();
var option = {};
Page({
  data:{
    data:"",
    comIndex: "", //物流方式
    wlNo: "",
    handWayIndex: "", //处理方式
    reasonIndex: "", //退款原因
    retTelephone: "", //手机号码
    retRemark: "", //备注信息
    isAdvert: wx.getStorageSync('isAdvert')
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    option = options;
    wx.request({
      url: app.globalData.http + 'toReturnOrder.do',
      data: {
        orderId: option.orderId,
        orderDetailId: option.orderDetailId,
        type: option.type,
        id: option.id || '',
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          data: res.data,
          retTelephone: res.data.wlTelephone,
          retRemark: res.data.wlRemark,
          wlNo: res.data.wlNo
        })

        if (res.data.companyId){
          var companyId = res.data.companyId;
          res.data.comList.forEach(function (e,i) {
            if (e.item_key == companyId) self.setData({ comIndex: i})
          })
        }
        
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
  bindtapChangePhone: function(e){
    this.data.retTelephone = e.detail.value
  },
  bindtapChangeRemark: function(e){
    this.data.retRemark = e.detail.value
  },
  bindchangeWlNo: function (e) {
    this.data.wlNo = e.detail.value
  },
  bindchangeCom: function(e){
    var value = e.detail.value,
      self = this;
    self.setData({ comIndex: value })
  },
  bindchangeHandWay: function(e){
    var value = e.detail.value,
        self = this;
    self.setData({handWayIndex: value})
    
  },
  bindchangeReason: function(e){
    var value = e.detail.value,
        self = this;
    self.setData({reasonIndex: value})
  },
  bindtapSubmit: function(){
    var self = this,
        data = self.data.data,
        retHandlingWay = "",
        retReasonId = "",
        retReason = "",
        phone = self.data.retTelephone,
        remark = self.data.retRemark,
        retTelephone = "",
        retRemark = "",
        wlTelephone = "",
        wlRemark = "",
        wlNo = self.data.wlNo,
        wlCompanyId = "",
        wlCompany = "";
    
    if(!phone){
      wx.showModal({title: '提示',content: '请输入手机号码',showCancel: false})
      return false;
    }

    wlTelephone = phone;
    wlRemark = remark;
    wlCompanyId = data.comList[self.data.comIndex].item_key;
    wlCompany = data.comList[self.data.comIndex].item_value;
    debugger;
    
    wx.request({
      url: app.globalData.http + 'submitReturnOrder.do',
      data: {
        id: option.id, //退款id 修改退款（填写物流信息）时必传
        orderId: option.orderId, // 订单id 必传
        orderDetailId: option.orderDetailId, // 订单详情id 必传
        userId: wx.getStorageSync('memberId'), //退款人id  必传
        retHandlingWay: retHandlingWay, //处理方式  1,我要退款，但不退货 2,我要退款退货
        retReasonId: retReasonId, //申请退款原因id,
        retReason: retReason, //申请退款原因,
        retMoney: data.return_money,//退款金额,
        retTelephone: retTelephone, //手机号码,
        retRemark: retRemark, //备注信息  长度不能大于200,

        wlCompanyId: wlCompanyId,//物流公司id
        wlCompany: wlCompany,//物流公司
        wlNo: wlNo,//物流单号
        wlTelephone: wlTelephone,//填写物流信息时用到的手机号码
        wlRemark: wlRemark,//填写物流信息的备注

      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 1){
          wx.navigateBack({
            delta: 1
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
})