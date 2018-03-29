/**
 * @date: 2017/12/31
 * @des 组件主要是获取服务值，特征值，以及发送指令和接收蓝牙数据，并且同步服务器，连接过程在facility 中的addnew；
 * @TODO: 判断是否连接并且当前的连接状态，以及同步信息；需要修改
 * */
var app = getApp(),
    bleUtils = require("../../utils/defined.js");

let _comData = {

    isConnected: false, //是否已链接

    notifyService: {}, //唤醒特征值
    writeService: {},//写入服务

    writeCharVal: {}, //写入特征值
    notifyCharVal: {}, //唤醒特征值

    isSynchronous: false,  //是否在同步数据标记  false 同步停止或者完成，true同步
    isFirstSync: false,//是否是第一次同步数据

    syncList: [],//同步到服务器的指令列表
    _pageIndex: 1,// 向服务器同步数据分次数
    _size: 20, // 向服务器同步数据每次指令条数
    syncTimer: null,
    heartSyncTimer: null,
    prepareBlue: {},//准备连接设备

    // 根据后台支持的蓝牙配置接口获取的数据
    //write 和 notify一致； 暂时写死
    uuidList : {
        writeSerUUID: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", //write-serverId
        notifySerUUID: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", //notify - serverId 

        notifyCharUUID: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",  // write- 特征值
        writeCharUUID: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", //notify- 特征值
    }
};

