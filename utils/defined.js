//数组按照键值去重
function removeRepeat(data, type) {
    var obj = {},
        arr = [];

    for (var i = 0; i < data.length; i++) {

        if (!obj[data[i][type]]) {
            obj[data[i][type]] = [data[i]];
            arr.push(data[i]);
        } else {
            obj[data[i][type]].push(data[i]);
        }
    }

    return arr;
} 

//数组按照键值去重
function removeRepeatItem(data) {

    var newArr = [data[0]];

    for (var i = 1; i < data.length; i++) {
        if (newArr.indexOf(data[i]) == -1) {
            newArr.push(data[i]);
        }
    }
    return newArr;
} 


function arrToStr(value){
    var arr = [],
        strArr = "";
        
    if (typeof value == "string"){
        for (var i = 0; i < value.length; i = i + 2) {
            var str = value[i] + value[i + 1];
            arr.push(str);
        };
    }
    
    var len = arr.length;

    for (var i = 0; i < arr.length; i++) {
        i == len - 1 ? (strArr += arr[i]) : (strArr += arr[i] + " ");
    };

    return strArr;
}
module.exports = {
    removeRepeat: removeRepeat,
    arrToStr: arrToStr,
    removeRepeatItem: removeRepeatItem
}