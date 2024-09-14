/**
 * sso utils
 * penggao4
 */

(function(win, $) {
  var TranscriptsSSOAll = {};

  var backUrl = '';
  var nextPage = '';
  var callback = null;
  TranscriptsSSOAll.login = function(userId, loginName, password, 
    backurl, nextpage, casUrl, serviceUrl, areaCode, personalName, behaviorCheckInPc, freezeUrl, loginCallBack) {
    if (!backurl) {
      backurl = './index.html';
    }
    if (!nextpage) {
      nextpage = './redirectIndex';
    }
    if (loginCallBack) { 
      callback = loginCallBack;
    }
    backUrl = decodeURIComponent(backurl);
    nextPage = decodeURIComponent(nextpage);

    if ((userId || loginName) && password) {
      initSSO(casUrl, serviceUrl);

      var loginParam = {
        account: loginName,
        password: password
      };
      areaCode && (loginParam.areaCode = areaCode);
      personalName && (loginParam.personalName = personalName);

      if (!loginName) {
        // 学籍号登录使用userId
        loginParam.account = userId;
        loginParam.key = 'id';
      }

      if (SSO.captchaType && SSO.captchaType === SSO.thirdCaptchaType) {
        loginParam.captchaId = window.loginThirdCaptchaId;
      } else if (SSO.captchaType && SSO.captchaType === SSO.picCaptchaType) {
        loginParam.captchaCode = window.loginThirdCode;
      }

      // 账号冻结解冻新增参数
      //是否是pc验证，即非H5
      loginParam.behaviorCheckInPc = behaviorCheckInPc === undefined ? true : behaviorCheckInPc;
      //开启风控验证
      loginParam.needBehaviorCheck = true;
      var customConfig ={};
      //解冻成功之后跳转的地址
      if (freezeUrl) {
        customConfig.redirectUrl = freezeUrl;
      } else {
        customConfig.redirectUrl = window.location.origin || (window.location.protocol + '//' + window.location.host);
      }
      //跳转到redirectUrl之前是否需要sso完成登录
      customConfig.needSsoLogin = "false";
      loginParam.customConfig = JSON.stringify(customConfig);

      SSO.loginExt(loginParam, function(result) {
        if (result && result.result != 'success') {
          var errorInfo = '';
          if (result.code === 2027) {
            // TODO 账号冻结 先弹窗提示 再跳转到对应页面
            var loginBtn = document.getElementById("signup_button");
            if (loginBtn) {
              loginBtn.style.cursor = "pointer";
              loginBtn.innerHTML = "登 录";
            }
            window.location.href = result.behaviorCheckUrl;
            return;
          } else if (result.code == 1002) {
            errorInfo = '用户名或密码错误，请点击忘记密码重置！';
          } else if (result.code == 2002) {
            errorInfo = result.data || '尝试次数已超过限制，请10分钟后重试！';
          } else if (result.code == 2019) {
            errorInfo = '您的账户存在风险，请点击忘记密码重置！';
          } else if (result.code == 2020) {
            errorInfo = '您的密码强度较弱，请点击忘记密码重置！';
          } else if (result.code == 2021) {
            errorInfo = '验证码不匹配！';
          } else if (result.code == 2022) {
            errorInfo = '验证码类型错误！';
          } else {
            errorInfo = '登录失败，请稍后重试！';
          }
          TranscriptsSSOAll.errorRedirect(errorInfo);
        } else {
          // login success
          $.ajax({
            url: serviceUrl,
            type: 'POST',
            timeout: 10000,
            data: { action: 'login', ticket: result.data.st },
            cache: false,
            success: function (html) {
              callback && callback();
              TranscriptsSSOAll.SSOLoginSuccess({userId: userId});
            },
            error: function (data) {
              TranscriptsSSOAll.SSOLoginSuccess({userId: userId});
            },
          });
        }
      });
    } else {
      TranscriptsSSOAll.errorRedirect('');
    }
  };

  TranscriptsSSOAll.SSOLoginSuccess = function(data) {
    $.ajax('./loginSuccess/', {
      type: 'POST',
      dataType: 'json',
      data: data || {},
      success: function() {
        loginReport();
        window.location.href = nextPage || './redirectIndex';
      },
      error: function() {
        window.location.href = nextPage || './redirectIndex';
      }
    });
  };

  TranscriptsSSOAll.errorRedirect = function(errorInfo) {
    if (!backUrl) {
      backUrl = './index.html';
    }
    if (errorInfo) {
      if (backUrl.indexOf('?') > -1) {
        backUrl += '&errorMessage=' + errorInfo;
      } else {
        backUrl += '?errorMessage=' + errorInfo;
      }
    }
    if (nextPage) {
      if (backUrl.indexOf('?') > -1) {
        backUrl += '&nextPage=' + nextPage;
      } else {
        backUrl += '?nextPage=' + nextPage;
      }
    }
    window.location.href = backUrl;
  };

  function loginReport() {
    $.ajax('./userBehavior/autoReport', {
      type: 'POST',
      dataType: 'json',
      data: {
        deviceId: SSO.getDeviceId(),
        osType: getOsType(),
        userAgent: window.navigator.userAgent
      },
      success: function() {},
      error: function() {}
    });
  }

  function getOsType() {
    var agent = (window.navigator.userAgent || '').toLowerCase();
    if (agent.indexOf('se 2.x') > -1) {
      return 'sogou';
    }
    if (agent.indexOf('qqbrowser') > -1) {
      return 'qq';
    }
    if (agent.indexOf('360se') > -1) {
      return '360';
    }
    if (agent.indexOf('opr') > -1) {
      return 'opera';
    }
    if (agent.indexOf('msie') > -1) {
      return 'ie';
    }
    if (agent.indexOf('edg') > -1) {
      return 'edge';
    }
    if (agent.indexOf('firefox') > -1) {
      return 'firefox';
    }
    if (agent.indexOf('chrome') > -1) {
      return 'chrome';
    }
    if (agent.indexOf('safari') > -1) {
      return 'safari';
    }
    return 'other';
  }

  function initSSO(casUrl, serviceUrl) {
    if (SSO.appKey) {
      return;
    }
    SSO.appKey = 'zx-container-client';
    SSO.ncetAppId = 'QLIqXrxyxFsURfFhp4Hmeyh09v6aYTq1';
    SSO.appName = 'tkyh,tkyh';
    SSO.loginRedirectUrl = serviceUrl;
    SSO.SSOServerUrl = casUrl;
    SSO.needAttribute = false;
    SSO.customLogoutUrl = '//' + window.location.hostname;
    SSO.useNextPage = false;
    SSO.client = "web";
    SSO.mac = SSO.deviceId;
    SSO.useAreaExamNo = true;
  }

  var Captcha = {};
  Captcha.initCode = function(callback, casUrl, serviceUrl) {
    initSSO(casUrl, serviceUrl);

    function getCaptchaResultCB(resultObj) {
      if (resultObj && resultObj.code === "success") {
        var captchaData = resultObj.data;
        var captchaType = captchaData && captchaData.captchaType;
        // 图形验证码
        if (captchaType === SSO.picCaptchaType && captchaData.captchaUrl){
          // $("#imageCode").attr("src", captchaData.captchaUrl);
          // $("#panelImageCode").show();
          $('.captchaBox img').attr("src", captchaData.captchaUrl);
          $(".captchaBox").show();
        }
      }
    }
    
    SSO.getCaptcha({
      getCaptchaResultCB: getCaptchaResultCB,
      captchaSuccessResultCB: callback
    });

    $(".captchaBox img").click(function() {
      SSO.getCaptcha({
        getCaptchaResultCB: getCaptchaResultCB,
        captchaSuccessResultCB: callback
      });
    });
  }

  win.TranscriptsSSOAll = TranscriptsSSOAll;
  win.Captcha = Captcha;
})(window, jQuery);
