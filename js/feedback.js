/**
 * feedback
 * author hanzhang
 * @date 2016-4-22
 */
(function(window,jQuery){

    var FeedBack =  FeedBack || {}
    var elementItem = {};

    var FeedBack = (function () {
        var FeedBack = {
            initElements:function() {
                elementItem.btnFeedBack = $("#sb_btnFeedBack");
            },
            bindEvents:function() {
                elementItem.btnFeedBack.click(function() {
                    FeedBack._intMainDialog();
                    FeedBack._bindMainDialogEvent();
					var options ={
						"userId":currentUser.id,
						"app": "container",
						"action": "btnClick",
						"data": "/container/container/student/index/?from=web-container-stuIndex_feedBackOpen"
					};
					TranscriptsCommon.setUserAction(options);
                });
            },
            initView:function() {

            },
            _intMainDialog:function() {
                var content = __sb_feedBackBox__({});
                TranscriptsCommon.blankBox("用户反馈", content, true);
                elementItem.txtFeedBack = $("#fb_txtFeedBack");
                elementItem.txtContact = $("#fb_txtContact");
                elementItem.btnSubmit = $("#fb_btnSumbit");
            },
            _bindMainDialogEvent:function() {
                elementItem.btnSubmit.click(function() {
                    FeedBack._submitFeedBack();
                })
            },
            /**
             * 自动关闭提示对话框
             * @param time
             * @param content
             */
             _showTipDialog : function (content, time) {
                TranscriptsCommon.simpleBox("温馨提示", content, true, 0);
            },

            /**
             * submit
             * @returns {boolean}
             * @private
             */
            _submitFeedBack : function () {
                var textFeedBack = elementItem.txtFeedBack.val();
                var textContact = elementItem.txtContact.val();
                if ($.trim(textFeedBack) == "") {
                    FeedBack._showTipDialog( "说点什么吧~",1.5);
                    return false;
                }
                if(FeedBack._getStrLen(textFeedBack) > 500){
                    FeedBack._showTipDialog("内容请限制在500个字符内",2);
                    return false;
                }
                if(FeedBack._getStrLen(textContact) > 50){
                    FeedBack._showTipDialog("联系方式过长~",2);
                    return false;
                }

                var param = {
                    imageName: "",
                    contactInfo: textContact,
                    content: textFeedBack
                };
                var paramInfo = {data: JSON.stringify(param)};
                FeedBack._ajaxPost(basePath + "/commonModule/feedback/", paramInfo, this._commitCallback("success"), this._commitCallback("failed"));
				
				var options ={
					"userId":currentUser.id,
					"app": "container",
					"action": "btnClick",
					"data": "/container/container/student/index/?from=web-container-stuIndex_feedBackOK"
				};
				TranscriptsCommon.setUserAction(options);
            },
            //计算字符串长度,汉字算两个字符
            _getStrLen : function(str) {
                var len = 0;
                for (var i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) > 255 || str.charCodeAt(i) < 0) len += 2; else len ++;
                }
                return len;
            },
            _commitCallback : function (res) {
                if (res == "success" || res.result == "success") {
                    FeedBack._showTipDialog("感谢您的反馈！", 2);
                    setTimeout(function() {
                        TranscriptsCommon.closeAllBox();
                    }, 2000);
                }
            },
            /**
             * ajax 请求
             * @param url  地址
             * @param paramInfo  参数，对象
             * @param successCallBack     成功回调
             * @param errorCallBack       错误回调
             */
            _ajaxPost : function (url, paramInfo, successCallBack, errorCallBack) {
                $.ajax({
                    type: "POST",
                    url: url,
                    data: paramInfo,
                    timeout: 250000, //超时时间：10秒
					cache:false,
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        if (typeof  errorCallBack === "function") {
                            errorCallBack();
                        } else {
                            if (XMLHttpRequest.status == 500) {
                                var errorData = eval("(" + XMLHttpRequest.responseText + ")");
                                FeedBack._showTipDialog("数据异常，errorData.message", 2);
                            } else {
                                FeedBack._showTipDialog("数据异常，请联系管理员", 2);
                            }
                        }
                    },
                    success: function (result) {
                        if (typeof  successCallBack === "function") {
                            successCallBack(result);
                        }
                    }
                });
            }
        };
        return FeedBack;
    })();
    $(function () {
        FeedBack.initElements();
        FeedBack.initView();
        FeedBack.bindEvents();
    });
})(window,jQuery);