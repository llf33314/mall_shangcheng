// pages/areaCode/areaCode.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reqData:[],
    findData: [],
    searchinput: '',
    countDown: -1,
  },
  onLoad: function (options) {
    var self = this;
    wx.request({
      url: app.globalData.http + 'areaPhoneList',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          reqData: res.data.data,
          findData: res.data.data
        })
      }
    })
  },
  tapClear: function(){
    var self = this;
    self.setData({
      searchinput: '',
      findData: self.data.reqData
    })
  },
  tapArea: function (e){
    wx.navigateTo({
      url: '../listShop/listShop?code=' + e.currentTarget.dataset.area.areacode
    })
  },
  bindKeyBlur: function(e){
    var self = this,
        filter = [],
        value = e.detail.value;

    self.data.reqData.forEach(function(e){
      if (e.country.indexOf(value) > -1 || e.englishname.indexOf(value) > -1){
        filter.push(e);
      }
    })

    self.setData({
      findData: filter
    })
  }
})