// pages/classification/classification.js
var app = getApp();
var util = require('../../utils/util.js')
var group_id = 0;
var loading = false,         //加载数据状态
    option = {},
    findName = "",
    curPage = 1;             //第几页数据
Page({
  data: {
    firstList: [],
    productPage: {},
    arrayNew: true,
    arraySales: true,
    arrayMoney: 0,
    arrayModel: 1,
    arrayIndex: 0,
    classification: true,
    is_lower: false,         //是否到底;
    is_page: true,           //是否会有多页
    searchName: '',
    picUrl: app.globalData.picUrl
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var self = this,
      shopId = options.shopId;
    group_id = options.group_id;
    option = options;
    option.searchName = option.searchName ? option.searchName :"";
    option.group_id = option.group_id ? option.group_id : "";
    curPage = 1;
    loading = false;
    self.setData({ is_lower: false, searchName: option.searchName || '', picUrl: app.globalData.picUrl})
    // if (shopId) {
    //   util.login(app, function () {
    //     wx.setStorageSync('shopId', shopId);

    //     wx.request({
    //       url: app.globalData.http + 'productAll.do',
    //       data: {
    //         shopId: wx.getStorageSync('shopId'),
    //         memberId: wx.getStorageSync('memberId'),
    //         searchName: option.searchName || "",
    //         groupId: option.group_id || "",
    //         "type": 1
    //       },
    //       method: 'GET',
    //       header: {
    //         'content-type': 'application/json'
    //       },
    //       success: function (res) {
    //         var data = res.data;
    //         if (data.productPage.pageCount <= 1) self.setData({ is_page: false })
    //         self.setData({
    //           productPage: data.productPage,
    //           firstList: data.firstList
    //         })
    //       }
    //     })
    //   });
    // } else {

      wx.request({
        url: app.globalData.http + 'productAll.do',
        data: {
          shopId: wx.getStorageSync('shopId'),
          memberId: wx.getStorageSync('memberId') || '',
          searchName: option.searchName || "",
          groupId: option.group_id || "",
          "type": 1
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data;
          if (data.productPage.pageCount <= 1) self.setData({ is_page: false })
          self.setData({
            productPage: data.productPage,
            firstList: data.firstList
          })
        }
      })
    // }
  },
  onShareAppMessage: function (res) {
    return {
      path: '/pages/classification/classification?shopId=' + wx.getStorageSync('shopId') + 
            "&searchName=" + option.searchName + 
            "&group_id=" + option.group_id,
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  bindtapClassification: function () {
    this.setData({ classification: !this.data.classification })
  },
  bindtapHideClassification: function () {
    this.setData({ classification: true })
  },
  bindtapHrefClassification: function (e) {
    //点击分类跳转页面
    if (e.currentTarget.dataset.child == 0) {
      wx.redirectTo({ url: '../classification/classification?group_id=' + e.currentTarget.dataset.group })
    } else {
      wx.redirectTo({ url: '../twoMenu/twoMenu?group_id=' + e.currentTarget.dataset.group })
    }
  },
  bindtapNav: function (e) {
    var self = this,
      page = e.currentTarget.dataset.page;
    if (page == self.data.arrayIndex && page != 2) return;
    if (page == 3) {
      self.setData({ arrayModel: self.data.arrayModel == 0 ? 1 : 0 });
      return false;
    } else if (page == 2) {
      if (self.data.arrayMoney == 0) self.setData({ arrayMoney: 1, arrayIndex: e.currentTarget.dataset.page });
      else if (self.data.arrayMoney == 1) self.setData({ arrayMoney: 2, arrayIndex: e.currentTarget.dataset.page });
      else if (self.data.arrayMoney == 2) self.setData({ arrayMoney: 1, arrayIndex: e.currentTarget.dataset.page });
    } else {
      self.setData({ arrayMoney: 0, arrayIndex: page })
    }

    wx.showToast({ title: 'loading...', mask: true, icon: 'loading', duration: 10000 })
    wx.request({
      url: app.globalData.http + 'productAll.do',
      data: {
        shopId: wx.getStorageSync('shopId'),
        memberId: wx.getStorageSync('memberId'),
        searchName: option.searchName || "",
        groupId: option.group_id || "",
        "type": parseInt(page) + 1,
        desc: self.data.arrayMoney == 1 ? 0 : 1
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideToast();
        var data = res.data;
        self.setData({
          productPage: data.productPage,
          firstList: data.firstList
        })
      }
    })

    curPage = 1;
    loading = false;
    self.setData({ is_lower: false })
  },
  bindscrolltolowerAddData: function (e) {
    //下拉加载商品数据
    var self = this;
    if (loading) return;
    curPage++;
    if (self.data.productPage.pageCount < curPage) {
      self.setData({ is_lower: true })
      return false;
    }
    loading = true;
    wx.request({
      url: app.globalData.http + 'productPage.do',
      data: {
        shopId: wx.getStorageSync('shopId'),
        memberId: wx.getStorageSync('memberId'),
        searchName: option.searchName || "",
        groupId: group_id || "",
        "type": parseInt(self.data.arrayIndex) + 1,
        desc: self.data.arrayMoney == 1 ? 0 : 1,
        curPage: curPage
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data;
        self.data.productPage.subList.push.apply(self.data.productPage.subList, data.subList);
        self.setData({ productPage: self.data.productPage })
        loading = false;
      }
    })
  },

  bindinputFind: function (e) {
    findName = e.detail.value;
  },

  findShop: function (e) {
    wx.redirectTo({ url: '../classification/classification?searchName=' + findName })
  },

  bindtapGoDetail: function(e){
    wx.redirectTo({ url: '../detailedCommodity/detailedCommodity?proid=' + e.currentTarget.dataset.proid })
  },

  catchtapAddShopCart: function (e) {
    //加入购物车
    var self = this;
    var defaultInvMap = self.data.data.defaultInvMap || {};
    wx.showToast({ title: 'loading...', mask: true, icon: 'loading', duration: 10000 })
    wx.request({
      url: app.globalData.http + 'addshopping.do',
      data: {
        shopCart: {
          userId: wx.getStorageSync('memberId'),
          shopId: wx.getStorageSync('shopId'),
          productId: proid,
          productNum: self.data.productNum,
          productSpecificas: self.data.specValueId.toString(),
          productSpeciname: defaultInvMap.specifica_name,
          price: self.data.data.product_price,
          primaryPrice: self.data.data.product_price,
          //proCode:self.data.productNum,
          discount: "1",
        },
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideToast()
        if (res.data.code == 1) {
          wx.showToast({
            title: '加入购物车成功！',
            icon: 'success',
            duration: 800
          })
          self.data.shopCartNum += self.data.productNum;
          self.setData({ shopCartNum: self.data.shopCartNum })
        } else {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'loading',
            duration: 800
          })
        }
      }
    })
  },
})

