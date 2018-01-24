function calculateOrder(data) {
  console.log(data, "data");
  let orderList = data.data.shopList;
  for (let i = 0; i < orderList.length; i++) {
    let order = orderList[i];
    let productList = order.proList;
    for (let j = 0; j < productList.length; j++) {
      let product = productList[j];
      product.totalNewPrice = product.total_price;//重新定义商品总价，用来计算的
    }
  }
  data.jifenMoneyOld = data.jifenMoneyOld || data.integral_money;
  data.fenbiMoneyOld = data.fenbiMoneyOld || data.fenbi_money;
  data.totalMoneyOld = data.totalMoneyOld || data.totalMoney;
  //计算联盟折扣
  if (data.data.unionStatus == 1) {
    data = caculationUnion(data);
  }
  let youhuiTotal = 0;
  //计算折扣
  data = caculationMemberDiscount(data);
  //计算优惠券
  data = caculationYhqDiscount(data);
  //计算粉币
  data = caculationFenbiDiscount(data);
  //计算积分
  data = caculationJifenDiscount(data);
  let allTotal = data.totalMoneyOld*1;
  if (data.memberDiscountMoney > 0) {
    allTotal = floatSub(allTotal, data.memberDiscountMoney);
  }
  if (data.unionDiscountMoney > 0) {
    allTotal = floatSub(allTotal, data.unionDiscountMoney);
  }
  if (data.yhqDiscountMoney > 0) {
    allTotal = floatSub(allTotal, data.yhqDiscountMoney);
  }
  if (data.fenbiDiscountMoney > 0) {
    allTotal = floatSub(allTotal, data.fenbiDiscountMoney);
  }
  if (data.jifenDiscountMoney > 0) {
    allTotal = floatSub(allTotal, data.jifenDiscountMoney);
  }

  data.totalMoney = allTotal.toFixed(2) * 1;

  return data;
}
/**
 * 计算会员折扣
 */
function caculationMemberDiscount(data) {
  data.memberDiscountMoney = 0;//清空会员折扣
  if (data.isUseDiscount != 1) {
    //没有使用折扣
    return data;
  }
  let memberDiscount = data.discount;//会员运折扣数
  if (memberDiscount == null || memberDiscount == "" || memberDiscount < 0 || memberDiscount >= 1) {
    return data;
  }
  let busCanUseDiscountProductPrice = 0;//定义能使用会员折扣的商品总价
  let orderList = data.data.shopList;
  //循环集合保存能使用折扣的商品总额
  data.data.shopList.forEach((shop, index) => {
    //循环商品
    shop.proList.forEach((product, index) => {
      if (product.is_member_discount == 1) {
        //能使用会员折扣的商品 busCanUseDiscountProductPrice + product.totalNewPrice
        busCanUseDiscountProductPrice = floatAdd(busCanUseDiscountProductPrice, product.totalNewPrice);
      }
    });
  });

  if (busCanUseDiscountProductPrice == 0) {
    return data;
  }
  //计算店铺下所有商品优惠后的金额 busCanUseDiscountProductPrice*memberDiscount 
  let discountYouhuiHouPrice = floatMul(busCanUseDiscountProductPrice, memberDiscount);
  //保存商家下折扣卡优惠的金额 busCanUseDiscountProductPrice - discountYouhuiHouPrice
  let busDiscountYouhui = floatSub(busCanUseDiscountProductPrice, discountYouhuiHouPrice);
  let totalYouhuiMoney = 0;
  // console.log(busDiscountYouhui, "会员折扣优惠后的总额")
  //循环集合计算每件商品优惠的价格
  data.data.shopList.forEach((shop, index) => {
    let shopProductNewTotal = 0;
    let youhuiTotalMoney = 0;
    //循环商品
    shop.proList.forEach((product, index) => {
      if (product.is_member_discount == 1) {
        let productNewTotal = product.totalNewPrice;//商品优惠前的价格
        let discountHouPrice = floatMul(productNewTotal, memberDiscount);//计算商品会员折扣后的金额
        let productYouhuiPrice = floatSub(productNewTotal, discountHouPrice);//计算会员折扣 优惠的金额  （商品优惠前的总价 -  优惠后的金额）
        product.totalNewPrice = discountHouPrice;
        totalYouhuiMoney = floatAdd(totalYouhuiMoney, productYouhuiPrice);
        // console.log("会员折扣优惠后的价格：", product.totalNewPrice)

        shopProductNewTotal = floatAdd(shopProductNewTotal, product.totalNewPrice);
        youhuiTotalMoney = floatAdd(youhuiTotalMoney, productYouhuiPrice);
      }
    });
    console.log("会员折扣优惠后的价格", shopProductNewTotal, "优惠了", youhuiTotalMoney);
  });
  data.memberDiscountMoney = totalYouhuiMoney.toFixed(2)*1;
  // console.log(data.memberDiscountMoney, "计算后会员折扣优惠后的总额", totalYouhuiMoney)
  return data;
}
/**
 * 计算联盟折扣
 */
