var app = getApp();

Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        pageId : ""
        
    },
    onLoad: function (conf) {
        this.setData({
            pageId: conf.pageId
        })
        console.log(conf.pageId)
    },
    onShow: function (){
        var self = this;
        wx.showLoading({
            title: "努力加载中",
            mask: false,
            success: function () {
            }
        });
        

        setTimeout(function () {
            wx.hideLoading();
        }, 300)
    }
})