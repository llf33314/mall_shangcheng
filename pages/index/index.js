//index.js
//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');
var loading = false,         //加载数据状态
    curPage = 1,             //第几页数据
    findName = "";           //搜索商品
Page({
  data: {
    indicatorDots: true,     //是否显示面板指示点
    autoplay: true,          //是否自动轮播
    interval: 5000,          //轮播切换时间
    duration: 500,           //轮播滑动动画时长
    imageList:[],            //轮播图片数据
    classification: true,    //分类弹出层状态
    firstList:[],            //分类弹出层数据
    productPage: {},         //商品列表
    isShowActivity: 0,       //是否有活动 1有活动 0 没活动
    is_group: 0,             //是否有团购活动 1 有 0 没有
    is_seckill: 0,           //是否有秒杀活动 1 有 0 没有
    is_auction: 0,           //是否有拍卖活动  1有  0 没有
    is_presale: 0,           //是否有预售活动  1有  0 没有
    activity: true,          //活动弹出层状态
    is_lower: false,         //是否到底;
    scrollTop: 0,

    picUrl: app.globalData.picUrl
  },
  onLoad: function (e) {
    var self = this;
    var shopId = e.shopId
    if (shopId)wx.setStorageSync('shopId', shopId);
      // util.login(app,function(){
      //   self.setData({ picUrl: app.globalData.picUrl })

      //   wx.request({
      //     url: app.globalData.http + 'pageIndex.do',
      //     data: {
      //       shopId: wx.getStorageSync('shopId'),
      //       memberId: wx.getStorageSync('memberId'),

      //     },
      //     method: 'GET',
      //     header: {
      //       'content-type': 'application/json'
      //     },
      //     success: function (res) {
      //       var data = res.data;
      //       curPage++;

      //       if (data.productPage.curPage == data.productPage.pageCount) {
      //         self.setData({ is_lower: true })
      //       }
      //       self.setData({
      //         imageList: data.imageList,
      //         productPage: data.productPage,
      //         firstList: data.firstList,             //分类弹出层数据
      //         isShowActivity: data.isShowActivity,   //是否有活动 1有活动 0 没活动
      //         is_group: data.is_group,               //是否有团购活动 1 有 0 没有
      //         is_seckill: data.is_seckill,           //是否有秒杀活动 1 有 0 没有
      //         is_auction: data.is_auction,           //是否有拍卖活动  1有  0 没有
      //         is_presale: data.is_presale,           //是否有预售活动  1有  0 没有
      //       })
      //     }
      //   })
      // });
    self.setData({ picUrl: app.globalData.picUrl })
    wx.request({
      url: app.globalData.http + 'pageIndex.do',
      data: {
        shopId: wx.getStorageSync('shopId'),
        memberId: wx.getStorageSync('memberId') || '',
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data;
        curPage++;

        if (data.productPage.curPage == data.productPage.pageCount) {
          self.setData({ is_lower: true })
        }
        self.setData({
          imageList: data.imageList,
          productPage: data.productPage,
          firstList: data.firstList,             //分类弹出层数据
          isShowActivity: data.isShowActivity,   //是否有活动 1有活动 0 没活动
          is_group: data.is_group,               //是否有团购活动 1 有 0 没有
          is_seckill: data.is_seckill,           //是否有秒杀活动 1 有 0 没有
          is_auction: data.is_auction,           //是否有拍卖活动  1有  0 没有
          is_presale: data.is_presale,           //是否有预售活动  1有  0 没有
        })
      }
    })

  },
  onShareAppMessage: function (res) {
    return {
      path: '/pages/index/index?shopId=' + wx.getStorageSync('shopId'),
    }
  },
  bindtapClassification: function(){
    this.setData({ classification: !this.data.classification, scrollTop: 0})
  },
  bindtapHideClassification: function(){
    this.setData({classification:true})
  },
  bindtapActivity: function(){
    this.setData({activity:!this.data.activity})
  },
  bindtapHideActivity: function(){
    this.setData({activity:true})
  },
  bindscrolltolowerAddData: function(e){
    //下拉加载商品数据
    var self = this;
    if(loading)return;
    if(self.data.productPage.pageCount < curPage){
      self.setData({is_lower: true})
      return false;
    }
    loading = true;
    wx.request({
      url: app.globalData.http + 'productPage.do',
      data: {
        shopId: wx.getStorageSync('shopId'),
        curPage: curPage
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data;
        curPage++;
        self.data.productPage.subList.push.apply(self.data.productPage.subList,data.subList);
        self.setData({productPage: self.data.productPage})
        loading = false;
      }
    })
  },
  bindtapHrefClassification: function(e){
    //点击分类跳转页面
    if(e.currentTarget.dataset.child == 0){
      wx.navigateTo({url: '../classification/classification?group_id=' + e.currentTarget.dataset.group})
    }else{
      wx.navigateTo({url: '../twoMenu/twoMenu?group_id=' + e.currentTarget.dataset.group})
    }
  },
  bindtapHrefDetail01: function(e){
    var dataset = e.currentTarget.dataset;
    if(dataset.type == 0)return;
    wx.navigateTo({ url: '../detailedCommodity/detailedCommodity?proid=' + dataset.proid})
  },
  bindtapHrefDetail02: function(e){
    var dataset = e.currentTarget.dataset;
    if(dataset.type == 2)return;
    wx.navigateTo({url: '../detailedCommodity/detailedCommodity?proid='+ dataset.proid})
  },

  bindinputFind: function(e){
    findName = e.detail.value;
  },

  findShop: function(e){
    wx.navigateTo({ url: '../classification/classification?searchName=' + findName })
  }
})
