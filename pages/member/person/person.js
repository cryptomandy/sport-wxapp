var app = getApp();
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""   
        },
       
        endLimit:"",
        birthDay:"",

        // 弹框组件
        sexIndex: -1,
        wIndex: -1,
        hIndex: -1,

        // 弹框数据
        wightArr: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
        hightArr: [130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240],
        sexArr : ["男","女"],
        //是否显示提示信息
        isShow: false  

    },
    onLoad: function () {
        var self = this;
        app.util.loadingFun();
        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            })
        });
        self.setData({
            endLimit: app.util.getTodayDate()
        });


    },
    onShow: function () {
        var self = this;
        self.getPersonData();
    },
    
    //获取个人信息
    getPersonData: function () {
        var self = this,
            params = {},
            session_id = self.data.user.sessionid;

        wx.request({
            url: app.util.ajaxUrl.GetUser || "",
            header: { 'content-type': 'application/json', "session_id": session_id },
            success: function (res) {
                var res = res.data;
                if (res) {
                    self.handlerData(res);
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },
    handlerData: function (res){
        // console.log(res);
        //判断是否都有值
        var judgeObj = {
            BirthDate: res.BirthDate,
            Height: res.Height,
            Weight: res.Weight,
            Gender: res.Gender
        };
        for (var key in judgeObj) {
            if (judgeObj[key] == 0 || judgeObj[key] == "") {
                obj.isShow = true;
            };
        }

        var self = this,
            obj = {
                sexIndex: -1,
                wIndex: -1,
                hIndex: -1,
                isShow: false
            };
        if (res.Gender == 1) {//性别处理
            obj.sexIndex = 0;
        }else{
            obj.sexIndex = 1;
        }
        
        var Weight = parseInt(res.Weight),
            Height = parseInt(res.Height);

        if (Weight != self.data.wightArr[self.data.wIndex]) {
            for (var i = 0; i < self.data.wightArr.length; i++) {
                if (self.data.wightArr[i] == Weight) {
                    obj.wIndex = i;
                    break;
                }
            }
        }
        if (Weight != self.data.hightArr[self.data.hIndex]) {
            for (var i = 0; i < self.data.hightArr.length; i++) {
                if (self.data.hightArr[i] == Height) {
                    obj.hIndex = i;
                    break;
                }
            }
        }
        
        self.setData({
            sexIndex: obj.sexIndex,
            birthDay: res.BirthDate || "",
            hIndex: obj.hIndex,
            wIndex : obj.wIndex,
            isShow: obj.isShow
        })
    },


    commitData: function () {
        var self = this,
            params = {};
        var datas = self.data;
        if (datas.sexArr[datas.sexIndex] =="男"){
            params.AMGender = 1;
        }else{
            params.AMGender = 2;
        }
        var session_id = self.data.user.sessionid;

        params.AMWeight = datas.wightArr[datas.wIndex];
        params.AMHeight = datas.hightArr[datas.hIndex];
        params.AMBirthDate = datas.birthDay;

        wx.request({
            url: app.util.ajaxUrl.ModifyUser || "",
            data: params,
            method: 'POST',
            header: { 'content-type': 'application/json', "session_id": session_id },
            success: function (res) {
                var res = res.data;
                if (res && res.IsSuccess) {
                    app.util.showTipAuto("保存成功");
                }else{
                    app.util.showModalFun("保存失败");
                }
            },
            fail: function (res) {
                app.util.showModalFun("保存失败");
            },
            complete: function () {

            }
        })
    },
    getShowData: function () {
        var self = this;

        self.data.hightArr = [];
        for (var i = 130; i < 241; i++) {
            self.data.hightArr.push(i);
        }
        console.log(JSON.stringify(self.data.hightArr));

        self.data.wightArr = [];
        for (var i = 35; i < 151; i++) {
            self.data.wightArr.push(i);
        }
        console.log(JSON.stringify(self.data.wightArr));
    },
    setDateLimit:function(){
        var t = new Date(), 
            yy = t.getFullYear(),
            mm = t.getMonth() + 1,
            dd = t.getDate();
        mm < 10 ? (mm = "0" + mm) : mm;
        dd < 10 ? (dd = "0" + dd) : dd;
        return yy + "-" + mm + "-" + dd;
    },
    bindDateChange: function (e) {
        console.log(e.detail)
        this.setData({
            birthDay: e.detail.value
        });
        this.commitData();
    },
    bindSexChange: function(e){
        this.setData({
            sexIndex: parseInt(e.detail.value)
        })
        if (this.data.sexIndex!=-1){
            this.commitData();
        }
        
    },
    bindHightChange: function(e){
        this.setData({
            hIndex: parseInt(e.detail.value)
        });
        if (this.data.hIndex != -1) {
            this.commitData();
        }
    },
    bindWightChange: function (e) {
        this.setData({
            wIndex: parseInt(e.detail.value)
        });
        if (this.data.wIndex != -1) {
            this.commitData();
        }
    }
})