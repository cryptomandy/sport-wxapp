var util = require("utils/util.js");
App({
    onLaunch: function () {
        var that = this;
        wx.checkSession({
            success: function () {
                
            },
            fail: function () {
                wx.hideLoading();
                that.loginSet();
            }
        })
    },

    
    onShow: function(){
        var that = this;
        if (wx.getStorageSync('state')) {
            var wxState = wx.getStorageSync('state');

            that.globalData.state.isFirstCon = wxState.isFirstCon || false;
            that.globalData.state.isConSuccess = wxState.isConSuccess || false;
        }else{
            var stateV = {
                isFirstCon: false,
                isConSuccess: false
            };
            wx.setStorageSync("state", stateV);
        }

        if (wx.getStorageSync("connectObj")){
            var sessionCon = wx.getStorageSync("connectObj");
            //本地记录蓝牙信息
            that.globalData.connectObj = {
                name: sessionCon.name || "",
                deviceId: sessionCon.deviceId || "",
                syncTime: sessionCon.syncTime || "",//同步数据时间
                batteryT: sessionCon.batteryT || "",//电量
                version: sessionCon.version || ""
            };
        }else{
            var connectObj =  {
                name: "",
                deviceId:"",
                syncTime:  "",
                batteryT:"",
                version: ""
            };
            wx.setStorageSync("connectObj", connectObj);
        }
    },
    onHide: function(){
        //隐藏小程序的时候，关闭搜索和停止连接
        var that = this;
        wx.closeBLEConnection({
            deviceId: self.data.prepareBlue.deviceId,
            success: function (res) {
            }
        });

        wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
            }
        });

        // 重置信息
        // that.globalData.isSyncData = false;
        that.globalData.isConnectBlue = false;

        // that.globalData.state.isFirstCon = false;
        // that.globalData.state.isConSuccess = false;

    },
    util: util || {}, //获取公共配置，不用再每个页面引用
    //在页面中获取登录信息；
    getUserInfo: function(cb){
        var that = this;
        if (wx.getStorageSync('sessionid') && wx.getStorageSync('sessionid').id && wx.getStorageSync('sessionid').id!="") {
            // console.log("获取session用户信息");
            that.globalData.userInfo = wx.getStorageSync('userInfo');
            that.globalData.sessionid = wx.getStorageSync('sessionid').id;

            typeof cb == "function" && cb(that.globalData);
        } else {
            //调用登录接口
            that.loginSet(cb);
        }
    },

    //登录
    loginSet: function(cb){
        var that = this;
        wx.login({
            success: function (loginRes) {
                var mycode = loginRes.code;
                //wx封装
                wx.getUserInfo({
                    lang: "zh_CN",
                    success: function (res) {
                        that.globalData.userInfo = res.userInfo;
                        wx.setStorageSync('userInfo', res.userInfo);

                        //保存用户信息到服务器
                        var sessionid = wx.getStorageSync('sessionid') || { "id": "", "createTime": "" };
                        wx.request({
                            url: util.ajaxUrl.jscode2session,
                            method: "POST",
                            data: {
                                AuthCode: mycode,
                                NickName: res.userInfo.nickName,
                                gender: res.userInfo.gender,
                                avatarUrl: res.userInfo.avatarUrl,
                                city: res.userInfo.city,
                                session_key: sessionid.id
                            },
                            success: function (userRes) {
                                if (userRes.data.IsSuccess) {
                                    console.log(userRes, "保存信息到服务器");

                                    sessionid.id = userRes.data.Message;
                                    sessionid.createTime = Date.now();
                                    wx.setStorageSync('sessionid', sessionid);

                                    that.globalData.sessionid = sessionid.id;
                                    if (typeof cb == "function"){
                                        typeof cb == "function" && cb(that.globalData);
                                    }
                                }
                            }
                        })
                    },
                    fail : function(){
                        wx.hideLoading();
                        wx.authorize({
                            scope: 'scope.userInfo',
                            success() {
                            }
                        })
                    }
                })
            },
            fail: function(){
                wx.hideLoading();
                that.loginSet(cb);
            },
        })
    },

    globalData:{
        userInfo: null,//用户信息
        sessionid:"", //session信息，有用
        state: {
            isFirstCon: false,  //是否是第一次连接
            isConSuccess: false //是否是第一次成功连接
        },

        isSyncData: false,//是否在同步数据， 只同步一次，当前加载后同步
        isSyncSuccess: false,//第一次是否同步成功；
        isConnectBlue: false, //是否已经连接蓝牙

        //需要记到session中
        connectObj: {
            name:"",
            deviceId:"",
            syncTime: "",//同步数据时间
            batteryT: "",//电量
            version:""
        }, // 已经连接的蓝牙

        configBlue: {
            "DeviceCode": "B3",
            "DeviceType": "1",
            "DeviceName": "健康手环",
            "DeviceImg": "",
            "DeviceSign": "",
            "AppServers": [
                {
                    "ServerUuid": "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
                    "ServerName": "服务1",
                    "isPrimary": false,
                    "AppCharacteristics": [
                        {
                            "ACUuid": "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
                            "ACName": "allread",
                            "Properties": "read"
                        },
                        {
                            "ACUuid": "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
                            "ACName": "write",
                            "Properties": "read"
                        }
                    ]
                }
            ]
        },// 支持当前连接的几种蓝牙，目前只支持一种，代码先不写

    }
})