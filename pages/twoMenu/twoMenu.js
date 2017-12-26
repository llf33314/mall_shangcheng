// pages/twoMenu/twoMenu.js
var app = getApp();
var findName = "";
Page({
  data:{
    firstList:[],
    classList:[],
    classification: true,

    picUrl: app.globalData.picUrl
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    self.setData({ picUrl: app.globalData.picUrl })
    wx.request({
      url: app.globalData.http + 'classAll.do',
      data: {
        shopId: wx.getStorageSync('shopId'),
        memberId: wx.getStorageSync('memberId'),
        classId: options.group_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data;
        self.setData({
          classList: data.classList,
          firstList: data.firstList
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
  bindtapClassification: function(){
    this.setData({classification:!this.data.classification})
  },
  bindtapHideClassification: function(){
    this.setData({classification:true})
  },
  bindtapHrefClassification: function(e){
    //点击分类跳转页面
    if(e.currentTarget.dataset.child == 0){
      wx.redirectTo({url: '../classification/classification?group_id=' + e.currentTarget.dataset.group})
    }else{
      wx.redirectTo({url: '../twoMenu/twoMenu?group_id=' + e.currentTarget.dataset.group})
    }
  },
  bindtapList: function(e){
    wx.navigateTo({url: '../classification/classification?group_id=' + e.currentTarget.dataset.group})
  },

  bindinputFind: function (e) {
    findName = e.detail.value;
  },

  findShop: function (e) {
    wx.redirectTo({ url: '../classification/classification?searchName=' + findName })
  }
})