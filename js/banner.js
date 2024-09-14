/**
 * banner
 * author hanzhang
 * @date 2016-4-22
 */
(function(window,jQuery){

    var Banner =  Banner || {}
    var elementItem = {};
    var index = 0;
    var intervalIndex = 0;
    var bannerCount = 0;

    var Banner = (function () {
        var Banner = {
            initElements:function() {
                elementItem.banners = $("li[id^='con_banner']");
                elementItem.bannerDiv = $("#con_divBanner");
                elementItem.bannerClose = $("#con_btnCloseBnn");
                elementItem.bannerLeft = $("#con_btnLeftBnn");
                elementItem.bannerRight = $("#con_btnRightBnn");
                elementItem.bannerCtrls = $("a[id^='con_btnCtrlBnn']");
                bannerCount = elementItem.banners.length;
            },
            bindEvents:function() {
                elementItem.banners.hover(function() {
                    clearInterval(intervalIndex);
                }, function(){
                    Banner.autoRun();
                });
                elementItem.bannerClose.click(function(){
                    $.cookie("conCloseBanner", "true");
                    elementItem.bannerDiv.hide();
					var options ={
						"userId":currentUser.id,
						"app": "container",
						"action": "btnClick",
						"data": "/container/container/student/index/?from=web-container-stuIndex_bannerClose"
					};
					TranscriptsCommon.setUserAction(options);
                });
                elementItem.bannerLeft.click(function(){
                    Banner._switch("pre");
                });
                elementItem.bannerRight.click(function(){
                    Banner._switch("next");
                });
                elementItem.bannerCtrls.hover(function() {
                    var _this = $(this);
                    index = _this.attr("order");
                    elementItem.bannerCtrls.removeClass();
                    $(elementItem.bannerCtrls[index]).addClass("current");
                    elementItem.banners.hide();
                    $(elementItem.banners[index]).show();
                });
            },
            initView:function() {
//                $.cookie("conCloseBanner", "false");
                if(bannerCount == 0 || !Banner._isVisible()) {
                    elementItem.bannerDiv.hide();
                } else if(bannerCount >= 1) {
                    elementItem.banners.hide();
                    Banner._switch(0);
                }
            },
            autoRun:function() {
                intervalIndex = setInterval(function(){
                    Banner._switch("next");
                    if(index == bannerCount){
                        index = 0;
                        Banner.initView();
                    }
                },3000);
            },
            _isVisible:function() {
                if("true" == $.cookie("conCloseBanner")) {
                    return false;
                } else {
                    return true;
                }
            },
            _switch:function(type) {
                $(elementItem.banners[index]).hide();
                $(elementItem.bannerCtrls[index]).removeClass();
                if("pre" == type) {
                    index--;
                    index = (index == -1) ? (index = bannerCount - 1) : index;
                } else if("next" == type) {
                    index++;
                    index = index % bannerCount;
                } else if(isNaN(type)) {
                    index = type;
                }
                $(elementItem.banners[index]).fadeIn();
                $(elementItem.bannerCtrls[index]).addClass("current");
            }
        };
        return Banner;
    })();
    $(function () {
        Banner.initElements();
        Banner.initView();
        Banner.bindEvents();
        Banner.autoRun();
    });
})(window,jQuery);
