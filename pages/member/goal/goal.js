var app = getApp();
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        // 弹框组件
        spIndex: 7,//运动 默认10000步
        sleepIndex: 6, //睡眠
        wIndex: 15, //体重
        
        sleepMM: [300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900], //睡眠分钟时间，提交后台使用
        // 弹框数据
        sleepArr: ["5小时", "5小时30分钟", "6小时", "6小时30分钟", "7小时", "7小时30分钟", "8小时", "8小时30分钟", "9小时", "9小时30分钟", "10小时", "10小时30分钟", "11小时", "11小时30分钟", "12小时", "12小时30分钟", "13小时", "13小时30分钟", "14小时", "14小时30分钟", "15小时"],//睡眠小时分钟时间，页面显示使用
        wightArr: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
        sportArr: [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000, 36000, 37000, 38000, 39000, 40000],  //步数
        isShow: false

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
        self.getPersonData();
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
                var res = res.data;
                if (res) { //处理数据
                    self.handlerData(res);
                }
            },
            complete: function(){
                wx.hideLoading();
            }
        })
    },
    handlerData: function (res){
        var self = this;
        var judgeObj = {
            AimSleep: res.AimSleep,
            AimSteps: res.AimSteps,
            AimWeight: res.AimWeight
        };
        for (var key in judgeObj) {
            if (judgeObj[key] == 0 || judgeObj[key] == "") {
                self.setData({
                    isShow: true
                })
            };
        }
        
        //遍历每一个身高，体重，和运动目标
        var AimSleep = parseInt(res.AimSleep),
            AimSteps = parseInt(res.AimSteps),
            AimWeight = parseInt(res.AimWeight);

        if (AimSleep!= self.data.sleepMM[self.data.sleepIndex]){
            for (var i = 0; i < self.data.sleepMM.length; i++){
                if (self.data.sleepMM[i] == AimSleep){
                    self.setData({
                        sleepIndex: i
                    })
                    break;
                }
            }
        }
        if (AimSteps != self.data.sportArr[self.data.spIndex]) {
            for (var i = 0; i < self.data.sportArr.length; i++) {
                if (self.data.sportArr[i] == AimSteps) {
                    self.setData({
                        spIndex: i
                    })
                    break;
                }
            }
        }
        if (AimWeight != self.data.wightArr[self.data.wIndex]) {
            for (var i = 0; i < self.data.wightArr.length; i++) {
                if (self.data.wightArr[i] == AimWeight) {
                    self.setData({
                        wIndex: i
                    })
                    break;
                }
            }
        }
    },
    //生成弹框显示的数据
    getShowData: function(){

        var self = this;
        self.setData({
            sleepArr: self.getHourData()
        });
        self.data.wightArr = [];
        for (var i = 35; i < 151; i++) {
            self.data.wightArr.push(i);
        }
        console.log(JSON.stringify(self.data.wightArr));

        self.data.sportArr = [];
        for (var i = 3; i < 41; i++) {
            self.data.sportArr.push(i * 1000);
        }
        console.log(JSON.stringify(self.data.sportArr));
    },
    getHourData: function(type){
        var dataArr = [];
        var arrMm = [];
        for (var i = 54; i < 180; i++) {  //间隔30分钟
            var str = "";
            if (i == 54) {
                i = i + 6;
            } else {
                i = i + 5;
            }
            if ((i / 12) == parseInt(i / 12)) {//标识是整数
                str = i * 5 / 60 + "小时";
            } else {
                var hh = i * 5 / 60;
                str = parseInt(hh) + "小时" + (i * 5 - parseInt(hh) * 60) + "分钟";
            }
            arrMm.push(i*5);
            dataArr.push(str);
        }
        console.log(JSON.stringify(arrMm));
        console.log(JSON.stringify(dataArr));
    },
   
    commitData: function(){
        var self = this,
            params = {},
            session_id = self.data.user.sessionid;

        params.AMAimSteps = self.data.sportArr[self.data.spIndex];
        params.AMAimSleep = self.data.sleepMM[self.data.sleepIndex];
        params.AMAimWeight = self.data.wightArr[self.data.wIndex];

        wx.request({
            url: app.util.ajaxUrl.ModifyAim ||"",
            data:params,
            method: "Post",
            header: { 'content-type': 'application/json', "session_id": session_id },
            success: function(res) {
                var res = res.data;
                if (res && res.IsSuccess){
                    app.util.showTipAuto("保存成功");
                }else{
                    app.util.showModalFun("保存失败");
                }
            },
            fail: function(res){
                app.util.showModalFun("保存失败");
            }
        })
    },
     
    bindSportChange: function(e){
        this.setData({
            spIndex: parseInt(e.detail.value) 
        })
        this.commitData();
    },
    bindSleepChange: function(e){
        this.setData({
            sleepIndex: parseInt(e.detail.value)
        })
        this.commitData();
    },
    bindWightChange: function (e) {
        this.setData({
            wIndex: parseInt(e.detail.value)
        })
        this.commitData();
    }
})