var app = getApp();
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        sleepMM: [300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900], //睡眠分钟时间，提交后台使用
        // 弹框数据
        sleepArr: ["5小时", "5小时30分钟", "6小时", "6小时30分钟", "7小时", "7小时30分钟", "8小时", "8小时30分钟", "9小时", "9小时30分钟", "10小时", "10小时30分钟", "11小时", "11小时30分钟", "12小时", "12小时30分钟", "13小时", "13小时30分钟", "14小时", "14小时30分钟", "15小时"],//睡眠小时分钟时间，页面显示使用
        //数据显示
        infro:{
            StepsDay:"",
            TotalMileageDay: "",
            GoodDays: "",

            Points:"",
            AimSleep:"",
            AimSteps:"",
            AimWeight:"",

            DeviceBind:false, //服务器的是否连接，现在前端先判断
            PhoneNumber:"",
            showSleep:""
        },
        //注意修改
        isBindDevive: false,
        isFacility: false
    },
    onLoad: function () {
        var self = this;
        app.util.loadingFun();
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
    onShow: function(){
        var self = this;
        self.getPersonData();
        console.log("连接状态", app.globalData.isConnectBlue);

        if (app.globalData.isConnectBlue){
            self.setData({
                isBindDevive: true
            })
        }
    },
    //获取个人信息
    getPersonData: function () {
        var self = this,
            params = {},
            session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.GetUser || "",
            header: { 'content-type': 'application/json', "session_id": session_id },
            success: function (res) {
                console.log(res.data);
                var res = res.data;
                if (res) {
                    //处理数据
                    self.handlerData(res);
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },
    handlerData: function (res) {
        var self = this;
        var sl = {
            Index : -1,
            AimSleep :"8小时"//默认值
        };

        //睡眠时间需要转换显示
        for (var i = 0; i < self.data.sleepMM.length; i++) {
            if (self.data.sleepMM[i] == parseInt(res.AimSleep)) {
                sl.Index = i;
                break;
            }
        }
        if (sl.Index != -1){
            sl.AimSleep = self.data.sleepArr[sl.Index];
        }

        self.setData({
            infro: {
                StepsDay: res.StepsDay || 0,
                TotalMileageDay: parseInt(res.TotalMileageDay)  || "0.00",
                GoodDays: res.GoodDays || 0,
                Points: res.Points || 0,

                showSleep: sl.AimSleep || "8小时",
                AimSteps: res.AimSteps|| 10000,
                AimWeight: res.AimWeight || 100,

                DeviceBind: res.DeviceBind || false,
                PhoneNumber: res.PhoneNumber || ""

            }
        })
    },
    
    deviceJump: function(){
        if (this.data.isBindDevive){
            wx.navigateTo({
                url: '../../facility/facility/facility',
            })
        }else{
            wx.navigateTo({
                url: '../../facility/addnew/n?type=2',
            })
        }
    }
})