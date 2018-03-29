var app = getApp();

Page({
    data: {
        user: {
            userInfo: {},
            sessionid: ""
        },

        checkRes: 0,// 前端使用( 1已经测试过， 2没有测试) 页面显示使用

        AHResting: "",
        AHRnning: "",
        SystolicPressure: "",
        DiastolicPressure: "",
        AHCreateDate:"",


        resultShow:"",
        statusT:"请输入血压值并保持佩戴手环"

    },
    onLoad: function () {
        var self = this;
        app.util.loadingFun();

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
        
        this.getAjaxData();
    },
    
    //查询评测结果
    getAjaxData: function () {
        var self = this;
        var session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.CardioRiskGet,
            header: { "session_id": session_id },
            method: "POST",
            success: function (res) {
                var res = res.data;
                if (res.IsSuccess){
                    var datas = JSON.parse(res.data);
                    self.setData({
                        resultShow: res.Message,

                        AHResting: datas.AHResting||"",
                        AHRnning: datas.AHRnning || "",
                        SystolicPressure: datas.SystolicPressure||"",
                        DiastolicPressure: datas.DiastolicPressure||"",
                        AHCreateDate: datas.AHCreateDate.split("T")[0],
                        checkRes: 1
                    })
                }else{
                    self.setData({
                        checkRes: 2
                    })
                }
            },
            fail: function(){
                self.setData({
                    checkRes: 2
                })
            },
            complete: function () {
                wx.hideLoading();
                
            }
        });
    },
    startCheck : function(){
        var self = this;
        if (self.data.DiastolicPressure==""){
            app.util.showModalFun("请输入您的舒张血压");
            return false;
        }

        if (self.data.SystolicPressure == ""){
            app.util.showModalFun("请输入您的收缩血压");
            return false;
        }
        self.commitData();
    },
    commitData: function () {
        var self = this;
        var session_id = self.data.user.sessionid;

        var param = {
            SystolicPressure: self.data.DiastolicPressure ||"",
            DiastolicPressure: self.data.SystolicPressure || ""
        };
        self.setData({
            statusT:"检测中，请稍后",
        })
        wx.request({
            url: app.util.ajaxUrl.CardioRisk,
            data: param,
            method: "POST",
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;
                if (res.IsSuccess) {
                    var datas = JSON.parse(res.data);
                    self.setData({
                        AHResting: datas.AHResting || "",
                        AHRnning: datas.AHRnning || "",
                        SystolicPressure: datas.SystolicPressure || "",
                        DiastolicPressure: datas.DiastolicPressure || "",
                        AHCreateDate: datas.AHCreateDate.split("T")[0],
                        
                        resultShow: res.Message,
                        checkRes: 1
                    })
                }else{
                    app.util.showModalFun("系统未计算出血压状况");
                }

            },
            fail:function(){
                app.util.showModalFun("系统未计算出血压状况");
            },
            complete: function () {
                wx.hideLoading();
                self.setData({
                    statusT: "请输入血压值并保持佩戴手环"
                })
            }
        });
    },
    refreshCheck: function(){
        var self = this;

        self.setData({
            
            SystolicPressure: "",
            DiastolicPressure:"",
            checkRes: 2,
        })
    },
    disIput: function(e){
        this.setData({
            DiastolicPressure: e.detail.value ||""
        })
    },
    sysIput: function(e){
        this.setData({
            SystolicPressure: e.detail.value || ""
        })
    }
})