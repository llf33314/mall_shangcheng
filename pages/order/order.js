// pages/order/order.js
var app = getApp();
var calculateOrder = require('../../utils/calculateOrder.js');
var option = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: "",
    messageArray: [],
    bindPhoneHidden: true,
    phone: '',
    code: '',
    countDown: -1,
    totalMoney: 0.00,

    fenbi: 0,
    fenbi_money: 0,
    integral: 0,
    integral_money: 0,

    yhqListLayer: true, //是否显示优惠券
    yhqIndex: 0,
    yhqList: [],

    yhqDiscountMoney: 0.00,
    fenbiDiscountMoney: 0.00,
    jifenDiscountMoney: 0.00,
    memberDiscountMoney: 0.00,//会员折扣优惠的金额
    unionDiscountMoney: 0.00,//联盟折扣优惠的金额

    isUseJifen: 0,//是否使用积分折扣 1 使用
    isUseFenbi: 0,//是否使用粉币折扣 1 使用
    isUseDiscount: 0,//是否使用会员折扣 1 使用
    isUseUnionDiscount: 0,//是否使用了联盟折扣 1 使用
    discount: 0,//折扣数

    fenbiDisabled: 0,//粉币是否禁用 1禁用
    jifenDisabled: 0,//积分是否禁用 1禁用
    memberDisabled: 0,//是否禁用1 禁用

    isJuliFreight: false,//true 需要用户修改地址
    orderId: 0,

    repeatSubmit: 0, //防止重复提交
    picUrl: app.globalData.picUrl,
    isAdvert: wx.getStorageSync('isAdvert')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    option = options;
    this.setData({ picUrl: app.globalData.picUrl })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    var _data = {
      busUserId: app.globalData.busId,
      memberId: wx.getStorageSync('memberId'),
      latitude: wx.getStorageSync('latitude'),
      longitude: wx.getStorageSync('longitude'),
      from: option.from,
      version: "1.1.0",
    }
    if (option.from == 1) {
      _data.cartIds = option.cartIds;
    } else if (option.from == 2) {
      _data.product_id = option.product_id;
      _data.product_specificas = option.product_specificas;
      _data.product_num = option.product_num;
      _data.product_price = option.product_price;
      _data.primary_price = option.primary_price;
    } else if (option.from ==3 ) {
      _data.orderId = option.orderId;
    }
    wx.request({
      url: app.globalData.http + 'toSubmitOrder.do',
      data: _data,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          data: res.data,
          totalMoney: res.data.totalMoney,
          fenbi: res.data.fenbi,
          fenbi_money: res.data.fenbi_money,
          integral: res.data.integral,
          integral_money: res.data.integral_money,
          discount: res.data.discount,
          isJuliFreight: res.data.isJuliFreight == 1 ? true: false
        });
        //默认计算会员折扣
        if (res.data.isDiscount == 1) {
          self.data.isUseDiscount = 1;
          countPrice(self);
        }
      }
    })
  },

  bindchangeDiscount: function (e) {
    var self = this,
      value = e.detail.value;

    if (value) {
      self.data.isUseDiscount = 1;
    } else {
      self.data.isUseDiscount = 0;
    }
    countPrice(self);
  },

  bindchangeUnionDiscount: function (e) {
    var self = this,
      value = e.detail.value;

    if (value) {
      self.data.isUseUnionDiscount = 1;
    } else {
      self.data.isUseUnionDiscount = 0;
    }
    countPrice(self);
  },

  bindchangeFB: function (e) {
    var self = this,
      value = e.detail.value;

    if (self.data.fenbiDisabled == 1) {
      return;
    }
    if (value) {
      self.data.isUseFenbi = 1;
    } else {
      self.data.isUseFenbi = 0;
    }
    countPrice(self);
  },

  bindchangeJF: function (e) {
    var self = this,
      value = e.detail.value;

    if (self.data.jifenDisabled == 1) {
      return;
    }
    if (value) {
      self.data.isUseJifen = 1;
    } else {
      self.data.isUseJifen = 0;
    }
    countPrice(self);
  },

  bindtapYHQ: function (e) {
    var dataset = e.currentTarget.dataset;
    this.setData({
      yhqListLayer: !this.data.yhqListLayer,
      yhqIndex: dataset.index
    })
  },

  bindtapUseYHQ: function (e) {
    //alert("aaa");
    var self = this,
      dataset = e.currentTarget.dataset || '',
      index = self.data.yhqIndex,
      boole = false;
    self.data.yhqList.forEach(function (e, i) {
      if ((e.user_card_code == dataset.obj.user_card_code && e.user_card_code) || (e.code == dataset.obj.code && e.code)) {
        if (i != index) boole = true;
      }
    })
    if (boole) {
      wx.showModal({
        title: '提示',
        content: '不能使用相同优惠券',
        showCancel: false,
      })
      return false;
    }
    self.data.yhqList[index] = dataset.obj;

    countPrice(self);

    self.setData({
      yhqList: self.data.yhqList,
      yhqListLayer: true
    })
  },

  bindinputMessage: function (e) {
    var self = this,
      page = e.currentTarget.dataset.page,
      value = e.detail.value;

    this.data.messageArray[page] = value;
  },

  bindtapPay: function (e) {
    var self = this,
      dataset = e.currentTarget.dataset,
      data = self.data.data,
      isUseYhq = 0,
      order = [];

    if (!data.addressMap) {
      wx.showModal({
        title: '提示',
        content: '请添加地址',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({ url: '../navAddress/navAddress' })
          }
        }
      })
      return false;
    }
    if (self.data.isJuliFreight){
      wx.showModal({
        title: '提示',
        content: '请重新编辑您的收货地址',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({ url: '../navAddress/navAddress' })
          }
        }
      })
      return false;
    }

    if (!wx.getStorageSync('phone')) {
      self.setData({ bindPhoneHidden: false });
      return false;
    }

    if (self.data.repeatSubmit == 0) self.data.repeatSubmit = 1;
    else return false;

    console.log("防止重复提交")

    data.shopList.forEach(function (e, i) {
      var orderMoney = e.totalProPrice - 0 + e.freightPrice;
      var orderDetail = [];
      var yhq = self.data.yhqList[i] || null;

      if (yhq) {
        isUseYhq = 1;
      }
      e.proList.forEach(function (e) {
        let _detail = {
          productId: e.product_id,
          productSpecificas: e.product_specificas || '',
          productSpeciname: e.product_specificaname || '',
          productImageUrl: e.product_image,
          detProNum: e.product_num,
          detProPrice: e.product_price,
          totalPrice: e.product_price * e.product_num,
          detPrivivilege: e.primary_price
        };
        if (e.detailId > 0){
          _detail.detailId = e.detailId;
        }
        orderDetail.push(_detail)
      });
      let _order = {
        receiveId: data.addressMap.id,
        productTotalMoney: data.totalProMoney,//订单商品总额（不包含运费）
        orderMoney: orderMoney.toFixed(2),
        orderFreightMoney: e.freightPrice,
        orderBuyerMessage: self.data.messageArray[i] || "",
        deliveryMethod: 1,
        orderPayWay: dataset.way,
        shopId: e.shop_id,
        wxShopId: e.wx_shop_id,
        orderDetail: orderDetail,
        selectCounpon: yhq
      };
      if(e.orderId > 0){
        _order.orderId = e.orderId;
      }
      order.push(_order);

    })

    wx.request({
      url: app.globalData.http + 'submitOrder.do',
      data: {
        memberId: wx.getStorageSync('memberId'),
        cartIds: option.cartIds || "",
        totalPayMoney: self.data.totalMoney || 0,
        totalAllMoney: data.totalProMoney - 0 + data.totalFreightMoney, //订单实付金额（包含运费）

        fenbi_money: self.data.fenbi_money || "", //粉币可抵扣的金额
        fenbi: self.data.fenbi || "", //粉币数量
        integral_money: self.data.integral_money || "", //积分可抵扣的金额
        integral: self.data.integral || "", //积分数量

        isUseJifen: self.data.isUseJifen || 0, //是否已经使用积分 1已经使用积分   0没使用
        isUseFenbi: self.data.isUseFenbi || 0, //是否已经使用粉币  1已经使用粉币     0没使用
        isUseYhq: isUseYhq || 0,
        isUseUnion: self.data.isUseUnionDiscount || 0, //是否已经使用商家联盟   1已经使用商家联盟     0没使用
        isUseDiscount: self.data.isUseDiscount || 0,//是否使用会员折扣  1已经使用
        // unionProNum: data.unionProNum,//能使用商家联盟的商品数量
        // unionProMoney: data.unionProMoney,//能使用商家联盟的商品总价

        // fenbiProNum: data.fenbiProNum,//能使用粉币的商品数量
        // fenbiProMoney: data.fenbiProMoney,//能使用粉币的商品总价

        // jifenProNum: data.jifenProNum,//能使用积分的商品数量
        // jifenProMoney: data.jifenProMoney,//能使用积分的商品总价

        order: JSON.stringify(order),
        version: "1.1.1"
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1 && dataset.way == 10) {
          if (self.data.totalMoney <= 0) {
            wx.redirectTo({
              url: '../myOrder/myOrder?page=0'
            })
          } else {
            wx.request({
              url: app.globalData.http + 'appletWxOrder.do',
              data: {
                orderNo: res.data.orderNo,
                memberId: wx.getStorageSync('memberId'),
                appid: wx.getStorageSync('appid')
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
                            wx.redirectTo({
                              url: '../myOrder/myOrder?page=0'
                            })
                          }
                        }
                      })
                    }
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '获取支付信息失败！',
                    showCancel: false
                  })
                }
              },
            })
          }
        } else if (res.data.code == 1) {
          wx.redirectTo({
            url: '../myOrder/myOrder?page=0'
          })
        } else if (res.data.code == -1) {
          wx.showModal({
            title: '提示',
            content: res.data.errorMsg,
            showCancel: false,
          })
        }
        self.data.repeatSubmit = 0;
      }
    })

  },

  bindinputPhone: function (e) {
    //手机号码
    this.data.phone = e.detail.value;
    this.setData({ phone: this.data.phone })
  },

  bindinputCode: function (e) {
    //验证码
    this.data.code = e.detail.value;
    this.setData({ code: this.data.code })
  },

  bindtapCode: function () {
    //发送验证码
    var self = this,
      phone = self.data.phone;
    if (/^1(3|4|5|7|8)\d{9}$/.test(phone)) {
      self.setData({ countDown: 60 })
      countDown(self, 60);
      wx.request({
        url: app.globalData.http + 'getValCode.do',
        data: {
          busId: app.globalData.busId,
          phoneNo: phone
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
      })
    } else {
      wx.showToast({ title: '手机号码有误', icon: 'loading', duration: 500 })
    }

  },

  bindsubmitPhone: function () {
    var self = this,
      phone = self.data.phone;
    wx.request({
      url: app.globalData.http + 'bindPhone.do',
      data: {
        memberId: wx.getStorageSync('memberId'),
        busId: app.globalData.busId,
        phone: self.data.phone,
        code: self.data.code
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result) {
          self.setData({ bindPhoneHidden: true })
          wx.setStorageSync('memberId', res.data.member.id)
          wx.setStorageSync('phone', phone)
          wx.showToast({ title: '绑定成功', icon: 'success', duration: 500 })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
          })
        }
      },
    })
  },

  bindtapClosePhoneLayer: function () {
    this.setData({ bindPhoneHidden: true })
  },
})

