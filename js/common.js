/**
 * utils
 * User: zzwang@iflytek.com
 */

var TranscriptsCommon = TranscriptsCommon || {};

/**
 * 替换表情图标
 */
TranscriptsCommon.replace_em = function(str,path){
	str = str.replace(/\</g,'&lt;');
	str = str.replace(/\>/g,'&gt;');
	str = str.replace(/\n/g,'<br/>');
	str = str.replace(/\[em_([0-9]*)\]/g,'<img src="'+path+'/public/module/global/js/jquery/jquery-qqFace/arclist/$1.gif" border="0" />');
	return str;
};

/**
 * 截获URL参数
 * @type {{QueryString: Function}}
 */
TranscriptsCommon.Request = {
    //获取URL参数
    QueryString: function (item) {
        var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
        return svalue ? svalue[1] : svalue;
    },

    /**
     * url 目标url
     * arg 需要替换的参数名称
     * arg_val 替换后的参数的值
     * return url 参数替换后的url
     */
    changeURLArg: function (url, arg, arg_val) {
        var pattern = arg + '=([^&]*)';
        var replaceText = arg + '=' + arg_val;
        if (url.match(pattern)) {//如果没有此参数，添加
            var tmp = '/(' + arg + '=)([^&]*)/gi';
            tmp = url.replace(eval(tmp), replaceText);
            return tmp;
        } else {//如果有此参数，修改
            if (url.match('[\?]')) {
                return url + '&' + replaceText;
            } else {
                return url + '?' + replaceText;
            }
        }
        return url + '\n' + arg + '\n' + arg_val;
    },

    /**
     *
     * @param url 目标url
     * @param params 参数对象，可是是多个
     *                 格式如：[{arg:01,arg_val:11},{arg:00,arg_val:12}]
     */
    changeURLArgs:function(url,params){
        var lastPattern ="";
         for(var item in params){
             var pattern = params[item].arg + '=([^&]*)';
             var replaceText = params[item].arg + '=' + params[item].arg_val;
             if (url.match(pattern)) {//如果没有此参数，添加
                 var tmp = '/(' + params[item].arg + '=)([^&]*)/gi';
                 tmp = url.replace(eval(tmp), replaceText);
                 return tmp;
             } else {//如果有此参数，修改
                 if (url.match('[\?]')) {
                     return url + '&' + replaceText;
                 } else {
                     return url + '?' + replaceText;
                 }
             }
         }
    },

    /**
     * 去除指定的url参数
     * @param url
     * @param param
     * @returns {*}
     */
    cutURLParam: function (url, param) {
        var url1 = url;
        if (url.indexOf(param) > 0) {
            if (url.indexOf("&", url.indexOf(param) + param.length) > 0) {
                url1 = url.substring(0, url.indexOf(param)) + url.substring(url.indexOf("&", url.indexOf(param) + param.length) + 1);
            }
            else {
                url1 = url.substring(0, url.indexOf(param) - 1);
            }
            return url1;
        }
        else {
            return url1;
        }
    }
};

/**
 * 弹框一直居中显示，能响应滚动和窗口大小变化
 * @param obj
 */
TranscriptsCommon.commShowAtCenter = function(obj) {
    // obj为jQuery对象
    var divWidth = obj.width() / 2;
    var divHeight = obj.height() / 2;
    obj.css({
        'position' : 'fixed',
        'top' : '50%',left:'50%',
        'margin-top' : '-' + divHeight + 'px',
        'margin-left': '-' + divWidth + 'px'
    });
};

/**
 * 统计用户行为
 * @param options
 */
TranscriptsCommon.setUserAction = function(options){
	try{
		$.ajax({
			url:basePath+"/stat/useraction",
			type:"POST",
			data:options,
			dataType:"text",
			cache:false,
			success:function(){},
			error:function(){}
		});
	}catch(e){
		
	}
};

/**
 * 截取含有汉字的字符串
 *
 * @param str：字符串 len ：截取长度 hasDot：是否需要添加省略号（true或false）
 * @author hlwang3
 */
