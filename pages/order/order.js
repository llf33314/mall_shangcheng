// pages/order/order.js
var app = getApp();
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

    isUseJifen: 0,
    isUseFenbi: 0,

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
    if (option.from == 1) {
      wx.request({
        url: app.globalData.http + 'toSubmitOrder.do',
        data: {
          busUserId: app.globalData.busId,
          memberId: wx.getStorageSync('memberId'),
          latitude: wx.getStorageSync('latitude'),
          longitude: wx.getStorageSync('longitude'),
          from: option.from,
          cartIds: option.cartIds,

          version: "1.1.0"
        },
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
          })
        }
      })
    } else {
      wx.request({
        url: app.globalData.http + 'toSubmitOrder.do',
        data: {
          busUserId: app.globalData.busId,
          memberId: wx.getStorageSync('memberId'),
          latitude: wx.getStorageSync('latitude'),
          longitude: wx.getStorageSync('longitude'),
          from: option.from,
          product_id: option.product_id,
          product_specificas: option.product_specificas,
          product_num: option.product_num,
          product_price: option.product_price,
          primary_price: option.primary_price,

          version: "1.1.0"
        },
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
          })
        }
      })
    }

  },

  bindchangeFB: function (e) {
    var self = this,
      value = e.detail.value;

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

    if (!wx.getStorageSync('phone')) {
      self.setData({ bindPhoneHidden: false })
      return false;
    }

    if (self.data.repeatSubmit == 0) self.data.repeatSubmit = 1;
    else return false;

    console.log("防止重复提交")

    data.shopList.forEach(function (e, i) {
      var orderMoney = e.totalProPrice - 0 + e.freightPrice;
      var orderDetail = [];
      var yhq = self.data.yhqList[i] || "";

      if (yhq) {
        isUseYhq = 1;
      }
      e.proList.forEach(function (e) {
        orderDetail.push({
          productId: e.product_id,
          productSpecificas: e.product_specificas || '',
          productSpeciname: e.product_specificaname || '',
          productImageUrl: e.product_image,
          detProNum: e.product_num,
          detProPrice: e.product_price,
          totalPrice: e.product_price * e.product_num,
          detPrivivilege: e.primary_price,
          discount: 1
        })
      })

      if (yhq.card_type == 0 || yhq.card_type == 1) {
        order.push({
          receiveId: data.addressMap.id,
          orderTotalMoney: data.totalProMoney,//订单商品总额（不包含运费）
          orderMoney: orderMoney.toFixed(2),
          orderFreightMoney: e.freightPrice,
          orderBuyerMessage: self.data.messageArray[i] || "",
          deliveryMethod: 1,
          orderPayWay: dataset.way,
          shopId: e.shop_id,

          yhqProNum: e.yhqProNum,//能使用优惠券的商品数量
          yhqProMoney: e.yhqProMoney,//能使用优惠券的商品总价

          wxCoupon: "",
          duofenCoupon: yhq,

          orderDetail: orderDetail,
        })

      } else {
        order.push({
          receiveId: data.addressMap.id,
          orderTotalMoney: data.totalProMoney,//订单商品总额（不包含运费）
          orderMoney: orderMoney.toFixed(2),
          orderFreightMoney: e.freightPrice,
          orderBuyerMessage: self.data.messageArray[i] || "",
          deliveryMethod: 1,
          orderPayWay: dataset.way,
          shopId: e.shop_id,

          yhqProNum: e.yhqProNum,//能使用优惠券的商品数量
          yhqProMoney: e.yhqProMoney,//能使用优惠券的商品总价

          wxCoupon: yhq,
          duofenCoupon: "",

          orderDetail: orderDetail,
        })
      }

    })

    wx.request({
      url: app.globalData.http + 'submitOrder.do',
      data: {
        memberId: wx.getStorageSync('memberId'),
        cartIds: option.cartIds || "",

        totalAllMoney: data.totalProMoney - 0 + data.totalFreightMoney, //订单实付金额（包含运费）

        fenbi_money: self.data.fenbi_money || "", //粉币可抵扣的金额
        fenbi: self.data.fenbi || "", //粉币数量
        integral_money: self.data.integral_money || "", //积分可抵扣的金额
        integral: self.data.integral || "", //积分数量

        isUseJifen: self.data.isUseJifen || 0, //是否已经使用积分 1已经使用积分   0没使用
        isUseFenbi: self.data.isUseFenbi || 0, //是否已经使用粉币  1已经使用粉币     0没使用
        isUseYhq: isUseYhq,
        isUseUnion: 0, //是否已经使用商家联盟   1已经使用商家联盟     0没使用
        unionProNum: data.unionProNum,//能使用商家联盟的商品数量
        unionProMoney: data.unionProMoney,//能使用商家联盟的商品总价

        fenbiProNum: data.fenbiProNum,//能使用粉币的商品数量
        fenbiProMoney: data.fenbiProMoney,//能使用粉币的商品总价

        jifenProNum: data.jifenProNum,//能使用积分的商品数量
        jifenProMoney: data.jifenProMoney,//能使用积分的商品总价

        order: order,
        version: "1.1.0"
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
        self.data.repeatSubmit == 0;
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

  data.shopList.forEach(function (e, i) {
    var orderMoney = e.totalProPrice - 0 + e.freightPrice;
    var orderDetail = [];
    var yhq = self.data.yhqList[i] || "";

    if (yhq) isUseYhq = 1;

    e.proList.forEach(function (e) {
      orderDetail.push({
        productId: e.product_id,
        productSpecificas: e.product_specificas || '',
        productSpeciname: e.product_specificaname || '',
        productImageUrl: e.product_image,
        detProNum: e.product_num,
        detProPrice: e.product_price,
        totalPrice: e.product_price * e.product_num,
        detPrivivilege: e.primary_price,
        discount: 1,
      })
    })

    if (yhq.card_type == 0 || yhq.card_type == 1) {

      order.push({
        orderTotalMoney: data.totalProMoney,//订单商品总额（不包含运费）
        orderMoney: orderMoney.toFixed(2),
        orderFreightMoney: e.freightPrice,
        shopId: e.shop_id,

        yhqProNum: e.yhqProNum,//能使用优惠券的商品数量
        yhqProMoney: e.yhqProMoney,//能使用优惠券的商品总价

        wxCoupon: "",
        duofenCoupon: yhq,

        orderDetail: orderDetail,
      })

    } else {
      order.push({
        orderTotalMoney: data.totalProMoney,//订单商品总额（不包含运费）
        orderMoney: orderMoney.toFixed(2),
        orderFreightMoney: e.freightPrice,
        shopId: e.shop_id,

        yhqProNum: e.yhqProNum,//能使用优惠券的商品数量
        yhqProMoney: e.yhqProMoney,//能使用优惠券的商品总价

        wxCoupon: yhq,
        duofenCoupon: "",

        orderDetail: orderDetail,
      })
    }

  })


  wx.request({
    url: app.globalData.http + 'calculationPreferential.do',
    data: {
      totalAllMoney: data.totalProMoney - 0 + data.totalFreightMoney, //订单实付金额（包含运费）

      fenbi_money: self.data.fenbi_money || "", //粉币可抵扣的金额
      fenbi: self.data.fenbi || "", //粉币数量
      integral_money: self.data.integral_money || "", //积分可抵扣的金额
      integral: self.data.integral || "", //积分数量

      isUseJifen: self.data.isUseJifen || 0, //是否已经使用积分 1已经使用积分   0没使用
      isUseFenbi: self.data.isUseFenbi || 0, //是否已经使用粉币  1已经使用粉币     0没使用
      isUseYhq: isUseYhq,
      isUseUnion: 0, //是否已经使用商家联盟   1已经使用商家联盟     0没使用
      unionProNum: data.unionProNum,//能使用商家联盟的商品数量
      unionProMoney: data.unionProMoney,//能使用商家联盟的商品总价


      fenbiProNum: data.fenbiProNum,//能使用粉币的商品数量
      fenbiProMoney: data.fenbiProMoney,//能使用粉币的商品总价

      jifenProNum: data.jifenProNum,//能使用积分的商品数量
      jifenProMoney: data.jifenProMoney,//能使用积分的商品总价

      memberId: wx.getStorageSync('memberId'),
      order: JSON.stringify(order)
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {

      if (res.data.code == 1) {
        self.setData({
          totalMoney: res.data.orderTotalMoney,
          yhqDiscountMoney: res.data.yhqDiscountMoney,
          fenbiDiscountMoney: res.data.fenbiDiscountMoney,
          jifenDiscountMoney: res.data.jifenDiscountMoney,
          fenbi: res.data.fenbi,
          fenbi_money: res.data.fenbi_money,
          integral: res.data.integral,
          integral_money: res.data.integral_money,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errorMsg,
          showCancel: false,
        })
      }
    },
  })
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
