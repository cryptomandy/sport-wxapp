var app = getApp();
var LOAD = {
};


// 获取节点信息，https://mp.weixin.qq.com/debug/wxadoc/dev/api/wxml-nodes-info.html
// 减少对已经渲染数据的操作
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        vedioList: [
            
        ],
        test:[
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName":"三高人群",
                "title":"三高人群每周饮食",
                "detail": "以清水灼熟食物，油份大大减少;清烚味道有助肝肾休息，帮助排毒去水...",
                "posterUrl":"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=844138308,4170970629&fm=27&gp=0.jpg"
            },
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName": "所有人群",
                "title": "营养膳食指南",
                "detail": "以清水灼熟食物，油份大大减少;清烚味道有助肝肾休息，帮助排毒去水...",
                "posterUrl": "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1694449341,614796693&fm=11&gp=0.jpg"
            },
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName": "三高人群",
                "title": "三高人群每周饮食",
                "detail": "健康饮食金字塔 民以食为天。解决温饱之后, 人们对于各种美味中所隐...",
                "posterUrl": "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=844138308,4170970629&fm=27&gp=0.jpg"
            },
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName": "所有人群",
                "title": "营养膳食指南",
                "detail": "健康饮食金字塔 民以食为天。解决温饱之后, 人们对于各种美味中所隐...",
                "posterUrl": "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1694449341,614796693&fm=11&gp=0.jpg"
            },
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName": "肥胖人群",
                "title": "健康瘦身餐",
                "detail": "健康饮食金字塔 民以食为天。解决温饱之后, 人们对于各种美味中所隐...",
                "posterUrl": "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=559444801,3652531339&fm=27&gp=0.jpg"
            },
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName": "三高人群",
                "title": "三高人群每周饮食",
                "detail": "健康饮食金字塔 民以食为天。解决温饱之后, 人们对于各种美味中所隐...",
                "posterUrl":"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=844138308,4170970629&fm=27&gp=0.jpg"
            },
            {
                "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171007/ebbcbf2866cd3dc22f11a9690bf099b7.mp4",
                "typeName": "肥胖人群",
                "title":"健康瘦身餐",
                "detail": "以清水灼熟食物，油份大大减少;清烚味道有助肝肾休息，帮助排毒去水...",
                "posterUrl": "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=559444801,3652531339&fm=27&gp=0.jpg"
            }
        ]
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
        LOAD.sTop = 0;  //距离顶部距离
        LOAD.__index = 1;  //标记加载到第几页
        LOAD.isLoading = false;  //标记请求列表是否完成
        LOAD.isFirst = true; //标记是否是第一次请求
        LOAD.page = 1; //视频列表总页数
        self.setData({
            vedioList: []
        })

        app.util.loadingFun();
        self.getAjaxData(false);
       
    },
    onShow: function(){
        var self = this;
       
    },

    getAjaxData: function (isClear) {
        var self = this;
        var session_id = self.data.user.sessionid;

        if (isClear) {
            app.util.loadingFun();
        }
        var param = {
            PageSize: 7,
            PageIndex: LOAD.__index,
            AVItemType: 5
        };
        wx.request({
            url: app.util.ajaxUrl.AppVideoList,
            data: param,
            // url:"", //视频列表异步
            header: { "session_id": session_id },
            success: function (res) {

                var res = res.data;
                // var res = {
                //     list : self.data.test 
                // };
                if (res.list && res.list.length > 0) {
                    LOAD.page = parseInt(res.total);

                    var totalLen = self.data.vedioList.length;

                    res.list.forEach(function (item, i) {
                        item.DataId = i + totalLen;
                    });

                    self.setData({
                        vedioList: self.data.vedioList.concat(res.list)
                    });
                    console.log(LOAD.page);
                    if ((LOAD.__index) == LOAD.page){
                        self.setData({
                            textMsg:"没有更多视频啦"
                        });
                    }else{
                        if (parseInt(res.total) > 7){
                            self.setData({
                                textMsg: "滑动加载更多"
                            });
                        }else{
                            self.setData({
                                textMsg: "没有更多视频啦"
                            });
                        }
                    }
                    LOAD.__index++;
                    LOAD.isLoading = true;
                    
                }else{
                    self.setData({
                        textMsg: "没有更多视频啦"
                    });
                }
                wx.hideLoading();
            },
            fail: function () {
                self.setData({
                    textMsg: "没有获取到视频信息"
                });
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
            }else{
                setTimeout(function () {
                    self.getAjaxData(true);
                },500);
            }
        }

    },
    // onPageScroll: function (config){
    //     var self = this;
    //     var length = this.data.vedioList.length,
    //         preS = LOAD.sTop,
    //         newS = config.scrollTop;
    //     var flag = false;
    //     if (LOAD.isFirst){
    //         flag = true;
    //         LOAD.isLoading = true;
    //         LOAD.isFirst = false;
    //     }
    //     // 计算加载过程中滑动的距离大于一定值值时执行加载，页数增多，页面可滑动范围增大，当前页数 * 间距随着页数变化
    //     var compare = 40 + LOAD.__index * parseInt((LOAD.__index * 4 / 5)) * 100;

    //     if (preS < newS && LOAD.isLoading && config.scrollTop > compare && LOAD.__index < LOAD.page){

    //         console.log(LOAD.__index, config.scrollTop, compare);
    //         LOAD.isLoading = false;
            
    //         if (flag){
    //             self.getAjaxData(true);
    //         }else{
    //             setTimeout(function () {
    //                 self.getAjaxData(true);
    //             },800)
    //         }
            
    //     }
    //     LOAD.sTop = newS;
    // }
})