var app = getApp();

Page({
    data: {
        user: {
            userInfo: {},
            sessionid: ""
        },
        percent: 0, //百分比
        stepData: {
            ASSteps: 0, //总步数
            ASMileage: 0,//公里
            ASCAL: 0// 热量
        },
        isStyle: {
            isLDeg: "rotate(" + (18 / 5) * 0 + "deg)",
            cirClass: "",
            rightClass: "wth0"
        },

        detail:{
            ASSteps:  "", //总步数
            ASMileage: "",//公里
            ASCAL: "",// 热量

            APStartTime:"",
            APScore:"",

            AHStartTime:"",
            AHResting:"",

            BMITime:"",
            BMI:""
        },
        hhmm:{
            sleepT:"",
            brainT:"",
            BmiT:"",
        }
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

    onShow: function () {
        var self = this;
        self.getStepsData();
    },

    getStepsData: function () {
        var self = this;
        var session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.AppStatistics || "",
            header: { "session_id": session_id },
            success: function (res) {
                var datas = res.data;

                if (datas) {
                    var percent = 0;
                    if (datas.ASSteps && datas.ASAimSteps){

                        percent = Math.floor((parseInt(datas.ASSteps) / parseInt(datas.ASAimSteps)) * 100);
                    }
                    
                    if (percent > 50) {
                        var per = percent;
                        if (percent > 100){
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

                    var obj = {
                        APStartTime:"",
                        AHStartTime:"",
                        BMITime:""
                    };
                    if (datas.APStartTime && datas.APStartTime != "" && datas.APStartTime.indexOf("NaN") < 0){
                        obj.APStartTime = self.getTimeHHMM(datas.APStartTime) || "";
                    }
                    if (datas.AHStartTime && datas.AHStartTime != "" && datas.AHStartTime.indexOf("NaN") < 0) {
                        obj.AHStartTime = self.getTimeHHMM(datas.AHStartTime) || "";
                    }
                    if (datas.BMITime && datas.BMITime != "" && datas.BMITime.indexOf("NaN") < 0) {
                        obj.BMITime = self.getTimeHHMM(datas.BMITime) || "";
                    }
                    self.setData({
                        hhmm: {
                            sleepT: obj.APStartTime,
                            brainT: obj.AHStartTime,
                            BmiT: obj.BMITime 
                        }
                    });


                    datas.APStartTime = self.getMTDate(datas.APStartTime);
                    datas.AHStartTime = self.getMTDate(datas.AHStartTime);
                    datas.BMITime = self.getMTDate(datas.BMITime);

                    datas.APScore && datas.APScore != null ? datas.APScore = parseInt(datas.APScore) :"";
                    datas.AHResting && datas.AHResting != null ? datas.AHResting = parseInt(datas.AHResting) : "";
                    datas.BMI && datas.BMI != null ? (datas.BMI = (datas.BMI).toFixed(2)) : "";

                    self.setData({
                        percent: percent,
                        stepData: {
                            ASSteps: datas.ASSteps || 0, //总步数
                            ASMileage: datas.ASMileage || 0,//公里
                            ASCAL: datas.ASCAL || 0// 热量
                        },
                        detail: datas,
                    });
                }else{
                    
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },
    
    jumpSteps: function(){
        var self = this;
        wx.navigateBack({
            url: '../steps/steps'
        })
    },
    //获取时分
    getTimeHHMM: function (time) {
        var newTime = new Date(time.replace("T", " ").replace(/\-/g, "/")),
            hh = newTime.getHours(),
            mm = newTime.getMinutes();

        hh < 10 ? hh = ("0" + hh) : hh;
        mm < 10 ? mm = ("0" + mm) : mm;
        return hh + ":" + mm;
    },
    getMTDate: function (time) {
        if(time){
            var days = new Date(time.replace("T", " ").replace(/\-/g, "/"));
        }else{
            var days = new Date();
        }
    
        var yy = days.getFullYear(),
            mm = (days.getMonth() + 1),
            dd = days.getDate();
        mm < 10 ? (mm = "0" + mm) : mm;
        dd < 10 ? (dd = "0" + dd) : dd;

        var dates = mm + "月" + dd +"日";
        return dates;
    }
})