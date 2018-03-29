var app = getApp();

Page({
    data: {
        user: {
            userInfo: {},
            sessionid: ""
        },
        isShadow: false,
        checkRes: 1,// 前端使用( 1已经测试过， 2没有测试, 3测试示范 , 7视频1，8视频2，9视频3)
        
        // 测试示例
        example:{
            url:"http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SHfileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400",
            imageUrl:"https://m.ly.com/healthy/health/assets/images/activity/package/top_1.jpg"
        },
        // 结果显示
        resList:[
            {
                name:"安静心率",
                nType: 1,
                checkArr:[60,70,100],
                iconClass:"", //样式
                score: 85,//分数
                iconMargin: "",//百分比
                limit:[
                    {
                        min: 0,
                        max : 60
                    },
                    {
                        min: 61,
                        max: 70
                    }, 
                    {
                        min: 71,
                        max: 100
                    },
                    {
                        min: 101,
                        max: 150
                    }
                ]
            },
            {
                name: "心率上升速度",
                nType: 3,
                checkArr: [20,50],
                iconClass: "",         

                score: 15,     
                iconMargin: "",               
                limit: [
                    {
                        min: 0,
                        max: 20
                    },
                    {
                        min: 21,
                        max: 50
                    },
                    {
                        min: 51,
                        max: 100
                    }
                ]
            },
            {
                name: "心率上升速度",
                nType: 5,
                checkArr: [20,40],
                iconClass: "",
                score: 30,
                iconMargin: "",
                limit: [
                    {
                        min: 0,
                        max: 20
                    },
                    {
                        min: 21,
                        max: 40
                    },
                    {
                        min: 41,
                        max: 100
                    }
                ]
            }

        ],
        checkTime: ""
        
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
    onShow: function(){
        this.setBrainShow();
    },
    CheckTipFun: function(){
        this.setData({
            checkRes: 3
        })
    },
    startCheck : function(){
        this.setData({
            checkRes : 7
        })
    },

    //计算心率结果小图标的显示
    setBrainShow: function(){
        var self = this,
            allItem = self.data.resList;
        for (var i = 0; i < allItem.length> 0 ;i++){
            for (var j = 0; j < allItem[i].limit.length; j++){
                var item = allItem[i].limit;
                if (allItem[i].score >= item[j].min && allItem[i].score <= item[j].max){

                    var inter = item[j].max - item[j].min, //当前区间的差值
                        perInter= Math.round((allItem[i].score - item[j].min) / inter * 100);

                    if (allItem[i].nType==1){
                        allItem[i].iconMargin = perInter * 0.25 + j * 25;
                        allItem[i].iconMargin = (allItem[i].iconMargin * 0.92).toFixed(2);
                        
                    }else{
                        allItem[i].iconMargin = perInter * 33 / 100 + j * 33.3333;
                        allItem[i].iconMargin = (allItem[i].iconMargin * 0.92).toFixed(2);
                        
                    }

                    allItem[i].iconClass = self.setIconColor(allItem[i].nType,j);
                    
                }
            }
        }
        self.setData({
            resList:allItem
        })
    },
    // 设置图标颜色
    setIconColor: function (nType,j){
        var self = this,
            colorN = "";
        //安静心率
        if (nType==1){
            if(j==0){
                colorN = ".r_p";
            }else if(j==1){
                colorN = ".r_g";
            }else if(j==2){
                colorN = ".r_n";
            }else{
                colorN = ".r_b";
            }
        }
        //上升速度
        if (nType == 3) {
            if (j == 0) {
                colorN = ".r_g";
            } else if (j == 1) {
                colorN = ".r_n";
            } else {
                colorN = ".r_b";
            }
        }
        if (nType == 5) {
            if (j == 0) {
                colorN = ".r_b";
            } else if (j == 1) {
                colorN = ".r_n";
            } else {
                colorN = ".r_g";
            }
        }
        return colorN;
    }
    
})