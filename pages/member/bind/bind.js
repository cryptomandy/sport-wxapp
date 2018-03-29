var app = getApp();
//注意提示后台修改验证码发送状态
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        PhoneNumber : "",
        AuthCode:"",
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
    // 异步请求
    getCodeInfro :function(){
        var self = this;
        var reg =/^1[3,4,5,7,8][0-9]{9}$/;
        if(!reg.test(self.data.PhoneNumber)){
            
            app.util.showModalFun("请输入正确的手机号");
        }else{
            var params = {
                    mobile: self.data.PhoneNumber
                },
                session_id = self.data.user.sessionid;

            wx.request({
                url: app.util.ajaxUrl.SendMobileCode,
                data: params,
                header: { 'content-type': 'application/json', "session_id": session_id },
                success: function(res){
                    var res = res.data;
                    if(res && res.IsSuccess){
                        app.util.showModalFun("验证码发送成功");
                    }else{
                        var failTips = "发送验证码失败，请稍后发送";
                        if(res.Message && res.Message!=""){
                            failTips = res.Message;
                        }
                        app.util.showModalFun(failTips);
                    }   
                }
            })
        }
    },
    loginInfro :function(){
        //验证码是否需要验证
        var self = this;
        var reg = /\d{6}/;
        if(!reg.test(self.data.AuthCode)){
            app.util.showModalFun("请输入正确的验证码");
        }else{
            
            var params = {},
                session_id = self.data.user.sessionid;
                
            params.AMPhoneNumber = self.data.PhoneNumber;
            params.AMModifyByName = self.data.AuthCode;

            wx.request({
                url: app.util.ajaxUrl.ModifyPhoneNumber,
                data: params,
                method: "Post",
                header: { 'content-type': 'application/json', "session_id": session_id },
                success: function(res){
                    var res = res.data;
                    if (res.IsSuccess){
                        wx.navigateBack({
                            url: '../member/member'
                        })
                    }else{
                        var failTips = "绑定手机号码失败，请稍后重试";
                        if(res.Message && res.Message!=""){
                            failTips = res.Message;
                        }
                        app.util.showModalFun(failTips);
                    }  
                }
            });
        }
    },
    // 输入框绑定
    bindsendPhone: function(e){
        this.setData({
            PhoneNumber: e.detail.value
        })
    },
    bindCodeInput:function(e){
        this.setData({
            AuthCode: e.detail.value
        })
    },
})