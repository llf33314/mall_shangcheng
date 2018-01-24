// pages/detailedCommodity/detailedCommodity.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js')
var util = require('../../utils/util.js')
var proid = '';
Page({
  data: {
    data: null,
    specValueId: [], //选中的规格
    shopDetailsBool: -1,
    productNum: 1, //购买数量
    shopCartNum: 0, //购物车数量
    address: "", //地址
    product_type_id: 0, //判断商品类型
    stopSpe: false,
    stopDescribe: false,

    evaluate: 0, //过滤评价 
    countMap: [],
    commentList: [],
    picUrl: app.globalData.picUrl,
    memberId: wx.getStorageSync('memberId'),
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    var article,
      shopId = options.shopId;
    proid = options.proid;
    self.setData({ memberId: wx.getStorageSync('memberId') })
    if (shopId) wx.setStorageSync('shopId', shopId);
    // util.login(app, function () {
    //   wx.request({
    //     url: app.globalData.http + 'phoneProduct.do',
    //     data: {
    //       shopId: wx.getStorageSync('shopId'),
    //       memberId: wx.getStorageSync('memberId'),
    //       productId: proid,
    //       province: 0
    //     },
    //     method: 'GET',
    //     header: {
    //       'content-type': 'application/json'
    //     },
    //     success: function (res) {
    //       if (res.data.defaultInvMap) {
    //         self.setData({ data: res.data, address: res.data.address, specValueId: res.data.defaultInvMap.xids.split(","), shopDetailsBool: 0, shopCartNum: res.data.shopCartNum });
    //       } else {
    //         self.setData({ data: res.data, address: res.data.address, specValueId: '', shopDetailsBool: 0, shopCartNum: res.data.shopCartNum });
    //       }
    //       self.setData({ product_type_id: res.data.product_type_id })
    //       article = res.data.product_detail;
    //       WxParse.wxParse('article', 'html', article, self, 5)
    //     }
    //   })
    // });
    wx.request({
      url: app.globalData.http + 'phoneProduct.do',
      data: {
        shopId: wx.getStorageSync('shopId') || '',
        memberId: wx.getStorageSync('memberId') || '',
        productId: proid,
        province: 0
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.defaultInvMap) {
          self.setData({ data: res.data, address: res.data.address, specValueId: res.data.defaultInvMap.xids.split(","), shopDetailsBool: 0, shopCartNum: res.data.shopCartNum });
        } else {
          self.setData({ data: res.data, address: res.data.address, specValueId: '', shopDetailsBool: 0, shopCartNum: res.data.shopCartNum });
        }
        self.setData({ product_type_id: res.data.product_type_id })
        article = res.data.product_detail;
        if (article) WxParse.wxParse('article', 'html', article, self, 5)
      }
    })
  },
  onShareAppMessage: function (res) {
    return {
      path: '/pages/detailedCommodity/detailedCommodity?shopId=' + wx.getStorageSync('shopId') + "&proid=" + proid,
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

  bindtapStopSpe: function () {
    //收起规格
    this.setData({ stopSpe: !this.data.stopSpe })
  },

  bindtapStopDescribe: function () {
    //收起描述
    this.setData({ stopDescribe: !this.data.stopDescribe })
  },

  bindtapAdd: function () {
    //增加购买数量
    this.setData({ productNum: ++this.data.productNum })
  },
  bindtapReduce: function () {
    //减少购买数量
    this.setData({ productNum: this.data.productNum - 1 <= 0 ? '1' : --this.data.productNum })
  },
  bindtapChangeSpe: function (e) {
    //切换规格
    var self = this,
      dataset = e.currentTarget.dataset;

    self.data.specValueId[dataset.parent] = dataset.spe;

    self.setData({ specValueId: self.data.specValueId })

    var str = self.data.specValueId.toString();

    self.data.data.guigePriceList.forEach(function (e) {
      if (e.xsid == str) {
        self.data.data.defaultInvMap.specifica_name = e.values;
        self.data.data.product_price = e.inv_price;
        self.data.data.member_price = e.member_price;
        self.setData({ data: self.data.data })
      };
    })
  },
  bindtapChangeShopNav: function (e) {
    //切换商品详情 规格参数 评价
    var self = this,
      dataset = e.currentTarget.dataset;

    self.setData({ shopDetailsBool: dataset.page });

    if (dataset.page == 2) {
      wx.request({
        url: app.globalData.http + 'getProductComment.do',
        data: {
          memberId: wx.getStorageSync('memberId'),
          proId: proid,
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var countMap = res.data.countMap || {};
          self.setData({
            countMap: {
              hao: countMap.hao || 0,
              zhong: countMap.zhong || 0,
              cha: countMap.cha || 0,
            },
            commentList: res.data.commentList
          })
          console.log(res.data.commentList);
        }
      })
    }
  },
  bindtapChangeEvaluate: function (e) {
    var self = this,
      dataset = e.currentTarget.dataset;
  },
  bindtapAddCart: function (e) {
    //加入购物车
    var self = this;
    var defaultInvMap = self.data.data.defaultInvMap || {};
    if (!wx.getStorageSync('memberId')) {
      var shopCart = {
        userId: wx.getStorageSync('memberId'),
        shopId: wx.getStorageSync('shopId'),
        productId: proid,
        productNum: self.data.productNum,
        productSpecificas: self.data.specValueId.toString(),
        productSpeciname: defaultInvMap.specifica_name,
        price: self.data.data.product_price,
        primaryPrice: self.data.data.product_price,

        busUserId: app.globalData.busId,
        //proCode:self.data.productNum,
        discount: "1",
      }
      util.login(app, function () {
        wx.request({
          url: app.globalData.http + 'addshopping.do',
          data: {
            shopCart: JSON.stringify(shopCart),
          },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
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
      })
    } else {
      var shopCart = {
        userId: wx.getStorageSync('memberId'),
        shopId: wx.getStorageSync('shopId'),
        productId: proid,
        productNum: self.data.productNum,
        productSpecificas: self.data.specValueId.toString(),
        productSpeciname: defaultInvMap.specifica_name,
        price: self.data.data.product_price,
        primaryPrice: self.data.data.product_price,

        busUserId: app.globalData.busId,
        //proCode:self.data.productNum,
        discount: "1",
      };
      wx.request({
        url: app.globalData.http + 'addshopping.do',
        data: {
          shopCart: JSON.stringify(shopCart)
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
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
    }

  },
  bindtapRightOff: function (e) {
    var self = this,
      _type = e.currentTarget.dataset.type;

    if (_type == 2 || _type == 4) {
      wx.showModal({
        title: '提示',
        content: '暂时未开放购买此类商品',
        showCancel: false
      })
      return false;
    }

    if (wx.getStorageSync('memberId')) {
      wx.navigateTo({
        url: '../order/order?from=2&product_id=' + proid + '&product_specificas=' + self.data.specValueId.toString() + '&product_num=' + self.data.productNum + '&product_price=' + self.data.data.product_price + '&primary_price=' + self.data.data.product_price
      })
    } else {
      util.login(app, function () {
        wx.navigateTo({
          url: '../order/order?from=2&product_id=' + proid + '&product_specificas=' + self.data.specValueId.toString() + '&product_num=' + self.data.productNum + '&product_price=' + self.data.data.product_price + '&primary_price=' + self.data.data.product_price
        })
      })
    }

  },
})