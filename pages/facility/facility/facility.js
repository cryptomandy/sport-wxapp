var app = getApp();
import { connectInt } from '../../../components/connect/connect.js';

Page({
    data:{
         user: {
            userInfo: {},
            sessionid: ""
        },
        
        //已经连接的设备信息
        name: "",
        deviceId: "",
        syncTime: "暂无信息",
        batteryT: "暂无信息",
        version: "暂无信息",

        isFacility: true,
        fisrtOrder: true,
        
        verOrder: "-85, 0, 3, -1, -110, -128", //版本号
        elecOrder: "-85, 0, 3, -1, -111, -128",//电量
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
        new connectInt();
    },
    onShow: function(){
        var self = this;
        var wxS = wx.getStorageInfoSync("connectObj");

        console.log("已经连接设备的信息", wxS);

        if (wxS && wxS.name && wxS.name != "") {
            wxS.syncTime = decodeURIComponent(wxS.syncTime);
            self.setData({
                name: wxS.name != "" ? wxS.name :"B3",
                deviceId: wxS.deviceId != "" ? wxS.deviceId : "暂无信息",
                syncTime: wxS.syncTime != "" ? wxS.syncTime : "暂无信息",
                batteryT: wxS.batteryT != "" ? wxS.batteryT : "暂无信息",
                version: wxS.version != "" ? wxS.version : "暂无信息"
            });
            self.setData({
                sendCommend: self.data.verOrder
            });
            self.getDeviceService();
            setTimeout(function(){
                self.setData({
                    sendCommend: self.data.elecOrder
                });
                self.getDeviceService();
            },4000)
        } 
        // else {
        //     wx.navigateTo({
        //         url: '../addnew/n',
        //     })
        // }
        wx.hideLoading();
    },
    //解除绑定后， 再次进入小程序时，要进行显示搜索信息，全局变量重置；这个过程最好同步服务器
    cancelBind: function(){
        var self = this;
        wx.showModal({
            content: "解除绑定后将无法获取手环内的信息。",
            showCancel: true,
            confirmText: "确定",
            confirmColor: "#1bb1fe",
            success: function (res) {
                
                if(res.confirm){
                    self.cancelAjax();
                }
            }
        })
    },
    cancelAjax: function(){
        var self = this,
            params = {};
        
        //全局参数重置
        app.globalData.state.isFirstCon = false;
        app.globalData.state.isConSuccess = false;

        app.globalData.state.isSyncSuccess = false;
        app.globalData.state.isSyncData = false;

        app.globalData.state.isConnectBlue = false;
        app.globalData.state.connectBlueObj = {};

        app.util.showModalCallBack("解除成功","",function(){
            wx.navigateBack({
                url:"../../member/member/member"
            })
        });

        // var session_id = self.data.user.sessionid;
        // wx.request({
        //     url: app.util.ajaxUrl.ModifyUser || "",
        //     method: 'POST',
        //     header: { 'content-type': 'application/json', "session_id": session_id },
        //     success: function (res) {
        //         var res = res.data;
        //         if (res && res.IsSuccess) {
        //             app.util.showModalFun("解除成功");
        //         } else {
        //             app.util.showModalFun("解除失败");
        //         }
        //     },
        //     fail: function (res) {
        //         app.util.showModalFun("解除失败");
        //     },
        //     complete: function () {

        //     }
        // })
    } 
});