// pages/shop/shop.js
var app = getApp();
var util = require('../../utils/util.js');
Page({
  data:{
    productList:[],               //购物车里面没有失效商品
    sxProductList:[],             //购物车失效商品
    boolEdit:[],                  //是否开启编辑

    commoditySelectLength: 0,     //选中商品数量
    price: 0,                     //选中商品总价
    commodityLength: 0,           //总共多少商品加入购物车
    commodityId: [],              //所有加入购物车商品id
    commodityPrice: [],           //所有加入购物车商品价格
    commodityBool: [],            //所有加入购物车商品状态

    allChangeBool: false,
    picUrl: app.globalData.picUrl,
    memberId: wx.getStorageSync('memberId')
  },
  onLoad:function(options){
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var self = this,
        comID = self.data.commodityId.concat(),
        comBool = self.data.commodityBool.concat();
    self.setData({ memberId: wx.getStorageSync('memberId') })

    if(!wx.getStorageSync('memberId'))return false;
    wx.request({
      url: app.globalData.http + 'shopCart.do',
      data: {
        memberId: wx.getStorageSync('memberId'),
        shopId: wx.getStorageSync('shopId'),

        busUserId: app.globalData.busId
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({ productList: res.data.productList || [], sxProductList: res.data.sxProductList || [] })

        if (!res.data.productList) {
          self.data.commodityId = [];
          self.data.commodityPrice = [];
          self.data.commodityBool = [];
          change(self)
          return false;
        }
        if (res.data.productList.length <= 0) {
          self.data.commodityId = [];
          self.data.commodityPrice = [];
          self.data.commodityBool = [];
          change(self)
          return false;
        }
        var num = 0;

        var bool = true;
        res.data.productList.forEach(function (e, i) {
          self.data.commodityId[i] = [];
          self.data.commodityPrice[i] = [];
          self.data.commodityBool[i] = [];
          self.data.boolEdit[i] = false;
          e.proList.forEach(function (e) {
            var bool = true;
            comID.forEach(function (key, j) {
              comID[j].forEach(function (id, i) {
                if (id == e.id) bool = comBool[j][i];
              })
            })
            self.data.commodityId[i].push(e.id)
            self.data.commodityBool[i].push(bool)
            self.data.commodityPrice[i].push(e.price)
            num += e.product_num;
          })
        })
        self.data.commodityLength = num;

        change(self)
      }
    })
    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  bindtapHrefDetail02: function (e) {
    var dataset = e.currentTarget.dataset;
    if (dataset.type == 2) return;
    wx.navigateTo({ url: '../detailedCommodity/detailedCommodity?proid=' + dataset.proid })
  },

  bindtapAddClassEdit: function(e){
    var self = this,
        index = e.currentTarget.dataset.index;

    self.data.boolEdit[index] = !self.data.boolEdit[index];
    self.setData({ boolEdit: self.data.boolEdit})
  },

  bindtapRemoveShop: function(e){
    //删除购物车数据
    var self = this,
        parent = e.currentTarget.dataset.parent,
        index = e.currentTarget.dataset.index,
        id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '是否删除该商品？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + 'shoppingdelete.do',
            data: {
              memberId: wx.getStorageSync('memberId'),
              ids: "[" + id + "]",
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res.data);
              if (res.data.code == 1) {
                self.data.commodityLength -= self.data.productList[parent].proList[index].product_num;
                self.data.price -= parseFloat(self.data.commodityPrice[parent][index]) * self.data.productList[parent].proList[index].product_num
                self.data.productList[parent].proList.splice(index, 1);
                self.data.commodityId[parent].splice(index, 1);
                self.data.commodityPrice[parent].splice(index, 1);
                self.data.commodityBool[parent].splice(index, 1);
                if (self.data.productList[parent].proList.length<=0){
                  self.data.productList.splice(parent, 1);
                }

                change(self)
                self.setData({
                  productList: self.data.productList,
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
    
  },
  bindtapReduce: function(e){
    var self = this,
        dataset = e.currentTarget.dataset,
        num = self.data.productList[dataset.parent].proList[dataset.index].product_num;
    if(num <= 1){
      self.data.productList[dataset.parent].proList[dataset.index].product_num = 1;
    }else{
      self.data.productList[dataset.parent].proList[dataset.index].product_num -= 1;
      self.data.commodityLength -= 1;
    }

    self.setData({productList: self.data.productList});

    change(self)
  },
  bindtapAdd: function(e){
    var self = this,
        dataset = e.currentTarget.dataset,
        num = self.data.productList[dataset.parent].proList[dataset.index].product_num;
    
    self.data.productList[dataset.parent].proList[dataset.index].product_num += 1;
    self.data.commodityLength += 1;
    self.setData({productList: self.data.productList});

    change(self)
  },
  bindtapChangeShop: function(e){
    //是否选中
    var self = this,
        dataset = e.currentTarget.dataset;
    
    self.data.commodityBool[dataset.parent][dataset.index] = !self.data.commodityBool[dataset.parent][dataset.index];
    
    change(self);


  },
  bindtapAllChange: function(){
    //全部选中
    var self = this;
    self.data.price = 0;
    if(self.data.allChangeBool){
      self.data.commodityBool.forEach(function(e,i){
        e.forEach(function(e,j){
          self.data.commodityBool[i][j] = false;
        })
      })
    }else{
      self.data.commodityBool.forEach(function(e,i){
        e.forEach(function(e,j){
          self.data.commodityBool[i][j] = true;
          self.data.price += parseFloat(self.data.commodityPrice[i][j]) * self.data.productList[i].proList[j].product_num;
        })
      })
    }

    change(self)

  },
  bindtapClean: function(){
    var self = this,
        arr  = [];
    
    wx.showModal({
      title: '提示',
      content: '是否清空失效商品？',
      success: function (res) {
        if (res.confirm) {
          self.data.sxProductList.forEach(function (e) {
            e.proList.forEach(function (e) {
              arr.push(e.id);
            })
          })
          wx.request({
            url: app.globalData.http + 'shoppingdelete.do',
            data: {
              memberId: wx.getStorageSync('memberId'),
              ids: "[" + arr.toString() + "]",
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if (res.data.code == 1) {
                self.setData({
                  sxProductList: "",
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
  },
  bindtapGoPay: function(){
    //去购买
    var self = this,
        cart = [],
        arr = [];

    self.data.commodityBool.forEach(function(e,i){
      e.forEach(function(e,j){
        if(e)arr.push(self.data.productList[i].proList[j].id);
        cart.push({
          id: self.data.productList[i].proList[j].id,
          num: self.data.productList[i].proList[j].product_num,
          check: e?1:0
        })
      })
    })

    wx.request({
      url: app.globalData.http + 'shoppingorder.do',
      data: {
        memberId: wx.getStorageSync('memberId'), 
        cart: cart
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 1){
          wx.navigateTo({
            url: '../order/order?from=1&cartIds=['+arr.toString()+']'
          })
        }else {
          wx.showModal({
            title: '提示',
            content: res.data.errorMsg,
            showCancel: false,
          })
        }
        
      }
    })
    
  },
  userInfoHandler: function(){
    var self = this,
      comID = self.data.commodityId.concat(),
      comBool = self.data.commodityBool.concat();
    util.login(app,function(){
      self.setData({ memberId: wx.getStorageSync('memberId')})
      wx.request({
        url: app.globalData.http + 'shopCart.do',
        data: {
          memberId: wx.getStorageSync('memberId'),
          shopId: wx.getStorageSync('shopId'),

          busUserId: app.globalData.busId
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          self.setData({ productList: res.data.productList || [], sxProductList: res.data.sxProductList || [] })

          if (!res.data.productList) {
            self.data.commodityId = [];
            self.data.commodityPrice = [];
            self.data.commodityBool = [];
            change(self)
            return false;
          }
          if (res.data.productList.length <= 0) {
            self.data.commodityId = [];
            self.data.commodityPrice = [];
            self.data.commodityBool = [];
            change(self)
            return false;
          }
          var num = 0;

          var bool = true;
          res.data.productList.forEach(function (e, i) {
            self.data.commodityId[i] = [];
            self.data.commodityPrice[i] = [];
            self.data.commodityBool[i] = [];
            self.data.boolEdit[i] = false;
            e.proList.forEach(function (e) {
              var bool = true;
              comID.forEach(function (key, j) {
                comID[j].forEach(function (id, i) {
                  if (id == e.id) bool = comBool[j][i];
                })
              })
              self.data.commodityId[i].push(e.id)
              self.data.commodityBool[i].push(bool)
              self.data.commodityPrice[i].push(e.price)
              num += e.product_num;
            })
          })
          self.data.commodityLength = num;

          change(self)
        }
      })
    })
  }
})


function change(self){
  var num = 0,self = self; 
  self.data.price = 0;
  self.data.commodityBool.forEach(function(e,i){
    e.forEach(function(e,j){
      if(e){
        num += self.data.productList[i].proList[j].product_num;
        self.data.price += parseFloat(self.data.commodityPrice[i][j]) * self.data.productList[i].proList[j].product_num;
      }
    })
  })
  if(num == self.data.commodityLength)self.data.allChangeBool = true;
  else self.data.allChangeBool = false;

  self.setData({
    commodityBool: self.data.commodityBool, 
    allChangeBool: self.data.allChangeBool, 
    boolEdit: self.data.boolEdit,
    commoditySelectLength: num,
    price: self.data.price.toFixed(2)
  })
}