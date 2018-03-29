var app = getApp();
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
    },
    onLoad: function () {
        var self = this;
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            })
        });
    },
})