//蓝牙数据
let _comMethod = {
    /*****************蓝牙相关判断方法*******************/

    // 获取服务值  单独组件
    getDeviceService: function () {
        var self = this;
        self.setData({
            isConnected: app.globalData.isConnectBlue
        });
        console.log(app.globalData.connectObj.deviceId,"设备名称")
        if (self.data.isConnected) {
            
            wx.getBLEDeviceServices({
                deviceId: app.globalData.connectObj.deviceId + "",
                success: function (res) {
                    console.log('获取服务成功', res.services);
                    for (var i = 0; i < res.services.length; i++) {
                        if (res.services[i].uuid == self.data.uuidList.writeSerUUID) {
                            self.setData({
                                writeService: res.services[i]
                            })
                        }

                        if (res.services[i].uuid == self.data.uuidList.notifySerUUID) {
                            self.setData({
                                notifyService: res.services[i]
                            })
                        }
                    }
                    self.getNotifyBLEDeviceCharacteristics();
                }
            })
        }
    },
    //获取蓝牙设备唤醒characteristic（特征值）
    getNotifyBLEDeviceCharacteristics: function () {
        var self = this;

        wx.getBLEDeviceCharacteristics({
            deviceId: app.globalData.connectObj.deviceId + "",
            serviceId: self.data.notifyService.uuid + "",
            success: function (res) {

                console.log('唤醒和写入特征值获取成功', res.characteristics);

                for (var i = 0; i < res.characteristics.length; i++) {
                    if (res.characteristics[i].uuid == self.data.uuidList.notifyCharUUID) {
                        self.setData({
                            notifyCharVal: res.characteristics[i]
                        })
                    }

                    if (res.characteristics[i].uuid == self.data.uuidList.writeCharUUID) {
                        self.setData({
                            writeCharVal: res.characteristics[i]
                        })
                    }
                }

                self.initNotifyListener();
            }
        })
    },
    // 初始化特征值
    initNotifyListener: function () {

        var self = this;
        console.log(self.data.notifyCharVal.uuid, "注册监听参数");

        wx.notifyBLECharacteristicValueChange({
            deviceId: app.globalData.connectObj.deviceId + "",
            serviceId: self.data.notifyService.uuid + "",
            characteristicId: self.data.notifyCharVal.uuid + "",
            state: true,
            success: function (res) {

                app.util.loadingFun("正在同步数据");
                self.setNotifyCallBack();
                
            },
            fail: function (res) {
                console.log("开启监听失败", res.errMsg);
            }
        });
    },

    //开启notify监控
    setNotifyCallBack: function(){
        var self = this;
        //指令发送成功
        setTimeout(function () {
            self.sendCmd();
        }, 1000);
        // 监听蓝牙广播数据

        setTimeout(function () {
            self.OnBLECharValueChange();
        }, 1000);
    },
    //向蓝牙中写入数据（ble蓝牙）
    sendCmd: function () {
        var self = this;
        var commends = self.data.sendCommend;
        var buffer = self.hexStringToArrayBuffer(commends);

        self.setData({
            isSynchronous: true
        })
        wx.writeBLECharacteristicValue({

            deviceId: app.globalData.connectObj.deviceId + "",
            serviceId: self.data.writeService.uuid + '',
            characteristicId: self.data.writeCharVal.uuid + '',
            value: buffer,
            success: function (res) {
                console.log('发送指令成功', res.errMsg);

                var AppData = self.data;
                if (!self.data.isFacility){
                    if (self.data.isHeart) { //心率页面同步数据
                        self.setData({
                            heartSyncTimer: setInterval(function () {
                                self.syncHeartDataToServer();
                            }, 60000)
                        })
                    } else { 
                        //同步总数据
                        app.globalData.isSyncData = true;
                        self.setData({
                            isSyncData: true,
                        });
                        self.setData({
                            syncTimer: setTimeout(function () {
                                self.syncDataToServer();
                            }, 6000)
                        });
                    }
                }
                
            },
            fail: function (res) {
                console.log('执行写入指令失败', res.errMsg);
            },
            complete: function () {

            }
        });
    },

    // 蓝牙返回值变化
    OnBLECharValueChange: function (type) {
        var self = this;
        wx.onBLECharacteristicValueChange(function (res) {
            
            if (!self.data.isFirstSync) {
                self.setData({
                    isFirstSync: true
                })
            }
            var value = "",
                flag = false;

            try {
                value = self.arrayBufferToHexString(res.value);
            } catch (err) {
                if (self.data.isFirstSync) {
                    flag = true;
                }
            } finally {
                
                if (value && value == "" && self.data.isFirstSync && flag) {// 没有数据
                    app.util.showModalFun("未接收到手环数据");
                    wx.hideLoading();
                } else {
                    if (value && value != "") {

                        var str = bleUtils.arrToStr(value.toUpperCase());

                        console.log(str);
                        //判断是否是心率的显示
                        if (self.data.isHeart){
                            var hVal = self.analysisHeart(str);

                            if (value.length > 13 && hVal != "" && hVal!="00"){
                                self.setData({
                                    hShow:{
                                        heartVal: hVal,
                                        fontH: "72"
                                    }
                                });
                            }else{
                                self.setData({
                                    hShow:{
                                        heartVal: "未获取",
                                        fontH: "42"
                                    }
                                });
                            }
                        } else if (self.data.isFacility){ // 判断是否是设备页获取信息
                            var strS = "",
                                arr = str.split(" ");
                            if (self.data.fisrtOrder){

                                arr.length > 0 ? strS = parseInt(arr.slice(6)[2], 16) : strS = "";
                                self.setData({
                                    version: strS,
                                    fisrtOrder: false
                                })
                            }else{
                                arr.length > 0 ? strS = parseInt(arr[arr.length - 1], 16) : strS = "";
                                self.setData({
                                    batteryT: strS
                                })
                            }
                        }else{
                            self.setData({
                                syncList: self.data.syncList.concat(str)
                            });
                        }
                        //同步数据到服务器
                    } else { // 标记同步完成
                        self.setData({
                            isSynchronous: false
                        });
                        wx.hideLoading();
                        //同步数据
                        // app.util.showTipAuto("接收手环数据完成");
                    }
                }
            }
        })
    },
    // 向服务器同步总数据，判断当前数据列表中每一位数据是否和前一位和后一位相同，过滤
    syncDataToServer: function () {
        var self = this;
        var arr = self.data.syncList;
        
        // 分时间段向后台同步数据，处理数据较多的情况
        var comp = parseInt((self.data._pageIndex * self.data._size) / 2);

        if (self.data.syncList.length && self.data.syncList.length > comp) {

            var pageData = self.data.syncList.slice((self.data._pageIndex-1) * self.data._size, self.data._pageIndex * self.data._size);

            if (pageData && pageData.length) {

                console.log("同步页数", self.data._pageIndex);

                self.syncAjax(pageData);
            } else {
                if (!pageData.length) {
                    clearInterval(self.data.syncTimer);
                    return false;
                }
                app.util.loadingFun("暂无数据");
            }
        }else{
            var obj = {
                syncTime: self.getSyncTime() || "",
            };
            //同步总数据
            app.globalData.isSyncSuccess = true;
            self.setData({
                isSyncSuccess: true,
            });
            //本地缓存记住同步时间
            var json = app.util.getStorageData(obj);
            wx.setStorageSync("connectObj", json);

            wx.hideLoading();
            app.util.showModalFun("没有数据可同步了");
        }
    },
    syncAjax: function (pageData){
        var self = this,
            session_id = self.data.user.sessionid;
        //注意是复杂类型，要序列化
        if (pageData && pageData.length){
            var params = {
                serviceId: self.data.notifyService.uuid || "",
                characteristicId: self.data.notifyCharVal.uuid || "",
                value: pageData
            };

            console.log("请求参数", params);

            self.setData({
                testList: pageData
            });

            wx.request({
                url: app.util.ajaxUrl.AppDeviceSaveValue,
                method: 'POST',
                data: params,
                header: { "session_id": session_id },
                success: function (res) {

                },
                complete: function (res) {

                    if (res.data.IsSuccess || res.data.Message.indexOf("Success") > -1) {

                        var __index = self.data._pageIndex;
                        __index++;
                        self.setData({
                            _pageIndex: __index
                        });
                    }
                    self.setData({
                        syncTimer: setTimeout(function () {
                            self.syncDataToServer();
                        }, 2000)
                    });
                }
            });
        }else{
            //同步总数据
            app.globalData.isSyncSuccess = true;
            self.setData({
                isSyncSuccess: true,
            });

            var obj = {
                syncTime: self.getSyncTime() ||"",
            };
            //本地缓存记住同步时间
            var json = app.util.getStorageData(obj);
            wx.setStorageSync("connectObj", json);

            wx.hideLoading();
        }
        
    },
    //同步心率信息
    syncHeartDataToServer: function(){
        var self = this,
            session_id = self.data.user.sessionid;

        var params = {
            headRate:  self.data.hShow.heartVal
        };

        wx.request({
            url: app.util.ajaxUrl.AddHeart,
            method: 'GET',
            data: params,
            header: { "session_id": session_id },
            success: function (res) {
                console.log("保存心率");

                if (res.data.IsSuccess) {
                    var AHRunStatus = 0;
                    //大于120是燃脂
                    if (parseInt(self.data.hShow.heartVal) > 120 ){
                        AHRunStatus = 1;
                    }
                    var obj = {
                        AHRunStatus: AHRunStatus,
                        AHResting: self.data.hShow.heartVal,
                        showTime: self.getCurTimeHHMM() || ""
                    };
                    self.data.hisList.unshift(obj);
                }
            },
            complete: function () {
                wx.hideLoading();
            },
            fail: function () {

            }
        });
    },
    //字符串转为类型化数组
    hexStringToArrayBuffer(commend) {
        var self = this,
            data = [];

        data = commend.split(",");

        var buffer = new ArrayBuffer(data.length),
            dataView = new DataView(buffer);

        for (var i = 0; i < data.length; i++) {
            dataView.setUint8(i, data[i]);
        }
        return buffer;
    },
    //类型化数组转字符串
    arrayBufferToHexString(buffer) {
        var self = this;
        var hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
                return ('00' + bit.toString(16)).slice(-2)
            }
        )
        return hexArr.join('');
    },
    
    //解析心率的数据
    analysisHeart: function(str){
        //数据已经处理过一次
        var arr = str.split(" "),
            heart16 = "";
        //获取16进制的心率值，最后两位代表心率值
        if (arr.length){
            heart16 = arr[arr.length - 1];
        } 
        return parseInt(heart16, 16);
    },


    //返回蓝牙是否正处于链接状态
    setConnectionStateChange: function () {
        var self = this;
        wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            return res.connected;
        });
    },

    /*****************蓝牙相关判断方法*******************/
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

    //获取当前的同步时间
    getSyncTime: function(){
        var self = this,
            days = new Date();

        var yy = days.getFullYear(),
            mm = (days.getMonth() + 1),
            dd = days.getDate(),
            hh = days.getHours(),
            min = days.getMinutes();

        mm < 10 ? (mm = "0" + mm) : mm;
        dd < 10 ? (dd = "0" + dd) : dd;
        hh < 10 ? (hh = "0" + hh) : hh;
        min < 10 ? (min = "0" + min) : min;
        var dates = yy + "年" + mm + "月" + dd + "日" + " " + hh + ":" + min;

        return encodeURIComponent(dates);
    },
    /************错误提示和兼容 end*********/
    // 返回首页
    cancelStart: function () {
        wx.navigateBack({
            url: "../../index/index"
        })
    },

    //获取时分
    getCurTimeHHMM: function (time) {
        var newTime = new Date(),
            hh = newTime.getHours(),
            mm = newTime.getMinutes();

        hh < 10 ? hh = ("0" + hh) : hh;
        mm < 10 ? mm = ("0" + mm) : mm;
        return hh + ":" + mm;
    }
}

//小程序中支持es6的转换
function blueInt(conf) {

    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];

    //组件中调用页面
    this._page = curPage;

    Object.assign(curPage, _comMethod);

    curPage.setData(Object.assign(_comData, conf));

    curPage.blueInt = this;

    return this;
}

export { blueInt }