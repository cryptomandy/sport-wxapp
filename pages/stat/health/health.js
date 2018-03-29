var app = getApp();
// 页面兼容三种状态: 1. 没有测试 2.正在测试  3.已经有结果  1,2,3前端用
//小程序中一个页面需要中需要显示和隐藏的模块不要用wx：if去判断，重新渲染比较慢，性能耗损比较大，用hidden判断
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        // 显示状态
        hStatus: 0,  //1. 没有测试 2.正在测试  3.已经有结果
        height: "",
        weight:"",

        BMINum :0,
        BMItip:""
    },
    onLoad: function () {
        var self = this;
        app.util.loadingFun(); //加载提示
        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            })
        });
    },
    onShow: function(){
        var self = this;
        self.getUserBMI();
    },
    startCheck: function(){
        this.setData({
            hStatus: 2
        })
    },
    //判断是否检测过
    getUserBMI: function(){
        var self = this;
        var session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.GetBMI,
            header: { "session_id": session_id},
            success: function (res) {
                var res = res.data;
                if (res && res.IsSuccess) {
                    
                    self.setData({
                        BMItip: res.Message,
                        BMINum: res.data.replace(/,/g,""),
                        hStatus: 3//显示结果
                    })
                }else{
                    self.setData({
                        hStatus: 1//没有测试
                    })
                }
            },
            fail: function(){
                self.setData({
                    hStatus: 1//没有测试
                })
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

    //计算检测结果
    startCalculate: function(){
        var self  =  this,
            params = {};
        var reg = /^(?!0+(\.0+)?$)\d+(\.\d+)?$/;

        if (self.data.height == "" || !reg.test(self.data.height)){
            if (self.data.height == ""){
                app.util.showModalFun("请输入身高");
            }else{
                app.util.showModalFun("身高请输入数字");
            }
            return false;
        }
        if (self.data.weight == "" || !reg.test(self.data.weight)){
            if (self.data.weight == "") {
                app.util.showModalFun("请输入体重");
            } else {
                app.util.showModalFun("身高请输入数字");
            }
            return false;
        }
        params.AMHeight = parseFloat(self.data.height) || 0;
        params.AMWeight = parseFloat(self.data.weight) || 0;

        var session_id = self.data.user.sessionid;
        app.util.loadingFun(); //加载提示
        wx.request({
            url: app.util.ajaxUrl.BMIModify,
            data: params,
            method: "Post",
            header: { 'content-type': 'application/json',"session_id": session_id},
            success: function(res){
                wx.hideLoading();
                var res = res.data;
                if (res && res.IsSuccess){

                    self.setData({
                        BMItip: res.Message,
                        BMINum: res.data,
                        hStatus: 3//显示结果
                    })
                }
            },
            complete: function(){

            }
        });
    },
    refreshCheck: function(){
        this.setData({
            hStatus: 2,
            height: "",
            weight:""
        })
    },
    heightInput: function(e){
        this.setData({
            height:e.detail.value
        })
    },
    weightInput: function(e){
         this.setData({
            weight: e.detail.value
        })
    }
})