TranscriptsCommon.interceptString = function(str, len, hasDot) {
    if (str == "" || str == undefined) {
        return "";
    }
    var newLength = 0, newStr = "",
        chineseRegex = /[^\x00-\xff]/g, singleChar = "",
        strLength = str.replace(chineseRegex, "**").length;

    if (strLength <= len) {
        return str;
    }
    if (hasDot) {
        len = len - 2;
    }
    for (var i = 0; i < strLength; i++) {
        singleChar = str.charAt(i).toString();
        if (singleChar.match(chineseRegex) != null) {
            newLength += 2;
        } else {
            newLength++;
        }
        if (newLength > len) {
            break;
        }
        newStr += singleChar;
    }
    if (hasDot) {
        newStr += "...";
    }
    return newStr;
};

/**
 * 获取用户头像
 * @param callback 回调
 */
TranscriptsCommon.getAvatarUrl = function(userId,callback){
	var params = {};
	if(userId){
		params = {userId:userId};
	}
	$.ajax({
		url:basePath + "/container/getAvatar/",
		type:"GET",
		dataType:"JSON",
		data:params,
		cache:true,
		jsonp: 'callback',
		success:function(data){
			if(data.result == "success" && data.message){
				if(typeof(callback)=="function"){
					callback(data.message);
				}
			}else{
				if(typeof(callback)=="function"){
					callback(basePath+"/public/module/global/images_tea_new/p1_new.png");
				}
			}
		},
		error: function(XHR, textStatus, errorThrown){
			if(typeof(callback)=="function"){
				callback(basePath+"/public/module/global/images_tea_new/p1_new.png");
			}
		}
	});
};

/**
 * 初始化用户头像
 * @param avatar 用户头像路径
 * @param img 加载头像的img对象
 */
TranscriptsCommon.initUserAvatar = function(avatar,img,userId){
    if(avatar){
        img.attr("src",avatar);
        img.error(function(){
			img.unbind("error");
			TranscriptsCommon.getAvatarUrl(userId,function(imgUrl){
				img.attr("src",imgUrl);
			});
        });
    }else{
        TranscriptsCommon.getAvatarUrl(userId,function(imgUrl){
			img.attr("src",imgUrl);
		});
    }
};

/**
 * 警告提示框
 * @param title    标题
 * @param content  内容
 * @param isLock   开启锁屏。 中断用户对话框之外的交互，用于显示非常重要的操作/消息，所以不建议频繁使用它，它会让操作变得繁琐
 */
TranscriptsCommon.dialogBox = function(title, content, isLock) {
    return art.dialog({
        lock: isLock,
        background: '#000000', // 背景色
        opacity: '0.5',
        title: title,
        content: content,
        ok: true,
        okVal: '确定'
    });
};

/**
 *  空白窗口
 * @param title    标题
 * @param content  内容
 * @param isLock   开启锁屏。 中断用户对话框之外的交互，用于显示非常重要的操作/消息，所以不建议频繁使用它，它会让操作变得繁琐
 * @param cancel   是否有右上角X按钮
 * @param height   窗口高度，某些内容比较多的窗口，不提前定义好高度会导致窗口定位不精准
 * @param width   预留字段，防止与height类似情况出现时进行设置
 */
TranscriptsCommon.blankBox = function(title, content, isLock, cancel, height, width, close) {
    var param = {
        lock: isLock,
        background: '#000000', // 背景色
        opacity: '0.5',
        title: title,
        content: content,
        width: width || 400,
        height: height || 50
    };
    if(cancel != undefined || cancel != null) {
        param.cancel = cancel;
    }
    if(close != undefined || cancel != null) {
        param.close = close;
    }
    return art.dialog(param);
}

/**
 * 简单提示窗口
 * @param title    标题
 * @param content  内容
 * @param isLock   开启锁屏。 中断用户对话框之外的交互，用于显示非常重要的操作/消息，所以不建议频繁使用它，它会让操作变得繁琐
 */
TranscriptsCommon.simpleBox = function(title, content, isLock,time) {
    return art.dialog({
        lock: isLock,
        background: '#000000', // 背景色
        opacity: '0.5',
        title: title,
        content: content,
        width:400,
        height:50,
        time:time||3
    });
}


/**
 * 操作蒙层
 * @param content  内容
 * @param time 自动关闭
 */
