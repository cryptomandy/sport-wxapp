var app = getApp();
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        isShadow: false,
        checkRes: 1 ,// 前端使用( 1已经测试过， 2没有测试)
    },
    onLoad: function () {
        var self = this;
        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            })
        });
    },
    //测试前提示
    CheckTipFun: function(){
        var self = this;
        self.setData({
            isShadow: true
        })
    },
    startCheckFun: function(){
        var self = this;
        wx.navigateTo({
            url: '../sportscheck/check',
        })
    },
    closeShadow : function(){
        var self = this;
        self.setData({
            isShadow: false
        })
    }
})