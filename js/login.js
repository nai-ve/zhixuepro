(function (window, $) {
  var Transcripts = Transcripts || {};
  var elements = elements || {};
  var _errorMessage = decodeURI(Request.QueryString("errorMessage"));
  var dateObj = {};
  var agreementVersion = "";
  var agreementLink = "";
  // 所有的用户协议配置
  var agreementList = [];
  var userId = "";
  var clickFlag = true;
  var _casUrl = "";
  var _serviceUrl = "";

  var userInfo = {};
  var isRepeatLogin = false;
  var loginSuccess = false;
  var qrCode
  var qrCodeStatusInterval
  var qrCodeId
  var isQRCodeLogin
  var qrCodeLoginRedirectUrl

  //错误次数
  var errNum = 0;
  var findPwdUrl = getCenterRelatedUrl("pwd");
  var findAccountUrl = getCenterRelatedUrl("account");

  // 跳转相关参数 特殊标识
  var jumpObj = {}
  var jumpSecond = 5
  var jumpRedirectUrl = ''
  var jumpRedirectDesc = ''
  var jumpTimer = null

  // 埋点封装
  function encapUserActionLog(code, id, info) {
    try {
      userActionLog("rq_web_login", code, id, info);
    } catch (e) {
      console.error("logsdk userActionLog error: ", code, id, info);
    }
  }

  // 初始化验证码回调
  function initCodeCallback(thirdParams) {
    var params = {
      appId: 'zx-container-client',
      captchaType: SSO.captchaType,
      deviceName: 'web',
      client: SSO.client,
      deviceId: SSO.getDeviceId()
    };

    if (SSO.captchaType === SSO.thirdCaptchaType) {
      params.thirdCaptchaExtInfo = thirdParams;
    } else if (SSO.captchaType === SSO.picCaptchaType) {
      params.captchaId = SSO.captchaId;
      params.captchaCode = userInfo.code;
      window.loginThirdCode = userInfo.code;
    }

    if (elements.divName.is(":hidden") !== true) {
      // nameLogin(userInfo.name, userInfo.pwd, userInfo.rName);
      return;
    }

    if (isRepeatLogin) {
      repeatAccount(userInfo.name, userInfo.pwd, userInfo.rName, userInfo.areaCode, params);
    } else {
      normalLogin(userInfo.name, userInfo.pwd, params);
    }
  }

  // 包含套餐信息的埋点
  function userActionLogCombo(code, userId, info) {
    $.ajax("/container/commonModule/getUserCustomPackage", {
      type: "GET",
      data: {
        userId: userId
      },
      dataType: "json",
      cache: true,
      success: function (data) {
        console.log('Package_data', data)
        if (data && data.success && data.result && Object.prototype.toString.call(data.result) === '[object Array]' && data.result.length) {
          info.combo = data.result.join(',')
          encapUserActionLog(code, userId, info)
        } else {
          encapUserActionLog(code, userId, info)
        }
      },
      error: function (err) {
        console.log('combo_info_err', err)
        encapUserActionLog(code, userId, info)
      }
    })
  }

  function getServiceUrl() {
    $.ajax("./login/getServiceUrl", {
      type: "GET",
      data: {},
      dataType: "json",
      cache: true,
      success: function (data) {
        if ((data.result = "success")) {
          _casUrl = data.casUrl;
          _serviceUrl = data.serviceUrl;
          Captcha.initCode(initCodeCallback, _casUrl, _serviceUrl);
        }
      }
    });
  }

  // 底部合作名校
  function loadCooperateSchool() {
    $.ajax("/container/commonModule/getBannerListForWeb/", {
      type: "GET",
      data: { tag: "ZX_LOGIN_SCHOOL" },
      dataType: "JSONP",
      timeout: 1000,
      cache: true,
      jsonp: "callback",
      jsonpCallback: "getBannerListForWeb",
      success: function (data) {
        if (data && data.length > 0) {
          var html = "";
          for (var i = 0; i < data.length; i++) {
            html +=
              '<li><img alt="合作名校" src="' + data[i].image + '"/></li>';
          }
          elements.schoolList.html(html);
        }
      },
      error: function () {
        elements.teamPartner.hide();
      }
    });
  }

  function loadBannerCB() {
    $.ajax("/container/commonModule/getBannerListForWeb/", {
      type: "GET",
      data: { tag: "ZX_LOGIN_BNN" },
      dataType: "JSONP",
      timeout: 1000,
      cache: true,
      jsonp: "callback",
      jsonpCallback: "getBannerListForLogin",
      success: function (data) {
        if (data && data.length > 0) {
          var sign = data[0].desc;
          var html = "";
          for (var i = 0; i < data.length; i++) {
            html +=
              '<li><a style="background-image: url(' +
              data[i].image +
              ');" href="javascript:"></a></li>';
          }
          if (sign == 'just') {
            elements.imgPlay.find(".imgList").html(html);
          } else {
            elements.imgPlay.find(".imgList").prepend(html);
          }
          setBanner();
        }
      }
    });
  }

  function bindDomainInfo() {
    var _url = window.location.href;
    if (_url.indexOf("whpj.zhixue.com") > -1) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_whpj")
      );
      elements.foot_copyright.html(
        "科大讯飞股份有限公司 版权所有"
      );
    } else if (_url.indexOf("hfpj.zhixue.com") > -1) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_hfpj")
      );
      elements.foot_copyright.html(
        "科大讯飞股份有限公司 版权所有"
      );
    } else if (_url.indexOf("luyang.zhixue.com") > -1) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_luyang")
      );
      elements.foot_copyright.html(
        "科大讯飞股份有限公司 版权所有"
      );
    } else if (
      _url.indexOf("yuxi.zhixue.com") > -1 ||
      _url.indexOf("zhixue.yuxicloud.cn") > -1
    ) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_yuxi")
      );
      elements.foot_copyright.html(
        "主办单位：玉溪市教育局 承办单位：玉溪市教育局信息办  技术支持：科大讯飞股份有限公司"
      );
    } else if (_url.indexOf("ybpj.zhixue.com") > -1) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_ybpj")
      );
      elements.foot_copyright.html(
        "主办单位：重庆市渝北区教育委员会 承办单位：重庆市渝北区教育技术装备中心  技术支持：科大讯飞股份有限公司"
      );
    } else if (_url.indexOf("xq1.nceduc.cn") > -1) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_xq1")
      );
      elements.foot_copyright.html(
        "主办单位：南昌市教育局  承办单位：南昌市现代教育技术中心  技术支持：科大讯飞股份有限公司"
      );
    } else if (_url.indexOf("sc.zhixue.com") > -1) {
      //临时屏蔽
      $(".sc_display").hide();
      $(".download_app_box").css({ background: "#FFFFFF", height: "0px" });
      elements.headLogo.html(elements.head_imgList.find(".head_logo_tea_sc"));
      elements.foot_copyright.html("");
    } else if (_url.indexOf("puning.zhixue.com") > -1) {
      elements.headLogo.html(
        elements.head_imgList.find(".head_logo_tea_puning")
      );
    } else {
      elements.head_select.show();
      elements.foot_copyright.html(
        "安徽知学科技有限公司 版权所有"
      );
    }
  }

  function getLoginFailTimeCB() {
    var userName = $.cookie("loginUserName");
    elements.divName.hide();
    if (_errorMessage != "null" && _errorMessage != "") {
      elements.errorMsg.html("*" + _errorMessage);
      _errorMessage = "";
    } else {
      elements.errorMsg.html("");
    }
    elements.txtName.val("");
    if (userName) {
      elements.txtUserName.val(userName);
      elements.txtPassword.val("").focus();
    } else {
      elements.txtUserName.val("").focus();
      elements.txtPassword.val("");
    }

    // 获取URL参数
    var originFromUrl = Request.QueryString("origin");
    if (originFromUrl) {
      setTimeout(function () {
        elements.txtUserName.val(originFromUrl);
        elements.txtPassword.val("").focus();
      }, 0);
    }
  }

  function setBanner() {
    var IntervalName;
    var imgList = elements.imgPlay.find(".imgList li");
    var bannerIndex = 0;
    var bannerCount = imgList.length;
    for (var i = 0; i < bannerCount; i++) {
      if (i == 0) {
        $(imgList[i]).show();
      } else {
        $(imgList[i]).hide();
      }
    }
    if (bannerCount > 1) {
      var html = "";
      for (var i = 0; i < bannerCount; i++) {
        if (i == 0) {
          html +=
            "<dd><a tag=" +
            i +
            ' class="active" href="javascript:void(0);"></a></dd>';
        } else {
          html += "<dd><a tag=" + i + ' href="javascript:void(0);"></a></dd>';
        }
      }
      elements.imgPlay.find(".btnList").html(html);
      var btnList = elements.imgPlay.find(".btnList a");
      bindBannerTime();
      btnList.click(function () {
        var _this = $(this);
        clearInterval(IntervalName);
        bindBannerTime();
        if (_this.hasClass("active")) {
          return;
        }
        bannerIndex = _this.attr("tag");
        switchBanner(bannerIndex);
      });
    }

    function bindBannerTime() {
      IntervalName = setInterval(function () {
        bannerIndex++;
        if (bannerIndex >= bannerCount) {
          bannerIndex = 0;
        }
        switchBanner(bannerIndex);
      }, 3000);
    }

    function switchBanner(index) {
      imgList.fadeOut();
      $(imgList[index]).fadeIn();
      btnList.removeClass("active");
      $(btnList[index]).addClass("active");
    }
  }

  function autoJumpTarget() {
    jumpTimer && clearInterval(jumpTimer)
    jumpTimer = setInterval(function () {
      if (jumpSecond <= 0) {
        jumpTimer && clearInterval(jumpTimer)
        window.location.href = jumpRedirectUrl
      } else {
        jumpSecond--
        elements.autoJumpSecond.text(jumpSecond)
      }
    }, 1000)
  }

  // 登录引流
  function loginDraining(data) {
    jumpObj = data && typeof data === 'object' ? data : {}
    jumpSecond = jumpObj.autoTime || -1
    jumpRedirectUrl = jumpObj.redirectUrl || ""
    jumpRedirectDesc = jumpObj.description || ""
    if (jumpRedirectUrl && typeof jumpRedirectUrl === 'string') {
      elements.jumpUrlConfirm.show();
      elements.jumpUrlConfirmMask.show();
      // 设置引流弹框提示文案
      if (jumpRedirectDesc && typeof jumpRedirectDesc === 'string') {
        elements.jumpTipTxt.html(jumpRedirectDesc)
      }
      if (jumpSecond && jumpSecond > 0) {
        // 倒计时自动跳转
        elements.autoJumpSecond.text(jumpSecond)
        autoJumpTarget()
      } else {
        // 手动跳转
        elements.autoJump.css('display', 'none')
      }
    } else {
      elements.errorMsg.html("*" + "登录失败，请重新登录");
      elements.signup_button.html("登录").css("cursor", "pointer");
    }
  }

  function normalLogin(txtUserName, txtPassword, params) {
    elements.signup_button.html("正在登录...").css("cursor", "default");
    params = params || {};
    params.loginName = txtUserName;
    params.description = "encrypt";
    params.password = toHexString(rc4(txtPassword, zxlogin_secret));
    $.ajax("./edition/login?from=web_login", {
      type: "POST",
      dataType: "json",
      data: params,
      success: function (resultInfo) {
        // 增加登录埋点
        var currentUserId
        if (resultInfo.data && resultInfo.data.userId) {
          currentUserId = resultInfo.data.userId
        }
        collect_edu('container_login','10000026', currentUserId)
        if (resultInfo.result != "success") {
          loginSuccess = false;
          if (resultInfo.message == "needValidName") {
            var _userId = resultInfo.data.userId ? resultInfo.data.userId : null
            encapUserActionLog('1005', _userId, {
              status: "needValidName",
              account: params.loginName,
              userId: _userId
            });
            userId = resultInfo.data.userId;
            window.loginThirdCaptchaId = resultInfo.data.captchaId;
            privacyCheck();
            return;
          } else if (resultInfo.message == "riskPassword" || resultInfo.message == "riskAccount") {
            $.fn.fullpage.destroy();
            elements.body.css("overflow", "hidden");
            elements.validateIdentity.show();
            elements.stepItemIdentity.addClass("actived");
            elements.stepItemPwd.removeClass("actived");
            var provinces = resultInfo.data || [];
            var option;
            for (var i = 0; i < provinces.length; i++) {
              //添加省份选项
              option = document.createElement("option");
              option.text = provinces[i].areaName;
              option.value = provinces[i].areaCode;
              elements.provinceSelect[0].add(option, null);
            }

            //如果只有一个选项
            if (resultInfo.message == "riskPassword") {
              elements.provinceSelect[0].disabled = true;
              elements.validateTipText.html("您的密码较弱，请进行身份核对后修改密码");
            } else {
              elements.validateTipText.html("您的账号存在登录异常风险，请进行身份核对后修改密码");
            }
            updateVertifyCode();
            bindValidateIdBaseEvent(params);
          } else if (resultInfo.message === "freezeAccount") {
            // 账号冻结
            elements.accountFreezeConfirm.show()
            elements.accountFreezeConfirmMask.show()
            elements.signup_button.html("登录").css("cursor", "pointer");
            window.loginThirdCaptchaId = resultInfo.data.captchaId;
            dateObj = {
              description: "encrypt",
              userId: userId,
              loginName: txtUserName,
              password: txtPassword,
              backUrl: "./login.html",
              nextpage: nextpageUrl,
            };
          } else if (resultInfo.message === "redirectAccount") {
            loginDraining(resultInfo.data)
          } else {
            encapUserActionLog('1005', null, { failed: "pwd_invalid", account: params.loginName });
            updateVertifyCode();
            if (resultInfo.message == "账号或密码错误，请点击登录遇到问题解决") {
              errNum++;
              if (errNum >= 3) {
                if (!findPwdUrl || !findAccountUrl) {
                  findPwdUrl = getCenterRelatedUrl("pwd");
                  findAccountUrl = getCenterRelatedUrl("account");
                }
                FindUserDialog(
                  "登录错误",
                  "账号或密码错误，您可以找回账号或者找回密码",
                  Transcripts.getFindPwdUrl(findPwdUrl),
                  Transcripts.getFindAccountUrl(findAccountUrl)
                );
              }
            } else {
              errNum = 0;
            }
            elements.errorMsg.html("*" + resultInfo.message);
            elements.signup_button.html("登录").css("cursor", "pointer");
            return;
          }
        } else if (resultInfo.result == "success") {
          var _userId = resultInfo.data.userId ? resultInfo.data.userId : null
          // 登录成功包含套餐信息的埋点
          userActionLogCombo('1005', _userId, {
            status: "success",
            account: params.loginName,
            userId: _userId
          })
          loginSuccess = true;
          userId = resultInfo.data.userId;
          window.loginThirdCaptchaId = resultInfo.data.captchaId;
          dateObj = {
            description: "encrypt",
            userId: userId,
            loginName: txtUserName,
            password: txtPassword,
            backUrl: "./login.html",
            nextpage: nextpageUrl,
          };
          privacyCheck();
        }
      },
      error: function () {
        encapUserActionLog('1005', null, {
          status: "failed",
          account: params.loginName,
        });
        updateVertifyCode();
        elements.errorMsg.html("*系统请求出错，请稍后重试！");
        elements.signup_button.html("登录").css("cursor", "pointer");
      },
    });
  }

  // 验证姓名主登录方法
  function nameLogin(txtUserName, txtPassword, txtName) {
    elements.signup_button.html("正在登录...").css("cursor", "default");
    var hexPassword = toHexString(rc4(txtPassword, zxlogin_secret));
    var params = {
      loginName: txtUserName,
      password: hexPassword,
      name: txtName,
      description: "encrypt",
    };
    if (!clickFlag) {
      elements.slide.css("display", "block");
      elements.slideDiv.css("display", "block");
      return;
    }
    $.ajax("./login/validateName/", {
      type: "POST",
      dataType: "json",
      data: params || {},
      success: function (resultInfo) {
        if (resultInfo.result !== "success") {
          loginSuccess = false;
          elements.errorMsg.html("*" + resultInfo.message);
          elements.signup_button.html("登录").css("cursor", "pointer");
          return;
        } else if (resultInfo.result == "success") {
          loginSuccess = true;
          postOpenUrl({
            userId: userId,
            loginName: txtUserName,
            password: txtPassword,
            backUrl: "./login.html",
            nextpage: nextpageUrl,
          });
        }
      },
      error: function () {
        elements.errorMsg.html("*系统请求出错，请稍后重试！");
        elements.signup_button.html("登录").css("cursor", "pointer");
      },
    });
  }

  // 获取二维码codeId并开启状态轮询
  function refreshQRCode(cb) {
    $.ajax("./edition/code/create", {
      type: "POST",
      data: {
        deviceId: SSO.getDeviceId()
      },
      dataType: "json",
      cache: true,
      success: function (data) {
        if (data && data.result === 'success') {
          qrCodeId = data.data.codeId
          var homeIndex = data.data.homeIndex
          var origin = window.location.origin || (window.location.protocol + '//' + window.location.host)
          var url = Base64.encode(origin + '/edition/code/login?deviceId=' + SSO.getDeviceId() + '&codeId=' + qrCodeId + '&from=zhixue_web_login&redirectUrl=' + origin + homeIndex)
          console.log('qrcode url', url)
          if (!qrCode) {
            // 参考https://github.com/davidshimjs/qrcodejs
            qrCode = new QRCode(document.getElementById("qrCode"), {
              width: 144,
              height: 144,
              text: url,
              correctLevel: QRCode.CorrectLevel.L
            })
          } else {
            qrCode.clear()
            qrCode.makeCode(url)
          }
          elements.qrCodeMask.addClass('hide')
          elements.qrCodeSuccessMask.addClass('hide')
        }
        cb && cb.call()
      }
    });
  }

  // 查询二维码的状态
  function checkQRCodeStatus() {
    $.ajax("./edition/code/status", {
      type: "POST",
      data: {
        deviceId: SSO.getDeviceId(),
        codeId: qrCodeId
      },
      dataType: "json",
      cache: true,
      success: function (data) {
        if (data && data.result === 'success') {
          var status = data.data.status
          if (status === 0) {
            // 0 - 已失效
            // 清除二维码状态轮询
            removeQRCodeStatusCheckInterval()
            // 添加提示遮罩
            elements.qrCodeMask.removeClass('hide')
          } else if (status === 2) {
            // 2 - 已登录
            removeQRCodeStatusCheckInterval()
            elements.qrCodeSuccessMask.removeClass('hide')

            userId = data.data.userId
            qrCodeLoginRedirectUrl = data.data.redirectUrl

            // 扫码登录成功包含套餐信息的埋点
            userActionLogCombo('1005', userId, {
              status: "success",
              account: userId,
              userId: userId,
              type: 'qrCode'
            })

            loginSuccess = true;
            privacyCheck();
          } else if (status === 4) {
            // 4 登录引流
            if (data.data.redirectConfig && data.data.redirectConfig.redirectUrl) {
              window.location.href = data.data.redirectConfig.redirectUrl
            } else {
              // TODO 登录引流 异常处理
              console.log("登录引流数据有误", data)
            }
          } else {
            // 1 未登录 3 锁定
          }
        }
      }
    });
  }

  // 结束二维码状态定时查询
  function removeQRCodeStatusCheckInterval() {
    if (qrCodeStatusInterval) {
      clearInterval(qrCodeStatusInterval)
      qrCodeStatusInterval = null
    }
  }

  // 开始二维码状态定时查询
  function addQRCodeStatusCheckInterval() {
    removeQRCodeStatusCheckInterval()
    qrCodeStatusInterval = setInterval(function () {
      checkQRCodeStatus()
    }, 3000)
  }

  // 全局错误监听
  function errorListener (event) {
    console.log('errorListener event', event)
    if (
      _casUrl &&
      event.target.tagName === 'SCRIPT' &&
      event.target.src.indexOf(_casUrl) > -1
    ) {
      console.log('loginErrorEventListener event', event)
      try {
        // 展示弹窗
        elements.noThirdCookieLoginFailedConfirmMask.show()
        elements.noThirdCookieLoginFailedConfirm.show()
        elements.signup_button.html("登录").css("cursor", "pointer");
        // 由于三方cookie限制账密登录异常弹窗
        collect_edu('container_login','10000021')
      } catch (error) {
        console.warn(error);
      }
    }
    return true
  }
  // 登录跨域场景触发
  function initErrorListener() {
    console.log('remove old ErrorListener')
    window.removeEventListener('error', errorListener, true)
    console.log('add new ErrorListener')
    window.addEventListener('error', errorListener, true);
  }

  function collectInit() {
    var list = ['www.zhixue.com', 'test.zhixue.com'].indexOf(window.location.hostname) > -1;
    if (!list) {
      return
    }
    var isTest = window.location.href.indexOf("test.zhixue.com") > -1;
    var config = {
      appId: isTest ? '1dx8Ru4yG2061' : 'BRN44YaIO73',  // 管理后台申请
      secrect: isTest
        ? '5b656664aefc45bb81aa2b03394595e0'
        : '635e122d4cd3438f9eecad8a87c86f46',
      publicKey: isTest
        ? 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkGLJ8vrwSslX3lQLaZ9Tj6lR45VLLEZTlqUDG589d+oYHsveMdJCMVN6/5Sf/qHKEr88C+sQ1dXpdVkHrMRfSJSo9NT8/p1irz+y9p8eibmltYEOGvQv1mK6ohyEMCshlbu4VCbQh4LxMi0wTPOBGkx+aqBZXXsw9HKWzorGW3QIDAQAB'
        : 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCK6vVi1Gtm76Z44D51kHLQqX3jtRjo5MpqpYzd4+9I9OHzVKUMr+vXTR7FZ+Cfl/CcAZzCX2Mdy3BI2ApHXTp5zWeqWOoIjL4XO+kmBA12zFZMwkpuC6olU/v3JDovmViWz6EMGIv3NoOFj8X6s1jUQZS77lyxPPg5qeK6kMtgfQIDAQAB',
      host: window.location.host,
      debug: isTest, //调试开关
      spa: false, // 是否单页面
      strage: isTest ? 'pre' : 'release', // pre是测试环境， release是现网环境
      auto: false,
      enableJsBridge: false,
      configUrl: '', // 远程配置地址，本地部署时需要设置
      collectUrl: '', // 上报地址，本地部署时需要设置
      analysisUrl: '' // 埋点js代码地址，本地部署时需要设置
    };
    if (!window.EDUCollector) return;
    window.EDUCollector.init(config)
  }

  function collect_edu(moduleId, eventId, currentUserId) {
    var list = ['www.zhixue.com', 'test.zhixue.com'].indexOf(window.location.hostname) > -1;
    if (!list) {
      return
    }
    if (!window.EDUCollector) return;
    try {
      var params = {
        user_id: userId || currentUserId || '',
        device_type: window.deviceType,
        device_version: window.deviceVersion
      };
      console.log('埋点参数=======>', params);
      window.EDUCollector.trackEvent(eventId, moduleId, 'jzjx_product', params);
    } catch (error) {
      console.log('EDUCollector $collect', error);
    }
  }

  Transcripts.init = function () {
    getLoginFailTimeCB();
    getServiceUrl();
    loadBannerCB();
    loadCooperateSchool();
    bindDomainInfo();
    // 默认加载一个二维码
    refreshQRCode()
    collectInit()
  }

  function switchLoginType() {
    elements.errorMsg.html("");
    // elements.divName.hide();
    var currentType = elements.loginSwitch.attr('data-type')
    if (currentType === 'account') {
      isQRCodeLogin = false
      removeQRCodeStatusCheckInterval()
      elements.qrLoginPanel.addClass('hide');
      elements.loginSwitch.attr('data-type', 'qr')
      elements.loginSwitchLabel.html("扫码登录")
      elements.loginSwitchBtn.removeClass('account')
      elements.loginSwitchBtn.addClass('qr')
    } else {
      // refreshQRCode()
      addQRCodeStatusCheckInterval()
      isQRCodeLogin = true
      elements.qrLoginPanel.removeClass('hide');
      elements.loginSwitch.attr('data-type', 'account')
      elements.loginSwitchLabel.html("账号登录")
      elements.loginSwitchBtn.removeClass('qr')
      elements.loginSwitchBtn.addClass('account')
    }
  }

  Transcripts.bindBaseEvent = function () {
    // 初始化页面高度
    elements.imgPlay.height(document.documentElement.clientHeight - elements.loginHead.height());

    // init fullpage
    elements.container_login.fullpage({
      verticalCentered: false,
      anchors: ["p1", "p2", "p3", "p4", "p5"],
      navigation: true,
      afterLoad: function (anchorLink, index) {
        switch (index) {
          case 1:
            elements.btnBackTop.slideUp();
            break;
          case 2:
          case 3:
          case 4:
            elements.btnBackTop.slideDown();
            break;
          case 5:
            elements.btnBackTop.slideDown();
            var options = {
              app: "tlsysapp",
              action: "indexScrollScreen",
              data: "/index/home/#p5",
            };
            setUserAction(options);
            break;
          default:
            break;
        }
      },
    });

    // 回到顶部
    elements.btnBackTop.click(function () {
      $.fn.fullpage.moveTo(1);
    });

    // 监听窗口变化 页面高度自适应
    $(window).resize(function () {
      elements.imgPlay.height(document.documentElement.clientHeight - 80);
    });

    // 正产用户登录事件
    elements.signup_button.click(function () {
      if (elements.signup_button.html() == "正在登录...") {
        return;
      }
      // 增加全局错误监听
      initErrorListener()
      // 删除备用登录页登录在智学域名下写的tgt
      window.bakTgt = $.cookie(SSO.casTgcCookieName)
      $.removeCookie(SSO.casTgcCookieName)
      isRepeatLogin = false;
      var userName = $.trim(elements.txtUserName.val());
      var userPassword = elements.txtPassword.val();
      if (!userName) {
        elements.errorMsg.html("*用户名不能为空");
        return;
      }
      if (!userPassword) {
        elements.errorMsg.html("*密码不能为空");
        return;
      }
      var txtImageCode = elements.txtImageCode.val();
      if (SSO.captchaType === SSO.picCaptchaType && !txtImageCode) {
        elements.errorMsg.html("*验证码不能为空");
        return;
      }
      $.cookie("loginUserName", userName, { expires: 7, path: "/" });
      userInfo.name = userName;
      userInfo.pwd = userPassword;
      userInfo.code = txtImageCode;
      // 验证姓名流程
      if (elements.divName.is(":hidden") !== true) {
        var name = $.trim(elements.txtName.val());
        if (!name) {
          elements.errorMsg.html("*真实姓名不能为空");
          return;
        }
        userInfo.rName = name;
        nameLogin(userInfo.name, userInfo.pwd, userInfo.rName);
        return;
      }
      // 开始登录
      elements.errorMsg.html("");
      if (SSO.captchaType === SSO.thirdCaptchaType) {
        SSO.verify();
      } else if (SSO.captchaType === SSO.picCaptchaType) {
        initCodeCallback(null);
      }
    });

    // 账号解冻弹窗取消
    elements.cancelFreezeAccountBtn.click(function () {
      elements.accountFreezeConfirm.hide();
      elements.accountFreezeConfirmMask.hide();
    });

    // 账号解冻弹窗申请解冻
    elements.freezeAccountBtn.click(function () {
      elements.accountFreezeConfirm.hide();
      elements.accountFreezeConfirmMask.hide();
      TranscriptsSSOAll.login(
        dateObj.userId,
        dateObj.loginName,
        dateObj.password,
        dateObj.backUrl,
        dateObj.nextpage,
        _casUrl,
        _serviceUrl
      );
    });

    // 监听enter事件触发登录
    document.onkeydown = function (event) {
      var e = event || window.event || arguments.callee.caller.arguments[0];
      if (e && e.keyCode == 13) {
        elements.signup_button.trigger("click");
      }
    };

    // 切换简繁体用户协议
    elements.switchLanguageBtn.click(function () {
      var currentType = elements.switchLanguageBtn.attr('data-type');
      if (currentType === 'simple') {
        // 切换为繁体
        elements.switchLanguageBtn.attr('data-type', 'complex');
        elements.switchLanguageBtn.html('切換為標準版');
        elements.simpleProtocol.hide();
        elements.simpleTitle.hide();
        elements.simpleAgreementText.hide();
        elements.complexProtocol.show();
        elements.complexTitle.show();
        elements.complexAgreementText.show();
      } else {
        // 切换为简体
        elements.switchLanguageBtn.attr('data-type', 'simple');
        elements.switchLanguageBtn.html('切换为澳门繁体版');
        elements.complexProtocol.hide();
        elements.complexTitle.hide();
        elements.complexAgreementText.hide();
        elements.simpleProtocol.show();
        elements.simpleTitle.show();
        elements.simpleAgreementText.show();
      }
    });

    elements.loginSwitchBtn.click(function () {
      switchLoginType()
    });

    elements.loginSwitchLabel.click(function () {
      switchLoginType()
    });

    elements.qrCode.dblclick(function () {
      refreshQRCode(addQRCodeStatusCheckInterval)
    })

    elements.qrCodeRefresh.click(function () {
      refreshQRCode(addQRCodeStatusCheckInterval)
    })

    // 监听用户名输入变化
    elements.txtUserName.keyup(function () {
      var that = $(this);
      var name = $.trim(that.val());
      if (name.length > 64) {
        that.empty().val(name.substring(0, 64));
      }
    });

    // 验证姓名 返回事件
    elements.divName.find(".btnReturn").click(function () {
      elements.errorMsg.html("");
      elements.divName.hide();
      updateVertifyCode();
      elements.divLogin.show();
      elements.txtPassword.focus();
    });

    // 注册
    elements.regUser.click(function () {
      window.location.href = "/container/reg/parent/reg?channel=" + getChannel() + "&tag=COMMON_WEB_USERAGREEMENT";
    });

    // 三方登录 QQ登录
    elements.qqLogin.click(function () {
      encapUserActionLog('1001', null, { type: 'qq' });
      $.get(basePath + "/third/to/qq", function (data) {
        window.location = data;
      });
    });

    // 三方登录 wechat登录
    elements.wechatLogin.click(function () {
      encapUserActionLog('1001', null, { type: 'wechat' });
      $.get(basePath + "/third/to/wechat", function (data) {
        window.location = data;
      });
    });

    // 三方登录 微博登录
    elements.weiboLogin.click(function () {
      encapUserActionLog('1001', null, { type: 'weibo' });
      $.get(basePath + "/third/to/weibo", function (data) {
        window.location = data;
      });
    });

    // 小飞飞客服
    elements.sb_btnOnline.click(function () {
      var online = 'https://xfkfapi.iflytek.com/ydgdwx/hotIssues-pc.html?id=2c9fc4958133732301828b74163b00da';
      try {
        userActionLog("rq_click_online_customer_service", '1042', null, { url: online, role: '' });
      } catch (e) {
        console.error("online customer service userActionLog error: ", e);
      }
      var newOnlineCustom = $('#newOnlineCustom');
      if (newOnlineCustom && newOnlineCustom.length) {
        return;
      }
      var html = "<div id='newOnlineCustom'>";
      html += "<iframe src='" + online + "'></iframe>";
      html += "<a href='javascript:'>x</a></div>";
      elements.body.append(html);

      newOnlineCustom = $('#newOnlineCustom');
      newOnlineCustom.on('click', 'a', function () {
        newOnlineCustom.remove();
      });
    });

    // 隐私协议 不同意
    elements.notAgreement.click(function () {
      encapUserActionLog('1006', null, { status: 'failed', pageView: 'login' });
      window.location.href = "./";
    });

    //登录遇到问题
    elements.forget_password.click(function () {
      var userName = $.trim(elements.txtUserName.val());
      var appendString = "";
      if (userName) {
        appendString = "?account=" + userName;
      }
      window.open("./meet_problem.html" + appendString);
    })

    // 隐私协议 同意
    elements.agreenment.click(function () {
      encapUserActionLog('1006', null, { status: 'success', pageView: 'login' });
      $.ajax({
        url: "/container/protocol/updateStatus/",
        type: "GET",
        dateType: "jsonp",
        data: { userId: userId, agreementVersion: agreementVersion },
        async: false,
        jsonp: "jsonpcallback",
      });
      elements.slide.css("display", "none");
      elements.slideDiv.css("display", "none");
      if (!loginSuccess) {
        clickFlag = true;
        elements.divName.show();
        elements.divLogin.hide();
        elements.txtName.val("");
        elements.txtName.focus();
        elements.signup_button.html("登录").css("cursor", "pointer");
        return;
      }
      postOpenUrl(dateObj);
    });

    // 引流跳转确认按钮
    elements.JumpUrlBtn.click(function () {
      jumpTimer && clearInterval(jumpTimer)
      elements.jumpUrlConfirm.hide();
      elements.jumpUrlConfirmMask.hide();
      window.location.href = jumpRedirectUrl
    });

    // 引流跳转取消按钮
    elements.cancelJumpUrlBtn.click(function () {
      jumpTimer && clearInterval(jumpTimer)
      elements.jumpUrlConfirm.hide();
      elements.jumpUrlConfirmMask.hide();
      elements.signup_button.html("登录").css("cursor", "pointer");
    });

    // 引流关闭按钮
    elements.jumpCloseIcon.click(function () {
      // todo 重置倒计时时间
      jumpTimer && clearInterval(jumpTimer)
      elements.jumpUrlConfirm.hide();
      elements.jumpUrlConfirmMask.hide();
      elements.signup_button.html("登录").css("cursor", "pointer");
    })

    // cookie阻止三方登录后弹窗取消
    elements.cancelLoginBtn.click(function () {
      elements.noThirdCookieLoginFailedConfirmMask.hide();
      elements.noThirdCookieLoginFailedConfirm.hide();
    });

    // cookie阻止三方登录后弹窗跳转到备用登录页
    elements.noThirdCookieLoginBtn.click(function () {
      elements.noThirdCookieLoginFailedConfirmMask.hide();
      elements.noThirdCookieLoginFailedConfirm.hide();
      // 跳转到备用登录页面埋点
      collect_edu('container_login','10000023')
      // 登录信息临时存储
      var loginBlockInfo = {
        u: elements.txtUserName.val(),
        p: elements.txtPassword.val(),
        t: window.bakTgt
      }
      console.log('loginBlockInfo', loginBlockInfo)
      window.sessionStorage.setItem('_temp_login_info', JSON.stringify(loginBlockInfo));
      window.location.href = './login_no_third_cookie.html'
    });

    elements.noThirdCookieloginFAQBtn.click(function () {
      // 跳转到账密登录FAQ埋点
      collect_edu('container_login','10000022')
      window.open('./no_third_login_problem.html', '_blank')
    });
  };


  //获取带参数找回密码
  Transcripts.getFindPwdUrl = function (url) {
    var account = $.trim(elements.txtUserName.val());
    var customConfig = {
      logo: "zhixue",
      theme: "green",
      login_type: "manual",
      loginAccount: account,
      hidden_module: "",
      callback_login_name: "1",
      callback_param: 'origin',
      product_appkey: 'zx_web'
    };
    return url + '?customConfig=' + window.Base64.encode(JSON.stringify(customConfig)) + '&skipTo=' + encodeURIComponent(Transcripts.getBackURL());
  }

  //获取带参数找回账号
  Transcripts.getFindAccountUrl = function (url) {
    var customConfig = {
      logo: "zhixue",
      theme: "green",
      login_type: "manual",
      hidden_module: "",
      callback_login_name: "1",
      callback_param: 'origin',
      product_appkey: 'zx_web'
    };
    return url + '?customConfig=' + window.Base64.encode(JSON.stringify(customConfig)) + '&skipTo=' + encodeURIComponent(Transcripts.getBackURL());
  }

  //获取返回链接
  Transcripts.getBackURL = function () {
    var isMobile = whetherMobile();
    var hostname = window.location.hostname;
    if (hostname == 'localhost') {
      hostname = 'test.zhixue.com';
    }
    if (isMobile) {
      return window.location.protocol + '//' + hostname + '/wap_login.html';
    }
    return window.location.protocol + '//' + hostname + '/login.html';
  }

  // 校验隐私政策是否 （签署、未签署、重新签署）
  function privacyCheck() {
    $.ajax({
      url: "/container/protocol/checkStatus/",
      type: "GET",
      dataType: "jsonp",
      data: {
        userId: userId,
        tag: 'COMMON_WEB_USERAGREEMENT'
      },
      timeout: 3000,
      jsonp: "jsonpcallback",
      success: function (data) {
        if (data && data.agreementPath) {
          try {
            agreementList = JSON.parse(data.agreementPath);
          } catch (error) {
            console.error(error)
            agreementList = [];
          }
        }
        var html = '';
        var traditionalHtml = '';
        // 组装协议列表
        for (var i = 0; i < agreementList.length; i++) {
          if (agreementList[i].isZhiXueWebUserProtocol) {
            agreementLink = agreementList[i].path;
          }
          html += "<a target='_blank' href='" + agreementList[i].path + "'>《" + agreementList[i].title + "》</a>";
          traditionalHtml += "<a target='_blank' href='" + agreementList[i].traditionalPath + "'>《" + agreementList[i].traditionalTitle + "》</a>";
          if (i < agreementList.length - 1) {
            html += '、';
            traditionalHtml += '、';
          }
        }
        if (data.signStatus === "SIGNED") {
          goPath();
        } else if (data.signStatus === "UNSIGNED") {
          agreementVersion = data.agreementVersion;
          elements.slide.css("display", "block");
          elements.slideDiv.css("display", "block");
          elements.simpleProtocolList1.html(html);
          elements.simpleProtocolList2.html(html);
          elements.complexProtocolList1.html(traditionalHtml);
          elements.complexProtocolList2.html(traditionalHtml);
          clickFlag = false;
        } else if (data.signStatus === "NEED_RE_SIGNED") {
          agreementVersion = data.agreementVersion;
          elements.slide.css("display", "block");
          elements.slideDiv.css("display", "block");
          elements.simpleProtocolList1.html(html);
          elements.simpleProtocolList2.html(html);
          elements.complexProtocolList1.html(traditionalHtml);
          elements.complexProtocolList2.html(traditionalHtml);
        }
      },
      error: function () {
        goPath();
      },
    });
  }

  // 获取渠道号
  function getChannel() {
    var channelKey = "channel";
    var channelMatcher = new RegExp("[?&]" + channelKey + "=([^&]*)(&?)", "i");
    var channel = location.search.match(channelMatcher);
    if (!channel) {
      channel = document.referrer.match(channelMatcher);
    }
    return channel ? channel[1] : "00";
  }

  function goPath() {
    if (!loginSuccess) {
      elements.divName.show();
      elements.divLogin.hide();
      elements.txtName.val("");
      elements.txtName.focus();
      elements.signup_button.html("登录").css("cursor", "pointer");
      return;
    }
    postOpenUrl(dateObj);
  }

  function bindValidateIdBaseEvent(params) {
    elements.validateIdBtnNext.click(function () {
      var index = elements.provinceSelect[0].selectedIndex;
      var areaCode = elements.provinceSelect[0].options[index].value;
      var studentName = $.trim(elements.studentName.val());
      if (elements.validateIdBtnNext.html() === "下一步") {
        elements.validateIdBtnNext.html("验证中...").css("cursor", "default");
        //请求接口验证输入
        if (!studentName) {
          elements.inputErrorTip.show();
          elements.inputErrorTip.html("学生姓名不可为空");
          elements.validateIdBtnNext.html("下一步").css("cursor", "pointer");
          return;
        }
        userInfo.rName = studentName;
        userInfo.areaCode = areaCode;
        isRepeatLogin = true;
        if (SSO.captchaType === SSO.thirdCaptchaType) {
          SSO.verify();
        } else if (SSO.captchaType === SSO.picCaptchaType) {
          var repeatNoCode = $.trim($('.repeatNoCode').val());
          if (!repeatNoCode) {
            elements.inputErrorTip.show();
            elements.inputErrorTip.html("验证码不可为空");
            elements.validateIdBtnNext.html("下一步").css("cursor", "pointer");
            return;
          }
          userInfo.code = repeatNoCode;
          initCodeCallback(null);
        }
        return;
      }
      if (elements.validateIdBtnNext.html() === "确认修改") {
        var pwd = $.trim(elements.newPwd.val());
        var pwdConfirm = $.trim(elements.newPwdConfirm.val());

        if (!pwd || !pwdConfirm) {
          elements.inputErrorTip.show();
          elements.inputErrorTip.html("密码不可为空");
          return;
        }

        if (pwd !== pwdConfirm) {
          elements.inputErrorTip.show();
          elements.inputErrorTip.html("密码不一致，请重新输入");
        } else {
          var hexNewPassword = toHexString(rc4(pwd, zxlogin_secret));
          $.ajax({
            url: './modifyPwdValidateScene',
            data: {
              userId: userId,
              originPwd: params.password,
              newPwd: hexNewPassword,
              description: 'encrypt'
            },
            type: "POST",
            dataType: "json",
            cache: false,
            success: function (res) {
              if (res.result == "success") {
                window.location.href = './login.html';
              } else {
                elements.inputErrorTip.show();
                elements.inputErrorTip.html("*" + res.message);
              }
            },
            error: function () {
              elements.inputErrorTip.show();
              elements.inputErrorTip.html("*" + "系统请求出错，请稍后重试!");
            },
          });
        }
      }
    });
  }

  function repeatAccount(txtUserName, txtPassword, name, areaCode, params) {
    params = params || {};
    params.loginName = txtUserName;
    params.description = "encrypt";
    params.password = toHexString(rc4(txtPassword, zxlogin_secret));
    params.userName = name;
    params.areaCode = areaCode;

    $.ajax("./edition/login?from=web_login", {
      type: "POST",
      dataType: "json",
      data: params,
      success: function (resultInfo) {
        //验证成功
        if (resultInfo.result == "success") {
          userId = resultInfo.data;
          elements.stepItemIdentity.removeClass("actived");
          elements.stepItemPwd.addClass("actived");
          elements.areaInput.hide();
          elements.newPwdInput.show();
          elements.inputErrorTip.hide();
          elements.validateIdBtnNext.html("确认修改");
        } else {
          updateVertifyCode();
          elements.inputErrorTip.show();
          elements.inputErrorTip.html(resultInfo.message || "省份或学生姓名错误");
          elements.validateIdBtnNext.html("下一步").css("cursor", "pointer");
        }
      },
      error: function () {
        elements.inputErrorTip.show();
        elements.inputErrorTip.html("*" + "系统请求出错，请稍后重试!");
        elements.validateIdBtnNext.html("下一步").css("cursor", "pointer");
      },
    });
  }

  function postOpenUrl(args) {
    new RealNameVerification(login);
    // 登录
    function login() {
      if (!loginSuccess) {
        return
      }
      if (isQRCodeLogin) {
        window.location.href = qrCodeLoginRedirectUrl
      } else {
        TranscriptsSSOAll.login(
          args.userId,
          args.loginName,
          args.password,
          args.backUrl,
          args.nextpage,
          _casUrl,
          _serviceUrl
        );
      }
    }
  }

  // 更新验证码
  function updateVertifyCode() {
    elements.imageCode.trigger('click');
  }

  // 实名认证
  function RealNameVerification(callback) {
    var that = this;
    that.callback = callback;
    that.customConfig = {
      view_type: "WEB",
      hidden_module: "header,tail",
      product_appkey: "zx-container-client",
      theme: "green",
      callback_type: "postMessage",
    };

    $.ajax({
      url: "./common/getRealNameIdentifyConfig",
      type: "POST",
      dataType: "JSON",
      data: {
        userId: userId,
        customConfig: JSON.stringify(that.customConfig),
      },
      timeout: 5000,
      success: function (data) {
        if (data.code == 0) {
          var result = data.result || {};
          if (result.onoff && (result.status == 0 || result.status == 3)) {
            if (result.status == 3) {
              elements.idErrorMsg.show();
              elements.realNameIdentify
                .find(".begin-identify")
                .text("重新认证");
            }

            $.fn.fullpage.destroy();
            elements.body.css("overflow", "hidden");

            elements.realNameIdentify.show();
            that.bindEvents();
          } else {
            that.callback && that.callback();
          }
        } else {
          var content = "<p>服务异常，点击知道了重新登录</p>";
          that.dialog("提示", content, that.reLogin, null);
        }
      },
      error: function () {
        var content = "<p>网络异常，点击知道了重新登录</p>";
        that.dialog("提示", content, that.reLogin, null);
      },
    });
  }
  // 实名认证 时间绑定
  RealNameVerification.prototype.bindEvents = function () {
    var that = this;
    // 开始认证
    elements.realNameIdentify.on("click", ".begin-identify", function () {
      var callback = function (data) {
        if (data.result && data.result.url) {
          var url = data.result.url;
          url = url.replace(/^http:\/\//, "https://");
          window.addEventListener(
            "message",
            that.dealMessage.bind(that),
            false
          );
          var html =
            '<div id="ztIdentify" class="zt-identify"><iframe src="' +
            url +
            '" frameborder="0"></div>';
          $(".zt-identify").remove();
          elements.body.append(html);
        }
      };
      that.identifyStatus(callback);
    });
    // 切换账号
    elements.realNameIdentify.on("click", ".change-account", function () {
      that.reLogin();
    });
    // 查看隐私政策
    elements.realNameIdentify.on("click", ".look-policy", function () {
      if (!agreementLink) {
        return;
      }
      var content =
        '<iframe src="' + agreementLink + '" frameborder="0"></iframe>';
      that.dialog("知学科技隐私权政策", content, null, "80%");
    });
  };
  // 实名认证 dialog
  RealNameVerification.prototype.dialog = function (
    title,
    content,
    callback,
    width
  ) {
    var html = '<div class="spe-dialog-mask"></div>';

    var style = "";
    if (width) {
      style = 'style="width:' + width + '"';
    }

    html += '<div class="spe-dialog" ' + style + ">";

    html += '<div class="spe-dialog-header">';
    html += "<span>" + title + "</span>";
    html += "</div>";

    html += '<div class="spe-dialog-body">';
    html += content;
    html += "</div>";

    html += '<div class="spe-dialog-footer">';
    html += '<a class="spe-dialog-know" href="javascript:">知道了</a>';
    html += "</div>";

    html += "</div>";

    $(".spe-dialog-mask").remove();
    $(".spe-dialog").remove();
    elements.body.append(html);

    $(".spe-dialog-know").click(function () {
      $(".spe-dialog-mask").remove();
      $(".spe-dialog").remove();
      callback && callback();
    });
  };
  // 实名认证 处理消息
  RealNameVerification.prototype.dealMessage = function () {
    var that = this;

    var data = event && event.data;
    if (!data) {
      return;
    }
    var obj = null;
    try {
      obj = typeof data == "string" ? JSON.parse(data) : data;
    } catch (error) {
      console.info("JSON.parse error", error);
    }
    if (!obj) {
      return;
    }
    // 前往国家教育资源公共服务体系认证 'goNcetCertific'
    if (obj.method == "certificFinish") {
      var callback = function (data) {
        var result = data.result || {};
        if (result.status == 0 || result.status == 3) {
          that.reLogin();
        } else if (result.status == 1 || result.status == 2) {
          that.callback && that.callback();
        }
      };
      that.identifyStatus(callback);
    } else if (obj.method == "certificTimeout") {
      var back = function () {
        elements.idErrorMsg.html("<i></i>认证页面过期，请重新认证").show();
        elements.realNameIdentify.find(".begin-identify").text("重新认证");
        $("#ztIdentify").remove();
      };
      that.dialog("提示", "页面已过期，点击知道了回到认证页", back, null);
    }
  };
  // 实名认证 relogin
  RealNameVerification.prototype.reLogin = function () {
    window.location.href = "./";
  };
  // 实名认证 获取认证状态
  RealNameVerification.prototype.identifyStatus = function (callback) {
    var that = this;
    $.ajax({
      url: "./common/getRealNameIdentifyInfo",
      type: "POST",
      dataType: "JSON",
      data: {
        userId: userId,
        customConfig: JSON.stringify(that.customConfig),
      },
      timeout: 5000,
      success: function (data) {
        if (data.code == 0) {
          callback(data);
        } else {
          var content = "<p>服务异常，点击知道了重新登录</p>";
          that.dialog("提示", content, that.reLogin, null);
        }
      },
      error: function () {
        var content = "<p>网络异常，点击知道了重新登录</p>";
        that.dialog("提示", content, that.reLogin, null);
      },
    });
  };

  $(function () {
    elements.body = $("body");
    elements.loginHead = $("#loginHead");
    elements.imgPlay = $("#imgPlay");
    elements.head_imgList = $("#head_imgList");
    elements.headLogo = $("#head_logo");
    elements.head_select = $("#head_select");
    elements.foot_copyright = $("#foot_copyright");
    elements.foot_last_copyright = $("#foot_last_copyright");
    elements.errorMsg = $("#errorMsg");
    elements.divLogin = $("#divLogin");
    elements.txtUserName = $("#txtUserName");
    elements.txtPassword = $("#txtPassword");
    elements.panelImageCode = $("#panelImageCode");
    elements.txtImageCode = $("#txtImageCode");
    elements.imageCode = $("#imageCode");
    elements.forget_password = $("#forget_password");
    elements.divName = $("#divName");
    elements.txtName = $("#txtName");
    elements.signup_button = $("#signup_button");
    elements.rightBtn = $("#rightBtn");
    elements.btnBackTop = $("#btnBackTop");
    elements.regUser = $("#regUser");
    elements.loginSwitch = $("#loginSwitch");
    elements.loginSwitchBtn = $("#loginSwitchBtn");
    elements.loginSwitchLabel = $("#loginSwitchLabel");
    elements.qrLoginPanel = $("#qrLoginPanel");
    elements.qrCode = $("#qrCode");
    elements.qrCodeMask = $("#qrCodeMask");
    elements.qrCodeSuccessMask = $("#qrCodeSuccessMask");
    elements.qrCodeRefresh = $("#qrCodeRefresh");
    elements.qrLoginInfo = $("#qrLoginInfo");
    elements.teamPartner = $("#teamPartner");
    elements.schoolList = $("#schoolList");
    elements.container_login = $("#container_login");
    elements.qqLogin = $("#qq_login_btn");
    elements.wechatLogin = $("#wechat_login_btn");
    elements.weiboLogin = $("#weibo_login_btn");
    elements.sb_btnOnline = $("#sb_btnOnline");
    elements.switchLanguageBtn = $("#switchLanguageBtn");
    elements.simpleTitle = $("#simple-title");
    elements.simpleProtocol = $("#simple-protocol");
    elements.simpleAgreementText = $("#simple-agreement-text");
    elements.simpleProtocolList1 = $('#simple-protocol-list-1');
    elements.simpleProtocolList2 = $('#simple-protocol-list-2');
    elements.complexTitle = $("#complex-title");
    elements.complexProtocol = $("#complex-protocol");
    elements.complexAgreementText = $("#complex-agreement-text");
    elements.complexProtocolList1 = $('#complex-protocol-list-1');
    elements.complexProtocolList2 = $('#complex-protocol-list-2');
    elements.slide = $("#slide");
    elements.slideDiv = $("#slide-div");
    elements.agreenment = $("#agreenment");
    elements.notAgreement = $("#notAgreement");
    elements.guestLogin = $("#guestLogin");
    elements.realNameIdentify = $("#realNameIdentify");
    elements.idErrorMsg = $("#idErrorMsg");
    elements.validateIdentity = $("#validateIdentity");
    elements.stepItemIdentity = $("#stepItemIdentity");
    elements.stepItemPwd = $("#stepItemPwd");
    elements.validateTipText = $("#validateTipText");
    elements.provinceSelect = $("#provinceSelect");
    elements.validateIdBtnNext = $("#validateIdBtnNext");
    elements.areaInput = $("#areaInput");
    elements.newPwdInput = $("#newPwdInput");
    elements.inputErrorTip = $("#inputErrorTip");
    elements.studentName = $("#studentName");
    elements.newPwd = $("#newPwd");
    elements.newPwdConfirm = $("#newPwdConfirm");
    elements.accountFreezeConfirm = $("#accountFreezeConfirm");
    elements.accountFreezeConfirmMask = $("#accountFreezeConfirmMask");
    elements.cancelFreezeAccountBtn = $("#cancelFreezeAccountBtn");
    elements.freezeAccountBtn = $("#freezeAccountBtn");
    elements.jumpUrlConfirm = $("#jumpUrlConfirm");
    elements.jumpUrlConfirmMask = $("#jumpUrlConfirmMask");
    elements.cancelJumpUrlBtn = $("#cancelJumpUrlBtn");
    elements.JumpUrlBtn = $("#JumpUrlBtn");
    elements.jumpTipTxt = $("#jumpTipTxt");
    elements.autoJump = $("#autoJump");
    elements.autoJumpSecond = $("#autoJumpSecond");
    elements.jumpCloseIcon = $("#jumpCloseIcon");

    // cookie限制登录相关dom
    elements.noThirdCookieLoginFailedConfirmMask = $("#noThirdCookieLoginFailedConfirmMask");
    elements.noThirdCookieLoginFailedConfirm = $("#noThirdCookieLoginFailedConfirm");
    elements.cancelLoginBtn = $("#cancelLoginBtn");
    elements.noThirdCookieLoginBtn = $("#noThirdCookieLoginBtn");
    elements.noThirdCookieloginFAQBtn = $('#noThirdCookieloginFAQBtn');

    Transcripts.init();
    Transcripts.bindBaseEvent();
  });
})(window, jQuery);
