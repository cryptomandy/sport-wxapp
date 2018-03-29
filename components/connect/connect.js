var app = getApp(),
    bleUtils = require("../../utils/defined.js");

// 蓝牙状态的全局参数
var tipEnum = { // 未开启的提示
    "no": {
        "title": "蓝牙未开启",
        "sub": "检测到您的蓝牙未打开，请去设置里确认是否打开",
        "type": 1
    },
    "yes": {
        "title": "蓝牙已开启",
        "sub": "",
        "type": 2
    }
};


var _GP = {

    delayTimer: null, //停止循环获取tag
    isReady: false,  //蓝牙是否开启标记
    
    user: {
        userInfo: {},
        sessionid: ""
    },
    
    tips: {
        "title": "",
        "sub": "",
        "type": 0
    },

    getList: [],

    blueStatus: 0,// 1. 未开启，2. 未连接， 3. 已连接过  状态前端用  4. 连接蓝牙显示；
    blueList: [],

    //蓝牙状态表示值
    isFound: false,
    ConfigList: {}, //支持当前连接的几种蓝牙，目前只支持一种，代码先不写列表循环
    prepareBlue: {},

    isFirSuccess: false   
};

/**
 * 特征值数据类型
 * 用小程序api接口获取的特征值
 * */

/**
 * @ 连接状态： 1. 首次连接，需要选择哪一个信息，再次连接自动连接；
 * 
 * 
 * */ 
