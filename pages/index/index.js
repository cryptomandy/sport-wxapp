var app = getApp();

var delayTimer = null;
import { blueInt } from '../../components/data/data.js';
import { connectInt } from '../../components/connect/connect.js';

/**
 * @第一次让用户自己选择，点击连接，第二次也要显示连接页面，否则不知道是否打开蓝牙，方便处理，在连接页面，搜索后自动连接，并且处理跳转问题，如果在首页处理，状态不好控制
 * 
*/
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        bluestate:{},
        //蓝牙连接状态
        isConnect: false, //是否连接设备
        isbluetoothready: false,
        searchingstatus: false,

        //顶部统计
        percent : 0,  //
        isStyle:{
            isLDeg: "rotate(" + (18 / 5) * 0 + "deg)",
            cirClass: "",
            rightClass: "wth0"
        },

        stepData: {  //异步获取的数据
            ASSteps: 0, //总步数
            ASMileage: 0,//公里
            ASCAL:0// 热量
        },
        isFacility: false,
        isSyncSuccess: false,//是否同步数据完成
    },
    
    //监听页面加载
    onLoad: function () {
        var self = this;
        //放在页面onLoad中可以继续同步数据，如果连接了设备；设备连接后将数据全局保存起来，回到首页进行同步，仅限于当前全局环境
        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            });
        });
        
    },
    onShow :function (){
        // this.GetSetDateStr();

        app.util.loadingFun(); //加载提示
        
        new blueInt({
            sendCommend: "",
            isHeart: false
        });
        new connectInt();

        var self = this;
        
        self.setData({
            isConnect: app.globalData.isConnectBlue                                                 
        });
        
        if (!app.globalData.state.isFirstCon) {

            app.globalData.state.isFirstCon = true;

            var state = {
                isFirstCon: true,
                isConSuccess: app.globalData.state.isConSuccess
            };

            wx.setStorageSync('state', state);

            self.connectF();
            wx.hideLoading();
        }

        if (app.globalData.isConnectBlue) {
            self.getStepsData();
            //同步数据，数据只同步一次，在进入首页时判断同步，如果连接完成后，回到首页进行同步数据
            if (!app.globalData.isSyncData) {
                self.GetSetDateStr(self.getDeviceService());
            }
        }else{
            if (!wx.openBluetoothAdapter) {
                app.util.showModalFun("当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。");
                return;
            }
            wx.openBluetoothAdapter({
                success: function (res) {

                },
                fail: function (res) {
                    wx.showModal({
                        content: "同步数据需要打开蓝牙，检测蓝牙未打开，请去手机设置中打开",
                        showCancel: true,
                        confirmText: "确定",
                        confirmColor: "#1bb1fe",
                        cancelColor: "#999",
                        success: function (res) {
                            //有取消按钮时，确认的回调函数
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '../facility/addnew/n?type=1'
                                })
                            }
                        }
                    })
                },
                complete(res) {
                }
            })
            
        }
        wx.hideLoading();
        
    },
    
    //下拉获取信息
    onPullDownRefresh: function(){
        app.util.loadingFun(); //加载提示
        if (self.data.isConnect) {
            self.getStepsData();
            //同步数据，数据只同步一次，在进入首页时判断同步，如果连接完成后，回到首页进行同步数据
            if (!app.globalData.isSyncData) {
                self.GetSetDateStr(self.getDeviceService());
                wx.hideLoading()
            }
        }
    },
    //去连接蓝牙
    connectF: function(){
        var self = this;
        //未连接提示去连接
        if (!self.data.isConnect){
            wx.showModal({
                content: "是否授权60秒健康蓝牙连接设备？",
                showCancel: true,
                confirmText: "确定",
                confirmColor: "#1bb1fe",
                cancelColor: "#999",
                success: function (res) {
                    //有取消按钮时，确认的回调函数
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '../facility/addnew/n?type=1'
                        })
                    }
                }
            })
        }
    },
    //获取同步指令数据
    GetSetDateStr: function(callback){
        var self = this,
            session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.GetSetDateStr || "",
            header: { "session_id": session_id },
            success: function (res) {
                console.log("指令",res.data);
                self.setData({
                    sendCommend: res.data
                });

                if (callback){
                    console.log("获取到指令", res.data);
                    callback.call();
                }
            },
            complete: function () {}
        })
    },

    //获取步数
    getStepsData: function(callback){
        var self = this,
            session_id = self.data.user.sessionid;
        var params = {
            ASDataType: 0,
            // ASStartTime: app.util.getTodayDate()
        };

        wx.request({
            url: app.util.ajaxUrl.AppStepsList || "",
            data: params,
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;
                if (res.list && res.list.length>0){
                    var datas = res.list[0];
                    var percent = 0;
                    if (datas.ASSteps && datas.ASAimSteps){
                        percent = Math.floor((parseInt(datas.ASSteps) / parseInt(datas.ASAimSteps)) * 100);
                    }
                    
                    if (percent > 50) {

                        var per = percent;
                        if (percent > 100) {
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

                    self.setData({
                        percent:  percent,
                        stepData: {
                            ASSteps: datas.ASSteps || 0, //总步数
                            ASMileage: datas.ASMileage ||0,//公里
                            ASCAL: datas.ASCAL ||0// 热量
                        },
                    });
                }else{
                    if (res.message && res.message!="没有session_id"){
                        app.loginSet();
                    }
                }
            },
            complete: function(){
                wx.hideLoading();
                if (callback){
                    callback.call();
                }
            }
        })
    },

    jumpRemd:function(touch){
        var t = touch.currentTarget,
            pageId = 0;

        if (t.id=="1"){
            pageId = 1;
        } else if (t.id == "2"){
            pageId = 2;
        } else if (t.id == "3") {
            pageId = 3;
        } else if (t.id == "4") {
            pageId = 4;
        }
        wx.navigateTo({
            url: "../other/f?pageId=" + pageId
        })
    },
    /****************** canvas绘图********************************/ 

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});