TranscriptsCommon.opertionTip = function(content,time) {
    return art.dialog({
        lock: true,
        background: '#000000', // 背景色
        opacity: '0.5',
        content: content||'请稍后，后台正在拼命处理中……',
        width:400,
        height:50,
        title:"",
        cancel:false
    });
}
/**
 * 确定提示框
 * @param title    标题
 * @param content  内容
 * @param okCallBack 确定后回调
 * @param cancelCallBack 取消后回调
 * @param isLock   开启锁屏。 中断用户对话框之外的交互，用于显示非常重要的操作/消息，所以不建议频繁使用它，它会让操作变得繁琐
 */
TranscriptsCommon.confirmBox = function(title, content, okCallBack, cancelCallBack, isLock) {
    return art.dialog({
        lock: isLock === false ? false : true,
        background: '#000000', // 背景色
        opacity: '0.5',
        title: title,
        content: content,
        ok: function () {
            if (typeof okCallBack == "function") {
                okCallBack();
            }
        },
        okVal: '确定',
        cancelVal: '关闭',
        cancel: function () {
            if (typeof cancelCallBack == "function") {
                cancelCallBack();
            }
        }
    });
}

/**
 *  关闭所有窗口
 */
TranscriptsCommon.closeAllBox = function() {
    var list = art.dialog.list;
    for (var i in list) {
        list[i].close();
    }
}


TranscriptsCommon.setCustomTitle = function(after) {
    var List=["教师端-首页","家长端-首页","学生端-首页","绑定孩子","绑定手机","学生端-师生互动","消息中心"];
    var preString =window.ZX_COM_CUSTOM_PROJECT && window.ZX_COM_CUSTOM_PROJECT.title ? ZX_COM_CUSTOM_PROJECT.title : "智学网";
    document.title = preString +"-"+ List[after];
}


/**
 * 格式化时间类
 */
TranscriptsCommon.DateFormat = (function () {
    /**
     * 构造函数
     * @param type time的类型 0:Unix时间戳格式 1:日期时间格式
     * @param time Unix时间戳格式 如：1393579588； 日期时间格式 如：2014-02-28 17:26:28
     * @constructor
     */
    var DateFormat = function (type, time) {
        switch (type) {
            case 0: // 时间戳格式
                this.timestamp = time;
                break;
            case 1: // 日期时间格式
                this.timestamp = parseInt(this.toTimeStamp(time));
                break;
            default :
                break;
        }
        this.formatDateTime = null;
    };

    /**
     * 格式化显示时间日期
     * @param time Unix时间戳格式, 如：1393579588
     * @param format 希望的时间格式，如:"yyyy-MM-dd hh:mm:ss"
     * @returns string 格式化后的时间字符串
     */
    DateFormat.prototype.toDateTime = function (time, format) {
        var x = new Date(parseInt(time)),
            y = format;
        var z = {M: x.getMonth() + 1, d: x.getDate(), h: x.getHours(), m: x.getMinutes(), s: x.getSeconds()};
        y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
            return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
        });
        this.formatDateTime = y.replace(/(y+)/g, function (v) {
            return x.getFullYear().toString().slice(-v.length)
        });
        return this.formatDateTime;
    };

    /**
     * 获取日期时间的时间戳
     * @param datetime 格式为"2014-03-03 09:36:00"
     * @returns {Number} 时间戳
     */
    DateFormat.prototype.toTimeStamp = function (datetime) {
        var dateAndTime = datetime.split(' ');
        var date = dateAndTime[0].split('-');
        //如果时间格式没有传递时分秒，在下面补上
        if (dateAndTime.length == 1) {
            dateAndTime.push("00:00:00");
        }
        var time = dateAndTime[1].split(':');
        return parseInt(new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]).getTime());
    };

    /**
     * 获取一个时间段的开始时间和结束时间时间戳
     * @param days 向后多少天，如为向前，则为负数
     * @returns {{beginTime: Number, endTime: Number}}
     */
    DateFormat.prototype.getDateInterval = function (days) {
        var anotherTime = parseInt(this.timestamp) + 60 * 60 * 24 * 1000 * days;
        if (days > 0) {
            var beginTime = this.toTimeStamp(this.toDateTime(this.timestamp, 'yyyy-MM-dd') + " 00:00:00");
            var endTime = this.toTimeStamp(this.toDateTime(anotherTime, 'yyyy-MM-dd') + " 23:59:59");
        } else {
            var beginTime = this.toTimeStamp(this.toDateTime(anotherTime, 'yyyy-MM-dd') + " 00:00:00");
            var endTime = this.toTimeStamp(this.toDateTime(this.timestamp, 'yyyy-MM-dd') + " 23:59:59");
        }
        var dateInterval = {
            "beginTime": beginTime,
            "endTime": endTime
        };
        return dateInterval;
    };
	
    /**
     * 获取本周时间戳
     * @returns {{beginTime: Number, endTime: Number}}
     */
    DateFormat.prototype.getCurWeekInterval = function(){
    	var curDate = new Date();
    	var curDay = curDate.getDay();
    	var d1 = this.getDateInterval((curDay -1)*-1);
    	var d2 = this.getDateInterval(7 - curDay);
    	var dateInterval = {
                "beginTime": d1.beginTime,
                "endTime": d2.endTime
        };
    	return dateInterval;
    };

    return DateFormat;
})();