var __allmethod = {

    initComponent: function () {
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
        self.setData({
            ConfigList: app.globalData.configBlue  //支持当前连接的蓝牙，因为请求过慢，写死，获取的方法getConfigList();
        });
        self.initBlue();

    },

    //刷新蓝牙状态
    refreshBlueState: function () {
        if (!this.data.isReady) {
            this.initBlue();
        }
    },

    /*****************蓝牙相关判断方法*******************/
    // 初始化蓝牙
    initBlue: function () {

        var self = this;
        if (!self.setConnectionStateChange() || !wx.openBluetoothAdapter) {
            if (!wx.openBluetoothAdapter) {
                app.util.showModalFun("当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。");
                return;
            }
            self.openBluetoothAdapter();
        } else {

            self.sendCmd();
        }
    },
    
    //初始化蓝牙适配器
    openBluetoothAdapter: function () {
        var self = this;
        wx.openBluetoothAdapter({
            success: function (res) {

                self.setData({
                    blueStatus: 1,
                    tips: tipEnum.yes,

                    isReady: true
                });
                self.getBluetoothState();
            },
            fail: function (res) {
                self.setData({
                    blueStatus: 1,
                    tips: tipEnum.no,

                });
                wx.hideLoading();
            },
            complete(res) {
            }
        })

    },
    //判断蓝牙是否可用状态
    getBluetoothState: function () {
        var self = this;
        wx.getBluetoothAdapterState({
            success: function (res) {
                if (res.available) {//蓝牙可用    
                    self.startBluetoothDevicesDiscovery();
                }
            },
            fail: function () {
                wx.hideLoading();
            }
        })
    },
    //开始搜索
    startBluetoothDevicesDiscovery: function () {
        var self = this;
        // 设置搜搜超时提示；
        setTimeout(function () {
            if (self.data.isFound) {
                return;
            } else {
                clearInterval(self.data.delayTimer);
                self.stopBluetoothDevicesDiscovery();

                wx.showModal({
                    content: "未搜索到可支持连接的蓝牙，搜索超时，请重新搜索",
                    showCancel: true,
                    confirmText: "确定",
                    confirmColor: "#1bb1fe",
                    success: function (res) {
                        if (res.confirm) {
                            self.getBluetoothState();
                        }
                    }
                });
                return;
            }
        }, 20000);

        //判断是否是第一次连接成功
        var succe = wx.getStorageInfoSync("state");
        
        self.setData({
            blueStatus: 2,
            isFirSuccess: succe.isConSuccess || false
        });

        wx.startBluetoothDevicesDiscovery({
            success: function (res) {
                wx.hideLoading();
                // console.log("开启搜索成功", res)
                self.getBluetoothDevices();
            },
            fail: function (res) {
                // console.log("开启搜索失败", res)
                wx.hideLoading();
                return;
            },
            complete: function (res) {
                console.log(res);
                wx.hideLoading();
            }
        })
        //每隔一秒获取一次
        self.setData({
            delayTimer: setInterval(function () {
                self.getBluetoothDevices();
            }, 3000)
        })
    },

    // 获取所有已发现的蓝牙设备，包括已经和本机处于连接状态的设备
    getBluetoothDevices: function () {
        var self = this;
        wx.getBluetoothDevices({
            success: function (res) {
                for (var i = 0; i < res.devices.length; i++) {
                    self.blueHandler(res.devices);
                }
            },

            fail: function (res) {
                clearInterval(self.data.delayTimer);
                app.util.showModalCallBack("没有搜索到可连接的设备", "我知道了");

                self.stopBluetoothDevicesDiscovery();
                wx.hideLoading();
                return false;
            }
        })
    },
    // 过滤未知的设备 和 不在目前支持设备内的设备   
    blueHandler: function (list) {
        var self = this;
        // console.log("设备显示02")
        if (list && list.length) {
            var len = self.data.blueList,
                arr = [],
                cList = self.data.ConfigList;

            for (var i = 0; i < list.length; i++) {  //过滤未知设备 和不匹配设备
                if (list[i].name == cList.DeviceCode || list[i].localName == cList.DeviceCode) {
                    self.setData({
                        isFound: true
                    });
                    clearInterval(self.data.delayTimer);
                    self.stopBluetoothDevicesDiscovery();
                    
                    //如果不是第一次连接，并且之前连接成功过一次的，第二次连接时自动连接
                    if (self.noFirstCon()){
                        list[i].checked = true;
                        self.setData({
                            prepareBlue: list[i]
                        })
                    }
                    arr.push(list[i]);
                }
            }

            if (self.noFirstCon()) {
                console.log("自动连接")
                self.createBLEConnectDevice();
            }else{
                console.log("第一次连接");
                if (arr && arr.length) {
                    self.setData({
                        blueList: self.data.blueList.length == 0 ? self.data.blueList.concat(arr) : bleUtils.removeRepeat(self.data.blueList.concat(arr), "deviceId"),
                        blueStatus: 3
                    })
                }
            }
        }
    },
    //连接低功耗蓝牙设备
    createBLEConnectDevice: function () {

        var self = this,
            conf = self.data.prepareBlue;
        setTimeout(function () {
            if (!app.globalData.isConnectBlue) {
                console.log("连接设备超时");
                wx.hideLoading();
                app.util.showModalCallBack("连接设备超时，重新连接", "", function () {
                    self.createBLEConnectDevice();
                })
            } else {
                return;
            }
        }, 60000);

        app.util.loadingFun("努力连接中...");
        wx.createBLEConnection({
            deviceId: conf.deviceId,
            success: function (res) {
                if (res.errMsg == "createBLEConnection:ok") {

                    app.util.showTipAuto("连接成功");

                    var state = wx.getStorageSync("state"),
                        stateObj = {
                            isFirstCon: state.isFirstCon,
                            isConSuccess: true
                        };

                    wx.setStorageSync('state', stateObj);
                    
                    var preB = self.data.prepareBlue || {};
                    //全局参数赋值
                    app.globalData.isConnectBlue = true;
                    app.globalData.connectObj.name = preB.name || preB.localName;
                    app.globalData.connectObj.deviceId = preB.deviceId;
                    
                    //设置我的设备本地存储
                    var jsonObj = app.util.getStorageData(conf);
                    wx.setStorageSync('connectObj', jsonObj);
                    
                    //判断返回地址
                    if (self.data.pageType && self.data.pageType == "3") { //设备页
                        wx.navigateBack({
                            url: "../../../facility/facility/facility"
                        });
                    } else if (self.data.pageType && self.data.pageType=="2"){ //个人中心
                        wx.navigateBack({
                            url: "../../../member/member/member"
                        });
                    }else{
                        wx.navigateBack({
                            url: "../../index/index"
                        });
                    }

                } else {
                    app.util.showModalCallBack("蓝牙未连接上，请重新连接", "确认", function () {
                        self.createBLEConnectDevice();
                    });
                }
            },
            fail: function (res) {
                app.util.showModalCallBack("蓝牙未连接上，请重新连接", "确认", function () {

                });
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },

    //判断是否是第一次连接
    noFirstCon: function(){
        var self = this;

        var Glob = app.globalData,
            flag = false;
        var sessionCon = wx.getStorageSync("connectObj");
        var state = wx.getStorageSync("state");     

        if (state.isFirstCon && sessionCon.deviceId && sessionCon.deviceId != "") {
            flag = true;
        }

        return flag;
    },
    //停止搜寻附近的蓝牙外围设备。请在确保找到需要连接的设备后调用该方法停止搜索。
    stopBluetoothDevicesDiscovery: function () {
        var self = this;
        wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
                console.log(res)
            }
        })
    },

    //返回蓝牙是否正处于链接状态
    setConnectionStateChange: function () {
        var self = this;
        wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            return res.connected;
        });
    },
    //关闭连接
    closeConnection: function () {
        var self = this;
        wx.closeBLEConnection({
            deviceId: self.data.prepareBlue.deviceId,
            success: function (res) {
                app.util.showModalFun("已经与蓝牙断开连接");
            }
        })
    },
    /*****************蓝牙相关判断方法*******************/
    // 处理数据方法

    // 获取可以支持的蓝牙列表，前端先写死
    getConfigList: function () {
        var self = this,
            session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.AppDevice + "?devName=B3",
            header: { "session_id": session_id },
            success: function (res) {
                if (res.data && res.data.length) {
                    self.setData({
                        ConfigList: res.data
                    })
                }
            },
            complete: function () {

            },
            fail: function () {

            }
        });
    },

    /*********错误提示和兼容start************/
    Unsupported: function () {
        wx.showModal({
            title: '提示',
            content: '您的手机不适配蓝牙',
            showCancel: false,
            confirmColor: "#1bb1fe",
            success: function (res) {

            }
        })
    },

    //蓝牙为开启失败提示和重置
    LaunchFail: function () {

        console.log("初始化蓝牙适配器失败");
        this.setData({
            blueStatus: 1,
            tips: tipEnum.no
        });
        this.onStateChange();
    },
    /************错误提示和兼容 end*********/
    // 返回首页
    cancelStart: function () {
        wx.navigateBack({
            url: "../../index/index"
        })
    },
    //取消搜索
    cancelSearch: function () {
        this.setData({
            blueStatus: 1,
            isFound: false
        });
        this.stopBluetoothDevicesDiscovery();
    },

    //选择绑定的蓝牙
    selectBlue: function (touch) {
        var self = this,
            list = self.data.blueList;
        var t = touch.currentTarget;

        for (var i = 0; i < list.length; i++) {
            if (t.id == list[i].deviceId) {

                list[i].checked = true;
            } else {
                list[i].checked = false;
            }
        }
        self.setData({
            blueList: list
        });
    },

    //确认绑定
    confirmBind: function () {
        var self = this,
            list = self.data.blueList;

        var flag = false;

        for (var i = 0; i < list.length; i++) {
            if (list[i].checked) {
                self.setData({
                    prepareBlue: list[i]
                })
            }
        }
        if (!self.data.prepareBlue.checked) {
            app.util.showModalFun("请选择需要绑定的蓝牙");
            return false;
        }
        var Ccode = self.data.ConfigList,
            pre = self.data.prepareBlue;

        // 判断当前要连接的蓝牙是否在可连接的列表之中
        if (pre.name == Ccode.DeviceCode || pre.localName == Ccode.DeviceCode) {
            self.createBLEConnectDevice();
        } else {
            app.util.showModalFun("蓝牙不在可以连接的范围内，请选择其他的蓝牙");
            return false;
        }
    },
    //刷新获取其他蓝牙
    refreshStatus: function () {
        this.startBluetoothDevicesDiscovery();
    }

}

//小程序中支持es6的转换
function connectInt(conf) {

    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];

    //组件中调用页面
    this._page = curPage;

    Object.assign(curPage, __allmethod);

    curPage.setData(Object.assign(_GP, conf));

    curPage.connectInt = this;

    return this;
}

export { connectInt }