function caculationUnion(data) {
  let union = data.data;
  data.unionDiscountMoney = 0;//商家联盟优惠金额设为 0 
  if (data.isUseUnionDiscount != 1 || union.unionStatus != 1) {
    data.isUseUnionDiscount = 0;//关闭联盟选择
    return data;
  }
  let unionDiscount = data.data.unionDiscount;//会员折扣
  if (unionDiscount == null || unionDiscount == "" || unionDiscount < 0 || unionDiscount >= 1) {
    data.isUseUnionDiscount = 0;//关闭联盟选择
    return data;
  }
  let busCanUseUnionProductPrice = 0;//定义能使用会员折扣的商品总价
  //循环店铺
  data.data.shopList.forEach((shop, index) => {
    //循环商品
    shop.proList.forEach((product, index) => {
      // if (product.isCanUseDiscount == 1) {
      //能使用会员折扣的商品
      busCanUseUnionProductPrice = floatAdd(busCanUseUnionProductPrice, product.totalNewPrice);
      // }
    });
  });
  if (busCanUseUnionProductPrice == 0) {
    data.unionDiscountMoney = 0;//商家联盟优惠金额设为 0 
    data.isUseUnionDiscount = 0;//关闭联盟选择
    return data;
  }
  //店铺下所有商品优惠后的金额 busCanUseUnionProductPrice * unionDiscount
  let discountYouhuiHouPrice = floatMul(busCanUseUnionProductPrice, unionDiscount);
  // console.log(discountYouhuiHouPrice)

  //保存商家下折扣卡优惠的金额 busCanUseUnionProductPrice - discountYouhuiHouPrice
  let busDiscountYouhui = floatSub(busCanUseUnionProductPrice, discountYouhuiHouPrice);
  let totalYouhuiMoney = 0;
  data.data.shopList.forEach((shop, index) => {
    //循环商品
    shop.proList.forEach((product, index) => {
      // if (product.isCanUseDiscount == 1) {
      let productNewTotal = product.totalNewPrice;//商品优惠前的价格
      let discountHouPrice = floatMul(productNewTotal, unionDiscount);//计算商品联盟折扣后的金额
      let productYouhuiPrice = floatSub(productNewTotal, discountHouPrice);//计算联盟折扣 优惠的金额  （商品优惠前的总价 -  优惠后的金额）
      product.totalNewPrice = discountHouPrice;
      totalYouhuiMoney = floatAdd(totalYouhuiMoney, productYouhuiPrice);
      // console.log("联盟卡优惠后的价格：", product.totalNewPrice)
      // }

    });
  })
  data.unionDiscountMoney = busDiscountYouhui.toFixed(2)*1;
  console.log(busDiscountYouhui, "联盟卡优惠的金额")
  return data;
}
/**
 * 计算粉币抵扣
 */