function countPrice(self) {
  var self = self,
    data = self.data.data,
    isUseYhq = 0,
    order = [];
  data = calculateOrder.calculateOrder(self.data);
  self.setData(data);

  // data.shopList.forEach(function (e, i) {
  //   var orderMoney = e.totalProPrice - 0 + e.freightPrice;
  //   var orderDetail = [];
  //   var yhq = self.data.yhqList[i] || "";

  //   if (yhq) isUseYhq = 1;

  //   e.proList.forEach(function (e) {
  //     orderDetail.push({
  //       productId: e.product_id,
  //       productSpecificas: e.product_specificas || '',
  //       productSpeciname: e.product_specificaname || '',
  //       productImageUrl: e.product_image,
  //       detProNum: e.product_num,
  //       detProPrice: e.product_price,
  //       totalPrice: e.product_price * e.product_num,
  //       detPrivivilege: e.primary_price,
  //       discount: 1,
  //       is_member_discount: e.is_member_discount || 0,
  //       is_coupons: e.is_coupons || 0,
  //       is_integral_deduction: e.is_integral_deduction || 0,
  //       is_fenbi_deduction: e.is_fenbi_deduction || 0,
  //     })
  //   })
  //   var orderData = {
  //     orderTotalMoney: data.totalProMoney,//订单商品总额（不包含运费）
  //     orderMoney: orderMoney.toFixed(2),
  //     orderFreightMoney: e.freightPrice,
  //     shopId: e.shop_id,
  //     orderDetail: orderDetail,
  //   }
  //   if(isUseYhq == 1){
  //     orderData.selectCoupon = yhq;
  //   }
  //   order.push(orderData);

  // })


  // wx.request({
  //   url: app.globalData.http + 'calculationPreferential.do',
  //   data: {
  //     totalAllMoney: data.totalProMoney - 0 + data.totalFreightMoney, //订单实付金额（包含运费）

  //     fenbi_money: self.data.fenbi_money || "", //粉币可抵扣的金额
  //     fenbi: self.data.fenbi || "", //粉币数量
  //     integral_money: self.data.integral_money || "", //积分可抵扣的金额
  //     integral: self.data.integral || "", //积分数量

  //     isUseJifen: self.data.isUseJifen || 0, //是否已经使用积分 1已经使用积分   0没使用
  //     isUseFenbi: self.data.isUseFenbi || 0, //是否已经使用粉币  1已经使用粉币     0没使用
  //     isUseDiscount: self.data.isUseDiscount || 0,//是否已经使用折扣  1已经使用 0没使用
  //     isUseYhq: isUseYhq,
  //     isUseUnion: 0, //是否已经使用商家联盟   1已经使用商家联盟     0没使用
  //     //unionProNum: data.unionProNum,//能使用商家联盟的商品数量
  //     //unionProMoney: data.unionProMoney,//能使用商家联盟的商品总价


  //     //fenbiProNum: data.fenbiProNum,//能使用粉币的商品数量
  //     //fenbiProMoney: data.fenbiProMoney,//能使用粉币的商品总价

  //     //jifenProNum: data.jifenProNum,//能使用积分的商品数量
  //     //jifenProMoney: data.jifenProMoney,//能使用积分的商品总价

  //     memberId: wx.getStorageSync('memberId'),
  //     order: JSON.stringify(order)
  //   },
  //   method: 'GET',
  //   header: {
  //     'content-type': 'application/x-www-form-urlencoded'
  //   },
  //   success: function (res) {

  //     if (res.data.code == 1) {
  //       self.setData({
  //         totalMoney: res.data.orderTotalMoney,
  //         yhqDiscountMoney: res.data.yhqDiscountMoney,
  //         fenbiDiscountMoney: res.data.fenbiDiscountMoney,
  //         jifenDiscountMoney: res.data.jifenDiscountMoney,
  //         fenbi: res.data.fenbi,
  //         fenbi_money: res.data.fenbi_money,
  //         integral: res.data.integral,
  //         integral_money: res.data.integral_money,
  //       })
  //     } else {
  //       wx.showModal({
  //         title: '提示',
  //         content: res.data.errorMsg,
  //         showCancel: false,
  //       })
  //     }
  //   },
  // })
}

function countDown(self, count) {
  var self = self, count = count;
  if (count > 0) {
    setTimeout(function () {
      --count;
      self.setData({ countDown: count })
      countDown(self, count)
    }, 1000)
  }
}
