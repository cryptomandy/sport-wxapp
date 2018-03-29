var app = getApp();
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""   
        },

        sScores: 0, 
        sleepStat: { //页面显示睡眠时间长
            deep: [],
            light: [],
            sober: [],    //清醒
            totalSleep: [], //总睡眠时长
        },
        percentNum :{//睡眠时长百分比
            deepPer: 0,
            lightPer: 0
        },

        canText:{
            startTime:"",
            soberTime:""
        },

        showList:[],
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
    onShow: function () {
        app.util.loadingFun();
        this.getAjaxData();
        // this.handlerData(this.data.chart);
    },

    getAjaxData: function () {
        var self = this,
            session_id = self.data.user.sessionid;
        var params = {
            // "APStartTime": app.util.getTodayDate(), 
            "APDataType": "0,1,2,3"
            // "APDataType":"0"
        };
        wx.request({
            url: app.util.ajaxUrl.AppSleepList,
            data: params,
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;
                
                if (res.list && res.list.length > 0) {
                    self.setData({
                        sScores: parseInt(res.par1)
                    })
                    self.handlerData(res.list);
                }
            },
            complete: function () { 
                wx.hideLoading();
            }
        });
    },
    //睡眠待渲染数据处理
    handlerData: function (data){
        var self = this;

        //循环处理数据
        var daysDetail = {},
            lists = [],
            interList = [];
        for(var i = 0 ;i < data.length; i++){
            if (data[i].APDataType==3){
                daysDetail = data[i];
            }else{
                lists.push(data[i]);
            }
        }
        var allSleep = daysDetail.APSleepTime ||[], //总时长
            shallow = daysDetail.APShallowSleepTime,//浅睡
            deep = daysDetail.APDeepSleepTime;//深睡
            
        
        if (lists && lists.length){
            //计算每个时间段占总睡眠时长的百分比
            for (var i = 0; i < lists.length; i++) {
                var item = lists[i],
                    json = {};

                json.Id = i;
                json.percent = Math.round((item.APSleepTime / allSleep) * 100);
                json.sleepType = item.APDataType;

                //设置柱形图颜色
                if (item.APDataType == 1) { //深睡
                    json.bgColor = "#8377c9";
                } else if (item.APDataType == 2) {
                    json.bgColor = "#a399d6"; //浅睡
                } else {
                    json.bgColor = "#c2bbe4";
                }
                interList.push(json);
            }
        }
        //设置睡眠详情信息
        self.setData({
            showList: interList,
            canText: {
                startTime: self.getTimeHHMM(lists[0].APStartTime) || "",
                soberTime: self.getTimeHHMM(lists[lists.length - 1].APEndTime) || ""
            },
            sleepStat: {
                totalSleep: self.formatTime(allSleep) || [],
                light: self.formatTime(shallow) || [],
                deep: self.formatTime(deep) || [],
                sober: self.formatTime(allSleep - shallow - deep) || []
            },
            percentNum: {
                deepPer: Math.round((deep / allSleep) * 100) || "",
                lightPer: Math.round((shallow / allSleep) * 100) || ""
            }
        });
    },
    
    /****************** 公共方法********************************/
    //获取时分
    getTimeHHMM: function (time) {

        var newTime = new Date(time.replace("T", " ").replace(/\-/g, "/")),
            hh = newTime.getHours(),
            mm = newTime.getMinutes();

        hh < 10 ? hh = ("0" + hh) : hh;
        mm < 10 ? mm = ("0" + mm) : mm;
        return hh + ":" + mm;
    },
    //分到时分换算
    formatTime: function (time) {
        var TimeArr = [];
        var time = parseInt(time),
            hour = parseInt(time / 60) || 0, //小时
            minute = time - hour * 60 || 0; //分钟

        TimeArr.push(hour);
        TimeArr.push(minute);
        return TimeArr;
    },
    //转换时间
    setGetTime: function (time) {
        return new Date(time.replace("T", " ").replace(/\-/g, "/")).getTime();
    }
    
});