function caculationFenbiDiscount(data) {

  let busCanUseFenbiProductPrice = 0;//保存能使用粉币的商品总额
  let busCanUseFenbiProductNum = 0;//保存能使用粉币的商品数量
  //循环店铺
  data.data.shopList.forEach((shop, index) => {
    //循环商品
    shop.proList.forEach((product, index) => {
      if (product.is_fenbi_deduction == 1) {
        //能使用会员折扣的商品 busCanUseFenbiProductPrice + product.totalNewPrice

        // console.log("能使用粉币的商品金额-------------", product.totalNewPrice);

        busCanUseFenbiProductPrice = floatAdd(busCanUseFenbiProductPrice, product.totalNewPrice);
        busCanUseFenbiProductNum++;
      }
    });
  });
  //重新获取粉币能抵扣的金额和数量
  data = getJifenFenbiRule(busCanUseFenbiProductNum, busCanUseFenbiProductPrice, 2, data, data.isUseFenbi);
  // console.log(busCanUseFenbiProductPrice, "----", busCanUseFenbiProductNum)
  if (busCanUseFenbiProductPrice == 0 || busCanUseFenbiProductNum == 0 || data.isUseFenbi != 1) {//能使用粉币的商品总价和商品总数 = 0
    data.fenbiDiscountMoney = 0;
    data.isUseFenbi = 0;//关闭粉币选择
    return data;
  }

  if (data.fenbi == 0 || data.fenbi_money == 0) {
    data.fenbiDiscountMoney = 0;
    data.isUseFenbi = 0;//关闭粉币选择
    return data;
  }
  let jifenFenbiRule = data.jifenFenbiRule;//积分规则
  let useFenbiTotalPrice = 0;//已使用粉币的优惠金额
  let useFenbiTotalNum = 0;//已使用粉币的商品数量
  //循环店铺
  data.data.shopList.forEach((shop, index) => {
    let shopYouhuiHouTotalPrice = 0;//保存 店铺下 商品优惠后的总额
    let totalYouhuiMoney = 0;//保存订单下优惠的总额
    //循环商品
    shop.proList.forEach((product, index) => {
      let isEndCanUseFenbi = useFenbiTotalNum == busCanUseFenbiProductNum && useFenbiTotalPrice == busCanUseFenbiProductPrice;
      if (product.is_fenbi_deduction == 1 && !isEndCanUseFenbi) {
        let productTotalPrice = product.totalNewPrice;//商品优惠前的总价
        let productYouHuiHouTotalPrice = 0;//商品优惠后的总价
        let fenbiYouhuiPrice = 0;//粉币优惠的金额
        if (useFenbiTotalNum + 1 == busCanUseFenbiProductNum) {//最后一个能使用粉币的商品
          fenbiYouhuiPrice = floatSub(data.fenbi_money, useFenbiTotalPrice);//单个商品使用粉币优惠的金额 =  粉币优惠的总额 - 已使用粉币的优惠金额
        } else {
          //单个商品使用粉币优惠的金额 = （（商品的总价 / 能使用粉币的商品总价） * 粉币总共能优惠的金额）
          fenbiYouhuiPrice = floatMul(floatDiv(product.totalNewPrice, busCanUseFenbiProductPrice, 10), data.fenbi_money);
        }
        // if (productTotalPrice < fenbiYouhuiPrice) {
        //   fenbiYouhuiPrice = productTotalPrice;
        // }
        productYouHuiHouTotalPrice = floatSub(productTotalPrice, fenbiYouhuiPrice);
        if (productYouHuiHouTotalPrice < 0) {
          productYouHuiHouTotalPrice = 0;
        }
        // console.log("使用粉币后的商品金额,", productYouHuiHouTotalPrice)
        product.totalNewPrice = productYouHuiHouTotalPrice;

        useFenbiTotalPrice = floatAdd(useFenbiTotalPrice, fenbiYouhuiPrice);
        useFenbiTotalNum++;
        // console.log("粉币抵扣优惠后的价格：", product.totalNewPrice)

        shopYouhuiHouTotalPrice = floatAdd(shopYouhuiHouTotalPrice, product.totalNewPrice);
        totalYouhuiMoney = floatAdd(totalYouhuiMoney, fenbiYouhuiPrice);
      }
    });
    console.log("粉币优惠后的价格：", shopYouhuiHouTotalPrice, "--优惠了：", totalYouhuiMoney);
  });
  // console.log("粉币优惠的金额", useFenbiTotalPrice);
  data.fenbiDiscountMoney = useFenbiTotalPrice.toFixed(2)*1;
  // data.fenbiDiscountMoney = useFenbiTotalPrice;

  return data;
}
/**
 *  计算积分抵扣
 */
