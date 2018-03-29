var util = {};
var host = "https://ebkapi.17u.cn";  //线上
// var host = "http://10.108.133.79";  //测试
// var host = "http://localhost";

util = {
    wxPromisify: function(fn){
        return function (obj = {}) {    
            return new Promise((resolve, reject) => {      
            obj.success = function (res) {        
                resolve(res)      
            }      
            obj.fail = function (res) {        
                reject(res)      
            }      
            fn(obj)    
            })  
        }
    },
    // 获取当前时间
    getTodayDate : function(){
        
        var days = new Date();
        // var days = new Date("2017-12-23"); //测试时间
        var yy = days.getFullYear(),
            mm = (days.getMonth() + 1),
            dd = days.getDate();
        mm < 10 ? ( mm = "0" + mm ) : mm;
        dd < 10 ? ( dd = "0" + dd ) : dd;

        var dates = yy + "-" + mm + "-" + dd;
        return dates;
    },
   /**
   * @desc 错误提示或者确认提示 "我知道了"/"确认" ,btnText(按钮文案)
   * */ 
    showModalFun : function(content, btnText,confirmColor){
        wx.showModal({
            content: content,
            showCancel: false,
            confirmText : btnText || "确定",
            confirmColor:confirmColor || "#1bb1fe",
            success:function(res){
                
            }
        })
    },
    /**
   * @desc 错误提示或者确认提示 "我知道了"/"确认" ,btnText(按钮文案)
   * */
    showModalCallBack: function (content, btnText,callback) {
        wx.showModal({
            content: content,
            showCancel: false,
            confirmText: btnText || "确定",
            confirmColor: "#1bb1fe",
            success: function (res) {
                if (res.confirm){
                    if (callback){
                        callback();
                    }
                }
            }
        })
    },
   /**
   * @desc 加载中提示
   * */ 
    loadingFun : function(title,type){
        // 加载中提示
        wx.showLoading({
            title: title || "努力加载中",
            mask : false,
            success: function(){
            }
        });
        if (type){
            setTimeout(function(){
                wx.hideLoading();
            })
        }
    },
    //获取storage信息
    getStorageData: function (conf) {
        var self = this;
        var sessionCon = wx.getStorageSync("connectObj");
        //本地记录蓝牙信息
        var obj = {
            name: "",
            deviceId: "",
            syncTime: "",
            batteryT: "",
            version: "",
        };

        conf.name && conf.name != "" ? (obj.name = conf.name) : (obj.name = sessionCon.name || "");
        conf.deviceId && conf.deviceId != "" ? (obj.deviceId = conf.deviceId) : (obj.deviceId = sessionCon.deviceId || "");
        conf.syncTime && conf.syncTime != "" ? (obj.syncTime = conf.syncTime) : (obj.syncTime = sessionCon.syncTime || "");
        conf.batteryT && conf.batteryT != "" ? (obj.batteryT = conf.batteryT) : (obj.batteryT = sessionCon.batteryT || "");
        conf.version && conf.version != "" ? (obj.version = conf.version) : (obj.version = sessionCon.version || "");

        // wx.setStorageSync("connectObj", obj);
        return obj;

    },
    /**
   * @desc 半透明提示保存成功
   * */
    showTipAuto: function (title,time) {
        wx.showToast({
            title: title || '保存成功',
            icon: 'success',
            duration: time || 1000
        })
    },
    /**
   * @desc 半透明没有图标的提示
   * */
    showTipCommon: function (title, time) {
        wx.showToast({
            title: title,
            icon:"",
            duration: time || 1000
        })
    },
   /**
   * @desc 异步地址配置,域名走统一配置
   * */ 
    ajaxUrl: {
        //登录保存用户
        "test": host + "/healthapi/AppDevice/Test",  
        "jscode2session": host + "/healthapi/Home/jscode2session",
        //统计
        "BMIModify": host + "/healthapi/AppDevice/BMIModify",//体重身高测量结果
        "GetBMI": host + "/healthapi/AppDevice/GetBMI",//获取用户测量信息

        "AppStepsList": host + "/healthapi/AppSteps/AppStepsList",//步数统计
        "AppSleepList": host + "/healthapi/AppSleep/AppSleepList",// 睡眠统计
        "AppStatistics": host + "/healthapi/AppSteps/AppStatistics", //统计主页
        
        //个人中心
        "ModifyAim": host + "/healthapi/AppDevice/ModifyAim",//  目标修改
        "ModifyUser": host + "/healthapi/AppDevice/ModifyUser",//  个人中心信息提交
        "GetUser": host + "/healthapi/AppDevice/GetUser", //获取用户信息数据
        "SendMobileCode": host + "/healthapi/AppDevice/SendMobileCode",//发送手机验证码
        "ModifyPhoneNumber": host + "/healthapi/AppDevice/ModifyPhoneNumber",//

        "HeartRateList": host + "/healthapi/AppHeartRate/AppHeartRateList",//心率列表
        "CardioRisk": host + "/healthapi/AppHeartRate/CardioRisk",
        "CardioRiskGet": host + "/healthapi/AppHeartRate/CardioRiskGet",


        "AppDevice": host + "/healthapi/AppDevice/AppDevice", //获取设备的特征值参数和uuid
        "AppVideoList": host + "/healthapi/AppGuide/AppVideoList",//视频列表
        "GetSetDateStr": host + "/healthapi/AppDevice/GetSetDateStr", //获取同步数据指令
        "AppDeviceSaveValue": host + "/healthapi/AppDevice/AppDeviceSaveValue",//同步数据到服务器
        "AddHeart": host + "/healthapi/AppHeartRate/AddHeart", // 保存心率,
        "GetSetSyncSleepData": host + "/healthapi/AppDevice/GetSetSyncSleepData",//睡眠指令

    },
    exampleAjax: function () {
        var self = this,
            params = {};
        var session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.ModifyUser || "",
            method: 'POST',
            header: { 'content-type': 'application/json', "session_id": session_id },
            success: function (res) {
                var res = res.data;
                if (res && res.IsSuccess) {
                    app.util.showModalFun("成功");
                } else {
                    app.util.showModalFun("失败");
                }
            },
            fail: function (res) {
                app.util.showModalFun("失败");
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    }
};
module.exports = util;
/**
 * 1. 发送完验证码绑定手机 ***
 * 2. 营养页面同步加载，不能加载太多
 * 3. 统计页面样式需要兼容  
 * 4. ios下健康指数不能获取页面空白 ***
 * 5. canvas画图不能跳转
 * 6. 统计页没有数据兼容问题；  **** 
 * 7. canvas数据画图步数显示换行问题
 * */ 