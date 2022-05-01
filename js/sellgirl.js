var sellgirl = sellgirl || {};
sellgirl.vm = sellgirl.vm || {};

//判断浏览器
function getOs() {
    //var OsObject = "";
    this.Name = "Unknown";
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        this.Name = "MSIE";
    }
    if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
        this.Name = "Firefox";
    }
    if (isSafari = navigator.userAgent.indexOf("Safari") > 0) {
        this.Name = "Safari";
    }
    if (isCamino = navigator.userAgent.indexOf("Camino") > 0) {
        this.Name = "Camino";
    }
    if (isMozilla = navigator.userAgent.indexOf("Gecko/") > 0) {
        this.Name = "Gecko";
    }
}
var oOs = new getOs();

sellgirl.isOnMobile = (function () {
    var system = {};
    var p = navigator.platform;
    var u = navigator.userAgent;
    system.win = p.indexOf("Win") == 0;
    system.mac = p.indexOf("Mac") == 0;
    system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
    //debugger;
    if (system.win || system.mac || system.xll) {//如果是PC转
        //if (u.indexOf('Windows Phone') > -1) {  //win手机端
        //}else {
        //    window.location.href = " <%=ctx%>/jsp/mobile/allChannel/addChannelPCerror.jsp";
        //}
        return false;
    }
    return true;
})();

/*
自写ajax方法,使用如下:
            sellgirl.ajax({
                url:'/api/home/getcitynews/1',
                param:utils.formatString('&id=1&page={0}&rows={1}', vmInstance.cityNews.page, vmInstance.cityNews.rows),
                async:false,
                success:function(xmlHttpReq){ 
                    document.getElementById("idNews").innerHTML = xmlHttpReq;
                    ////aaabc=aaabc.replace('<z:anyType xmlns:d1p1="http://www.w3.org/2001/XMLSchema" i:type="d1p1:string" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/">','');
                    ////aaabc=aaabc.replace('</z:anyType>','');
                }
            });
            */