function caculationJifenDiscount(data) {
  let busCanUseJifenProductPrice = 0;//保存能使用粉币的商品总额
  let busCanUseJifenProductNum = 0;//保存能使用粉币的商品数量
  //循环店铺
  data.data.shopList.forEach((shop, index) => {
    //循环商品
    shop.proList.forEach((product, index) => {
      if (product.is_integral_deduction == 1) {
        //能使用积分抵扣的商品 busCanUseJifenProductPrice + product.totalNewPrice

        //console.log(product.totalNewPrice, " product.total_price")
        //统计能使用积分抵扣的商品总额
        busCanUseJifenProductPrice = floatAdd(busCanUseJifenProductPrice, product.totalNewPrice);
        //统计能使用积分抵扣的商品数量
        busCanUseJifenProductNum++;
      }
    });
  });
  data = getJifenFenbiRule(busCanUseJifenProductNum, busCanUseJifenProductPrice, 1, data, data.isUseJifen);
  // console.log("能使用积分的商品总额", busCanUseJifenProductPrice);
  if (busCanUseJifenProductNum == 0 || busCanUseJifenProductPrice == 0 || data.isUseJifen != 1) {
    data.jifenDiscountMoney = 0;
    data.isUseJifen = 0;//关闭积分选择
    return data;
  }
  // console.log("jifenNum", data.integral, busCanUseJifenProductPrice)
  if (data.integral == 0 || data.integral_money == 0) {
    data.jifenDiscountMoney = 0;
    data.isUseJifen = 0;//关闭积分选择
    return data;
  }
  let jifenFenbiRule = data.jifenFenbiRule;//积分规则
  let useJifenTotalPrice = 0;//已使用积分的优惠金额
  let useJifenTotalNum = 0;//已使用积分的商品数量
  let youhuiPrice = 0;
  //循环店铺
  data.data.shopList.forEach((shop, index) => {
    let shopProductNewTotal = 0;//保存 店铺下 商品优惠后的总额
    let totalYouhuiMoney = 0;//保存 订单下 商品优惠的金额
    //循环商品
    shop.proList.forEach((product, index) => {
      if (product.is_integral_deduction == 1) {
        let productTotalPrice = product.totalNewPrice;//商品优惠前的总价
        let productYouHuiHouTotalPrice;//商品优惠后的总价
        let jifenYouhuiPrice = 0;//积分优惠的金额
        //debugger
        if (useJifenTotalNum + 1 == busCanUseJifenProductNum) {
          /*    最后一个能使用积分的商品   */

          //单个商品使用积分优惠的金额 =  积分优惠的总额 - 已使用积分的优惠金额
          jifenYouhuiPrice = floatSub(data.integral_money, useJifenTotalPrice);
        } else {
          //单个商品使用积分优惠的金额 = （（商品的总价 / 能使用积分的商品总价） * 积分总共能优惠的金额）
          jifenYouhuiPrice = floatMul(floatDiv(product.totalNewPrice, busCanUseJifenProductPrice, 10), data.integral_money);
        }
        // if (productTotalPrice < jifenYouhuiPrice) {
        //   jifenYouhuiPrice = productTotalPrice;
        // }
        productYouHuiHouTotalPrice = floatSub(productTotalPrice, jifenYouhuiPrice);
        if (productYouHuiHouTotalPrice < 0){
          productYouHuiHouTotalPrice = 0;
        }
        // console.log("积分优惠的价格：", jifenYouhuiPrice);
        product.totalNewPrice = productYouHuiHouTotalPrice;

        useJifenTotalPrice = floatAdd(useJifenTotalPrice, jifenYouhuiPrice);//累积积分优惠的价格
        useJifenTotalNum++;
        // console.log("积分抵扣优惠后的价格：", product.totalNewPrice)

        shopProductNewTotal = floatAdd(shopProductNewTotal, product.totalNewPrice);
        totalYouhuiMoney = floatAdd(totalYouhuiMoney, jifenYouhuiPrice);
        console.log("积分优惠的价格：", jifenYouhuiPrice, "---优惠后：", product.totalNewPrice, "--原价：", product.product_price);
      }
    });
    // console.log("积分优惠后的价格：", shopProductNewTotal, "--优惠了：", totalYouhuiMoney, "元");
  });
  // console.log("积分抵扣优惠后的价格：", useJifenTotalPrice)
  data.jifenDiscountMoney = useJifenTotalPrice.toFixed(2)*1;
  return data;
}
//计算优惠券抵扣
function caculationYhqDiscount(data) {
  data.yhqDiscountMoney = 0;
  //循环店铺
  for (let i = 0; i < data.data.shopList.length; i++) {
    let shop = data.data.shopList[i];
    let coupons = data.yhqList[i];//选中的优惠券对象
    if (coupons == null || coupons == "") {//没有选中优惠券直接跳出循环
      // shop.selectCoupon = null;
      continue;
    }
    let canUseCouponProductPrice = 0;//能使用优惠券的商品金额
    let canUseCouponProductNum = 0;//能使用优惠券的商品数量
    shop.proList.forEach((product, index) => {//循环商品集合
      if (product.is_coupons == 1 && product.totalNewPrice > 0) {
        canUseCouponProductPrice = floatAdd(canUseCouponProductPrice, product.totalNewPrice);
        canUseCouponProductNum++;
      }
    });
    if (canUseCouponProductPrice == 0 || canUseCouponProductNum == 0) {//能使用优惠券的商品总价和商品总数 = 0  则跳出当前循环
      wx.showModal({
        title: '提示',
        content: "能使用优惠券的商品总额为0，暂没达到条件",
        showCancel: false,
      });
      data.yhqList[i] = "";
      // shop.selectCoupon = null;
      continue;
    }
    let cardFrom = coupons.couponsFrom;//优惠券来源（ 1 微信优惠券  2多粉优惠券 ）
    let cardType = coupons.cardType;//卡券类型 0折扣券 1减免券
    let addUse = coupons.addUser;//是否允许叠加 0不允许 1已允许 (多粉优惠券也可以)
    let couponNum = coupons.couponNum//叠加的数量
    let shopYouhuiHouTotalPrice = 0;//保存 店铺下 商品优惠后的总额
    if (cardType == 0 && data.isUseDiscount == 1) {
      wx.showModal({
        title: '提示',
        content: "会员折扣和折扣券不能同时使用",
        showCancel: false,
      });
      data.yhqList[i] = "";
      // shop.selectCoupon = null;
      continue;
    }
    // console.log("coupons", coupons)
    //计算店铺下使用商品优惠券的 优惠总额
    if (cardType == 0 && data.isUseDiscount != 1) {
      //计算店铺下 折扣券 优惠的总额
      let youhuiHouPrice = floatMul(canUseCouponProductPrice, coupons.discount);//折扣券优惠后的 商品金额
      shopYouhuiHouTotalPrice = floatSub(canUseCouponProductPrice, youhuiHouPrice);//店铺下商品使用优惠券 的优惠总额 = 能使用折扣券的商品总额 - 折扣优惠后的商品金额
    } else if (cardType == 1) {
      //计算店铺下 减免券 优惠的总额
      shopYouhuiHouTotalPrice = coupons.reduceCost;//店铺下商品使用优惠券 的优惠总额  = 减免券优惠的总额
      //判断是否多粉优惠券 且可以叠加
      if (cardFrom == 2 && addUse == 1 && couponNum > 1) {

        if (coupons.cashLeastCost > 0) {//使用优惠券的条件
          couponNum = floatDiv(canUseCouponProductPrice, coupons.reduceCost); // 优惠券的叠加数量 =  店铺下 能使用优惠券的商品总额 /  使用优惠券的条件
          couponNum = parseInt(couponNum);
        } else {
          //优惠的金额  乘以 叠加数量 （优惠的总额） 大于 能使用优惠券的商品数量
          if (coupons.reduceCost * couponNum > canUseCouponProductPrice) {
            let aa = floatDiv(canUseCouponProductPrice, coupons.reduceCost); //优惠券叠加的数量 =  店铺下能使用优惠券的商品总额 / 减免券优惠的金额
            couponNum = parseInt(couponNum);
          }
        }
        if (couponNum > coupons.couponNum) {
          couponNum = coupons.couponNum;
        }
        data.yhqList[i].useCouponNum = couponNum;
        shopYouhuiHouTotalPrice = floatMul(coupons.reduceCost, couponNum);
      }
      if (coupons.cashLeastCost > canUseCouponProductPrice) {//满减条件  大于能 使用优惠券的商品金额
        wx.showModal({
          title: '提示',
          content: "能使用优惠券的金额没有达到满减条件",
          showCancel: false,
        });
        data.yhqList[i] = "";
        continue;
      }
      if (shopYouhuiHouTotalPrice > canUseCouponProductPrice) {//优惠的总额  大于 能使用优惠券的商品金额，则 优惠券的金额 = 能使用优惠券的商品金额
        shopYouhuiHouTotalPrice = canUseCouponProductPrice;
      }
    }
    if (shopYouhuiHouTotalPrice == 0) {//优惠的金额 = 0 没必要计算
      // shop.selectCoupon = null;
      data.yhqList[i] = "";
      continue;
    }
    // console.log("shopYouhuiHouTotalPrice",shopYouhuiHouTotalPrice)
    let useCouponTotalPrice = 0;//已使用优惠券的商品金额
    let useCouponTotalNum = 0;//已使用优惠券的商品数量
    let shopProductNewTotal = 0;//保存订单优惠后的商品总额
    let totalYouhuiMoney = 0;//保存使用优惠券优惠的金额
    for (let j = 0; j < shop.proList.length; j++) {
      let product = shop.proList[j];
      let isEndCanUseYhq = useCouponTotalNum == canUseCouponProductNum && useCouponTotalPrice == shopYouhuiHouTotalPrice;
      if (product.is_coupons == 1 && !isEndCanUseYhq) {
        let productTotalPrice = product.totalNewPrice;//商品优惠前的总价
        let productYouHuiHouTotalPrice = productTotalPrice;//商品优惠后的总价
        let couponYouhuiPrice = 0;//优惠券优惠的金额
        //能使用优惠券的商品
        if (cardType == 0 && data.isUseDiscount != 1) {
          /* 折扣券的计算 */
          //计算单个商品优惠的价格（ 折扣券）
          productYouHuiHouTotalPrice = floatMul(productTotalPrice, coupons.discount);// 折扣券优惠后的 商品金额
          couponYouhuiPrice = floatSub(productTotalPrice, productYouHuiHouTotalPrice);//优惠的金额
        } else if (cardType == 1) {
          /* 减免券的计算 */
          //单个商品的总价/ 店铺下能使用优惠券的商品总价  * 能够优惠的价格 （减免券）
          couponYouhuiPrice = floatMul(floatDiv(productTotalPrice, canUseCouponProductPrice, 10), shopYouhuiHouTotalPrice);
          productYouHuiHouTotalPrice = floatSub(productTotalPrice, couponYouhuiPrice);
        }
        if (productYouHuiHouTotalPrice < 0) {//商品优惠后的商品总额 小于 0
          productYouHuiHouTotalPrice = 0;//优惠后的价格  = 0
          couponYouhuiPrice = productTotalPrice;//商品优惠的金额  = 优惠前的总额
        }
        if (useCouponTotalNum + 1 == canUseCouponProductNum) {//最后一个商品
          couponYouhuiPrice = floatSub(shopYouhuiHouTotalPrice, useCouponTotalPrice);//商品优惠的金额 =  店铺下商品使用优惠券 的优惠总额
        }
        if (couponYouhuiPrice + useCouponTotalPrice > shopYouhuiHouTotalPrice) {//商品优惠的金额 + 已经优惠的商品总价 > 店铺下优惠的总额
          couponYouhuiPrice = floatSub(shopYouhuiHouTotalPrice, useCouponTotalPrice);//商品优惠的金额 = 店铺下优惠的总额 - 已经优惠的总价
          productYouHuiHouTotalPrice = floatSub(productTotalPrice, couponYouhuiPrice);//商品优惠后的总价 = 商品优惠前的总价 - 商品优惠的金额
        }
        useCouponTotalPrice += couponYouhuiPrice;
        useCouponTotalNum++;
        product.totalNewPrice = productYouHuiHouTotalPrice;

        totalYouhuiMoney = floatAdd(totalYouhuiMoney, couponYouhuiPrice);
        // console.log("couponYouhuiPrice",couponYouhuiPrice)
        shopProductNewTotal = floatAdd(shopProductNewTotal, product.totalNewPrice);
        console.log("优惠券优惠后的价格：", product.totalNewPrice, "优惠了：", couponYouhuiPrice)
      }
    }
    console.log("优惠后价格：", shopProductNewTotal, "优惠券总共能优惠", totalYouhuiMoney);
    totalYouhuiMoney = totalYouhuiMoney.toFixed(2)*1;
    data.yhqDiscountMoney = floatAdd(data.yhqDiscountMoney, totalYouhuiMoney);
  }
  return data;
}
/**
 * 重组积分粉币
 * @param {能使用抵扣的商品数量} canUseDiscountNum 
 * @param {能使用抵扣的商品金额} canUseDiscountMoney 
 * @param {类型 1 积分 2 粉币} type 
 */
