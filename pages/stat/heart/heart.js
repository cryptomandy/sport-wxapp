var app = getApp();

import { blueInt } from '../../../components/data/data.js';
import { connectInt } from '../../../components/connect/connect.js';

var LOAD = {};
//燃脂的区分

Page({
    data: {
        user: {
            userInfo: {},
            sessionid: ""
        },
        textRes:"",

        timeShow:"",
        hisList: [],

        hShow:{
            heartVal: "未获取",//如果是在当前页面则一直动态显示，然后5分钟同步数据
            fontH: "42"
        },
        heartSyncTimer: null,
        isFacility: false
    },
    onLoad: function () {
        var self = this;
        clearInterval(self.data.heartSyncTimer);

        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            })
        });
        new blueInt({
            sendCommend: "-85,00,04,-1,-124,-128,01",
            isHeart: true
        });
    },
    onShow: function () {
        var self = this;

        LOAD.sTop = 0;  //距离顶部距离
        LOAD.__index = 1;  //标记加载到第几页
        LOAD.isLoading = false;  //标记请求列表是否完成
        LOAD.isFirst = true; //标记是否是第一次请求
        LOAD.page = 1; //视频列表总页数

        
        app.util.loadingFun();

        self.setData({
            timeShow: self.getDate()
        })
        self.getAjaxData(false);

        //同步数据显示，进入页面同步数据
        if (app.globalData.isConnectBlue){
            self.getDeviceService();
        }
    },

    getAjaxData: function (isClear) {
        var self = this;
        var session_id = self.data.user.sessionid;

        if (isClear) {
            app.util.loadingFun();
        }
        var param = {
          OrderField:"AHStartTimeNum DESC",
            AHStartTime: app.util.getTodayDate(),
            PageIndex: LOAD.__index,
            PageSize: 20
        };

        wx.request({
            url: app.util.ajaxUrl.HeartRateList,
            data: param,
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;

                if (res.list && res.list.length > 0) {

                    LOAD.page = Math.ceil(res.total / 15);
                    var totalLen = self.data.hisList.length;

                    res.list.forEach(function (item, i) {
                        item.DataId = i + totalLen;
                        item.showTime = self.getTimeHHMM(item.AHStartTime);
                    });

                    if ((LOAD.__index + 1) == LOAD.page) {
                        self.setData({
                            hisList: self.data.hisList.concat(res.list),
                            textRes: "没有更多历史数据啦"
                        });
                    }else{
                        if (parseInt(res.total) > 20){
                            self.setData({
                                hisList: self.data.hisList.concat(res.list),
                                textRes: "滑动加载更多"
                            });
                        }else{
                            self.setData({
                                hisList: self.data.hisList.concat(res.list),
                                textRes: "没有更多历史数据啦"
                            });
                           
                        }
                    }

                    LOAD.__index++;
                    LOAD.isLoading = true;
                }else{
                    self.setData({
                        textRes:"没有更多历史数据啦"
                    })
                }
            },
            fail: function(){
                self.setData({
                    textRes: "未获取到历史数据"
                })
            },
            complete: function () {
                wx.hideLoading();
                
            }
        });
    },
    onReachBottom: function () {
        var self = this;
        if (LOAD.isFirst) {
            LOAD.isLoading = true;
            LOAD.isFirst = false;   
        }
        if (LOAD.isLoading && LOAD.__index < LOAD.page) {

            console.log(LOAD.__index);

            LOAD.isLoading = false;
            if (LOAD.isFirst) {
                self.getAjaxData(true);
            } else {
                setTimeout(function () {
                    self.getAjaxData(true);
                }, 500);
            }
        }
    },

    onHide: function(){
        var self = this;
        clearInterval(self.data.heartSyncTimer);
        //停止接收信息
        self.setData({
            sendCommend:"-85,00,04,-1,-124,-128,0"
        });

        self.sendCmd();
    },
    // onPageScroll: function (config) {

    //     var length = this.data.hisList.length,
    //         preS = LOAD.sTop,
    //         newS = config.scrollTop;

    //     if (!LOAD.isFirst) {
    //         LOAD.isLoading = true;
    //         LOAD.isFirst = true;
    //     }

    //     var compare = 40 + LOAD.__index * parseInt((LOAD.__index / 2)) * 100;
    //     if (preS < newS && LOAD.isLoading && config.scrollTop > compare && LOAD.__index < LOAD.page) {

    //         console.log(preS,newS,LOAD.__index, config.scrollTop, compare);

    //         LOAD.isLoading = false;
    //         this.getAjaxData(true);
    //     }
    //     LOAD.sTop = newS;
    // },
    // 获取当前时间
    getDate: function () {
        var days = new Date();
        var yy = days.getFullYear(),
            mm = (days.getMonth() + 1),
            dd = days.getDate();
        mm < 10 ? (mm = "0" + mm) : mm;
        dd < 10 ? (dd = "0" + dd) : dd;

        var dates = yy + "年" + mm + "月" + dd + "日";
        return dates;
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
})