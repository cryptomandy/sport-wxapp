var app = getApp();
import { connectInt } from '../../../components/connect/connect.js';
/**
 * 特征值数据类型
 * 用小程序api接口获取的特征值
 * */

Page({
    data:{
        pageType: "1",//默认首页，连接后回跳页面
        isFirstCon: false
    },
    onLoad: function (param) {
        var self = this;
        self.setData({
            pageType : param.type
        })
        new connectInt();
    },
    onShow:function(){
        var self = this;
        self.initComponent();
    },
    onHide: function(){
        clearInterval(_GP.delayTimer);
    }
});