function getJifenFenbiRule(canUseDiscountNum, canUseDiscountMoney, type, data, isSelect) {
  let jifenFenbiRule = data.data.jifenFenbiRule;
  if (jifenFenbiRule == null || jifenFenbiRule == "") {
    return data;
  }

  if (canUseDiscountMoney > 0) {
    //  canUseDiscountMoney = floatNumber(canUseDiscountMoney, 2);
    canUseDiscountMoney = canUseDiscountMoney.toFixed(2)*1;
  }
  if (type == 1) {
    console.log(canUseDiscountMoney, "能使用积分的商品总额")
    if (jifenFenbiRule.jifenStartMoney > 0 && jifenFenbiRule.jifenStartMoney < canUseDiscountMoney && canUseDiscountMoney > 0) {
      //积分
      if (canUseDiscountMoney <= data.jifenMoneyOld && data.jifenMoneyOld > 0) {//起兑的商品金额小于
        data.integral = floatMul(jifenFenbiRule.jifenRatio, canUseDiscountMoney);
        data.integral_money = canUseDiscountMoney;

        data.integral = floatNumber(data.integral, 2);
      } else {
      }
      data.jifenDisabled = 0;//启用积分抵扣选择
    } else {
      data.jifenDisabled = 1;//禁用积分抵扣选择
      data.isUseJifen = 0;//关闭积分选择
      // data.integral = 0;
      // data.integral_money = 0;
      if (isSelect) {
        //选中抵扣才能提醒
        wx.showModal({
          title: '提示',
          content: '能使用积分抵扣的商品金额为' + canUseDiscountMoney + '，没达到起兑金额',
          showCancel: false,
        });
      }
    }

  } else if (type == 2) {
    console.log(canUseDiscountMoney, "能使用粉币的商品总额")
    //粉币
    if (jifenFenbiRule.fenbiStartMoney > 0 && jifenFenbiRule.fenbiStartMoney < canUseDiscountMoney && canUseDiscountMoney > 0) {
      //显示积分抵扣的按钮
      let fenbiNum = data.fenbi || 0;
      let fenbiMoney = data.fenbi_money || 0;
      if (fenbiMoney > 0) {
        if (canUseDiscountMoney < jifenFenbiRule.fenbiStartMoney) {
          canUseDiscountMoney = jifenFenbiRule.fenbiStartMoney;
        }
        //canUseDiscountMoney / jifenFenbiRule.fenbiStartMoney
        let fenbiMoney = floatDiv(canUseDiscountMoney, jifenFenbiRule.fenbiStartMoney);
        fenbiMoney = parseInt(fenbiMoney)*10;
        data.fenbi = floatMul(jifenFenbiRule.fenbiRatio, fenbiMoney);
        //fenbiMoney * jifenFenbiRule.fenbiStartMoney
        //data.fenbi_money = floatMul(fenbiMoney, jifenFenbiRule.fenbiStartMoney);

        data.fenbi = floatNumber(data.fenbi, 2);
        data.fenbi_money = floatNumber(fenbiMoney, 2);
      }
      data.fenbiDisabled = 0;//启用粉币抵扣选择
    } else {
      data.fenbiDisabled = 1;//禁用粉币抵扣选择
      data.isUseFenbi = 0;//关闭粉币选择
      // data.fenbi = 0;
      // data.fenbi_money = 0;
      if (isSelect) {
        //选中抵扣才能提醒
        wx.showModal({
          title: '提示',
          content: '能使用粉币抵扣的商品金额为' + canUseDiscountMoney + '，没达到起兑金额',
          showCancel: false,
        });
      }
    }
  }
  return data;
}
//加法
function floatAdd(arg1, arg2) {
  var r1, r2, m;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2));
  // return (arg1 * m + arg2 * m) / m;
  return arg1 + arg2;
}