/**
 * 获取本周、本月的开端日期、停止日期
 */
TranscriptsCommon.GetWeekMouth = (function () {
    var GetWeekMouth = function (date) {
        if (date == undefined) {
            this.now = new Date(); //当前日期
        } else {
            this.now = new Date(date); //当前日期
        }

        //将本周的开始时间设置为周一，结束时间设置为周日
        this.nowDayOfWeek = this.now.getDay(); //今天本周的第几天
        if(this.nowDayOfWeek==0){
            this.nowDayOfWeek =6;
        }else if(this.nowDayOfWeek==6){
            this.nowDayOfWeek=1;
        }else{
            this.nowDayOfWeek--;
        }

        this.nowDay = this.now.getDate(); //当前日
        this.nowMonth = this.now.getMonth(); //当前月
        this.nowYear = this.now.getYear(); //当前年
        this.nowYear += (this.nowYear < 2000) ? 1900 : 0; //
        this.lastMonthDate = new Date(); //上月日期
        this.lastMonthDate.setDate(1);
        this.lastMonthDate.setMonth(this.lastMonthDate.getMonth() - 1);
    };

    //格局化日期：yyyy-MM-dd
    GetWeekMouth.prototype.formatDate = function (date) {
        var myyear = date.getFullYear();
        var mymonth = date.getMonth() + 1;
        var myweekday = date.getDate();

        if (mymonth < 10) {
            mymonth = "0" + mymonth;
        }
        if (myweekday < 10) {
            myweekday = "0" + myweekday;
        }
        return (myyear + "-" + mymonth + "-" + myweekday);
    };

    //获得本周的开端日期
    GetWeekMouth.prototype.getWeekStartDate = function () {
        var weekStartDate = new Date(this.nowYear, this.nowMonth, this.nowDay - this.nowDayOfWeek);
        return this.formatDate(weekStartDate);
    };

    //获得本周的停止日期
    GetWeekMouth.prototype.getWeekEndDate = function () {
        var weekEndDate = new Date(this.nowYear, this.nowMonth, this.nowDay + (6 - this.nowDayOfWeek));
        return this.formatDate(weekEndDate);
    };

    //获得本月的开端日期
    GetWeekMouth.prototype.getMonthStartDate = function () {
        var monthStartDate = new Date(this.nowYear, this.nowMonth, 1);
        return this.formatDate(monthStartDate);
    };

    //获得本月的停止日期
    GetWeekMouth.prototype.getMonthEndDate = function () {
        var monthEndDate = new Date(this.nowYear, this.nowMonth, this.getMonthDays(this.nowMonth));
        return this.formatDate(monthEndDate);
    };

    //获得某月的天数
    GetWeekMouth.prototype.getMonthDays = function (myMonth) {
        var monthStartDate = new Date(this.nowYear, myMonth, 1);
        var monthEndDate = new Date(this.nowYear, myMonth + 1, 1);
        var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
        return days;
    };

    return GetWeekMouth;
})();