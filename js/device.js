(function getDeviceInfo () {
  try {
    var Browser_Name = navigator.appName;
    var Browser_Version = parseFloat(navigator.appVersion);
    var Browser_Agent = navigator.userAgent;
    var deviceVersion, deviceType;
    var is_IE = Browser_Name == "Microsoft Internet Explorer";
    //判读是否为ie浏览器，ie浏览器已废弃，无需兼容
    var is_NN = Browser_Name == "Netscape"; //判断是否为netscape浏览器
    var is_op = Browser_Name == "Opera"; //判断是否为Opera浏览器
    var is_IE11 = Browser_Agent.indexOf('Trident') > -1 && Browser_Agent.indexOf('rv:11.0') > -1
    if (is_NN) {
      //appName为'Netscape'的浏览器可能为Chrome、Firefox、Edge等
      //处理5.0及以上版本
      if (Browser_Version >= 5.0) {
        if (is_IE11) {
          deviceType = 'IE11'
          deviceVersion = '11.0'
        }
        if (Browser_Agent.indexOf("Netscape") != -1) {
          var Split_Sign = Browser_Agent.lastIndexOf("/");
          var Version = Browser_Agent.lastIndexOf(" ");
          var Bname = Browser_Agent.substring(0, Split_Sign);
          var Split_sign2 = Bname.lastIndexOf(" ");
          deviceVersion = Browser_Agent.substring(
            Split_Sign + 1,
            Browser_Agent.length
          );
          deviceType = Bname.substring(Split_sign2 + 1, Bname.length);
        }
        if (Browser_Agent.indexOf("Firefox") != -1) {
          //火狐浏览器具有Firefox唯一标识
          var Split_Sign = Browser_Agent.lastIndexOf("/");
          var Version = Browser_Agent.lastIndexOf(" ");
          deviceVersion = Browser_Agent.substring(
            Split_Sign + 1,
            Browser_Agent.length
          );
          deviceType = Browser_Agent.substring(Version + 1, Split_Sign);
        }
        if (Browser_Agent.indexOf("Safari") != -1) {
          //Chrome、Edge和Safari浏览器appName都有Safari字段
          if (Browser_Agent.indexOf("Chrome") != -1) {
            //Chrome和Edge浏览器appName都有Chrome字段
            //Chrome浏览器
            var Split_Sign = Browser_Agent.lastIndexOf(" ");
            var Version = Browser_Agent.substring(0, Split_Sign);
            var Split_Sign2 = Version.lastIndexOf("/");
            var Bname = Version.lastIndexOf(" ");
            deviceVersion = Version.substring(
              Split_Sign2 + 1,
              Version.length
            );
            deviceType = Version.substring(Bname + 1, Split_Sign2);
            if (Browser_Agent.indexOf("Edg") != -1) {
              //为Edge浏览器
              var Split_Sign = Browser_Agent.lastIndexOf("/");
              var Version = Browser_Agent.substring(0, Split_Sign);
              var Split_Sign2 = Browser_Agent.lastIndexOf("/");
              var Bname = Browser_Agent.lastIndexOf(" ");
              console.log("Bname:", Bname);
              deviceVersion = Browser_Agent.substring(
                Split_Sign2 + 1,
                Browser_Agent.length
              );
              deviceType = Browser_Agent.substring(Bname + 1, Split_Sign);
            }
          } else {
            //Safari浏览器
            var Split_Sign = Browser_Agent.lastIndexOf("/");
            var Version = Browser_Agent.substring(0, Split_Sign);
            var Split_Sign2 = Version.lastIndexOf("/");
            var Bname = Browser_Agent.lastIndexOf(" ");
            deviceVersion = Browser_Agent.substring(
              Split_Sign2 + 1,
              Bname
            );
            deviceType = Browser_Agent.substring(Bname + 1, Split_Sign);
          }
        }
        if (Browser_Agent.indexOf("QQBrowser") != -1) {
          //为Edge浏览器
          var Split_Sign = Browser_Agent.lastIndexOf("/");
          var Version = Browser_Agent.substring(0, Split_Sign);
          var Split_Sign2 = Browser_Agent.lastIndexOf("/");
          var Bname = Browser_Agent.lastIndexOf(" ");
          console.log("Bname:", Bname);
          deviceVersion = Browser_Agent.substring(
            Split_Sign2 + 1,
            Browser_Agent.length
          );
          deviceType = Browser_Agent.substring(Bname + 1, Split_Sign);
        }
      } else {
        deviceVersion = Browser_Version;
        deviceType = Browser_Name;
      }
    } else if (is_IE) {
      var Version_Start = Browser_Agent.indexOf("MSIE");
      var Version_End = Browser_Agent.indexOf(";", Version_Start);
      deviceVersion = Browser_Agent.substring(
        Version_Start + 5,
        Version_End
      );
      deviceType = Browser_Name;
      if (
        Browser_Agent.indexOf("Maxthon") != -1 ||
        Browser_Agent.indexOf("MAXTHON") != -1
      ) {
        var mv = Browser_Agent.lastIndexOf(" ");
        var mv1 = Browser_Agent.substring(mv, Browser_Agent.length - 1);
        mv1 = "遨游版本:" + mv1;
        deviceType += "(Maxthon)";
        deviceVersion += mv1;
      }
    } else if (is_op) {
      //Opera浏览器
      deviceType = "Opera";
      deviceVersion = Browser_Version;
    } else {
      deviceType = "Unknown Navigator";
      deviceVersion = "Unknown Version";
    }

    if (!deviceType) {
      deviceType = 'Unknown'
    }

    if (!deviceVersion) {
      deviceVersion = 'Unknown'
    }

    window.deviceType = deviceType
    window.deviceVersion = deviceVersion
    console.log('deviceInfo', window.deviceType, window.deviceVersion)
  } catch (e) {
    console.error('get device info error', e)
  }
})();