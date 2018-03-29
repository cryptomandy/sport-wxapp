var app = getApp();
//当前睡眠数据；
//方案二后期优化的处理方式，初始化三个全局的数组，然后将新请求的数据按类别插入到对应的索引位置，然后渲染，判断是向左还是向右滑动，不断插入数据，不用每次都请求数据，问题是： 什么时候滑动加载要多次测试计算；
//三种不同状态显示的信息，本来打算做三个不同的显示框，进行显示的，后期优化，由于排序问题；

var ConfArr= [
    {
        Id: 3,
        isFirst: true,
        pageTotal: 1,
        pageIndex: 1
    },
    {
        Id: 5,
        isFirst: true,
        pageTotal: 1,
        pageIndex: 1
    },
    {
        Id: 7,
        isFirst: true,
        pageTotal: 1,
        pageIndex: 1
    }

];

var COMconf = {
    day: 7,
    other: 4,
    pageSize: 7,
    isNoLoad: false, //异步是否加载完
    isFirstLoad: true
};
//TODO：处理加载状态，和处理异步异常；
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        windowWidth: 320,
        TOUCHS :{},

        setStyle: {
            width4: 140,
            width7: 60,
            colHeight: 420, //柱形图高度
            aimSleep: 1080 //最高目标数据
        },
        aimHeight: 80,
        //柱形图显示数据
        sType: 3, //日(3)，周(5)，月(7)枚举
        showList: [],

        bottomTab: [
            {
                "name":"日",
                "checked":true,
                "num":1,
                "sType":3
            },
             {
                "name":"周",
                "checked":false,
                "num":7,
                "sType":5
            }, 
            {
                "name":"月",
                "checked":false,
                "num":30,
                "sType":7
            }
        ],
        statInfro: {
            curDate:"",//显示详情的时间
            total:{//详情信息
                Num1 : [], // 睡眠总长
                Num2: [], //深睡
                Num3: [],//浅睡

                Num4: "", //入眠时间
                Num5: "",//清醒时间
                Num6: ""//清醒时长
            }
        },
        preTime : "",
        totalList: -1, //当前类型是否有信息

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
        
        self.setData({
            preTime: app.util.getTodayDate()
        });
        //首屏加载的时候是倒序显示；倒序获取最新数据显示，然后滑动时候判断向左还是向右滑动，是否可滑动数据；
    },
    onShow: function (e) {
        this.getStepsData(false);
        app.util.loadingFun();
    },
    //获取统计列表数据
    getStepsData: function (isClear) {
        var self = this,
            session_id = self.data.user.sessionid;

        try {
            var res = wx.getSystemInfoSync();
            self.setData({
                windowWidth : res.windowWidth
            })
        } catch (e) {

        }

        if (COMconf.isFirstLoad) {
            COMconf.isNoLoad = true,
            COMconf.isFirstLoad = false;
        }
        if (COMconf.isNoLoad){
            if (isClear) {
                app.util.loadingFun();
            }
            var params = {};
            params.APDataType = self.data.sType;
            params.OrderField = "APStartTime DESC";
            params.PageSize = COMconf.pageSize; //每页多少数据

            var showItem = {};
            for (var j = 0; j < ConfArr.length; j++) {
                if (self.data.sType == ConfArr[j].Id) {
                    params.PageIndex = ConfArr[j].pageIndex; //当前请求类型的页数
                    showItem = ConfArr[j];
                }
            }
            wx.request({
                // url: app.util.ajaxUrl.AppSleepList + "?APStartTime>=2017-11-08&APDataType=5&PageSize=4",
                url: app.util.ajaxUrl.AppSleepList,
                data: params,
                header: { "session_id": session_id },
                success: function (res) {
                    // var res = testData.sleep;
                    var res = res.data;
                    if (showItem.isFirst) { //给每个类型赋值总的页数
                        for (var j = 0; j < ConfArr.length; j++) {
                            if (self.data.sType == ConfArr[j].Id && res.total) {
                                ConfArr[j].pageTotal = parseInt(res.total);
                            }
                        }
                    }
                    self.setData({
                        totalList: parseInt(res.total)
                    });
                    if (res.list && res.list.length > 0) {
                        self.ajaxDataHand(res);

                    }
                },
                complete: function () {
                    wx.hideLoading();
                    COMconf.isNoLoad = true;
                }
            });
        }else{
            app.util.showTipCommon("数据正在加载中，请稍后滑动或者切换");
        }
    },
    // 异步数据处理
    ajaxDataHand: function (res) {
        var self = this,
            res = res.list.reverse(), //列表
            setStyle = self.data.setStyle;

        var len = res.length,
            isCurDate = false,
            curItem = {},

            curIndex = 0,
            preIndex = 0,
            FLAG = false;

        for (var i = 0; i < res.length > 0; i++) {

            res[i].Id = i + 1;
            var ShowTime = "";
            
            res[i].DeepBgColor = "#8377c9";
            res[i].PercentDeep = Math.round((res[i].APDeepSleepTime / setStyle.aimSleep) * setStyle.colHeight);
            res[i].ShaBgColor = "#a399d6";
            res[i].PercentShallow = Math.round((res[i].APShallowSleepTime / setStyle.aimSleep) * setStyle.colHeight);
            
            if (self.data.sType == 3) {
                res[i].ShowTime = self.getTimeMMDD(res[i].APEndTime);
                res[i].Width = setStyle.width7;
            } else {
                res[i].ShowTime = self.getTimeMMDD(res[i].APStartTime) + "~" + self.getTimeMMDD(res[i].APEndTime);
                res[i].Width = setStyle.width4;
            }
        
            //判断是否是当天/周/月
            if (self.data.sType == 5 || self.data.sType == 7) {
                if (self.getTime(res[i].APStartTime) < self.getTime() && self.getTime(res[i].APEndTime) > self.getTime()) {
                    FLAG = true;
                }
            }

            if (res[i].APEndTime.split("T")[0] == self.data.preTime || FLAG) {
                curItem = res[i];
                curIndex = preIndex = i;
                isCurDate = true;
                res[i].CurText = self.setXtext(true);
            } else {
                res[i].CurText = "";
            }
        }

        if (preIndex && res.length > 1) {
            res[preIndex - 1].CurText = self.setXtext(false);
        }
        if (!isCurDate) {
            curIndex = len - 1;
            curItem = res[len - 1];
        }
        
        self.setData({
            showList: res || []
        });

        self.setCurDateDetail(curItem);
        wx.hideLoading();
    },

    //设置当前文案提示(例如："今天" / "本周"，区分日，周，月)
    setXtext: function (type) {
        var text = "";
        if (type) {
            switch (this.data.sType) {
                case 3: text = "今天"; break;
                case 5: text = "本周"; break;
                case 7: text = "本月"; break;

                
            }
        } else {
            switch (this.data.sType) {
                
                case 3: text = "昨天"; break;
                case 5: text = "上周"; break;
                case 7: text = "上月"; break;
                
            }
        }
        return text;
    },
    //切换显示类型
    tabShowType: function(evt){
        //evt.currentTarget.dataset获取节点上带的属性
        var self = this,
            lists = self.data.bottomTab,
            curType = evt.currentTarget.dataset.typeid;

        for(var i=0; i< lists.length; i++){
            if(curType == lists[i].sType){
                if (curType == 3) {
                    COMconf.pageSize = COMconf.day;
                } else {
                    COMconf.pageSize = COMconf.other;
                }
                lists[i].checked = true;
            }else{
                lists[i].checked = false
            }
        }
        //设置数据时，不是第一级节点的需要去设置为将里面所有的数据设置上，否则会覆盖
        self.setData({
            sType: curType,
            bottomTab: lists
        });
        
        self.getStepsData(true);
    },
    //显示某一天的睡眠详情
    setCurDateDetail: function (time) {
        var self = this;

        var inter = time.APSleepTime - time.APDeepSleepTime - time.APShallowSleepTime; //清醒时长

        var total = {
            Num1: self.formatTime(time.APSleepTime) || [],
            Num2: self.formatTime(time.APDeepSleepTime) || [],
            Num3: self.formatTime(time.APShallowSleepTime) || [],

            Num4: self.getTimeHHMM(time.APStartTime) || "",
            Num5: self.getTimeHHMM(time.APEndTime) || "",
            Num6: inter || "0" //注意是int类型数据
        };

        self.setData({
            statInfro: {
                curDate: time.APEndTime.split("T")[0] || "",
                total: total
            }
        })
    }, 
    //点击柱形图显示统计内容详情
    clickShowDetail: function(touch){

        var self = this;
        var areaXY = touch.currentTarget,
            curDateData = {};
        var len = self.data.showList.length;

        for (var i = 0; i < len; i++) {
            var item = self.data.showList[i];

            if ((i+1) == parseInt(areaXY.id)) {
                curDateData = item;
                break;
            }
        }
        self.setCurDateDetail(curDateData);
    },
     
    //滑动计算滑动方向和刷新
    scrollShowDetail: function (touch) {
        var self = this;
        var endXY = touch.changedTouches[0];
        //判断滑动长度
        var resData = self.judgeScrollLength({
            endXY: endXY,
            startXY: self.data.TOUCHS,
            limitLen: 60
        });
        console.log(resData);
        if (resData.Type && (resData.Type == "L" || resData.Type == "R")) {

            for (var j = 0; j < ConfArr.length; j++) {
                //判断当前是哪个类型的滑动，其次判断是否可滑动
                if (self.data.sType == ConfArr[j].Id) {
                    if (ConfArr[j].pageIndex < ConfArr[j].pageTotal && resData.Type == "L") {   //可向右滑
                        ConfArr[j].pageIndex++;
                        self.getStepsData(true);
                    }

                    if (ConfArr[j].pageIndex > 1 && resData.Type == "R") { //可向左滑
                        ConfArr[j].pageIndex--;
                        self.getStepsData(true);
                    }
                }
            }
        }
    },
    /*********************公共函数，处理数据**************************/ 
    judgeScrollLength : function (conf) {

        var res = {},
            sX = Math.round(conf.startXY.pageX),
            eX = Math.round(conf.endXY.pageX);
        //向左滑动
        if (eX > sX && (eX - sX) > conf.limitLen) {
            res.CurLen = parseInt(eX - sX);
            res.Type = "L";
        }
        //向右滑动
        if (sX > eX && (sX - eX) > conf.limitLen) {
            res.CurLen = parseInt(sX - eX);
            res.Type = "R";
        }
        return res;
    },
    getTouchStartXY: function (touch) {
        this.setData({
            TOUCHS: touch.changedTouches[0]
        })
        // TOUCHS = touch.changedTouches[0];
    },
    //分到时分换算
    formatTime: function (time) {
        var TimeArr = [];
        var time = parseInt(time),
            hour = parseInt(time / 60), //小时
            minute = time - hour * 60 || "0"; //分钟

        TimeArr.push(hour);
        TimeArr.push(minute);  
        return TimeArr;
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
    //获取月日
    getTimeMMDD: function (time) {
        var newTime = new Date(time),
            mm = newTime.getMonth() + 1,
            dd = newTime.getDate();

        mm < 10 ? mm = ("0" + mm) : mm;
        dd < 10 ? dd = ("0" + dd) : dd;
        return mm + "/" + dd;
    },
    getTime: function (time) {
        if (time) {
            return new Date(time.replace("T", " ").replace(/\-/g, "/")).getTime();
        } else {
            return new Date().getTime();
        }
    }
})