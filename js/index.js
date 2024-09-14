/**
 * Created with JetBrains WebStorm.
 * User: hanzhang
 * Date: 16-4-21
 * Time: 上午9:23
 * To change this template use File | Settings | File Templates.
 */
(function(window, jQuery) {
  var popIndex = 1;
  var StudentContainer = StudentContainer || {};
  var studentId = currentUser != undefined ? currentUser.id : "";
  var role = "student";

  var pureTest = ["xf.zhixue.com", "localhost"];

  //纯净版
  StudentContainer.pureInit = function() {
    if (
      window.location.hostname &&
      pureTest.indexOf(window.location.hostname) > -1
    ) {
      var banner = $("#con_divBanner2");
      banner.hide();
    }
  };

  StudentContainer.showPop = function(popIndex) {
    switch (popIndex) {
      case 1:
        StudentContainer._showChangePwdBox(StudentContainer.showPop);
        break;
      case 2:
        StudentContainer._showBindMobileBox(StudentContainer.showPop);
        break;
      case 3:
        // StudentContainer._showVipEndBox(StudentContainer.showPop);
        break;
      case 4:
        StudentContainer._showOperative(StudentContainer.showPop);
        break;
    }
  };

  StudentContainer.getUserItems = function() {
    $.getJSON(studentRootUrl + "/student/getUserItems/?callback=?", function(
      data
    ) {
      //TODO 后续是否弹领取体验券
    });
  };

  /**
   * 强制更改密码
   * @param callback  回调
   */
  StudentContainer._showChangePwdBox = function(callback) {
    try {
      $.post(basePath + "/container/student/isModifyPwd/", function(
        isModifyPwd
      ) {
        if (!isModifyPwd) {
          var element = {};
          var _html = __con_changePwdBox__({ name: currentUser.name });
          TranscriptsCommon.blankBox(
            "修改密码",
            _html,
            true,
            false,
            null,
            null,
            function() {
              if (typeof callback == "function") {
                callback(++popIndex);
              }
            }
          );
          element.bindInfo = $("#con_divPwdTips");
          element.password = $("#con_txtPwd");
          element.rePassword = $("#con_txtRePwd");
          element.okStep2 = $("#con_pwdSubmit");

          // var password = /^([A-Za-z0-9_]){1,}$/;
          var newLoginName = "";
          // 获取明文
          $.ajax({
            url: basePath+'/app/login/getUserPlainInfo',
            type: 'get',
            dataType: "json",
            data: { userId: currentUser.id ,type:'loginName'},
            success: function(data) {
                if(data.success) {
                  newLoginName = data.result;
                  var stuCode = stuCode || newLoginName.replace("zx", "");
                  var weakPattern = new RegExp(
                    "^(000000|111111|123456)$" +
                      "|^" +
                      newLoginName +
                      "$|^" +
                      stuCode +
                      "$"
                  );
                  element.bindInfo.text("");
                  element.okStep2.click(function() {
                    if (!element.password.val()) {
                      element.bindInfo.text("请输入密码！");
                      return false;
                    } else {
                      if (
                        !stringLength(element.password.val(), 6, 16) ||
                        weakPattern.test(element.password.val())
                      ) {
                        element.bindInfo.text("您的密码强度过低，请换一个试试！");
                        return false;
                      }
                    }
                    if (!element.rePassword.val()) {
                      element.bindInfo.text("请输入确认密码！");
                      return false;
                    } else {
                      if (element.password.val() != element.rePassword.val()) {
                        element.bindInfo.text("两次密码不一致，请重新输入！");
                        return false;
                      }
                      if (
                        !stringLength(element.rePassword.val(), 6, 16) ||
                        weakPattern.test(element.rePassword.val())
                      ) {
                        element.bindInfo.text("您的密码强度过低，请换一个试试！");
                        return false;
                      }
                    }
        
                    $.post(
                      basePath + "/container/student/updatePassword/",
                      { password: element.password.val() },
                      function(data) {
                        data = eval("(" + data + ")");
                        if (data.result == "success") {
                          TranscriptsCommon.closeAllBox();
                          TranscriptsCommon.simpleBox(
                            "温馨提示",
                            "密码修改成功！",
                            false,
                            1
                          );
                        } else {
                          element.bindInfo.text(data.message);
                        }
                      }
                    );
                  });
                } else {
                  if (window.console) {
                    window.console.log(data.result);
                  }
                  if (typeof callback == "function") {
                    callback(++popIndex);
                  }
                }
            }
          })
        } else {
          if (typeof callback == "function") {
            callback(++popIndex);
          }
        }
      });
    } catch (e) {
      if (window.console) {
        window.console.log(e.message);
      }
      if (typeof callback == "function") {
        callback(++popIndex);
      }
    }
  };

  /**
   * 是否需要绑定手机号码
   * @param callback  回调
   */
  StudentContainer._showBindMobileBox = function(callback) {
    if (!isFirstView) {
      if (typeof callback == "function") {
        callback(++popIndex);
      }
      return;
    }
    try {
      // 功能已废弃,后期要做需要重写
      // $.post(basePath + "/container/student/needBindMobile/", function(
      //   needBindMobile
      // ) {
      //   if (needBindMobile) {
      //     bindMobile(callback);
      //   } else {
      //     if (typeof callback == "function") {
      //       callback(++popIndex);
      //     }
      //   }
      // });
      if (typeof callback == "function") {
        callback(++popIndex);
      }
    } catch (e) {
      if (window.console) {
        window.console.log(e.message);
      }
      if (typeof callback == "function") {
        callback(++popIndex);
      }
    }
  };

  /**
   *
   * @param callback
   */
  StudentContainer._showVipEndBox = function(callback) {
    try {
      $.post(basePath + "/container/student/isVipEnd/", function(vipInfo) {
        if (typeof vipInfo == "string") {
          var _vipInfo = eval("(" + vipInfo + ")");
          if (_vipInfo.isVIPEnd && $.cookie("vipEndShow") != "1") {
            var _html = __con_vipEndBox__({
              endTime: _vipInfo.vipEndTime,
              zhixuebaoRootUrl: zhixuebaoRootUrl
            });
            TranscriptsCommon.blankBox(
              "温馨提示",
              _html,
              true,
              null,
              null,
              null,
              function() {
                if (typeof callback == "function") {
                  callback(++popIndex);
                }
              }
            );
            $("#con_btnCloseVIPBox").click(function() {
              TranscriptsCommon.closeAllBox();
              var options = {
                userId: currentUser.id,
                app: "container",
                action: "btnClick",
                data:
                  "/container/container/student/index/?from=web-container-stuIndex_vipEndCancel"
              };
              TranscriptsCommon.setUserAction(options);
            });
            $.cookie("vipEndShow", 1);
          } else {
            if (typeof callback == "function") {
              callback(++popIndex);
            }
          }
        }
      });
    } catch (e) {
      if (window.console) {
        window.console.log(e.message);
      }
      if (typeof callback == "function") {
        callback(++popIndex);
      }
    }
  };

  /**
   *
   * @param callback
   */
  StudentContainer._showOperative = function(callback) {
    $.ajax({
      url: basePath + "/commonModule/getBannerListForWeb/",
      type: "GET",
      data: { tag: "STU_M_OPERATIVE", userId: currentUser.id },
      cache: true,
      dataType: "JSON",
      success: function(data) {
        if (data && data.length > 0) {
          var banner = data[0];
          if ($.cookie("operativeShow" + banner.id) == "1") {
            if (typeof callback == "function") {
              callback(++popIndex);
            }
            return;
          }
          var element = {};
          element.conOperative = $("#conOperative");
          element.closed = element.conOperative.find(".closed");
          element.cont = element.conOperative.find(".cont");

          element.cont.css(
            "background",
            "url(" + banner.image + ") no-repeat center top"
          );
          element.conOperative.show();
          $.cookie("operativeShow" + banner.id, 1, { expires: 365 });

          element.cont.click(function() {
            window.open(banner.externalLink);
            element.conOperative.hide();
            if (typeof callback == "function") {
              callback(++popIndex);
            }
          });
          element.closed.click(function() {
            element.conOperative.hide();
            if (typeof callback == "function") {
              callback(++popIndex);
            }
          });
        } else {
          if (typeof callback == "function") {
            callback(++popIndex);
          }
        }
      },
      error: function() {
        if (typeof callback == "function") {
          callback(++popIndex);
        }
      }
    });
  };

  /**
   * 字符长度验证
   * @param text
   * @param minLen
   * @param maxLen
   * @returns {boolean}
   */
  function stringLength(text, minLen, maxLen) {
    var tempLen = text ? text.replace(/[^\x00-\xff]/g, "**").length : 0;
    if (maxLen) {
      return tempLen < minLen || tempLen > maxLen ? false : true;
    } else {
      return tempLen < minLen ? false : true;
    }
  }

  /**
   * 绑定手机号码
   * @param callback  回调
   */
  function bindMobile(callback) {
    var _html = __con_bindMobileBox__({ name: currentUser.name });
    var element = {};
    TranscriptsCommon.blankBox(
      "绑定手机号",
      _html,
      true,
      null,
      null,
      null,
      function() {
        if (typeof callback == "function") {
          callback(++popIndex);
        }
      }
    );
    element.btnClose = $("#con_btnCloseBindMobile");
    element.bindInfo = $("#con_divMobileTips");
    element.btnCode = $("#con_btnGetCode");
    element.bindCode = $("#con_txtBindCode");
    element.bindPhone = $("#con_txtBindMobile");
    element.okStep1 = $("#con_btnSubmitMobile");
    element.xclose = $("a.aui_close");
    var _setIntervalIndex = 0;
    var _index = 59;
    var mobile = /^0?(1[0-9])[0-9]{9}$/;
    element.okStep1.click(function() {
      if (!element.bindPhone.val()) {
        element.bindInfo.text("请输入手机号码");
        return false;
      } else {
        if (!mobile.test(element.bindPhone.val())) {
          element.bindInfo.text("请输入正确的手机号码");
          return false;
        }
      }
      if (!element.bindCode.val()) {
        element.bindInfo.text("请输入验证码");
        return false;
      }
      $.getJSON(
        basePath + "/container/student/bindMobile/",
        { mobile: element.bindPhone.val(), code: element.bindCode.val() },
        function(data) {
          if (data.result == "success") {
            clearInterval(_setIntervalIndex);
            TranscriptsCommon.closeAllBox();
            TranscriptsCommon.simpleBox(
              "温馨提示",
              "手机号码绑定成功！",
              false,
              1
            );
          } else {
            element.bindInfo.text(data.message);
          }
          //绑定手机号-确认绑定埋点
          try {
            var otherInfos = {};
            otherInfos.role = role;
            if (data.result == "success") {
              otherInfos.status = data.result;
            } else {
              otherInfos.status = "fail";
            }
            otherInfos.errorInfo = data.message;
            createUserAction("1008", otherInfos);
          } catch (error) {}
        }
      );

      var options = {
        userId: currentUser.id,
        app: "container",
        action: "btnClick",
        data:
          "/container/container/student/index/?from=web-container-stuIndex_bindMobileOK"
      };
      TranscriptsCommon.setUserAction(options);
    });

    element.btnClose.on("click", function() {
      $.ajax({
        url: basePath + "/container/student/ignoreBindMobile",
        type: "POST",
        dataType: "JSON",
        cache: false,
        success: function(res) {
          if (res.result == "success") {
            console.log(JSON.stringify(res));
          }
        }
      });
      TranscriptsCommon.closeAllBox();
      if (typeof callback == "function") {
        callback(++popIndex);
      }
      try {
        var otherInfos = {};
        otherInfos.role = role;
        createUserAction("1007", otherInfos);
      } catch (error) {}

      var options = {
        userId: currentUser.id,
        app: "container",
        action: "btnClick",
        data:
          "/container/container/student/index/?from=web-container-stuIndex_bindMobileCancel"
      };
      TranscriptsCommon.setUserAction(options);
    });

    element.bindPhone.keyup(function() {
      if (_index != 59) {
        return;
      }
      if (mobile.test(element.bindPhone.val())) {
        //验证手机号
        checkMobile(element.bindPhone.val(), function(data) {
          if (data.result == "failed") {
            element.bindInfo.text(data.message);
          } else {
            element.btnCode.removeClass("dis");
          }
        });
      } else {
        element.btnCode.addClass("dis");
      }
      element.bindInfo.empty();
    });

    element.bindCode.focus(function() {
      element.bindInfo.empty();
    });

    //获取验证码
    element.btnCode.on("click", function() {
      if ($(this).hasClass("dis")) {
        return false;
      }
      var _options = {};
      _options.mobile = element.bindPhone.val();
      if (!_options.mobile) {
        element.bindInfo.text("请输入手机号码！");
        return false;
      } else {
        if (!mobile.test(_options.mobile)) {
          element.bindInfo.text("请输入正确的手机号码！");
          return false;
        }
      }
      $(this).addClass("dis");
      element.bindCode.removeAttr("readonly");
      element.bindPhone.attr("readonly", "readonly");
      element.btnCode.html("59秒后重新获取");
      _setIntervalIndex = setInterval(function() {
        _index--;
        if (_index > 0) {
          element.btnCode.html(_index + "秒后重新获取");
          element.btnCode.addClass("dis");
        } else {
          clearInterval(_setIntervalIndex);
          _index = 59;
          element.btnCode.removeClass("dis");
          element.btnCode.html("获取验证码");
        }
      }, 1000);
      $.ajax({
        url: basePath + "/container/student/sendSMS/",
        data: _options,
        type: "POST",
        dataType: "json",
        cache: false,
        success: function(data) {
          if (!data.result) {
            element.bindInfo.text("验证码获取失败");
            clearInterval(_setIntervalIndex);
            _index = 59;
            element.btnCode.removeClass("dis");
            element.btnCode.html("获取验证码");
          }
        },
        error: function() {
          element.bindInfo.text("验证码获取失败");
          clearInterval(_setIntervalIndex);
          element.btnCode.html("获取验证码");
          element.btnCode.removeClass("dis");
        }
      });
    });

    element.xclose.off("click").click(function() {
      var otherInfos = {};
      otherInfos.role = role;
      createUserAction("1007", otherInfos);
    });
  }

  /**
   * 验证手机号码是否已绑定
   * @param mobile
   * @param callback
   */
  function checkMobile(mobile, callback) {
    var d = new Date().getTime();
    $.getJSON(
      basePath + "/container/student/checkMobile/?d=" + d,
      { mobile: mobile },
      function(data) {
        callback(data);
      }
    );
  }

  /**
   * 用户行为埋点
   * @param {*} opCode 操作码
   * @param {*} otherInfos 其他属性信息
   */
  function createUserAction(opCode, otherInfos) {
    var module = "rq_security";
    userActionLog4Cross(module, opCode, studentId, otherInfos);
  }

  // 右边导航栏配置
  var _containerRootUrl = basePath || "";
  var module = "rq_web_home";
  if (_containerRootUrl == undefined || _containerRootUrl == "") {
    _containerRootUrl = window.location.origin + "/container";
  }
  window.onload = function() {
    $.ajax({
      url: _containerRootUrl + "/getSideToolsConfig",
      type: "GET",
      dataType: "json",
      cache: false,
      success: function(data) {
        var pureTest = ["xf.zhixue.com", "localhost"];
        //下载体验
        if (data.showDownload == "false") {
          $("#sb_btnDownload").hide();
        } else {
          //纯净版智学
          if (!(pureTest.indexOf(window.location.hostname) > -1)) {
            $("#sb_btnDownload").css("display", "block");
          }
        }
        //在线客服
        if (data.showOnlineService == "false") {
          $("#sb_btnOnline").hide();
        } else {
          $("#sb_btnOnline").css("display", "block");
        }
        //用户反馈
        if (data.showUserFeedback == "false") {
          $("#sb_btnFeedBack").hide();
        } else {
          $("#sb_btnFeedBack").css("display", "block");
        }
      },
      error: function(ret) {
        var pureTest = ["xf.zhixue.com", "localhost"];
        if (!(pureTest.indexOf(window.location.hostname) > -1)) {
          $("#sb_btnDownload").css("display", "block");
        }
        // $("#sb_btnDownload").css("display", "block");
        $("#sb_btnOnline").css("display", "block");
        $("#sb_btnFeedBack").css("display", "block");
      }
    });
  };

  $(function() {
    try {
      TranscriptsCommon.setCustomTitle(2);
      StudentContainer.pureInit();
      StudentContainer.showPop(popIndex);
      StudentContainer.getUserItems();
      //高考志愿登录
      if (isFirstView) {
        $.getJSON(studentRootUrl + "/nceed/getUserToken/?callback=?", function(
          data
        ) {
          if (data) {
            $.getJSON(
              gaokaoqUrl + "/sso.html?callback=?",
              { token: data },
              function(result) {}
            );
          }
        });
        $.getJSON(
          zhixuebaoRootUrl + "/zhixuebao/openVip/loginT?callback=?",
          function(data) {}
        );
      }
    } catch (e) {
      if (window.console) {
        window.console.log(e.message);
      }
    }
  });
})(window, jQuery);
