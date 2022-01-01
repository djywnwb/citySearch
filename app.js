// app.js
App({
  onLaunch() {
  //  连接数据库
    wx.cloud.init({
      env: 'djywnwb-8gpcl0d1c19830b8',
      traceUser: true
    })
  },
  globalData: {
    userInfo: null
  }
})