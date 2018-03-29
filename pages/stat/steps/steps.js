var app = getApp();

Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        percent:0,
        isStyle: {
            isLDeg: "rotate(" + (18 / 5) * 0 + "deg)",
            cirClass: "",
            rightClass: "wth0"
        },
        stepData: {
            ASSteps: 0, //总步数
            ASMileage: 0,//公里
            ASCAL: 0,// 热量
            ASTimeTotal:0
        },
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
        //动态修改标题
        wx.setNavigationBarTitle({
            title: "今日步数"//页面标题为路由参数
        })
    },
    onShow: function () {
        this.getStepsData();
    },
    getStepsData: function(){
        var self = this,
            session_id = self.data.user.sessionid;

        var params = {
            // "ASStartTime": app.util.getTodayDate(),
            "ASDataType": "0"
        };
        wx.request({
            url: app.util.ajaxUrl.AppStepsList,
            data: params,
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;
                
                if (res.list && res.list.length > 0) {
                    var datas = res.list[0];
                    var percent = 0;
                    if (datas.ASSteps && datas.ASAimSteps){
                        percent = Math.floor((parseInt(datas.ASSteps) / parseInt(datas.ASAimSteps)) * 100) || 0;
                    }
                    
                    if (percent > 50) {

                        var per = percent;
                        if (percent > 100) {
                            per = 100;
                        }

                        self.setData({
                            isStyle: {
                                isLDeg: "rotate(" + (18 / 5) * per + "deg)",
                                cirClass: "clip-auto",
                                rightClass: ""
                            }
                        });
                    } else {
                        self.setData({
                            isStyle: {
                                isLDeg: "rotate(" + (18 / 5) * percent + "deg)",
                                cirClass: "",
                                rightClass: "wth0"
                            }
                        });
                    }

                    datas.ASTimeTotal = parseInt(datas.ASWalkingTime) + parseInt(datas.ASRnningTime) || 0;
                    self.setData({
                        percent: percent,
                        stepData : datas
                    }); 
                }else{
                    
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    }
})