sellgirl.ajax = function (object) {

    var xmlHttpReq = null; //声明一个空对象用来装入XMLHttpRequest

    if (window.XMLHttpRequest) {//除IE5 IE6 以外的浏览器XMLHttpRequest是window的子对象

        xmlHttpReq = new XMLHttpRequest(); //我们通常采用这种方式实例化一个XMLHttpRequest

    }

    else if (window.ActiveXObject) {//IE5 IE6是以ActiveXObject的方式引入XMLHttpRequest的

        xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");

        //IE5 IE6是通过这种方式

    }

    if (xmlHttpReq != null) {//如果对象实例化成功 我们就可以干活啦
        var urlMenu = object.url || '';
        var sendStr = object.param || '';//url 的参数
        var async;
        if (object.async === false) {//不能用var a=object.async||true,因为undefined和false均执行||的后面
            async = false;
        } else {
            async = true;
        }
        xmlHttpReq.open("post", urlMenu, async);//false同步,true异步,//为了使sellgirl.loader.js迟些加载,可以似为false
        //xmlHttpReq.open("get", "Default.aspx?s=" + intI + "&ProgramID=8&pages=" + pages + "&ArticleID=" + articleId, true);//原来

        //调用open()方法并采用异步方式

        function RequestCallBack() {//一旦readyState值改变，将会调用这个函数

            if (xmlHttpReq.readyState == 4) {
                //判断成功还是失败
                var msg = xmlHttpReq.responseText;
                var sellgirlObject = sellgirl.toObject(msg);
                var callbackSuccess = function (condition) {
                    if (!!condition) {
                        //object.success(xmlHttpReq);
                        //由于火狐中的<>尖角符号自动转成了&lt&gt,原因未知
                        if (typeof (sellgirlObject) == 'string' && (oOs.Name == 'Firefox' || oOs.Name == 'Gecko')) {
                            sellgirlObject = utils.htmlDecode(sellgirlObject);
                        }
                        object.success(sellgirlObject);//新闻第一页英文被转为对象了
                        //object.success(msg);
                    }
                }
                //var ret = msg.match(/^{\"code\":\"(.*)\",\"text\":\"(.*)\"[,}]/);//前面新增了 success属性所以match不到
                //var ret = msg.match(/[,{]\"code\":\"(.*)\",\"text\":\"(.*)\"[,}]/);
                var ret = msg.match(/^{\"success\":(.*),\"code\":\"(.*)\",\"text\":\"(.*)\"[,}]/);
                var retError = msg.match(/^{\"Message\":\"(.*)\",\"ExceptionMessage\":\"(.*)\",\"ExceptionType\":.*/);
                //console.info(ret[2]);
                if (ret != null) {//这里其实是包含成功和失败的,判断code
                    //sellgirlObject = { success: ret[1], code: ret[2], text: ret[3] };//已经优化了sellgirl.toObject方法,这句似乎没有必要了--20171127
                    ////msg = (ret[1] + ret[2]).replace(/\\"/g, '"').replace(/\\r\\n/g, '<br/>').replace(/dbo\./g, '');
                    msg = (ret[2] + ret[3]).replace(/\\"/g, '"').replace(/\\r\\n/g, '<br/>').replace(/dbo\./g, '');
                    //if (!!ret[1]) {//成功,ret[1]为字符串"false"时转为bool 是true
                    if (ret[1] != "false" && !!ret[1]) {//成功,ret[1]为字符串"false"时转为bool 是true
                        callbackSuccess(object.success);
                    } else {
                        if (object.error) {
                            object.error(sellgirlObject);
                        } else {
                            com.message(ret[2], ret[3]);
                        }
                    }
                } else if (retError != null) {
                    msg = (retError[2] + retError[3]).replace(/\\"/g, '"').replace(/\\r\\n/g, '<br/>').replace(/dbo\./g, '');
                    if (object.error) {
                        object.error(sellgirlObject);
                    } else {
                        com.message(retError[2], retError[3]);
                    }
                } else {
                    callbackSuccess(object.success);
                    //if (object.success) {
                    //    //object.success(xmlHttpReq);
                    //    //由于火狐中的<>尖角符号自动转成了&lt&gt,原因未知
                    //    if (typeof (sellgirlObject) == 'string' && (oOs.Name == 'Firefox' || oOs.Name == 'Gecko')) {
                    //        sellgirlObject = utils.htmlDecode(sellgirlObject);
                    //    }
                    //    object.success(sellgirlObject);//新闻第一页英文被转为对象了
                    //    //object.success(msg);
                    //}
                }
            }

        }
        xmlHttpReq.onreadystatechange = RequestCallBack; //设置回调函数
        xmlHttpReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');//用post方法的话，一定要加这句。

        xmlHttpReq.send(sendStr); //因为使用get方式提交，所以可以使用null参调用

    }
};
////JSON字符串转为对象
//sellgirl.toObject = function (value) {//旧版
//    var regx = /^{.*}$/;
//    var regxDaKuoHao = /^{(.*)}$/;
//    var regxYinHao = /^\"(.*)\"$/;
//    var rsArray = value.match(regxDaKuoHao);
//    var rs = '';
//    if (rsArray != null) {
//        rs = rsArray[1].toString();
//    } else {
//        rs = value;
//    }
//    if (rs.match(regxYinHao) != null) {
//        rs = rs.match(regxYinHao)[1].toString();
//    };
//    //var rs = regx.exec(value);
//    //rs = rs.toString();
//    //rs = rs.substring(1,rs.length-1);
//    var list = rs.split(',');
//    var result = {};
//    for (var o in list) {
//        //var valueText = list[o].split(':');//日后改良为 'a':'b'的匹配再用
//        //if (valueText.length > 1) {
//        //    textArray = valueText[1].match(regxYinHao);
//        //    if (textArray != null) {
//        //        valueText[1] = textArray[1].toString();
//        //    }
//        //    result[valueText[0]] = valueText[1];
//        //} else {
//        result = rs;
//        //}
//    }
//    return result;
//    //alert(rs);
//};
sellgirl.toObjectPropertyNameValue = function (value) {//用:号拆分单个属性:'\"cardContent\":\"A型淋浴房\"'
    var m = value.match(/^\"([a-zA-Z]+)\"+:(.*)$/);
    //var s = value.split(':');
    if (m && m.length > 2) {
        var n = m[1];
        var v = m[2];//v可能头尾是双引号
        if (v[0] == '\"') v = v.substr(1, v.length - 1);//注意\"算是1个字符
        if (v[v.length - 1] == '\"') v = v.substr(0, v.length - 1);
        return [n, v];
    }
    return null;

    //var m = value.match(/^\"[a-zA-Z]+\"+:.*$/);
    //var s = value.split(':');
    //if (s && s.length > 1) return [s[0].replace(/\"/g, ''), value.replace(s[0], '')];
    //return null;
}
sellgirl.toObjectProperty = function (value) {// 用,号拆分这种格式:'\"cardContent\":\"A型淋浴房\",\"nextCardId\":\"778d96ca-524a-4cf8-b590-52730ea97ec8\",\"nextCardCode\":\"p_006\"'
    //  '\"cardContent\":\"A型淋浴房\",\"nextCardId\":\"778d96ca-524a-4cf8-b590-52730ea97ec8\",\"nextCardCode\":\"p_006\"'.match(/^(\"[a-zA-Z]+\"+:.+,)+/)
    //var m = value.match(/^(\"[a-zA-Z]+\"+:.+,)+/);

    //var m = value.match(/^(\"[a-zA-Z]+\"+:.*,)+/);

    //var m = value.match(/^(\"[a-zA-Z]+\"+:\"[^\"]*\",)|(\"[a-zA-Z]+\"+:[^\"]*,)+/);

    var m = value.match(/^(\"[a-zA-Z]+\"+:.*,(?=\"))+/);//匹配到的是 多个 [属性:值,] 结构,除去了最后一个属性  (?=\")是为了排除 值 中有逗号的情况

    var result = {};
    if (m != null) {
        var next = sellgirl.toObjectProperty(m[0].substr(0, m[0].length - 1));
        if (next) { result = next };
        var property = value.substr(m[0].length, value.length - m[0].length);
        if (property.indexOf(':') >= 0) {

            var valueName = sellgirl.toObjectPropertyNameValue(property);
            if (valueName) result[valueName[0]] = valueName[1];
            //var valueName = property.split(':');//这样分格的话,value里如果有:就不正确了,暂用
            //result[valueName[0]] = valueName[1];
            return result;
        } else {// 这种 '\"cardContent\":\"A型淋,浴房\" 时进入此分支
            var valueName = sellgirl.toObjectPropertyNameValue(value);
            if (valueName) { result[valueName[0]] = valueName[1]; return result; }
        }
    } else {//最后一个属性后面是没逗号的
        var valueName = sellgirl.toObjectPropertyNameValue(value);
        if (valueName) { result[valueName[0]] = valueName[1]; return result; }
        //var valueName = value.split(':');//这样分格的话,value里如果有:就不正确了,暂用
        //if (valueName && valueName.length > 1) { result[valueName[0]] = valueName[1]; return result;}
    }
    return null;
}
//JSON字符串转为对象
sellgirl.toObject = function (value) {
    var regx = /^{.*}$/;
    var regxDaKuoHao = /^{(.*)}$/;
    var regxYinHao = /^\"(.*)\"$/;
    var regxObj = /^(\"[^,\"]+\"\:.*,)+$/;
    //var regxYinHao = /^(\\\"(.*)\\\")|(\"(.*)\")$/;
    //var regxYinHao = /^\"(.*)\"$/;
    var rsArray = value.match(regxDaKuoHao);
    var rs = '';
    var isObject = false;//是对象类型
    var isString = false;//是字符串
    if (rsArray != null) {
        rs = rsArray[1].toString();
        isObject = true;
    } else {
        rs = value;
    }

    if (isObject) {
        return sellgirl.toObjectProperty(rs);
    }

    if (rs.match(regxYinHao) != null && (!isObject)) {
        rs = rs.match(regxYinHao)[1].toString();
        isString = true;
    };
    //var rs = regx.exec(value);
    //rs = rs.toString();
    //rs = rs.substring(1,rs.length-1);
    var list = rs.split(',');
    var result = {};
    for (var o in list) {
        //var valueText = list[o].split(':');//日后改良为 'a':'b'的匹配再用
        //if (valueText.length > 1) {
        //    textArray = valueText[1].match(regxYinHao);
        //    if (textArray != null) {
        //        valueText[1] = textArray[1].toString();
        //    }
        //    result[valueText[0]] = valueText[1];
        //} else {
        result = rs;
        //}
    }
    return result;
    //alert(rs);
};
sellgirl.reload = function (object) {//其实所有不兼容都是因为用了submit类型的按钮,否则就用window.location.href = tUrl一句ok了
    var obDefault = { url: '' };
    $.extend(obDefault, object);
    var tUrl = obDefault.url || '';
    if (tUrl == '') {
        var aa = location.href;
        window.location.replace(aa);//ie
        window.location.reload();//firefox刷新
        location.href = aa;//chrome 刷新
    } else {
        window.location.href = tUrl;//chrome
        location.replace(tUrl);//ie
        window.location.href = tUrl;//firefox跳转
    }
    //alert('22');
};
sellgirl.logout = function (object) {
    //var obDefault = { url: '' };
    //object = $.extend(obDefault, object);
    //var tUrl = object.url || '';
    sellgirl.ajax({
        url: '/api/home/exit/1',
        param: utils.formatString('&id=1'),
        async: false,
        success: function (xmlHttpReq) {
            sellgirl.reload(object);
            //if (tUrl == '') {
            //    location.replace(location.href);
            //} else {
            //    location.reload(true);
            //    //location.href(tUrl);
            //}
        }
    });
};
sellgirl.login = function (object) {
    //sellgirl.reload();
    //window.location.href = '/manager';
    //sellgirl.reload();
    //sellgirl.reload('aa');
    //var obDefault = { url: 'bbbb' };
    ////object = $.extend(obDefault, object);
    //$.extend(obDefault, object);
    var userCode = $('#usercode').val() || '';
    var password = $('[type=password]').val() || '';//url 的参数
    //var tUrl = obDefault.url || '';
    //alert(tUrl);
    sellgirl.ajax({
        url: '/api/home/login/1',
        param: utils.formatString('&id=1&usercode={0}&password={1}', userCode, password),
        async: false,
        success: function (xmlHttpReq) {
            sellgirl.reload(object);
            //location.replace('aaa');
            //window.location = location.href();////刷新的方法很难兼容所有浏览器
            //window.location.replace(location.href);
            //if (tUrl == '') {
            //window.location.reload();
            //location.reload(true);
            //} else {
            //    location.href(tUrl);
            //}
        }
    });
    //return false;
};
sellgirl.keyDown = function (oEvent, fun, key) {
    var ikey = 13;//默认enter键触发
    if (arguments.length > 2) {
        ikey = key;
    }
    //var ieKey = event.keyCode;
    var ieKey = sellgirl.eventUtil.getCharCode(oEvent);
    //if ((elem.id == 'usercode' || elem.id == 'password') && ieKey == ikey) {//下面改为通用
    if (ieKey == ikey) {//
        fun();
    }
};
/**
* 混合的构造函数/原型方式
**/
function HtmlCodeLowerCase() {
    this.aCode = [];
    this.aCode.push('a');
    this.aCode.push('div');
    this.aCode.push('span');
    this.aCode.push('p');
    this.aCode.push('br');
}
function HtmlCode() {
    var oHtmlCodeLowerCase = new HtmlCodeLowerCase();
    this.aCode = [];
    var tempUpperCase = "";
    for (var i in oHtmlCodeLowerCase.aCode) {
        this.aCode.push(oHtmlCodeLowerCase.aCode[i]);
        tempUpperCase = oHtmlCodeLowerCase.aCode[i].toUpperCase();
        this.aCode.push(tempUpperCase);
        //this.aCode.push(oHtmlCodeLowerCase.aCode[i].tolocaleUpperCase());
    }
}
function StyleCode() {
    this.aCode = [];
    this.aCode.push('style');
    this.aCode.push('class');
    this.aCode.push('id');
    this.aCode.push('lang');
    this.aCode.push('width');
    this.aCode.push('height');
    this.aCode.push('border');
    this.aCode.push('face');
}
//清除html格式,返回纯文本
sellgirl.clearHtml = function (v) {
    //str = str.replace(/<[^>]*>/g, ''); //这句可以替换全部,但有可能替换了文章中的<

    var oHtmlCode = new HtmlCode();
    //oUrlCode.showCode();
    for (var i in oHtmlCode.aCode) {
        v = v.replace(eval("/<" + oHtmlCode.aCode[i] + "[^>]*>/g"), "");//
        v = v.replace(eval("/<\\/" + oHtmlCode.aCode[i] + ">/g"), "");//所有\必须转译为\\
    }
    //v = v.replace(/<div[^>]*>/g,''); //原版
    //v = v.replace(/<\/div>/g, '');

    v = v.replace(/<!--[^>]*-->/g, '');//注释内容     

    var oStyleCode = new StyleCode();
    //oUrlCode.showCode();
    for (var i in oStyleCode.aCode) {
        v = v.replace(eval("/" + oStyleCode.aCode[i] + "=.+?['|\\\"]/g"), "");//所有\必须转译为\\   而"要转为\"
    }
    v = v.replace(/face=.+?['|\"]/, '');//去除样式 只允许小写 正则匹配没有带 i 参数   

    //原版
    //v = v.replace(/style=.+?['|\"]/g,'');//去除样式     
    //v = v.replace(/class=.+?['|\"]/g,'');//去除样式     
    //v = v.replace(/id=.+?['|\"]/g,'');//去除样式        
    //v = v.replace(/lang=.+?['|\"]/g,'');//去除样式         
    //v = v.replace(/width=.+?['|\"]/g,'');//去除样式      
    //v = v.replace(/height=.+?['|\"]/g,'');//去除样式      
    //v = v.replace(/border=.+?['|\"]/g,'');//去除样式      
    //v = v.replace(/face=.+?['|\"]/g,'');//去除样式      
    //v = v.replace(/face=.+?['|\"]/,'');//去除样式 只允许小写 正则匹配没有带 i 参数   
    return v;
};
sellgirl.getLength = function (str) {
    ///<summary>获得字符串实际长度，中文2，英文1</summary>
    ///<param name="str">要获得长度的字符串</param>
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
};
//截取字符串(包括中文）
sellgirl.setString = function (str, len) {
    var strlen = 0;
    var s = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 128) {
            strlen += 2;
        } else {
            strlen++;
        }
        s += str.charAt(i);
        if (strlen >= len) {
            return s;
        }
    }
    return s;
};
sellgirl.domSlice = function (thisDom, shortNum, targetDom) {
    alert('11');
};
////滚到页面顶部的方法,暂时无使用,其实不需要函数,直接<a href="#">aa</a>也是可以滚到顶部
//sellgirl.goToMark = function (btnId) {

//    //BackTop = function (btnId) {
//        var btn = document.getElementById(btnId);
//        var d = document.documentElement;
//        window.onscroll = set;
//        btn.onclick = function () {
//            btn.style.display = "none";
//            window.onscroll = null;
//            this.timer = setInterval(function () {
//                d.scrollTop -= Math.ceil(d.scrollTop * 0.1);
//                if (d.scrollTop == 0) clearInterval(btn.timer, window.onscroll = set);
//            }, 10);
//        };
//        function set() { btn.style.display = d.scrollTop ? 'block' : "none" }
//    //};
//    //BackTop('gotop');

//};
sellgirl.isEmpty = function (obj) {
    if (!obj || obj == "") return true;
};

/*
* 获取浏览器可见范围
*/
sellgirl.getBrowerViewSize = function () {
    var w = window.innerWidth;
    var h = window.innerHeight;
    //alert(window.innerHeight);
    //alert(window.screen.height);
    //var h = 99999;
    function smaller(a, b) {
        if (a > 0 && a < b) return a;
        return b;
    }
    //if (windows) {
    //    w = smaller(windows.innerWidth, w);
    //    h = smaller(windows.innerHeight, h);
    //}

    w = smaller(document.documentElement.clientWidth, w);
    h = smaller(document.documentElement.clientHeight, h);
    //w = smaller(document.body.clientWidth, w);
    //h = smaller(document.body.clientHeight, h);
    //w = smaller(document.body.offsetWidth, w);
    //h = smaller(document.body.offsetHeight, h);
    w = smaller(window.screen.width, w);
    h = smaller(window.screen.height, h);
    w = smaller(window.screen.availWidth, w);
    h = smaller(window.screen.availHeight, h);
    var result = { width: w, height: h };
    //alert(result.height);
    return result;
};

var sellgirlTipBox = document.createElement("div");
sellgirlTipBox.id = "sellgirlTipBox";
sellgirl.showTip = function (text, opts) {
    opts = opts || {};
    sellgirlTipBox.innerHTML = text;
    function func() {
        var style =
        {
            background: 'lightgreen',
            position: "fixed",
            zIndex: 10,
            //right: '0px',
            //bottom:'0px',
        }
        if (opts.direct) {
            var direct = opts.direct;
            if (direct.indexOf('u') > -1) { style.top = opts.top || '0px'; }
            if (direct.indexOf('r') > -1) { style.right = opts.right || '0px'; }
            if (direct.indexOf('d') > -1) { style.bottom = opts.bottom || '0px'; }
            if (direct.indexOf('l') > -1) { style.left = opts.left || '0px'; }
        }
        for (var i in style)
        { sellgirlTipBox.style[i] = style[i]; }
        if (document.getElementById("sellgirlTipBox") == null) {
            document.body.appendChild(sellgirlTipBox);
            if (!opts.direct) {
                var winSize = sellgirl.getBrowerViewSize();
                if ((!opts.top) && (!opts.bottom)) {
                    sellgirlTipBox.style.top = (winSize.height - sellgirlTipBox.clientHeight) / 2 + 'px';
                }
                if ((!opts.left) && (!opts.right)) {
                    sellgirlTipBox.style.left = (winSize.width - sellgirlTipBox.clientWidth) / 2 + 'px';
                }
            }
            setTimeout("document.body.removeChild(sellgirlTipBox)", 2000);
        }
    }
    func();
};

/*
阻止事件
*/
sellgirl.stopPropagation = function (event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
};

sellgirl.showMask = function (html,opts) {

    opts = opts || {};
    var me=this;

    this.sellgirlMaskBox = document.createElement("div");
    //sellgirlMaskBox.id = "sellgirlMaskBox";
    this.sellgirlMaskContentBox = document.createElement("div");
    this.sellgirlMaskCloseBtn = document.createElement("div");
    //sellgirlMaskContentBox.id = "sellgirlMaskContentBox";
    this.sellgirlMaskBox.appendChild(this.sellgirlMaskContentBox);
    //this.sellgirlMaskBox.appendChild(this.sellgirlMaskCloseBtn);
    this.sellgirlMaskBox.style.position = 'fixed';
    this.sellgirlMaskBox.style.top = '0px';
    this.sellgirlMaskBox.style.zIndex = '555';
    this.sellgirlMaskBox.style.width = '100%';
    this.sellgirlMaskBox.style.height = '100%';
    this.sellgirlMaskBox.style.textAlign = 'center';
    this.sellgirlMaskBox.style.backgroundColor = '#efefef';    
    
    this.sellgirlMaskContentBox.innerHTML = html;
    
    this.sellgirlMaskCloseBtn.style.position = 'fixed';
    this.sellgirlMaskCloseBtn.style.top = '0px';
    this.sellgirlMaskCloseBtn.style.right = '0px';
    this.sellgirlMaskCloseBtn.style.backgroundColor = 'white';  
    this.sellgirlMaskCloseBtn.style.color = 'red';  
    this.sellgirlMaskCloseBtn.style.zIndex = 9999;
    this.sellgirlMaskCloseBtn.style.cursor = 'pointer';  
    this.sellgirlMaskCloseBtn.innerHTML = "关闭遮罩";
    this.sellgirlMaskCloseBtn.addEventListener('click', function (event) {
        sellgirl.stopPropagation(event);
        me.close();
    });
    
    if (opts.opacity) {this.sellgirlMaskBox.style.opacity = opts.opacity;
    //this.sellgirlMaskCloseBtn.style.opacity = 10;
    }
    
    var winSize = sellgirl.getBrowerViewSize();
    document.body.appendChild(this.sellgirlMaskBox);
    document.body.appendChild(this.sellgirlMaskCloseBtn);
    this.sellgirlMaskContentBox.style.paddingTop = ((winSize.height - this.sellgirlMaskContentBox.clientHeight) / 2) + 'px';
};

sellgirl.showMask.prototype.close = function () {
    if (this.sellgirlMaskBox) {
        document.body.removeChild(this.sellgirlMaskBox);
        document.body.removeChild(this.sellgirlMaskCloseBtn);
        delete this.sellgirlMaskBox;
        delete this.sellgirlMaskCloseBtn;
    }
};

/*
*增加自适应背景图
*dom:背景图加的位置(canvas是作为dom的子对象添加的,如果图片不显示,调整canvas和dom的z-index关系)(dom支持直接使用document.body)
*imgUrl:图片地址
*imgSize:{w:宽,h:高,s:{x:,y:},e:{x:,y:}}  (s和e是图片与"浏览器的左上角到右下角的对角线"对齐的参照线的开始结束点的坐标)
*canvasProperty:canvas对象的html属性 {opacity,backgroundColor}
*opts:{loaded:图片加载完事件}
*/
sellgirl.backgroundImg = function (dom, imgUrl, imgSize, canvasProperty, opts) {
    canvasProperty = canvasProperty || {};
    opts = opts || {};
    if (dom !== document.body && dom.style.zIndex === '') { dom.style.zIndex = '1'; }

    var getDevicePixelRatio = function () {//为了解决手机上因为viewport而模糊的问题-20171123
        return window.devicePixelRatio || 1;//注意,就算这里放大2倍,也不会变得更高清,纯粹是增加了分辨率而已
    }
    var pixelTatio = getDevicePixelRatio();

    //var canvas = document.getElementById('h5Image');
    //var canvas = document.getElementById(canvasId);
    var canvas = document.createElement("canvas");
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '-100';
    canvas.style.top = '0px';
    dom.appendChild(canvas);
    if (canvasProperty.opacity) canvas.style.opacity = canvasProperty.opacity;

    var ctx1 = canvas.getContext('2d');
    var image1 = new Image();
    image1.crossOrigin = "anonymous"; //如果图片是跨域,想对canvasDom.toDataURL()就需要这一句--benjamin20200213

    //目标是使"图片参照线"匹配到"浏览器的左上角到右下角的对角线

    ////var src = 'img/web_sasha_1920x1080_02.jpg';
    //var src = imgUrl;

    var w = imgSize.w, h = imgSize.h;//图片尺寸
    var line = {//图片与"浏览器的左上角到右下角的对角线"对齐的参照线.如果人物是平躺的话,一般就取水平中分线
        s: imgSize.s,
        e: imgSize.e
    }
    //var w = 2300, h = 2300;//图片尺寸
    //var line = {//图片与"浏览器的左上角到右下角的对角线"对齐的参照线.如果人物是平躺的话,一般就取水平中分线
    //    s: { x: 0, y: 1150 },
    //    e: { x: 2300, y: 1150 }
    //}
    var l = Math.sqrt(Math.pow(line.e.x - line.s.x, 2) + Math.pow(line.e.y - line.s.y, 2));

    function getAngle(start, end) {
        var diff_x = end.x - start.x,
            diff_y = end.y - start.y;
        //返回角度,不是弧度
        return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
    }

    function setImageAngle() {
        //当然你也可以写个简单的extend函数去添加方法

        var wWidth = 0;
        var wHeight = 0;
        if (dom !== document.body) {
            var domRect = dom.getBoundingClientRect();
            var wWidth = domRect.width;
            var wHeight = domRect.height;
        } else {
            var wWidth = window.innerWidth;
            var wHeight = window.innerHeight;
        }
        //首先计算浏览器对角线长度
        var diagonal = Math.sqrt(Math.pow(wWidth, 2) + Math.pow(wHeight, 2));

        //根据图片的三线比例计算宽高
        var width = diagonal * w / l;
        var height = diagonal * h / l;

        //求浏览器对角线与图片参照线(移动前)的差角
        var angleOfDifference
            = getAngle({ x: 0, y: 0 }, { x: wWidth, y: wHeight })
            - getAngle({ x: line.s.x, y: line.s.y }, { x: line.e.x, y: line.e.y });

        ////alert('宽'+width+' 高'+height);
        //canvas.width = window.innerWidth;
        //canvas.height = window.innerHeight;
        //        //为了解决手机上因为viewport而模糊的问题-20171123
        //        canvas.style.width = window.innerWidth + "px";
        //        canvas.style.height = window.innerHeight + "px";
        //        canvas.width = window.innerWidth * pixelTatio;
        //        canvas.height = window.innerHeight * pixelTatio;

        //应该使用计算的wWidth--benjamin20200213
        canvas.style.width = wWidth + "px";
        canvas.style.height = wHeight + "px";
        canvas.width = wWidth * pixelTatio;
        canvas.height = wHeight * pixelTatio;

        if (canvasProperty.backgroundColor) {//背景色一定要画到画布上,用户保存图片时才能保存下来(想用css是不行的)
            ctx1.rect(0, 00, wWidth * pixelTatio, wHeight * pixelTatio);
            ctx1.fillStyle = canvasProperty.backgroundColor;
            ctx1.fill();
        }

        ctx1.rotate(angleOfDifference * Math.PI / 180);//旋转

        ////console.info('angleOfDifference:'+angleOfDifference+'--x:' + line.s.x * diagonal / l + '--y:' + line.s.y * diagonal / l+'--w:'+wWidth+'--h:'+wHeight);
        //ctx1.drawImage(image1, -(line.s.x * diagonal / l), -(line.s.y * diagonal / l), width, height);//注意第二三个参数是位移,是旋转后的方向上的,是斜的
        //为了解决手机上因为viewport而模糊的问题-20171123
        ctx1.drawImage(image1, -(line.s.x * diagonal * pixelTatio / l), -(line.s.y * diagonal * pixelTatio / l), width * pixelTatio, height * pixelTatio);//注意第二三个参数是位移,是旋转后的方向上的,是斜的
    }
    image1.onload = function () {
        setImageAngle();
        if (opts.loaded) {
            opts.loaded();
        }
    }

    //缩略图--benjamin20200411
    var hasThumbnail = opts.thumbnail !== null && opts.thumbnail !== undefined;
    //var imgThumbnail = null;
    if (hasThumbnail) {
        var fullImage = new Image();
        fullImage.onload = function () {
            image1.src = fullImage.src;
            //image1 = fullImage;
        };
        fullImage.src = imgUrl;
    }

    image1.src = hasThumbnail ? opts.thumbnail : imgUrl;
    if (dom !== document.body) {
        EleResize.on(dom, function () { setImageAngle(); })
    } else {
        window.onresize = function () {
            setImageAngle();
        };
    }
    //$(window).resize(function () {
    //    setImageAngle();
    //});
    //EleResize.on(dom, function () { alert(1);});
};

/*
根据图片创建拼图
*/
sellgirl.createPuzzle = function (dom, imgUrl, rowQty, colQty, opts) {
    opts = opts || {};

    //生成拼图
    //var image1 = new Image();
    //var imageLoaded = false;
    //image1.onload = function () {
    //    imageLoaded = true;
    //}
    //image1.src = imgUrl;
    //while (!imageLoaded) {        
    //}
    //var imageWidth = image1.width;
    //var imageHeight = image1.height;

    //var imageWidth = parseInt(dom.offsetWidth.replace('px', ''));
    //var imageHeight = parseInt(dom.offsetHeight.replace('px', ''));
    var imageWidth = dom.offsetWidth;
    var imageHeight = dom.offsetHeight;
    var puzzleWidth = imageWidth / colQty;
    var puzzleHeight = imageHeight / rowQty;
    var puzzleQty = rowQty * colQty;

    for (var i = 0; i < rowQty; i++) {
        for (var j = 0; j < colQty; j++) {
            var picItem = document.createElement("div");
            picItem.className = "pic";
            picItem.style.width = puzzleWidth - 3 + 'px';
            picItem.style.height = puzzleHeight - 3 + 'px';
            picItem.style.float = 'left';
            picItem.style.background = "url('" + imgUrl + "')";
            picItem.style.position = 'absolute';
            picItem.style.transition = 'all 0.5s ease 0s';

            picItem.style.backgroundPosition = '-' + (puzzleWidth * j) + 'px -' + (puzzleHeight * i) + 'px';
            picItem.style.left = (puzzleWidth * j) + 'px';
            picItem.style.top = (puzzleHeight * i) + 'px';
            picItem.setAttribute("data-index", i * colQty + j + 1);
            dom.appendChild(picItem);
        }
    }
    var result = {};

    //var picbox = document.getElementById('picbox');
    var picbox = dom;
    var pic = document.querySelectorAll('.pic');
    var picWidth = pic[0].offsetWidth;
    //debugger;
    var picHeight = pic[0].offsetHeight;
    var picboxWidth = picbox.offsetWidth;
    var picboxHeight = picbox.offsetHeight;
    var go = document.getElementById('go');
    var times = document.getElementById('times'); //定时。用于扩展
    var dx, dy, newLeft, newtop, startTime, endTime;
    var dragging = '';
    var allSuccess = false;
    var outputSpan = document.getElementById('outputSpan'); //日志,便于测试
    function doGo() {
        startTime = Date.parse(new Date()); //获取到期1970年1月1日到当前时间的毫秒数，这个方法不常见，这里为试用
        for (var i = 0; i < pic.length; i++) {
            pic[i].style.display = "block"; //设置显示拼图，游戏开始
        }
        //picbox.style.background = "#fff";
        for (var i = 0; i < puzzleQty; i++) { //随机打乱
            var a = Math.floor(Math.random() * puzzleQty);
            var b = Math.floor(Math.random() * puzzleQty);
            if (a != b) {
                random(a, b);
            }
        }
        allSuccess = false;
    }
    go.addEventListener('touchstart', function () {

        doGo();
    });
    for (var i = 0; i < pic.length; i++) {
        pic[i].addEventListener('touchstart', function (e) {
            pfPreventDefault(e);
            if (dragging !== '') { return; }
            if (isAnyoneMoving()) { return; }
            dragging = this.getAttribute('data-index');
            this.style.zIndex = 100; //设置拖拽元素的z-index值，使其在最上面。
            dx = e.targetTouches[0].pageX - this.offsetLeft; //记录触发拖拽的水平状态发生改变时的位置
            dy = e.targetTouches[0].pageY - this.offsetTop; //记录触发拖拽的垂直状态发生改变时的位置
            this.startX = this.offsetLeft; //记录当前初始状态水平发生改变时的位置
            this.startY = this.offsetTop; //offsetTop等取得的值与this.style.left获取的值区别在于前者不带px,后者带px
            this.style.transition = 'none';
            //alert('x:' + this.startX + ' y:' + this.startY);
        });
        pic[i].addEventListener('touchmove', function (e) {
            pfPreventDefault(e);
            //writeLog('2');
            if (dragging !== this.getAttribute('data-index')) { return; }
            //writeLog('5');
            newLeft = e.targetTouches[0].pageX - dx; //记录拖拽的水平状态发生改变时的位置
            newtop = e.targetTouches[0].pageY - dy;
            showLog('newLeft:' + newLeft + '  picWidth:' + picWidth);
            if (newLeft <= -picWidth / 2) { //限制边界代码块，拖拽区域不能超出边界的一半
                newLeft = -picWidth / 2;
            } else if (newLeft >= (picboxWidth - picWidth / 2)) {
                newLeft = (picboxWidth - picWidth / 2);
            }
            if (newtop <= -picHeight / 2) {
                newtop = -picWidth / 2;
            } else if (newtop >= (picboxHeight - picHeight / 2)) {
                newtop = (picboxHeight - picHeight / 2);
            }
            //showLog('newLeft:' + newLeft);
            this.style.left = newLeft + 'px';
            this.style.top = newtop + 'px'; //设置目标元素的left,top
        });
        pic[i].addEventListener('touchend', function (e) {
            //writeLog('3');
            //alert('stop');
            if (dragging !== this.getAttribute('data-index')) { return; }
            dragging = '';
            this.style.zIndex = 0;
            this.style.transition = 'all 0.5s ease 0s'; //添加css3动画效果
            this.endX = e.changedTouches[0].pageX - dx;
            this.endY = e.changedTouches[0].pageY - dy; //记录滑动结束时的位置，与进入元素对比，判断与谁交换
            var obj = change(e.target, this.endX, this.endY); //调用交换函数
            if (obj == e.target) { //如果交换函数返回的是自己
                obj.style.left = this.startX + 'px';
                obj.style.top = this.startY + 'px';
            } else { //否则
                var _left = obj.style.left;
                obj.style.left = this.startX + 'px';
                this.style.left = _left;
                var _top = obj.style.top;
                obj.style.top = this.startY + 'px';
                this.style.top = _top;
                var _index = obj.getAttribute('data-index');
                obj.setAttribute('data-index', this.getAttribute('data-index'));
                this.setAttribute('data-index', _index); //交换函数部分，可提取
            }
        });
        pic[i].addEventListener('transitionend', function () {
            //writeLog('4');
            //alert('transitionend');
            if (allSuccess === true) { return; }
            if (isSuccess()) {
                allSuccess = true;
                if (opts.success !== undefined) {
                    opts.success();
                } else {
                    alert("成功了");
                }

                //alert("成功了,页面将跳转");
                //window.location.href = "question3.html";

                //console.log('成功了！'); //此处监听事件有bug，会添加上多次事件。
            } else {
                // pic[i].removeEventListener('transitionend');
            }
        });
    }
    //手机端没有mousemove
    //        document.onmousemove = function() {
    //            //alert(1);
    //            writeLog('m');
    //        };
    //        picbox.onmousemove = function() {
    //            //alert(1);
    //            writeLog('m');
    //        };
    function change(obj, x, y) { //交换函数，判断拖动元素的位置是不是进入到目标原始1/2，这里采用绝对值得方式
        for (var i = 0; i < pic.length; i++) { //还必须判断是不是当前原素本身。将自己排除在外
            if (Math.abs(pic[i].offsetLeft - x) <= picWidth / 2 && Math.abs(pic[i].offsetTop - y) <= picHeight / 2 && pic[i] != obj)
                return pic[i];
        }
        return obj; //返回当前
    }
    function random(a, b) { //随机打乱函数，其中交换部分，可以提取出来封装
        var aEle = pic[a];
        var bEle = pic[b];
        var _left;
        _left = aEle.style.left;
        aEle.style.left = bEle.style.left;
        bEle.style.left = _left;
        var _top;
        _top = aEle.style.top;
        aEle.style.top = bEle.style.top;
        bEle.style.top = _top;
        var _index;
        _index = aEle.getAttribute("data-index");
        aEle.setAttribute("data-index", bEle.getAttribute("data-index"));
        bEle.setAttribute("data-index", _index);
    }
    function isSuccess() { //判断成功标准
        //var str = '';
        for (var i = 0; i < pic.length; i++) {
            //str += pic[i].getAttribute('data-index');
            if (parseInt(pic[i].getAttribute('data-index')) !== (i + 1)) {
                return false;
            }
        }
        //if (str == '123456789') {
        //    return true;
        //}
        //return false;
        return true;
    }
    function isAnyoneMoving() { //任何一个移动中(由于动画延迟造成的
        //            for (var i = 0; i < pic.length; i++) {
        //                if (parseInt(pic[i].style.left.replace('px', '')) % 100 !== 0
        //                || parseInt(pic[i].style.top.replace('px', '')) % 100 !== 0) {
        ////                    alert(pic[i].startX);
        ////                    alert(parseInt(pic[i].style.left.replace('px', '')));
        //                    showLog('hasOneMoving');
        //                    return true;
        //                }
        //            }
        //            showLog('stoping');
        return false;
    }

    function writeLog(s) {
        //outputSpan.innerHTML +=s;
    }
    function showLog(s) {
        //outputSpan.innerHTML = s;
    }
    function pfPreventDefault(e) {
        e.preventDefault();
        //$pf.stopPropagation(e);
    }

    if (opts.autoGo !== false) {//默认自动打乱
        doGo();
    }

    //        var time;
    //        setInterval(function() { //定时函数，额。。。待续。
    //            endTime = Date.parse(new Date());
    //            times.innerHTML = (endTime - startTime) / 1000 || '';
    //        }, 1000);

    //doGo();
    result.go = doGo;
    return result;
};

/*这方法不完美(因为js是单线程),尽量不使用此方法,阻塞等待*/
sellgirl.waitTime = function (time) {
    var isOk = false;
    //alert(3);
    //console.info(3);

    //方法1:这个方法会使之前执行的jquery动画无效
    var sd = (new Date()).getTime();
    while (((new Date()).getTime() - sd) < time) {

    }

    //console.info(4);

    //方法2:这样写会卡住,setTimeout和while不能一起用
    //setTimeout(function () {
    //    //alert(3);
    //    console.info(3);
    //    isGoing = false;
    //}, time);
    //while (!isOk) {
    //    var aa = "aa";
    //}

    return;
};

sellgirl.asyncLoadImage = function (dom, imgUrl) {

    var image1 = new Image();
    image1.onload = function () {
        dom.src = imgUrl;
    };
    image1.src = imgUrl;

};

sellgirl.onClick = function (dom, callback) {
    //debugger;
    if (sellgirl.isOnMobile) {
        dom.addEventListener('touchstart', callback);
    } else {
        dom.addEventListener('click', callback);
    }
};

sellgirl.createMusicPlayer = function (audioContainer,opts) {
    if(opts===undefined||opts===null){
        opts={};
    }
    //按钮
    var nextLrcModeBtn = audioContainer.find('#nextLrcModeBtn');

    //缓存
    function sNumber(num, key, defaultNum) {
        if (defaultNum === undefined || undefined === null) { defaultNum = 0; }
        if (num !== null && num !== undefined) {
            localStorage.setItem(key, num.toString());
        }
        return localStorage.getItem(key) == null || localStorage.getItem(key) == 'undefined' ? defaultNum : parseInt(localStorage.getItem(key));
    }
    function sCurIdx(curIdx) {
        return sNumber(curIdx, 'sellgirl_mediaPlayer_curIdx');
    }
    function sPlayMode(playMode) {
        //return sNumber(playMode, 'sellgirl_mediaPlayer_playMode');
        return sNumber(playMode, 'sellgirl_mediaPlayer_playMode', 2); //默认随机播放
    }
    function sLrcMode(lrcMode) {
        return sNumber(lrcMode, 'sellgirl_mediaLrcer_lrcMode', 1);
    }

    var medias = {};
    var curIdx = sCurIdx();
    var playMode = sPlayMode();
    var lrcMode = sLrcMode();

    var lrcJSONCache = {};
    var lrcTimeCache = {}; //歌词对应的时间数组--benjamin20191125
    //var lrcTime = [];//歌词对应的时间数组--benjamin20191125
    // var lrcTitle = '';//歌词标题
    var randomPlayList = [];
    var randomPlayContainer = null;

    function getPlayLis() {//获得播放列表li
        return document.getElementsByClassName('sellgirl_player_list_top')[0].children;
    }

    if (getPlayLis().length - 1 < curIdx) { curIdx = sCurIdx(0); } //当服务器中删除了视频文件时,当前idx可能已经太大了

    function setDefaultBg(oldSrc) {
        var lis = getPlayLis();
        for (var i = 0; i < lis.length; i++) {
//            if (decodeURIComponent('./' + oldSrc.replace(window.location.href.replace(/[^\/]*$/, ''), '')) == lis[i].attributes.getNamedItem('src').nodeValue + '.' + lis[i].attributes.getNamedItem('sgFmts').nodeValue.split(',')[0]) {
            if (decodeURIComponent(oldSrc.replace(window.location.href.replace(/[^\/]*$/, ''), '')) == lis[i].attributes.getNamedItem('src').nodeValue ) {
                lis[i].style.backgroundColor = ''; // 'white';//如果加了白色,会挡住 a:hover时的背景色
            }
        }

    }
    function srcIsVideo(src) {
        var lcSrc = src.toLowerCase();
        //var formats = ['.mp4', '.ogg', '.mkv'];
        var formats = ['mp4', 'mkv']; //改为多source后--20180728
        for (var i = 0; i < formats.length; i++) {
            if (lcSrc.indexOf(formats[i]) > -1) { return true; }
        }
        return false;
    }
    function srcIsFlv(src) {
        var lcSrc = src.toLowerCase();
        var formats = ['flv']; 
        for (var i = 0; i < formats.length; i++) {
            if (lcSrc.indexOf(formats[i]) > -1) { return true; }
        }
        return false;
    }
    function mediaIsStopped(player) {
        return player.videoDom.ended || player.videoDom.paused;
    }
    var videoPlayers={};
    function createVideo(src, isVideo) {
        isVideo = (isVideo !== false); //默认true
        var oVideo = document.createElement(isVideo ? "video" : "audio");
        oVideo.autoplay = 'autoplay';
        oVideo.controls = 'controls';
        oVideo.className = 'classAudio';
        oVideo.autobuffer = 'autobuffer';
        oVideo.setAttribute('sellgirlSrc',src);
        //oVideo.src = src;
        oVideo.addEventListener('ended', function () {
            playNext();
        });
        var result={
            play:function(){oVideo.play();},
            pause:function(){oVideo.pause();},
            videoDom:oVideo,
            isFlv:false,
            removeSource:function(){
                var childs = oVideo.childNodes;
                for (var i = childs.length - 1; i >= 0; i--) {
                    oVideo.removeChild(childs[i]);
                }
            },
            onTimeUpdate:function(fun){
              oVideo.ontimeupdate=fun;
            },
            onSeeked:function(fun){
              oVideo.onseeked=fun;
            },
            currentTime:function(){
                return oVideo.currentTime;
            },
            setCurrentTime:function(t){
                return oVideo.currentTime=t;
            }
        };
        videoPlayers[src]=result;
        return result;
    }
    //var flvPlayers={};
    //需要引用flvjs
    function createFlv(src) {
        var oVideo = document.createElement("video");                        
        oVideo.autoplay = 'autoplay';
        oVideo.controls = 'controls';
        oVideo.className = 'classAudio';
        oVideo.autobuffer = 'autobuffer';
        oVideo.setAttribute('sellgirlSrc',src);
        //oVideo.src = src;
        
        var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            // url: 'http://example.com/flv/video.flv'
            url: src+'.flv'
        });
        flvPlayer.attachMediaElement(oVideo);
        flvPlayer.load();
        //flvPlayer.play();
        oVideo.addEventListener('ended', function() {
            playNext();
        });
//        return oVideo;
        var result={
            play:function(){flvPlayer.play();},
            pause:function(){flvPlayer.pause();},
            videoDom:oVideo,
            isFlv:true,
            removeSource:function(){
                var childs = oVideo.childNodes;
                for (var i = childs.length - 1; i >= 0; i--) {
                    oVideo.removeChild(childs[i]);
                }
            },
            onTimeUpdate:function(fun){
              oVideo.ontimeupdate=fun;
            },
            onSeeked:function(fun){
              oVideo.onseeked=fun;
            },
            currentTime:function(){
                return oVideo.currentTime;
            },
            setCurrentTime:function(t){
                return oVideo.currentTime=t;
            }
        };
        videoPlayers[src]=result;
        return result;
    }
    var lastTimeIsFlv=false;
    function liClick(li) {

        var idx = parseInt(li.attributes.getNamedItem('sgIdx').nodeValue);
        sCurIdx(idx);
        if (idx === curIdx && medias[idx]) {//当重播时
            if (!medias[idx].ended) { medias[idx].setCurrentTime ( 0); }
            medias[idx].play();
            return;
        }

        var aus = document.getElementsByClassName('classAudio');
        var videoLayer = document.getElementsByClassName('videoLayer')[0];
        
        if (aus && aus.length > 0) {
            //var originSrc=aus[0].getAttribute('sellgirlSrc');
            var originSrc=aus[0].attributes.getNamedItem('sellgirlSrc').nodeValue;
            var originPlayer=videoPlayers[originSrc];
            //setDefaultBg(aus[0].src);//iphone不支持此属性currentSrc
            //setDefaultBg(aus[0].childNodes[0].src); //iphone不支持此属性currentSrc.改为多个source之后要用第一个子节点的url去找当前播放地址
            //setDefaultBg(lastTimeIsFlv?aus[0].src:aus[0].childNodes[0].src); //iphone不支持此属性currentSrc.改为多个source之后要用第一个子节点的url去找当前播放地址
            setDefaultBg(originSrc); //iphone不支持此属性currentSrc.改为多个source之后要用第一个子节点的url去找当前播放地址

            if (!mediaIsStopped(originPlayer)) { originPlayer.pause(); }
            if (!medias[curIdx]) { medias[curIdx] = aus[0]; }
            videoLayer.removeChild(aus[0]);
        }

        var src = li.attributes.getNamedItem('src').nodeValue;
        //debugger;
        var sgFmts=li.attributes.getNamedItem('sgFmts').nodeValue;
        //var isVideo = srcIsVideo(src);
        var isVideo = srcIsVideo(sgFmts); //改为多source之后--20180728
        var isFlv=srcIsFlv(sgFmts);
        if (!medias[idx]) {
            if(typeof(flvjs)==='undefined'||(!isFlv)){
                medias[idx] = createVideo(src, isVideo);
            }else{
                medias[idx] = createFlv(src);
            }
        } else {
            if (isVideo) {//iphone上,如果不重新load的话,有时切换到不同格式时就会显示不了video的图像,没办法先加这句;华为手机上,即使load了也没用,视频直接停了,所以干脆重新创建element
                var oldVideo = medias[idx];
                medias[idx] = createVideo(src);
                delete oldVideo;
            } else if (medias[idx].currentTime() != 0) {
                medias[idx].setCurrentTime(0);
            }
            var currentPlayer=videoPlayers[src];
            if (mediaIsStopped(currentPlayer)) { 
                currentPlayer.play();
            }
        }
        
        //为了兼容多种浏览器，同时声称多个source节点--20180728var childs = f.childNodes; 
        medias[idx].removeSource();
    
        var fmts = li.attributes.getNamedItem('sgFmts').nodeValue.split(',');
        var mimeType={
            mp4:'video/mp4'
        };
        
        if(!isFlv){
            for (var i = 0; i < fmts.length; i++) {
                var oSource = document.createElement("source");
                oSource.src = src + '.' + fmts[i];
                //oSource.type = 'audio/' + fmts[i];
                oSource.type = mimeType[fmts[i]]!=undefined?mimeType[fmts[i]]:'audio/' + fmts[i];
                medias[idx].videoDom.appendChild(oSource);
            }
        }

        //videoLayer.appendChild(medias[idx]);
        videoLayer.appendChild(medias[idx].videoDom);
        curIdx = idx;
        li.style.backgroundColor = 'lightblue';

        //显示歌词--benjamin20191125
        //debugger;
        if (!isVideo) {
            function showLrc() {

                var ul = $("#lrclist")[0]; //获取ul
                $("#lrclist").empty();
                var i = 0;
                var lrcJSON = lrcJSONCache[li.innerHTML];
                // debugger;
                $.each(lrcJSON, function (key, value) {//遍历lrc
                    // lrcTime[i++] = parseFloat(key.substr(1,3)) * 60 + parseFloat(key.substring(4,10));//00:00.000转化为00.000格式
                    ul.innerHTML += "<li><p>" + ((lrcJSON[key] === null || lrcJSON[key] === undefined || lrcJSON[key] === "") ? "&nbsp;" : lrcJSON[key]) + "</p></li>"; //ul里填充歌词
                });
                //lrcTime[lrcTime.length] = lrcTime[lrcTime.length-1] + 3;//如不另加一个结束时间，到最后歌词滚动不到最后一句


                var currentLine = 0; //当前播放到哪一句歌词了
                var currentTime; //当前播放的时间
                //var audio = document.getElementById("audio");
                //var ppxx;//保存ul的translateY值
                var $li = $("#lrclist>li"); //获取所有li
                //debugger;
                var lrcTime = lrcTimeCache[li.innerHTML];
                var lastJ = -2;
                medias[idx].onTimeUpdate( function () {//audio时间改变事件
                    //debugger;
                    currentTime = medias[idx].currentTime();
                    //debugger;
                    for (var j = currentLine, len = lrcTime.length; j < len; j++) {//这样写的话，liclick时需要重置currentLine为0，索性从0开始找吧
                        //for (var j=0, len=lrcTime.length; j<len; j++){
                        if (
                                (currentTime < lrcTime[j + 1]
                                  || j + 1 >= lrcTime.length//最后一行时
                                )
                                && (currentTime >= lrcTime[j]
                                  || j === 0//第一行时(如果没这句,当歌词第一句的时间比较大时,就一直不满足了
                                )
                               ) {
                            currentLine = j;
                            if (//lastJ!==j&&//这样的话，liclick时lastJ没有重置
                                    (!$li.eq(currentLine).hasClass('on')) &&
                                    (!$pf.stringIsNullOrWhiteSpace($li.get(currentLine).innerText))) {
                                // debugger;
                                //ppxx = 250-(currentLine*32);
                                // ul.style.transform = "translateY("+ppxx+"px)";
                                // debugger;
                                // ul.scrollTop=ppxx;
                                //$('.sellgirl_player_lrcContainer').scrollTop(currentLine*32);

                                var ppxx = $li.get(currentLine).getBoundingClientRect().top
                                      - $li.get(0).getBoundingClientRect().top;
                                //$('.sellgirl_player_lrcContainer').animate({scrollTop:currentLine*32},200);
                                $('.sellgirl_player_lrcContainer').animate({ scrollTop: ppxx }, 200);

                                // console.log(ppxx);
                                // ul.scrollTop="1000px";
                                // $li.get(currentLine-1).className="";
                                $li.removeClass('on');
                                // console.log("on"+currentLine);
                                $li.get(currentLine).className = "on";

                                lastJ = j;
                            }
                            break;
                        }
                    }
                });
                medias[idx].onSeeked(function () {//audio进度更改后事件
                    currentTime = medias[idx].currentTime();
                    // console.log("  off"+currentLine);
                    $li.get(currentLine).className = "";
                    for (var k = 0, len = lrcTime.length; k < len; k++) {
                        if (
                                (currentTime < lrcTime[k + 1]
                                  || k + 1 >= lrcTime.length//最后一行时
                                )
                                && currentTime >= lrcTime[k]
                               ) {
                            currentLine = k;
                            lastJ = -2;
                            break;
                        }
                    }
                });
            }
            if (lrcJSONCache[li.innerHTML] === undefined) {
                //var lrcUtl = encodeURIComponent(li.attributes.getNamedItem('lrc').nodeValue);
                var lrcUtl = encodeURI(li.attributes.getNamedItem('lrc').nodeValue);
                //alert(lrcUtl);
                $.get(lrcUtl, null, function (data) {
                    if (data !== undefined && data !== null && data !== '') {
                        // $("#lrclist").css('transform','translateY(26px)');

                        var lrcArray = data.indexOf('\r\n') > -1 ? data.split('\r\n') : data.split('\n');// linux系统是\n换行(如github的web系统里面)

                        var lrcTitle = '';
                        var lrcJSON = {};
                        var lrcJSONArray = [];
                        // debugger;
                        lrcJSON['[00:00.00]'] = '';//顺序对后面$.foreach是有影响的
                        function isTimeLine(s){
                            return s!==null&&s!==undefined&&s.length>9&&s[0]==='['&&s[3]===':'&&s[9]===']';
                        }
                        function setLineToTime(line){//为了适应压缩版的歌词(一行有多个时间标签)
                            var timeArr=[];
                            while(isTimeLine(line)){
                                timeArr.push(line.substr(0,10));
                                line=line.substr(10,line.length-10);
                            }
//                            if(isTimeLine(line)){
//                                lrcJSON[line.substr(0,10)] = line.substr(10,line.length-10);
//                            }
                            for(var i=0;i<timeArr.length;i++){
                                lrcJSON[timeArr[i]] = line;
                                lrcJSONArray.push({t:timeArr[i],l:line});
                            }
                        }
                        function keyToTime(key){
                            return parseFloat(key.substr(1, 3)) * 60 + parseFloat(key.substring(4, 10));
                        }
                        for (var j = 0; j < lrcArray.length; j++) {
//                            if (lrcArray[j].indexOf(']') === 9) {
                            if (isTimeLine(lrcArray[j])) {
////                                var lrcRow = lrcArray[j].split(']');
////                                lrcJSON[lrcRow[0] + ']'] = lrcRow[1];
//                                lrcJSON[lrcArray[j].substr(0,10)] = lrcArray[j].substr(10,lrcArray[j].length-10);
                                setLineToTime(lrcArray[j]);
                            } else {
                                lrcTitle += lrcArray[j];
                            }
                        }
                        //if (lrcJSON['[00:00.00]'] === undefined && lrcJSON['[00:00:00]'] === undefined) {
                        lrcJSON['[00:00.00]'] = lrcTitle;
                       lrcJSONArray.push({t:'[00:00.00]',l:lrcTitle});
//                        
//                            var aa=$.sort(lrcJSON, function (a,b){
//                                return parseInt(a.replace(':','').replace('.',''))-parseInt(b.replace(':','').replace('.',''));
//                            });

                        try{
                            //压缩版歌词需要重新排序--benjamin 20201205
                            var lrcJSONArraySort=lrcJSONArray.sort( function (a,b){
                                //return parseInt(a.t.replace(':','').replace('.',''))-parseInt(b.t.replace(':','').replace('.',''));
                                return keyToTime(a.t)-keyToTime(b.t);
                            });
                            lrcJSON={};
                            for(var i=0;i<lrcJSONArraySort.length;i++){
                                lrcJSON[lrcJSONArraySort[i].t]=lrcJSONArraySort[i].l;
                            }
                        }catch(e){
                        
                        }
                        
                        
                        lrcJSONCache[li.innerHTML] = lrcJSON;

                        var lrcTime = []; //歌词对应的时间数组
                        i = 0;
                        $.each(lrcJSON, function (key, value) {//遍历lrc
                            //lrcTime[i++] = parseFloat(key.substr(1, 3)) * 60 + parseFloat(key.substring(4, 10)); //00:00.000转化为00.000格式
                            lrcTime[i++] =keyToTime(key);
                            // ul.innerHTML += "<li><p>"+lrcJSON[key]+"</p></li>";//ul里填充歌词
                        });
                        lrcTimeCache[li.innerHTML] = lrcTime;
                        showLrc();
                        setLrcModel(nextLrcModeBtn[0]);

                    } else {
                        delete lrcJSONCache[li.innerHTML];
                        delete lrcTimeCache[li.innerHTML];
                        var ul = $("#lrclist")[0]; //获取ul
                        $("#lrclist").empty();
                        ul.innerHTML = "<li>无歌词</li>";

                    }
                });
            } else {
                showLrc();
            }

        }
    }
    function play(idx) {
        var lis = getPlayLis();
        if (!lis[idx]) { idx = 0 };
        liClick(lis[idx]);
    }
    function playNext() {
        // debugger;       
        switch (playMode) {
            case 0:
                play(curIdx + 1);
                break;
            case 1:
                play(curIdx);
                break;
            case 2: //Random 和传统随机不同,随机抽取,全部轮一遍后再重复
                // if(randomPlayList.length<1){
                //     var lis = getPlayLis();
                //     for (var i = 0; i < lis.length; i++) {
                //         randomPlayList.push(i);
                //     }
                // }
                // play($pf.listRandomTake(randomPlayList,1,true)[0]);

                play(randomPlayContainer.randomTake(1));
                setPlayModelLabel(document.getElementsByClassName('sellgirl_player_list_toolbar')[0].children[0]);
                break;
            default:
                break;
        }
    }
    function setPlayModelLabel(dom) {
        switch (playMode) {
            case 0:
                dom.innerHTML = "&lt;顺序播放&gt;";
                break;
            case 1:
                dom.innerHTML = "&lt;单曲循环&gt;";
                break;
            case 2:
                dom.innerHTML = "&lt;随机播放(rest:" + randomPlayContainer.getRestCount() + ")&gt;";
                break;
            default:
                break;
        }
    }
    function setLrcModel(dom) {
        switch (lrcMode) {
            case 0:
                dom.innerHTML = "&lt;多行歌词&gt;";
                break;
            case 1:
                dom.innerHTML = "&lt;单行歌词&gt;";
                break;
            default:
                break;
        }

        switch (lrcMode) {
            case 0:
                $('.sellgirl_player_lrcContainer').height('auto');
                break;
            case 1:
                var lrcLi = $('.sellgirl_player_lrc li').eq(0);
                if (lrcLi.length > 0) {
                    $('.sellgirl_player_lrcContainer').height(lrcLi.height() + 21); //21是偏差值
                }
                break;
            default:
                break;
        }
    }
    var isSongListClosed = false;
    function expandSongList(useAnimate) {
        var playerListTop = $('.sellgirl_player_list_top');
        function setTopHeight(height) {
            if (useAnimate !== false) {
                playerListTop.animate({ height: height + 'px' }, 200);
            } else {
                playerListTop.height(height + 'px');
            }
        }
        var rect = playerListTop[0].getBoundingClientRect();
        var h = $(window).height() - rect.top - 5; //5为偏差值,否则会多1个滚动条
        playerListTop.height("auto");
        var autoRect = playerListTop[0].getBoundingClientRect();
        // debugger;
        playerListTop.height("0px");
        if (autoRect.height > h) {
            // playerListTop.height(h);
            // playerListTop.animate({height:h+'px'},200);
            setTopHeight(h);
        } else {
            //playerListTop.height(autoRect.height);
            // playerListTop.animate({height:autoRect.height+'px'},200);
            setTopHeight(autoRect.height);
        }
        // $('.sellgirl_player_list_top').animate({height:"100px"},200);
        isSongListClosed = false;
    }
    function closeSongList(useAnimate) {
        if (useAnimate !== false) {
            $('.sellgirl_player_list_top').animate({ height: '0px' }, 200);
        } else {
            $('.sellgirl_player_list_top').height('0px');
        }
        isSongListClosed = true;
    }
    function selectSong(dom) {
        var playerListTop = $('.sellgirl_player_list_top');
        // var rect = dom.getBoundingClientRect();
        // var h = $(window).height() - rect.top - 5;//5为偏差值,否则会多1个滚动条
        // debugger;
        // if(playerListTop.height()>1){
        // if(playerListTop.css('display')!=='none'){
        if (!isSongListClosed) {
            // playerListTop.hide();
            // playerListTop.height("0px");
            closeSongList();
            // playerListTop.height(0);
            // playerListTop.prev().hide();
            dom.innerHTML = "<选歌...>";
        } else {
            // // debugger;
            // //  playerListTop.prev().show();
            //  var rect = playerListTop[0].getBoundingClientRect();
            // var h = $(window).height() - rect.top -5;//5为偏差值,否则会多1个滚动条
            // playerListTop.height(h);
            // playerListTop.show();
            // playerListTop.height("auto");
            expandSongList();
            dom.innerHTML = "<收起列表>";
        }
    }

    ////    var oldOnLoad = window.onload;
    ////    window.onload = function() {
    ////        if (oldOnLoad) { oldOnLoad(); }

    ////        var lis = getPlayLis();
    ////        var idxs = [];
    ////        for (var i = 0; i < lis.length; i++) {
    ////            idxs.push(i);
    ////        }
    ////        randomPlayContainer = $pf.listRandomTakeContainer(idxs);

    ////        //liClick(lis[curIdx]);
    ////        playNext(); //默认下一首--benjamin20191130

    ////        if (lis.length < 5) {
    ////            $('#selectSongBtn').hide();
    ////            expandSongList(false);
    ////        } else {
    ////            // $('.sellgirl_player_list_top').height(0);
    ////            // $('.sellgirl_player_list_top').hide();
    ////            // closeSongList();
    ////            closeSongList(false);
    ////        }
    ////        // liClick(getPlayLis()[curIdx]);
    ////        setPlayModelLabel(document.getElementsByClassName('sellgirl_player_list_toolbar')[0].children[0]);
    ////        //setLrcModel(document.getElementById('nexLrcModeBtn'));第一次加载歌词是异步的
    ////    }

    //$(document).ready(function () {
    //    //        if (oldOnLoad) { oldOnLoad(); }

    //    var lis = getPlayLis();
    //    var idxs = [];
    //    for (var i = 0; i < lis.length; i++) {
    //        idxs.push(i);
    //    }
    //    randomPlayContainer = $pf.listRandomTakeContainer(idxs);

    //    //liClick(lis[curIdx]);
    //    playNext(); //默认下一首--benjamin20191130

    //    if (lis.length < 5) {
    //        $('#selectSongBtn').hide();
    //        expandSongList(false);
    //    } else {
    //        closeSongList(false);
    //    }
    //    // liClick(getPlayLis()[curIdx]);
    //    setPlayModelLabel(document.getElementsByClassName('sellgirl_player_list_toolbar')[0].children[0]);
    //    //setLrcModel(document.getElementById('nexLrcModeBtn'));第一次加载歌词是异步的
    //});
    function nextPlayMode(dom) {
        // playMode = playMode > 0 ? 0 : playMode + 1; //2种模式时
        playMode = playMode > 1 ? 0 : playMode + 1; //3种模式时
        sPlayMode(playMode);
        setPlayModelLabel(dom);
    }
    function nextLrcMode(dom) {
        lrcMode = lrcMode > 0 ? 0 : lrcMode + 1; //3种模式时
        sLrcMode(lrcMode);
        setLrcModel(dom);
    }

    return {
        ready: function () {
            //监听
            audioContainer.find('#nextPlayModeBtn').click(function () {
                nextPlayMode(this);
            });
            audioContainer.find('#playNextBtn').click(function () {
                playNext(this);
            });
            audioContainer.find('#selectSongBtn').click(function () {
                selectSong(this);
            });
            nextLrcModeBtn.click(function () {
                nextLrcMode(this);
            });
            audioContainer.find('.sellgirl_player_list_top a').click(function () {
                liClick(this);
            });
            

            //        if (oldOnLoad) { oldOnLoad(); }

            var lis = getPlayLis();
            var idxs = [];
            for (var i = 0; i < lis.length; i++) {
                idxs.push(i);
            }
            randomPlayContainer = $pf.listRandomTakeContainer(idxs);

            //liClick(lis[curIdx]);
            var hasIdx=opts.idx!==undefined&&opts.idx!==null&&opts.idx<lis.length&&opts.idx>-1;
            var songName=hasIdx?lis[opts.idx].innerHTML:"";
            var tmpPlayFirstTime=function(){
            //debugger;
            
                if(hasIdx){
                    play(opts.idx);
                }else{
                    playNext(); //默认下一首--benjamin20191130
                }
            };
            
//            if(sellgirl.isOnMobile){
//            
//            }
            //var tmpMask=new sellgirl.showMask("<p class='sellgirlStartPlayBtn' style='cursor:pointer;'>点击开始播放</p><br /><p class='sellgirlDonotPlayBtn' style='cursor:pointer;color:red;font-size:8px'>不开始播放</p>",{opacity:0.5});
            //var tmpMask=new sellgirl.showMask("<p class='sellgirlStartPlayBtn' style='cursor:pointer;'>点击开始播放</p><br /><br /><p class='sellgirlDonotPlayBtn' style='cursor:pointer;color:red;font-size:8px'>不开始播放</p>",{opacity:0.5});
            var tmpMaskStr="";
            if(hasIdx){
                tmpMaskStr+="<p>"+songName+"</p>";   
                tmpMaskStr+="<p class='sellgirlStartPlayBtn' style='cursor:pointer;'>点击开始播放</p>";
                var tmpMask=new sellgirl.showMask(tmpMaskStr,{opacity:0.5});

                $('.sellgirlStartPlayBtn').parent().parent().click(function(){
                    tmpPlayFirstTime();
                    tmpMask.close();
                });
            }else{
            //var tmpMask=new sellgirl.showMask("<p class='sellgirlStartPlayBtn' style='cursor:pointer;'>点击开始播放</p>",{opacity:0.5});
            }         
//            $('.sellgirlDonotPlayBtn').click(function(event){
//                sellgirl.stopPropagation(event);
//                tmpMask.close();
//            });

            if (lis.length < 5) {
                $('#selectSongBtn').hide();
                expandSongList(false);
            } else {
                closeSongList(false);
            }
            // liClick(getPlayLis()[curIdx]);
            setPlayModelLabel(document.getElementsByClassName('sellgirl_player_list_toolbar')[0].children[0]);
            //setLrcModel(document.getElementById('nexLrcModeBtn'));第一次加载歌词是异步的
        }
    };
};

/*
* 获得登录用户信息,如果不能获得,跳到登录页
*/
//sellgirl.getLoginUserData = function (doAction, backRoute, scope) {
//    //if (!userData) alert("必需传用用户对像");
//    var userCode = localStorage.getItem('sellgirl_userCode');
//    var encryptPwd = localStorage.getItem('sellgirl_encryptPwd');
//    sellgirl.ajax({
//        url: '/api/login/GetLoginLunTanUserData/1',
//        param: utils.formatString('&userCode={0}&encryptPwd={1}', userCode, encryptPwd),
//        async: true,
//        success: function (xmlHttpReq) {
//            if (xmlHttpReq.success) {
//                localStorage.setItem('sellgirl_userCode', xmlHttpReq.data.userCode);
//                localStorage.setItem('sellgirl_encryptPwd', xmlHttpReq.data.password);

//                if (doAction) {
//                    if (scope) { doAction.call(scope, xmlHttpReq.data); } else { doAction(xmlHttpReq.data); }

//                }
//                //if (isAdd) { alert("下次出现的机会增加"); } else { alert("下次出现的机会降低"); }
//                //setFrequency(xmlHttpReq.data);
//            } else {
//                if (backRoute) {
//                    sellgirl.reload(utils.formatString('/Home/JsLogin?controllerName={0}&actionName={1}', backRoute.controllerName, backRoute.actionName));
//                } else {
//                    sellgirl.reload('/Home/Login');
//                }
//            }
//        }
//    });
//}

///*
//* 获得登录用户信息,如果不能获得,跳到登录页,主要是需要userCode,由于不验证localStorage的密码,所以如果严谨的功能不要调用此方法.此方法是为了尽可能地方便不需要登陆
//*/
//sellgirl.getLoginUserData = function (doAction, backRoute, scope) {
//    //if (!userData) alert("必需传用用户对像");
//    var _userCode = localStorage.getItem('sellgirl_userCode');
//    //var userData = { userCode: userCode };
//    function action(userData) {
//        if (scope) { doAction.call(scope, userData); } else { doAction(userData); }
//    }
//    if (_userCode) {
//        action({ userCode: _userCode });
//        return;
//    }
//    //var encryptPwd = localStorage.getItem('sellgirl_encryptPwd');
//    sellgirl.ajax({
//        url: '/api/login/GetLoginLunTanUserData/1',
//        //param: utils.formatString('&userCode={0}&encryptPwd={1}', userCode, encryptPwd),
//        async: true,
//        success: function (xmlHttpReq) {
//            if (xmlHttpReq.success) {
//                localStorage.setItem('sellgirl_userCode', xmlHttpReq.data.UserCode);
//                //localStorage.setItem('sellgirl_encryptPwd', xmlHttpReq.data.password);
//                action(xmlHttpReq.data);
//                //if (doAction) {
//                //    if (scope) { doAction.call(scope, xmlHttpReq.data); } else { doAction(xmlHttpReq.data); }

//                //}
//                //if (isAdd) { alert("下次出现的机会增加"); } else { alert("下次出现的机会降低"); }
//                //setFrequency(xmlHttpReq.data);
//            } else {
//                if (backRoute) {
//                    sellgirl.reload({url:utils.formatString('/Home/JsLogin?controllerName={0}&actionName={1}', backRoute.controllerName, backRoute.actionName)});
//                } else {
//                    sellgirl.reload({url:'/Home/Login'});
//                }
//            }
//        }
//    });
//}

///*
//* 补全userData
//*/
//sellgirl.getLoginUserData = function (userData, backRoute) {//
//    if (userData.userCode) { localStorage.setItem('sellgirl_userCode', userData.userCode) }
//    //if (!userData) alert("必需传用用户对像");
//    var _userCode = localStorage.getItem('sellgirl_userCode');
//    if (_userCode) { userData.userCode = _userCode; return;}
//    ////var userData = { userCode: userCode };
//    //function action(userData) {
//    //    if (scope) { doAction.call(scope, userData); } else { doAction(userData); }
//    //}
//    //if (_userCode) {
//    //    action({ userCode: _userCode });
//    //    return;
//    //}
//    sellgirl.reload({ url: utils.formatString('/Home/JsLogin?controllerName={0}&actionName={1}', backRoute.controllerName, backRoute.actionName) });
//    return;
//    ////var encryptPwd = localStorage.getItem('sellgirl_encryptPwd');
//    //sellgirl.ajax({
//    //    url: '/api/login/GetLoginLunTanUserData/1',
//    //    //param: utils.formatString('&userCode={0}&encryptPwd={1}', userCode, encryptPwd),
//    //    async: true,
//    //    success: function (xmlHttpReq) {
//    //        if (xmlHttpReq.success) {
//    //            localStorage.setItem('sellgirl_userCode', xmlHttpReq.data.UserCode);
//    //            //localStorage.setItem('sellgirl_encryptPwd', xmlHttpReq.data.password);
//    //            action(xmlHttpReq.data);
//    //            //if (doAction) {
//    //            //    if (scope) { doAction.call(scope, xmlHttpReq.data); } else { doAction(xmlHttpReq.data); }

//    //            //}
//    //            //if (isAdd) { alert("下次出现的机会增加"); } else { alert("下次出现的机会降低"); }
//    //            //setFrequency(xmlHttpReq.data);
//    //        } else {
//    //            if (backRoute) {
//    //                sellgirl.reload({ url: utils.formatString('/Home/JsLogin?controllerName={0}&actionName={1}', backRoute.controllerName, backRoute.actionName) });
//    //            } else {
//    //                sellgirl.reload({ url: '/Home/Login' });
//    //            }
//    //        }
//    //    }
//    //});
//}