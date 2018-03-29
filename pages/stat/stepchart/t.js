var app = getApp();

var ConfArr = [
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

var Sizes = {
    day: 7, //是天是每天请求条数
    other: 4, //是周和月时每次请求条数
    pageSize: 7
};

Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        windowWidth: 320,
        TOUCHS: {},

        // 柱形图显示设置
        setStyle :{
            width4: 140,
            width7: 60,
            colHeight: 460, //柱形图高度
            aimStep: 40000 //最高目标数据
        },
        showList:[], //每次刷新页面显示的
        aimHeight: 80,
        //柱形图显示数据
        sType: 3, //日(3)，周(5)，月(7)枚举
        //不同类型的柱形图显示，分开将已经请求过的数据保存下来
        statInfro: {
            curDate: "",//显示详情的时间
            total:{
                Num1 : 0, //步数
                Num2: 0, //时间
                Num3: 0,//公里
                Num4: 0//消耗
            }
        },
        //底部切换
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
        preTime:"",
        totalList: -1,//列表条数
    },
    onLoad: function (e) {
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
    onReady: function (e) { 
        this.getStepsData(false);
        app.util.loadingFun();
    },
    getStepsData: function (isClear) {
        var self = this;
        var session_id = self.data.user.sessionid;
        try {
            var res = wx.getSystemInfoSync();
            self.setData({
                windowWidth: res.windowWidth
            })
        } catch (e) {

        }
        self.setData({
            preTime: app.util.getTodayDate()
        });
        
        if (isClear){
            app.util.loadingFun();
        }
        var params = {};
        params.ASDataType = self.data.sType;
        params.OrderField = "ASStartTime DESC";
        params.PageSize = Sizes.pageSize; //每页多少数据
        
        var showItem  = {};
        for (var j = 0; j < ConfArr.length; j++) {
            if (self.data.sType == ConfArr[j].Id) {
                params.PageIndex = ConfArr[j].pageIndex; //当前请求类型的页数
                showItem = ConfArr[j];
            }
        }

        wx.request({
            url: app.util.ajaxUrl.AppStepsList,
            data: params,
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;
                // var res = testData.steps;
                if (showItem.isFirst){ //给每个类型赋值总的页数
                    for (var j = 0; j < ConfArr.length; j++) {
                        if (self.data.sType == ConfArr[j].Id && res.total) {
                            ConfArr[j].pageTotal = parseInt(res.total);
                        }
                    }
                }
                self.setData({
                    totalList: parseInt(res.total)
                });
                if (res.list && res.list.length>0) {
                    self.ajaxDataHand(res);
                }
            },
            complete: function(){
                wx.hideLoading();
            }
        });
    },
    // 异步数据处理
    ajaxDataHand: function (res){
        var self= this,
            res = res.list.reverse(),
            setStyle = self.data.setStyle;

        var len = res.length,
            isCurDate = false,
            curItem = {},

            showIndex = 0,
            preIndex = 0,
            FLAG = false;

        for(var i =0;i < res.length> 0;i++){

            res[i].Id = i+1;
            if (res[i].ASSteps > setStyle.aimStep || res[i].ASSteps == setStyle.aimStep){
                res[i].Percent = Math.round(setStyle.colHeight);
            }else{
                res[i].Percent = Math.round((res[i].ASSteps / setStyle.aimStep) * setStyle.colHeight);
            }
            
            if (self.data.sType == 3) {
                res[i].Width = setStyle.width7;
                res[i].ShowTime = self.formatTMMMDD(res[i].ASEndTime);
            } else {
                res[i].Width = setStyle.width4;
                res[i].ShowTime = self.formatTMMMDD(res[i].ASStartTime) + "~" + self.formatTMMMDD(res[i].ASEndTime);
            }

            //判断是否是当天/周/月
            if (self.data.sType == 5 || self.data.sType == 7) {
                if (self.getTime(res[i].ASStartTime) < self.getTime() && self.getTime(res[i].ASEndTime) > self.getTime()) {
                    FLAG = true;
                }
            }

            if (res[i].ASEndTime.split("T")[0] == self.data.preTime || FLAG) {
                curItem = res[i];
                showIndex = preIndex = i;
                isCurDate = true;
                res[i].CurText = self.setXtext(true);
                res[i].colColor = "#e0f5ff";
            } else {
                res[i].CurText = "";
                res[i].colColor = "#80d4ff";
            }
        }

        if (preIndex && res.length > 1) {
            res[preIndex - 1].CurText = self.setXtext(false);
        }
        //如果不是当天/周/月，显示最后一个数据
        if (!isCurDate) {
            showIndex = len - 1;
            curItem = res[len - 1];
        }

        self.setData({
            showList:res,
            aimHeight: Math.round((res[0].ASAimSteps) / setStyle.aimStep * setStyle.colHeight) + 80

        });
        self.setCurDateDetail(curItem);
        wx.hideLoading();
    },

    //设置当前文案提示(例如："今天" / "本周"，区分日，周，月)
    setXtext: function (type) {
        var text = "";
        if (type){
            switch (this.data.sType) {
                case 3: text = "今天"; break;
                case 5: text = "本周"; break;
                case 7: text = "本月"; break;
                
            }
        }else{
            switch (this.data.sType) {
                case 3: text = "昨天"; break;
                case 5: text = "上周"; break;
                case 7: text = "上月"; break;
            }
        }
        return text;
    },
    //切换显示类型
    tabShowType: function (evt){
        //evt.currentTarget.dataset获取节点上带的属性
        
        var self = this,
            lists = self.data.bottomTab,
            curType = evt.currentTarget.dataset.typeid;

        for(var i=0; i< lists.length; i++){
            if(curType == lists[i].sType){
                if (curType == 3) {
                    Sizes.pageSize = Sizes.day;
                } else {
                    Sizes.pageSize = Sizes.other;
                }
                lists[i].checked = true;
            }else{
                lists[i].checked = false
            }
        }

        self.setData({
            sType: curType,
            bottomTab: lists
        });

        self.getStepsData(true);

    },
    //显示某一天的睡眠详情
    setCurDateDetail: function (data) {
        var self = this;
       
        var total = {
            Num1: data.ASSteps || 0,
            Num2: parseInt(data.ASWalkingTime) + parseInt(data.ASRnningTime) || 0,

            Num3: parseInt(data.ASMileage) || 0,
            Num4: data.ASCAL || 0
        };

        self.setData({
            statInfro: {
                curDate: data.ASEndTime.split("T")[0] || "",
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
         
        if (resData.Type && (resData.Type == "L" || resData.Type == "R")){ 

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
    getTouchStartXY: function (touch) {
        this.setData({
            TOUCHS: touch.changedTouches[0]
        })
    },
    getTime: function (time) {   //(TODO:公共方法)
        if (time) {
            return new Date(time.replace("T", " ").replace(/\-/g, "/")).getTime();
        } else {
            return new Date().getTime();
        }

    },
    judgeScrollLength: function (conf) {   //(TODO:公共方法)

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
    //获取月日
    formatTMMMDD: function (time) {  //(TODO:公共方法)
        var newTime = new Date(time.replace("T", " ").replace(/\-/g, "/")), 
            mm = newTime.getMonth() + 1,
            dd = newTime.getDate();

        mm < 10 ? mm = ("0" + mm) : mm;
        dd < 10 ? dd = ("0" + dd) : dd;
        return mm + "/" + dd;
    },
})