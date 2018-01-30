// pages/addAddress/addAddress.js
var app = getApp();
var id = 0;
Page({
  data:{
    provinceList: [],        //后台传的省份数据
    provinces:[],            //拼接的省份名称
    provinceNum: -1,          //当前选中的哪个省份
    address:{},              //编辑地址信息

    cityList: [],
    citys: [],
    cityNum: -1,

    areaList: [],
    areas: [],
    areaNum: -1,

    memDefault: 2,              //是否默认,1-默认地址 2不是默认
    memName: "",                //收货人姓名
    memPhone: "",               //收货人联系方式
    memAddress: "",             //收货人地址
    memProvince: 0,             //省份id
    memCity: 0,                 //城市id
    memArea: 0,                 //区id
    memLatitude: "",            //纬度
    memLongitude: "",           //经度

    repeatSubmit: 0,
    isAdvert: wx.getStorageSync('isAdvert'),
    isJuliFreight: false,//true 按距离计算运费，因此要从地图选择详细地址
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    id = options.id;
    wx.request({
      url: app.globalData.http + 'toAddress.do',
      data: {
        id: id || "",
        busUserId: app.globalData.busId,
        memberId: wx.getStorageSync('memberId'),
        shopId: wx.getStorageSync('shopId')
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var provinceNum = -1,
            cityNum = -1,
            areaNum = -1,
            memProvince = 0;
            
        if(res.data.address){
          memProvince = res.data.address.memProvince;
        }

        self.data.provinces = [];
        res.data.provinceList.forEach(function(e,i){
          self.data.provinces.push(e.city_name)
          if(e.id == memProvince)provinceNum = i;
        })
        self.setData({
          provinceList: res.data.provinceList, 
          provinces: self.data.provinces, 
          provinceNum: provinceNum,
          isJuliFreight: res.data.isJuliFreight == 1 ? true : false
        })
        // console.log(self.data.isJuliFreight)

        if(res.data.address){
          var _address = res.data.address;
          var memCity = _address.memCity,
            memArea = _address.memArea;
          self.setData({
            address: _address,
            memName: _address.memName,                 //收货人姓名
            memPhone: _address.memPhone,               //收货人联系方式
            memAddress: _address.memAddress,           //收货人地址
            memProvince: memProvince,
            memCity: memCity,
            memArea: memArea,
            memLatitude: _address.memLatitude,
            memLongitude: _address.memLongitude,
            memDefault: _address.memDefault
          })

          wx.request({
            url: app.globalData.http + 'queryCity.do',
            data: {
              id: memProvince
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              self.data.citys = [];              
              res.data.forEach(function(e,i){
                self.data.citys.push(e.city_name)
                if(e.id == memCity)cityNum = i;
              })
              self.setData({cityList: res.data, citys: self.data.citys, cityNum: cityNum})
            }
          })

          wx.request({
            url: app.globalData.http + 'queryCity.do',
            data: {
              id: memCity
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              self.data.areas = [];
              res.data.forEach(function(e,i){
                self.data.areas.push(e.city_name)
                if(e.id == memArea)areaNum = i;
              })
              self.setData({
                areaList: res.data, 
                areas: self.data.areas,
                areaNum: areaNum
              })
            }
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
  bindchangeProvince: function(e){
    var self = this,
        num = e.detail.value;
      
    if(self.data.provinceNum == num)return;

    self.setData({provinceNum: num, cityNum:-1, areaNum:-1, citys:[], areas:[]})
    self.data.memProvince = self.data.provinceList[num].id;
    wx.request({
      url: app.globalData.http + 'queryCity.do',
      data: {
        id: self.data.memProvince
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        
        res.data.forEach(function(e){
          self.data.citys.push(e.city_name)
        })
        self.setData({cityList: res.data, citys: self.data.citys})
      }
    })
  },
  bindchangeCity: function(e){
    var self = this,
        num = e.detail.value;

    self.setData({cityNum: num, areaNum:-1, areas:[]})
    self.data.memCity = self.data.cityList[num].id;
    wx.request({
      url: app.globalData.http + 'queryCity.do',
      data: {
        id: self.data.memCity
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        res.data.forEach(function(e){
          self.data.areas.push(e.city_name)
        })
        self.setData({areaList: res.data, areas: self.data.areas})
      }
    })
  },
  bindchangeArea: function(e){
    var self = this,
        num = e.detail.value;

    self.setData({areaNum: num})
    self.data.memArea = self.data.areaList[num].id;
  },
  bindinputName: function(e){
    this.data.memName = e.detail.value;
  },
  bindinputAddress: function(e){
    this.data.memAddress = e.detail.value;
    // var self = this;
    // wx.chooseLocation({
    //   success: function(e){
    //     this.data.memAddress = e.detail.value;
    //   }
    // })
  },
  bindLocation: function (e) {
    var self = this;
    if (self.data.isJuliFreight){
      //弹出地址选择
      wx.chooseLocation({
        success: function(e){
          if (e.name == ""){
            wx.showModal({ title: '提示', content: '请重新选择详细地址', showCancel: false });
            return false;
          }
          var address = self.data.address;
          address.memAddress = e.name;
          self.setData({
            memLongitude: e.longitude,
            memLatitude: e.latitude,
            memAddress: e.name,
            address: address
          });
          //console.log(self.data.address,"self.data.address.memAddress")
        }
      })
    }
  },
  bindinputPhone: function(e){
    this.data.memPhone = e.detail.value;
  },
  bindtapSubmit: function(){
    var self = this;    
    if(self.data.memName == ""){
      wx.showModal({title: '提示',content: '收货人不能为空',showCancel: false})
      return false;
    }else if(self.data.memPhone == ""){
      wx.showModal({title: '提示',content: '联系电话不能为空',showCancel: false})
      return false;
    }else if(self.data.provinceNum == -1){
      wx.showModal({title: '提示',content: '请选择省',showCancel: false})
      return false;
    }else if(self.data.cityNum == -1){
      wx.showModal({title: '提示',content: '请选择市',showCancel: false})
      return false;
    }else if(self.data.areaNum == -1){
      wx.showModal({title: '提示',content: '请选择区',showCancel: false})
      return false;
    }else if(self.data.memAddress == ""){
      wx.showModal({title: '提示',content: '详细地址不能为空',showCancel: false})
      return false;
    }

    var _myData = self.data;
    if (self.data.isJuliFreight) {
      if (_myData.memLatitude == "" || _myData.memLongitude == "") {
        wx.showModal({ title: '提示', content: '请重新选择详细地址', showCancel: false })
        return false;
      }
    }

    if (self.data.repeatSubmit == 0) self.data.repeatSubmit = 1;
    else return false;

    console.log("防止重复提交")
    console.log(self.data)

    wx.request({
      url: app.globalData.http + 'addressSubmit.do',
      data: {
        id: id || "",
        memDefault: self.data.memDefault,
        memName: self.data.memName,
        memPhone: self.data.memPhone,
        memAddress: self.data.memAddress,
        memProvince: self.data.memProvince,
        memCity: self.data.memCity,
        memArea: self.data.memArea,
        dfMemberId: wx.getStorageSync('memberId'),
        memLongitude: self.data.memLongitude,
        memLatitude: self.data.memLatitude
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 1){
          wx.navigateBack({delta: 1})
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.errorMsg,
            showCancel: false,
          })
        }
        self.data.repeatSubmit = 0;
      }
    })
  }
})