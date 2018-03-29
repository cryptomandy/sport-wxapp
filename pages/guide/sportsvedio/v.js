var app = getApp();
var LOAD = {

};
Page({
    data:{
        user: {
            userInfo: {},
            sessionid: ""
        },
        test:[
            {
               "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171027/7eddd98bbb09639d5cd0ea2e17d92082.mp4",
                "typeName": "所有人群",
                "title": "全身拉伸训练",
                "detail": "同时拉伸某块肌肉的同时收缩它的拮抗肌, 引起交互抑制, 让被拉伸的...",
                "type": "增肌",
                "posterUrl":"https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=714196591,2657618024&fm=200&gp=0.jpg"
            },
            {
               "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171027/7eddd98bbb09639d5cd0ea2e17d92082.mp4",
                "typeName": "所有人群",
                "title": "颈椎病康复操",
                "detail": "颈椎操，是时下在办公族中流行的一种颈部保健运动。",
                "type": "锻炼",
                "posterUrl": "https://pic5.40017.cn/02/000/6a/2d/rBANDFm43b-AIgivAAC2mImW41A080_640x320_00.jpg"
            },
            {
               "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171027/7eddd98bbb09639d5cd0ea2e17d92082.mp4",
                "typeName": "肥胖人群",
                "title": "减肥运动",
                "detail": "想要减少身体上的赘肉，就要把体内多余的卡路里燃烧掉。消耗卡路里...",
                "type": "运动",
                "posterUrl": "https://pic5.40017.cn/02/000/6a/2d/rBANDFm43b-AIgivAAC2mImW41A080_640x320_00.jpg"
            },
            {
               "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171027/7eddd98bbb09639d5cd0ea2e17d92082.mp4",
                "typeName": "所有人群",
                "title": "古典瑜伽",
                "detail": "现代很多人经常对瑜伽流派混淆不清,经常把哈他瑜伽的多种变化形式...",
                "type": "锻炼",
                "posterUrl": "https://pic5.40017.cn/02/000/6a/2d/rBANDFm43b-AIgivAAC2mImW41A080_640x320_00.jpg"
            },
            {
               "Url": "https://od0uu77nr.qnssl.com/gonglue/iOSResource/20171027/7eddd98bbb09639d5cd0ea2e17d92082.mp4",
                "typeName": "肥胖人群",
                "title": "减肥运动",
                "detail": "想要减少身体上的赘肉，就要把体内多余的卡路里燃烧掉。消耗卡路里...",
                "type": "运动",
                "posterUrl": "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=714196591,2657618024&fm=200&gp=0.jpg"
            }
        ],
        vedioList:[],
        parentid: "",
        parent: {
            AVNote:"",
            AVTitle:"",
            AVCoverUrl:""
        }
    },
    //https://www.w3cschool.cn/weixinapp/weixinapp-video.html  看这个信息
    onLoad: function (conf) {

        var self = this;
        self.setData({
            parentid: conf.parentid
        })

        app.util.loadingFun();
        app.getUserInfo(function (res) {
            self.setData({
                user: {
                    userInfo: res.userInfo || {},
                    sessionid: res.sessionid || ""
                }
            })
        });
        
    },
    onShow: function () {
        
        var self = this;
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
    getAjaxData: function (isClear) {
        var self = this;
        var session_id = self.data.user.sessionid;

        if (isClear) {
            app.util.loadingFun();
        }
        var param = {
            PageSize: 7,
            PageIndex: LOAD.__index,
            AVItemType: 3,
            AHSceneType:1,
            AVParentId: self.data.parentid
        };
        wx.request({
            url: app.util.ajaxUrl.AppVideoList,
            data: param,
            header: { "session_id": session_id },
            success: function (res) {
                var res = res.data;
                // var res = {
                //     list: self.data.test
                // };

                if (LOAD.isFirst){
                    self.setData({
                        AVNote: res.parent.AVNote || "",
                        AVTitle: res.parent.AVTitle || ""
                    })
                }
                if (res.list && res.list.length > 0) {
                    LOAD.page = parseInt(res.total);

                    var totalLen = self.data.vedioList.length;

                    res.list.forEach(function (item, i) {
                        item.DataId = i + totalLen;
                    });

                    self.setData({
                        vedioList: self.data.vedioList.concat(res.list)
                    });
                    if ((LOAD.__index) == LOAD.page) {
                        self.setData({
                            textMsg: "没有更多视频啦"
                        });
                    } else {
                        if (parseInt(res.total) > 7) {
                            self.setData({
                                textMsg: "滑动加载更多"
                            });
                        } else {
                            self.setData({
                                textMsg: "没有更多视频啦"
                            });
                        }
                    }
                    LOAD.__index++;
                    LOAD.isLoading = true;
                }
                wx.hideLoading();
            },
            complete: function () {
            },
            fail: function () {
                self.setData({
                    textMsg: "没有获取到信息"
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
            } else {
                setTimeout(function () {
                    self.getAjaxData(true);
                }, 500);
            }
        }

    }
    
})