function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function login(app,callback){
  if (wx.getStorageSync('memberId')&&callback){
    callback()
  }else{
    wx.login({ //login流程
      success: function (res) { //登录成功
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({
            success: function (res1) {
              console.log("获取用户信息成功");
              wx.request({
                url: app.globalData.domain + '/wxapplet/79B4DE7C/applet_grant.do',
                //url: app.globalData.http + 'login.do',
                data: {
                  busId: app.globalData.busId,
                  js_code: code,
                  appid: app.globalData.appid,//app.globalData.appid,//'wxc71d3e2f77e4109f',
                  rawData: res1.rawData,
                  style: app.globalData.style
                },
                method: 'GET',
                header: {
                  'content-type': 'application/json'
                },
                success: function (res2) {
                  if (res2.data.success) {
                  //if (!res2.data.success) {
                    //登录成功
                    wx.setStorageSync('phone', res2.data.member.phone);
                    wx.setStorageSync('memberId', res2.data.memberId);
                    // wx.setStorageSync('phone', 15017934717);
                    // wx.setStorageSync('memberId', 1225352);
                    wx.setStorageSync('appid', app.globalData.appid);
                    wx.setStorageSync('isAdvert', res2.data.isAdvert);
                    if (callback) callback(res2)
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '授权失败!',
                      showCancel: false,
                    })
                  }
                }
              })
            },
            fail: function (e) {
              wx.showModal({
                title: '提示',
                content: '获取用户信息失败！',
                showCancel: false,
              })
            }
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '登录失败！',
          showCancel: false,
        })
      }
    });
  }
}

module.exports = {
  formatTime: formatTime,
  login: login
}