//减    
function floatSub(arg1, arg2) {
  var r1, r2, m, n;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2));
  //动态控制精度长度    
  n = (r1 >= r2) ? r1 : r2;
  n = n > 10 ? 10 : n;
  let num = ((arg1 * m - arg2 * m) / m).toFixed(n);
  //console.log(n,"n",arg1-arg2,num);
  // return parseFloat(num);
  return arg1 - arg2;
}
//乘    
function floatMul(arg1, arg2) {
  var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
  try { m += s1.split(".")[1].length } catch (e) { }
  try { m += s2.split(".")[1].length } catch (e) { }
  // return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  return arg1 * arg2;
}
//除   
function floatDiv(arg1, arg2) {
  var t1 = 0, t2 = 0, r1, r2;
  try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
  try { t2 = arg2.toString().split(".")[1].length } catch (e) { }

  r1 = Number(arg1.toString().replace(".", ""));

  r2 = Number(arg2.toString().replace(".", ""));
  // return (r1 / r2) * Math.pow(10, t2 - t1);
  return arg1 / arg2;
}
function floatNumber(num, len) {
  var bb = num + "";
  len = len + 1;
  if (bb.indexOf('.') > 0) {
    var dian2 = bb.indexOf('.') + len;
    num = bb.substring(0, dian2) * 1;
  }
  return num;
}

module.exports = {
  calculateOrder: calculateOrder
}