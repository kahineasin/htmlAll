function checkXHRLogin(XHR) {
  if (
    XHR.responseURL !== undefined &&
    XHR.responseURL.indexOf("/User/Login?ReturnUrl=") > -1
  ) {
    window.location.href = "/User/Login";
  }
}
function pfRequestSuccess(success) {
  return function (data, textStatus, jqXHR) {
    //debugger;
    if (data !== null && data !== undefined) {
      if (
        data === "loginout" ||
        (typeof data === "string" && data.indexOf('value="登录"') > -1)
      ) {
        window.location.href = "/User/Login";
        return;
      } else if (data) {
        if (data.Status === 1801) {
          window.location.href =
            "/Hyzl/Home/SelectMonth?sourceUrl=" + data.BackUrl;
          return;
        }
      }
    }
    if (success) {
      success(data, textStatus, jqXHR);
    } else {
      if (data && data.Message) {
        alert(data.Message);
      }
    }
  };
}

/*
 *perfect工具类，此类希望在所有项目中能版本唯一
 *by wxj
 */
var $pf = $pf || {};

$pf.post = function (url, data, success, dataType) {
  var newSuccess = pfRequestSuccess(success);
  return $.post(url, data, newSuccess, dataType);
};
$pf.get = function (url, data, success, dataType) {
  var newSuccess = pfRequestSuccess(success);
  return $.get(url, data, newSuccess, dataType);
};

$pf.exporter = function (opt) {
  var self = this;
  var action = window.location.pathname.replace(
    /^(\/[^\/]+\/[^\/]+).*$/,
    "$1" + "/download"
  );
  var defaultOptions = {
    //action: "/home/download",
    action: action,
    dataGetter: "api",
    dataAction: "",
    dataParams: {},
    titles: [[]],
    fileType: "xls",
    compressType: "none",
  };

  this.paging = function (page, rows) {
    self.params.dataParams.page = page;
    self.params.dataParams.rows = rows;
    return self;
  };

  this.compress = function () {
    self.params.compressType = "zip";
    return self;
  };

  this.title = function (filed, title) {
    self.params.titles[filed] = title;
    return self;
  };

  this.download = function (suffix) {
    self.params.fileType = suffix || "xls";
    self.params.dataParams = JSON.stringify(self.params.dataParams);
    self.params.titles = JSON.stringify(self.params.titles);

    //创建iframe
    var downloadHelper = $(
      '<iframe style="display:none;" class="downloadHelper"></iframe>'
    ).appendTo("body")[0];
    var doc = downloadHelper.contentWindow.document;
    if (doc) {
      //downloadHelper.contentWindow.onload = function () { alert(1); };
      //doc.onload = function () { alert(1); };
      doc.open();
      doc.write(""); //微软为doc.clear();
      doc.writeln(
        $pf.formatString(
          "<html><body><form id='downloadForm' name='downloadForm' method='post' action='{0}'>",
          self.params.action
        )
      );
      for (var key in self.params)
        doc.writeln(
          $pf.formatString(
            "<input type='hidden' name='{0}' value='{1}'>",
            key,
            self.params[key]
          )
        );
      doc.writeln("</form></body></html>");
      doc.close();
      var form = doc.forms[0];
      if (form) {
        //doc.body.onload = function () { alert(1); };
        form.submit();
      }
    }
  };

  var initFromGrid = function (grid) {
    var options = grid.$element().datagrid("options");
    if (grid.treegrid)
      options.url = options.url || grid.treegrid("options").url;

    var titles = [[]],
      length = Math.max(options.frozenColumns.length, options.columns.length);
    for (var i = 0; i < length; i++)
      titles[i] = (options.frozenColumns[i] || []).concat(
        options.columns[i] || []
      );

    self.params = $.extend(true, {}, defaultOptions, {
      dataAction: options.url,
      dataParams: options.queryParams,
      titles: titles,
    });
  };

  if (opt.$element) initFromGrid(opt);
  else self.params = $.extend(true, {}, defaultOptions, opt);

  return self;
};

/**
* 格式化字符串
* 用法:
.formatString("{0}-{1}","a","b");
*/
$pf.formatString = function () {
  for (var i = 1; i < arguments.length; i++) {
    var exp = new RegExp("\\{" + (i - 1) + "\\}", "gm");
    arguments[0] = arguments[0].replace(exp, arguments[i]);
  }
  return arguments[0];
};

$pf.stringIsNullOrWhiteSpace = function (s) {
  return (
    s === null ||
    s === undefined ||
    s.toString().replace(" ", "").replace(" ", "") === ""
  );
};

/*字符串脱敏
 */
$pf.stringDesensitization = function (s, left, right) {
  if ($pf.stringIsNullOrWhiteSpace(s)) {
    return s;
  }
  var r = "";
  for (var i = 0; i < s.length; i++) {
    if (i < left || i > s.length - 1 - right) {
      r += "*";
    } else {
      r += s[i];
    }
  }
  return r;
};

/*身份证脱敏
 */
$pf.identificationDesensitization = function (s) {
  return $pf.stringDesensitization(s, 0, 4);
};

$pf.isDecimal = function (value, precision) {
  if (value) {
    var sReg = "^[0-9]+.{0,1}[0-9]";
    if (precision == null || precision == undefined) {
      sReg += "*";
    } else {
      sReg += "{0," + precision + "}";
    }
    sReg += "$";
    var reg = new RegExp(sReg, "g");
    return reg.test(value);
  }
  return true;
};
$pf.isInt = function (value) {
  if (value) {
    return value.match(/^[0-9]+$/g);
  }
  return true;
};

$pf.objectToBool = function (value) {
  var r = null;
  if (value === "1" || value === "true" || value === "True") {
    r = true;
  } else if (value === "0" || value === "false" || value === "False") {
    r = false;
  }
  return r;
};

/*
 *千分位
 */
$pf.thousandth = function (value) {
  var strValue = typeof value == "number" ? value.toString() : value;
  if (strValue !== null && strValue !== undefined) {
    if (strValue.indexOf(".") > -1) {
      //有小数点时
      return strValue.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    } else {
      return strValue.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
    }
  }
  return strValue;
};

/*
 * 科学记数法
 */
$pf.num2e = function (num) {
  var p = Math.floor(Math.log(num) / Math.LN10);
  var n = num * Math.pow(10, -p);
  return n + "e" + p;
};

/*
 *小数位数
 */
$pf.toFixed = function (value, decimalDigits) {
  if (decimalDigits === null || decimalDigits === undefined) {
    decimalDigits = 2;
  }
  if (typeof value == "number") {
    return value.toFixed(decimalDigits);
  } else {
    return parseFloat(value).toFixed(decimalDigits);
  }
};

/**
 * 格式化时间(日期)显示方式
 * 用法:format="yyyy-MM-dd hh:mm:ss";
 */
$pf.formatTime = function (v, format) {
  if (!v) return "";
  var d = v;
  if (typeof v === "string") {
    if (v.indexOf("/Date(") > -1)
      d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
    else
      d = new Date(
        Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0])
      ); //.split(".")[0] 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
  }
  var o = {
    "M+": d.getMonth() + 1, //month
    "d+": d.getDate(), //day
    "h+": d.getHours(), //hour
    "m+": d.getMinutes(), //minute
    "s+": d.getSeconds(), //second
    "q+": Math.floor((d.getMonth() + 3) / 3), //quarter
    S: d.getMilliseconds(), //millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (d.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
};

$pf.formatDate = function (value) {
  return $pf.formatTime(value, "yyyy-MM-dd");
};

function PFTimeSpan(ymd) {
  //使用 var xx=new PFTimeSpan({minute:true});
  this._ymd = ymd || { hour: true, minute: true, second: true };
  this.hour = 0;
  this.minute = 0;
  this.second = 0;
  this.millisecond = 0;
}
PFTimeSpan.prototype.toString = function () {
  var me = this;
  var ymd = me._ymd;
  var s = "";
  if (ymd.hour && me.hour !== 0) {
    s += me.hour + "时";
  }
  if (ymd.minute && me.minute !== 0) {
    s += me.minute + "分";
  }
  if (ymd.second && me.second !== 0) {
    s += me.second + "秒";
  }
  if (ymd.millisecond && me.millisecond !== 0) {
    s += me.millisecond + "毫秒";
  }
  return s;
};
/*
 *Data.getTime()相减之后的值转换为容易处理的对象
 */
$pf.getTimeSpan = function (date1, date2, ymd) {
  var s1 = date1.getTime();
  var s2 = date2.getTime();
  return $pf.getTimeSpanByMilliseconds(s2 - s1);
  //ymd = ymd || { hour: true, minute: true, second: true };
  //var result = {};

  //var s1 = date1.getTime();
  //var s2 = date2.getTime();
  //var total = (s2 - s1) / 1000;  //这里等到是秒
  //var after = total;
  //if (ymd.hour) {
  //    result.hour = parseInt(after / (60 * 60));//计算整数小时数
  //    after -= (result.hour * 60 * 60);//取得算出小时数后剩余的秒数
  //};
  //if (ymd.minute) {
  //    result.minute = parseInt(after / 60);//计算整数小时数
  //    after -= (result.minute * 60);//取得算出小时数后剩余的秒数
  //};
  //if (ymd.second) {
  //    result.second = parseInt(after);//计算整数秒数
  //    after -= result.second;//取得算出秒数后剩余的毫秒数
  //};
  //if (ymd.millisecond) {
  //    result.millisecond = after;
  //};
  //result.ToString = function () {
  //    var s = "";
  //    if (ymd.hour) {
  //        s += Hour + "时";
  //    }
  //    if (ymd.minute) {
  //        s += Minute + "分";
  //    }
  //    if (ymd.second) {
  //        s += Second + "秒";
  //    }
  //    if (ymd.millisecond) {
  //        s += Millisecond + "毫秒";
  //    }
  //    return s;
  //};
  //return result;
};
$pf.getTimeSpanByMilliseconds = function (elapsedMilliseconds, ymd) {
  //ymd = ymd || { hour: true, minute: true, second: true };
  var result = new PFTimeSpan(ymd);
  ymd = result._ymd;

  //var s1 = date1.getTime();
  //var s2 = date2.getTime();
  //var total = (s2 - s1) / 1000;  //这里等到是秒
  var total = elapsedMilliseconds / 1000;
  var after = total;
  if (ymd.hour) {
    result.hour = parseInt(after / (60 * 60)); //计算整数小时数
    after -= result.hour * 60 * 60; //取得算出小时数后剩余的秒数
  }
  if (ymd.minute) {
    result.minute = parseInt(after / 60); //计算整数小时数
    after -= result.minute * 60; //取得算出小时数后剩余的秒数
  }
  if (ymd.second) {
    result.second = parseInt(after); //计算整数秒数
    after -= result.second; //取得算出秒数后剩余的毫秒数
  }
  if (ymd.millisecond) {
    result.millisecond = after;
  }
  //result.ToString = function () {
  //    var s = "";
  //    if (ymd.hour && result.hour!==0) {
  //        s += result.hour + "时";
  //    }
  //    if (ymd.minute && result.minute !== 0) {
  //        s += result.minute + "分";
  //    }
  //    if (ymd.second && result.second !== 0) {
  //        s += result.second + "秒";
  //    }
  //    if (ymd.millisecond && result.millisecond !== 0) {
  //        s += result.millisecond + "毫秒";
  //    }
  //    return s;
  //};
  return result;
};

$pf.cmonthToDate = function (cmonth) {
  var year = parseInt(cmonth.substr(0, 4));
  var month = parseInt(cmonth.substr(5, 2));
  return new Date(year, month, 1);
};

$pf.compareCMonth = function (smon, emon) {
  var smonDate = $pf.cmonthToDate(smon);
  var emonDate = $pf.cmonthToDate(emon);
  return (
    (emonDate.getFullYear() - smonDate.getFullYear()) * 12 +
    (emonDate.getMonth() - smonDate.getMonth())
  );
};

$pf.getFileSize = function (value, unit) {
  unit = unit || { GB: true, MB: true, KB: true };
  var result = {};

  var total = value; //这里等到是秒
  var after = total;
  if (unit.GB) {
    result.GB = parseInt(after / (1024 * 1024)); //计算整数小时数
    after -= result.GB * 1024 * 1024; //取得算出小时数后剩余的秒数
  }
  if (unit.MB) {
    result.MB = parseInt(after / 1024); //计算整数小时数
    after -= result.MB * 1024; //取得算出小时数后剩余的秒数
  }
  if (unit.KB) {
    result.KB = after;
  }
  return result;
};

$pf.formatFileSize = function (value, unit) {
  unit = unit || { GB: true, MB: true, KB: true };
  var fileSize = $pf.getFileSize(value, unit);

  var result = "";
  if (unit.GB && fileSize.GB > 0) {
    result += fileSize.GB + "GB ";
  }
  if (unit.MB && fileSize.MB > 0) {
    result += fileSize.MB + "MB ";
  }
  if (unit.KB && fileSize.KB > 0) {
    result += fileSize.KB + "KB ";
  }
  if (result.length > 0) {
    result = result.substr(0, result.length - 1);
  }
  return result;
};

$pf.stringToDate = function (v, format) {
  if (!v) {
    return "";
  }

  var strV = v.toString();

  var o = {
    "M+": "01",
    "d+": "01",
    "h+": "01",
    "m+": "01",
    "s+": "01",
    "q+": "01",
    S: "01",
  };
  var year = -1;
  var month = -1;
  var matchExec = new RegExp(/(y+)/).exec(format);
  if (matchExec != null) {
    year = strV.substr(matchExec.index, matchExec[0].length);
  }

  for (var k in o) {
    if (o.hasOwnProperty(k)) {
      matchExec = new RegExp(k).exec(format);
      if (matchExec != null) {
        o[k] = strV.substr(matchExec.index, matchExec[0].length);
      }
    }
  }
  return new Date(
    $pf.formatString(
      "{0}/{1}/{2} {3}:{4}:{5}",
      year,
      o["M+"],
      o["d+"],
      o["h+"],
      o["m+"],
      o["s+"]
    )
  );
};

/*
 *和C#中的Random.Next(int minValue, int maxValue);功能一样
 *@min 返回的随机数的下界（随机数可取该下界值）。
 *@max 返回的随机数的上限（随机数不能取该上限值）。maxValue 必须大于等于 minValue。
 */
$pf.randomNext = function (min, max) {
  //1,5
  // return Math.floor(Math.random() * (max - min + 1)) + min;//0~4
  return Math.floor(Math.random() * (max - min)) + min; //0~4
};

/*
 *在列表中随机取n个项
 *取项后从原列表移除
 */
$pf.listRandomTake = function (list, num, removeFromSrcList) {
  removeFromSrcList = removeFromSrcList || false; //默认false

  var result = [];

  //if (list == null || list.length <= num) { return list; }
  if (list == null) {
    return list;
  }
  if (list.length <= num) {
    if (removeFromSrcList) {
      result = list.splice(0, list.length);
      return result;
    } else {
      return list;
    }
  }

  //Random Rnd = new Random();
  var lc = list.length;
  //var tmpList = list.slice(0);
  //var exist =[];
  var tmpList = removeFromSrcList ? list : list.slice(0);
  while (result.length < num) {
    //旧方法不好(抽到重复的重新抽),因为浪费性能
    ////var i = Rnd.Next(0, lc);
    //var i = $pf.randomNext(0, lc);
    //if (!exist.Contains(i))
    //{
    //    exist.Add(i);
    //    result.Add(list[i]);
    //}
    //var i = Rnd.Next(0, lc);

    var i = $pf.randomNext(0, tmpList.length);
    result.push(tmpList[i]);
    tmpList.splice(i, 1);
    // if(removeFromSrcList){
    //     list.splice(i, 1);
    // }
  }
  return result;
};

/*
 *类似随机抽卡,抽完的下次不会抽到重复的.全部抽完之后再重新开始
 */
$pf.listRandomTakeContainer = function (list) {
  var _list = list;
  var _restList = list.slice(0);
  var _lastOne = null;

  var result = {
    randomTake: function (num) {
      var r = null;
      //debugger;
      if (_restList.length < 1) {
        //新一轮的第一次
        _restList = list.slice(0);
        //为了避免 第一轮最后一次 和 第二轮第一次抽到相同的
        var tmpDelete = null;
        //debugger;
        for (var i = 0; i < _restList.length; i++) {
          if (_restList[i] == _lastOne) {
            tmpDelete = _restList.splice(i, 1)[0];
          }
        }
        r = $pf.listRandomTake(_restList, num, true);
        if (tmpDelete !== null) {
          _restList.push(tmpDelete);
        }
      } else {
        r = $pf.listRandomTake(_restList, num, true);
      }
      _lastOne = r[0]; //抽多个就不考虑和上一轮重复了
      //return {data:r,restCount:_restList.length};
      return r;
    },
    getRestCount: function () {
      return _restList.length;
    },
  };
  return result;
};
/*
阻止事件
*/
$pf.stopPropagation = function (event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  } else {
    event.cancelBubble = true;
  }
};
/*
 * 抛出事件
 * param Array arrayParam  事件参数
 */
$pf.fireEvent = function (componentId, eventName, arrayParam) {
  $("#" + componentId).trigger(eventName, arrayParam);
};

/*
 *返回jquery对象
 */
$pf.getJQ = function (dom) {
  if (dom instanceof jQuery) {
    return dom;
  } else {
    return jQuery(dom);
  }
};
/*
 *后端生成的树型表格的展开方法(用于当json不能处理过大数据的情况)(此方法追求性能)
 */
$pf.expandTree = function (td) {
  //alert(1);
  //debugger;
  td = $pf.getJQ(td);
  //var td = $(td);
  var tr = td.parent("tr");
  var level = tr.attr("level");
  var expanded = tr.attr("expanded");
  if (level != null && level != undefined) {
    var iLevel = parseInt(level);

    var children = tr;
    while ((children = children.next("tr[level]")).length > 0) {
      var cLevel = parseInt(children.attr("level"));
      if (cLevel <= iLevel) {
        break;
      }
      if (cLevel !== iLevel + 1 && expanded !== "expanded") {
        continue;
      } //其实只下1层才需要展开,以前是所有子级展开是浪费的--wxj20180627
      if (expanded == "expanded") {
        //展开->收起
        children.css("display", "none");
        //$(children).hide();
      } else {
        //收起->展开
        children.css("display", "table-row");
        var h = children.find(".hitarea");
        h.removeClass("hitarea-expanded");
        h.addClass("hitarea-closed");
        children.removeAttr("expanded");
        //$(children).show();
        //console.info(children.css('display'));
      }
    }
    var hitarea = td.find(".hitarea");
    if (expanded == "expanded") {
      hitarea.removeClass("hitarea-expanded");
      hitarea.addClass("hitarea-closed");
    } else {
      hitarea.removeClass("hitarea-closed");
      hitarea.addClass("hitarea-expanded");
    }
  }
  if (expanded == "expanded") {
    tr.removeAttr("expanded");
  } else {
    tr.attr("expanded", "expanded");
  }
};

/*
 *遍历末级叶节点,对应PFHelper里的TreeListItem结构
 */
$pf.eachLeaf = function (tree, action) {
  for (var i = 0; i < tree.Children.length; i++) {
    var a = tree.Children[i];
    if (a.Children.length > 0) {
      $pf.eachLeaf(a, action);
    } else {
      action(a);
    }
  }
};
/*
 *获得所有末级叶Child的数量
 */
$pf.getAllLeafCount = function (tree, condition) {
  var total = 0;
  $pf.eachLeaf(tree, function (a) {
    if (condition == null || condition(a)) {
      total++;
    }
  });
  return total;
};
/*
 *深度优先递归
 *参数:T子项,int深度,T父节点
 */
$pf.eachChild = function (tree, action, depth) {
  if (depth === null || depth === undefined) {
    depth = 2;
  }
  //if (tree.Children !== null && tree.Children !== undefined) {
  for (var i = 0; i < tree.Children.length; i++) {
    var a = tree.Children[i];
    action(a, depth, tree);
    $pf.eachChild(a, action, depth + 1);
  }
  //}
  //tree.Children.ForEach(a => { action(a, depth, this); a.EachChild(action, depth + 1); });
};
$pf.eachChildWithLast = function (tree, action, depth) {
  if (depth === null || depth === undefined) {
    depth = 2;
  }
  //if (tree.Children !== null && tree.Children !== undefined) {
  var l = tree.Children.length;
  for (var i = 0; i < l; i++) {
    var a = tree.Children[i];
    action(a, depth, i == l - 1, tree);
    $pf.eachChildWithLast(a, action, depth + 1);
  }
};

/*
 *获得最大深度(最小为1)
 */
$pf.getDepth = function (tree) {
  //debugger;
  var max = 1;
  $pf.eachChild(tree, function (a, b) {
    if (b > max) {
      max = b;
    }
  });
  return max;
};

/*
 *上传文件(因为常用于批量查询,所以不统一加layer遮罩)
 */
$pf.uploadFile = function (fileInput, url, opts) {
  opts = opts || {};
  var success = opts.success;
  //var complete = opts.complete;
  var typeStr = opts.typeStr;
  //var maxSize = opts.maxSize || 2097152;//默认前台限制2MB(服务器端配置了最大10MB)
  var maxSize = opts.maxSize || 2048; //默认前台限制2MB(服务器端配置了最大10MB)(maxSize的单位是KB
  //var file = document.querySelector('input[type=file]').files[0];//IE10以下不支持
  var files = fileInput.files || fileInput[0].files; //IE10以下不支持,当为jq对象时要拿第一个
  function errorReturn() {
    if (typeof error === "function") {
      error();
    }
  }
  if (files !== null && files !== undefined && files.length > 0) {
    var file = files[0];
    //var typeStr = "image/jpg,image/png,image/gif,image/jpeg";

    if (
      typeStr === null ||
      typeStr === undefined ||
      typeStr.indexOf(file.type) >= 0
    ) {
      //document.getElementById('test1').value = file.name;
      if (file.size > maxSize * 1024) {
        alert(
          "上传的文件不能大于" +
            $pf.formatFileSize(maxSize, { GB: true, MB: true })
        );
        errorReturn();
      } else {
        var layerIdx = layer.load("正在上传请稍候");
        var fd = new FormData();
        fd.append("file1", file); //上传的文件： 键名，键值
        //var url = path;//接口
        url = url ? url : "";
        var XHR = null;
        if (window.XMLHttpRequest) {
          // 非IE内核
          XHR = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
          // IE内核，这里早期IE版本不同，具体可以查下
          XHR = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
          XHR = null;
        }
        if (XHR) {
          XHR.open("POST", url);
          XHR.onreadystatechange = function () {
            if (XHR.readyState == 4) {
              //if (typeof complete === 'function') {
              //    complete();
              //}
              if (layerIdx) {
                layer.close(layerIdx);
              }
              if (XHR.status == 200) {
                var resultValue = XHR.responseText;
                checkXHRLogin(XHR);
                //if (XHR.responseURL!==undefined&&XHR.responseURL.indexOf('/User/Login?ReturnUrl=') > -1) {
                //    window.location.href = "/Login/Login";
                //}
                if (typeof success === "function") {
                  //var data = typeof resultValue === 'string' ? resultValue : JSON.parse(resultValue);
                  var data = resultValue;
                  try {
                    data = JSON.parse(resultValue);
                  } catch (e) {}
                  success(data);
                }
                XHR = null;
              }
            }
          };
          XHR.send(fd);
        }
      }
    } else {
      alert("请上传格式为" + typeStr + "的图片");
      errorReturn();
    }
  }
  //else if (typeof complete === 'function') {
  //    complete();
  //}
};

/*
获得月份的英文简称
*/
$pf.getEnMonthByNum = function (num) {
  switch (num) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      return "";
  }
};

/*
 * 获取url中的参数
 */
$pf.getRequest = function () {
  var url = location.search; // 获取url中含"?"符后的字串

  var theRequest = {};

  if (url.indexOf("?") !== -1) {
    var str = url.substr(1);

    var strs = str.split("&");

    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }

  return theRequest;
};

/*
 *设置url参数
 */
$pf.setUrlParams = function (url, arr) {
  if (url.indexOf("?") < 0) {
    url += "?";
  } else {
    var lc = url[url.length - 1];
    if (lc !== "?" && lc !== "&") {
      url += "&";
    }
  }

  function setParam(sUrl, name, val) {
    if (val instanceof Array) {
      for (var i = 0; i < val.length; i++) {
        sUrl += name + "=" + val[i] + "&";
      }
    } else {
      sUrl += name + "=" + val + "&";
    }
    return sUrl;
  }
  function removeSameParam(sUrl, pName) {
    //移除url中已经存在的同名参数,已考虑 xx[]的情况
    var patt1 = new RegExp(
      "([&?]{1})" + pName + "[\\[\\]]{0,2}=[^&]*[&]{0,1}",
      "g"
    );
    return sUrl.replace(patt1, "$1");
  }
  //到这里url格式为 xx? 或者 xx?xx&
  if (arr instanceof Array) {
    for (var i = 0; i < arr.length; i++) {
      //考虑到有数组的情况,必需全部移除再设置
      url = removeSameParam(url, arr[i].name);
    }
    for (var i = 0; i < arr.length; i++) {
      url = setParam(url, arr[i].name, arr[i].value);
    }
  } else {
    //object
    for (var i in arr) {
      //考虑到有数组的情况,必需全部移除再设置
      if (arr.hasOwnProperty(i)) {
        url = removeSameParam(url, i);
      }
    }
    for (var i in arr) {
      if (arr.hasOwnProperty(i)) {
        url = setParam(url, i, arr[i]);
      }
    }
  }
  if (url[url.length - 1] === "&") {
    url = url.substr(0, url.length - 1);
  }
  return url;
};

/*
 *此方法待删除,请使用getTableColumnDataIdxs(应该不用删除,后来发现子列没有返回field-name,第一行是对的--benjamin20190428)
 *拿table的列索引集合,考虑多表头的情况(对于隐藏列,暂当其不生成到dom)
 */
$pf.getTableColumnIdxs = function (tableDom) {
  var me = $(tableDom);
  var head = me.find("thead");
  var trs = head.children();
  var r = {}; // 格式如{1:'',2:''} 注意,为了写法规范,这里用对象,最后转为数组
  var unGetCols = []; //格式如[3,4] 从第一个tr里找列,如果colspan不为1,就从第二个tr开始找
  //var hideCols = [];如果有隐藏列,用这个--wxjlatertodo
  var i = 0;
  $(trs[0])
    .children()
    .each(function (idx, ele) {
      //遍历第一个tr里的td
      var htd = $(ele);
      var colspan = parseInt(htd.attr("colspan") || 1);
      if (colspan === 1) {
        r[i] = htd.attr("field-name") || htd.text();
      } else {
        for (var j = i; j < i + colspan; j++) {
          unGetCols.push(j);
        }
      }
      i += colspan;
    });
  if (unGetCols.length > 0) {
    //如果是多表头
    for (l = 1; l < trs.length; l++) {
      //var count = 0;
      var sIdx = unGetCols[0];
      //if (trs.attr('visible')) { hideCols.add(); continue; }//如果有隐藏列,用这个(未完成)--wxjlatertodo
      $(trs[l])
        .children()
        .each(function (idx, ele) {
          var htd = $(ele);
          var colspan = parseInt(htd.attr("colspan") || 1);
          if (colspan === 1) {
            //r[sIdx] = htd.text();//这里应该是搞错了,因为第一层也是用的field-name--benjamin20190428
            r[sIdx] = htd.attr("field-name") || htd.text();
            unGetCols.splice(unGetCols.indexOf(sIdx), 1);
          }
          sIdx += colspan;
        });
      if (unGetCols.length < 1) {
        break;
      }
    }
  }
  var rArr = []; //格式如 ['col1','col2']
  for (var k = 0; k < i; k++) {
    //在这里i是总列数
    rArr.push(r[k]);
  }
  return rArr;
};

///*
//*和getTableColumnIdxs是一样的,因为发现getTableColumnIdxs返回的是td的text,而不是data,这样应该是错的,
//*但不是很确定,因此新开一个方法,getTableColumnIdxs在以后有可能要删除
//*/
//$pf.getTableColumnDataIdxs = function (tableDom) {
//    var me = $(tableDom);
//    var head = me.find('thead');
//    var trs = head.children();
//    var r = {};// 格式如{1:'',2:''} 注意,为了写法规范,这里用对象,最后转为数组
//    var unGetCols = [];//格式如[3,4] 从第一个tr里找列,如果colspan不为1,就从第二个tr开始找
//    //var hideCols = [];如果有隐藏列,用这个--wxjlatertodo
//    var i = 0;
//    $(trs[0]).children().each(function (idx, ele) {//遍历第一个tr里的td
//        var htd = $(ele);
//        var colspan = parseInt(htd.attr('colspan') || 1);
//        if (colspan === 1) {
//            r[i] = htd.attr('field-name') || htd.text();
//        } else {
//            for (var j = i; j < i + colspan; j++) {
//                unGetCols.push(j);
//            }
//        }
//        i += colspan;
//    });
//    if (unGetCols.length > 0) {//如果是多表头
//        for (l = 1; l < trs.length; l++) {
//            //var count = 0;
//            var sIdx = unGetCols[0];
//            //if (trs.attr('visible')) { hideCols.add(); continue; }//如果有隐藏列,用这个(未完成)--wxjlatertodo
//            $(trs[l]).children().each(function (idx, ele) {
//                var htd = $(ele);
//                var colspan = parseInt(htd.attr('colspan') || 1);
//                if (colspan === 1) {
//                    r[sIdx] = htd.text();
//                    unGetCols.splice(unGetCols.indexOf(sIdx), 1);
//                }
//                sIdx += colspan;
//            });
//            if (unGetCols.length < 1) { break; }
//        }
//    }
//    var rArr = [];//格式如 ['col1','col2']
//    for (var k = 0; k < i; k++) {//在这里i是总列数
//        rArr.push(r[k])
//    }
//    return rArr;
//};

/*
 *绑定table的列点击事件，因为列是动态生成且可变的，所以每次load complete之后重新绑定是有必要的
 */
$pf.bindTableColumnClick = function (table, columnTitle, action) {
  //debugger;
  var colIdxs = $pf.getTableColumnIdxs(table);
  var idx = colIdxs.indexOf(columnTitle);
  if (idx !== null && idx !== undefined) {
    var $cell = table.find("tbody tr td:nth-child(" + (idx + 1) + ")");
    $cell.unbind("click", action);
    $cell.bind("click", action);
    $cell.css("textDecoration", "underline");
    $cell.css("cursor", "pointer");
  }
};
/*
 *绑定table的行点击事件
 */
$pf.bindTableRowClick = function (table, action) {
  table.on("click", "tbody tr", action);
};

$pf.mergeTableCell = function (table, columnTitle) {
  var colIdxs = $pf.getTableColumnIdxs(table);
  var idx = colIdxs.indexOf(columnTitle);
  //var cells = table.find('tbody tr td');
  var cells = table.find("tbody tr td:nth-child(" + (idx + 1) + ")");
  var lastValue = "";
  var cellGroup = {};
  cells.each(function (index, element) {
    var $element = $(element);
    var text = $element.text();
    if (cellGroup[text] === null || cellGroup[text] === undefined) {
      cellGroup[text] = 0;
    }
    cellGroup[text] += 1;
    //if (lastValue !== $element.text()) {
    //    $element.attr('rowspan', table.find('tbody tr td'))
    //} else {
    //    $element.css('display','none');
    //}
    //lastValue = $(element).text();
  });
  cells.each(function (index, element) {
    var $element = $(element);
    var text = $element.text();
    if (
      lastValue !== text &&
      cellGroup[text] !== null &&
      cellGroup[text] !== undefined
    ) {
      $element.attr("rowspan", cellGroup[text]);
    } else {
      $element.css("display", "none");
    }
    lastValue = text;
  });
  //for (var i in cellGroup) {
  //    if (cellGroup.hasOwnProperty(i)) {

  //    }
  //}
};

/*
 * 复制表头的宽度(为了解决锁表头时,表头列宽不一致的问题)
 * setTableWidth:bool 是否设置table宽度(当dst的列比src的列少时,有必要这样)
 */
$pf.copyTableHeadWidth = function (srcHead, dstHead, setTableWidth) {
  //debugger;
  var width = 0;
  for (var i = 0; i < dstHead.find("tr").length; i++) {
    var tr = dstHead.find("tr").eq(i);
    var trSrc = srcHead.find("tr").eq(i);
    for (var j = 0; j < tr.find("th").length; j++) {
      var th = tr.find("th").eq(j); //dst
      var thSrc = trSrc.find("th").eq(j);
      var rect = thSrc[0].getBoundingClientRect();
      if (setTableWidth && i === 0) {
        width += rect.width;
      }
      ////debugger;
      //var w = rect.width
      //    - 1//border
      //    - parseInt(thSrc.css('paddingLeft').replace('px'))
      //    - parseInt(thSrc.css('paddingRight').replace('px'));
      //if (j === 0) {
      //    debugger;
      //}
      th.css(
        "minWidth",
        rect.width -
          1 - //border
          parseInt(thSrc.css("paddingLeft").replace("px")) -
          parseInt(thSrc.css("paddingRight").replace("px")) +
          "px"
      );
    }
  }
  if (setTableWidth) {
    dstHead.parents("table:eq(0)").width(width + "px");
  }
};
$pf.copyTableHeadSize = function (srcHead, dstHead, setTableWidth) {
  //debugger;
  var width = 0;
  for (var i = 0; i < dstHead.find("tr").length; i++) {
    var tr = dstHead.find("tr").eq(i);
    var trSrc = srcHead.find("tr").eq(i);
    for (var j = 0; j < tr.find("th").length; j++) {
      var th = tr.find("th").eq(j); //dst
      var thSrc = trSrc.find("th").eq(j);
      var rect = thSrc[0].getBoundingClientRect();
      if (setTableWidth && i === 0) {
        width += rect.width;
      }
      ////debugger;
      //var w = rect.width
      //    - 1//border
      //    - parseInt(thSrc.css('paddingLeft').replace('px'))
      //    - parseInt(thSrc.css('paddingRight').replace('px'));
      //if (j === 0) {
      //    debugger;
      //}
      th.css(
        "minWidth",
        rect.width -
          1 - //border
          parseInt(thSrc.css("paddingLeft").replace("px")) -
          parseInt(thSrc.css("paddingRight").replace("px")) +
          "px"
      );
      th.css(
        "height",
        rect.height -
          1 - //border
          parseInt(thSrc.css("paddingTop").replace("px")) -
          parseInt(thSrc.css("paddingBottom").replace("px")) +
          "px"
      );
    }
  }
  if (setTableWidth) {
    dstHead.parents("table:eq(0)").width(width + "px");
  }
};

/*
 *月份相减,格式如 2017.01
 */
$pf.monthSubtract = function (bigger, smaller) {
  var b = bigger.split(".");
  var s = smaller.split(".");
  return (
    (parseInt(b[0]) - parseInt(s[0])) * 12 + parseInt(b[1]) - parseInt(s[1])
  );
};

$pf.setFormValues = function (form, values) {
  var fields = form.find(
    "input[type=text],input[type=select],input[type=number]"
  );
  fields.each(function (index, element) {
    var me = $(element);
    var v = values[element.name];
    if (v !== undefined) {
      me.val(v);
    }
  });
};

$pf.resetForm = function (form) {
  form[0].reset();
  //下拉控件的值清除
  form.find("select.iselect").each(function (index, element) {
    var me = $(this);
    var sp = me.next();
    //select元素reset后其实是选中了第一个元素
    //if (sp.hasClass('iselwrap-val')) { sp.text(me.find("option:first").text()) }//reset是回到页面加载时的form状态才对
    if (sp.hasClass("iselwrap-val")) {
      sp.text(me.find("option:selected").text());
    }
  });
  form.find(".pf-fileupload").each(function (index, element) {
    var me = $(this);
    //debugger;
    //var fileF = me.find('input[type=file]');
    //form[0].reset()已经把file清空了
    //if (fileF.val() != "") {    //当file有地址才进行清空
    //    fileF.remove();     //移除当前file
    //    fileF.val('');
    //}
    me.find("span").html("");
  });
  //debugger;
  form.find("input[name=isHybhAsTeam]").each(function (index, element) {
    //debugger;
    var me = $(this);
    //me.val(me[0].defaultValue);//注意hidden型的defaultValue比较特殊,永远和value一样的
    me.val(me.parent().find("input[name=selectTeamCheckBox]").is(":checked"));
  });
};

$pf.disableField = function (arg) {
  for (var i = 0; i < arguments.length; i++) {
    var field = arguments[i];
    if (field[0].nodeName === "INPUT") {
      if (field.attr("type") === "radio") {
        field
          .filter(function () {
            return !$(this).is(":checked");
          })
          .attr("disabled", "disabled");
      } else if (field.attr("type") === "checkbox") {
        field.attr("onclick", "return false;");
      } else {
        field.attr("readonly", "readonly");
        if (field.hasClass("Wdate")) {
          field.removeAttr("onclick");
        }
      }
    } else if (field[0].nodeName === "SELECT") {
      //field.attr('readonly', 'readonly');//select元素的readonly属性无效
      field.attr("disabled", "disabled");
      //由于禁用后不会自动提交值,不方便,所以用隐藏字段保存值
      var hideFId = field[0].getAttribute("id") + "_hidden";
      var hideF = document.getElementById(hideFId);
      if (hideF === null || hideF === undefined) {
        hideF = document.createElement("input");
        hideF.setAttribute("type", "hidden");
        hideF.setAttribute("id", hideFId);
        hideF.name = field[0].name;
        field[0].parentNode.insertBefore(hideF, field[0]);
      }
      hideF.value = field[0].value;
    }
  }
};

$pf.enableField = function (arg) {
  for (var i = 0; i < arguments.length; i++) {
    var field = arguments[i];
    if (field[0].nodeName === "INPUT") {
      if (field.attr("type") === "radio") {
        field
          .filter(function () {
            return !$(this).is(":checked");
          })
          .removeAttr("disabled");
      } else if (field.attr("type") === "checkbox") {
        if (field.attr("onclick") === "return false;") {
          field.removeAttr("onclick");
        }
      } else {
        field.removeAttr("readonly");
        if (field.hasClass("Wdate")) {
          //field.addAttr('onclick','xxxx');//要使用这句,需要在$pf.disableField中先保存原来的--benjamimn todo
        }
      }
    } else if (field[0].nodeName === "SELECT") {
      //field.removeAttr('readonly');//select元素的readonly属性无效
      field.removeAttr("disabled");
      //由于禁用后不会自动提交值,不方便,所以用隐藏字段保存值
      var hideFId = field[0].getAttribute("id") + "_hidden";
      var hideF = document.getElementById(hideFId);
      $(hideF).remove();
    }
  }
};

$pf.disableButton = function (arg) {
  for (var i = 0; i < arguments.length; i++) {
    var me = arguments[i];
    if (me[0].nodeName === "A" || me[0].nodeName === "INPUT") {
      if (me.attr("disabled") !== "disabled") {
        me.attr("disabled", "disabled");
      }
    }
  }
};
$pf.enableButton = function (arg) {
  for (var i = 0; i < arguments.length; i++) {
    var me = arguments[i];
    if (me[0].nodeName === "A" || me[0].nodeName === "INPUT") {
      if (me.attr("disabled") !== "disabled") {
      } else {
        me.removeAttr("disabled");
      }
    }
  }
};

$pf.watermark = function (settings) {
  //console.info(parent.$pf.hasWatermark);
  //console.info($pf.hasWatermark);
  if ($pf.hasWatermark || parent.$pf.hasWatermark) {
    //以防iframe嵌套的功能出现多层水印(如查询网络图功能)
    return;
  }
  $pf.hasWatermark = true;
  //debugger;
  //$(document.body);
  var oTemp = null;
  var doWaterMark = function () {
    //oTemp.innerHTML='';

    //debugger;
    //默认设置
    var defaultSettings = {
      watermark_txt: "text",
      watermark_x: 20, //水印起始位置x轴坐标
      watermark_y: 20, //水印起始位置Y轴坐标
      watermark_rows: 20, //水印行数
      watermark_cols: 20, //水印列数
      watermark_x_space: 100, //水印x轴间隔
      watermark_y_space: 50, //水印y轴间隔
      watermark_color: "#aaa", //水印字体颜色
      watermark_alpha: 0.4, //水印透明度
      watermark_fontsize: "15px", //水印字体大小
      watermark_font: "微软雅黑", //水印字体
      watermark_width: 210, //水印宽度
      watermark_height: 80, //水印长度
      watermark_angle: 15, //水印倾斜度数
    };
    //采用配置项替换默认值，作用类似jquery.extend
    if (arguments.length === 1 && typeof arguments[0] === "object") {
      var src = arguments[0] || {};
      for (key in src) {
        if (
          src[key] &&
          defaultSettings[key] &&
          src[key] === defaultSettings[key]
        )
          continue;
        else if (src[key]) defaultSettings[key] = src[key];
      }
    }

    //获取页面最大宽度
    var page_width = Math.max(
      document.body.scrollWidth,
      document.body.clientWidth
    );
    var cutWidth = page_width * 0.015;
    page_width = page_width - cutWidth;
    //获取页面最大高度
    var page_height =
      Math.max(document.body.scrollHeight, document.body.clientHeight) - 100; // + 450//原版加450,会导致页面撑长
    // var page_height = document.body.scrollHeight+document.body.scrollTop;
    //如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔
    if (
      defaultSettings.watermark_cols == 0 ||
      parseInt(
        defaultSettings.watermark_x +
          defaultSettings.watermark_width * defaultSettings.watermark_cols +
          defaultSettings.watermark_x_space *
            (defaultSettings.watermark_cols - 1)
      ) > page_width
    ) {
      defaultSettings.watermark_cols = parseInt(
        (page_width -
          defaultSettings.watermark_x +
          defaultSettings.watermark_x_space) /
          (defaultSettings.watermark_width + defaultSettings.watermark_x_space)
      );
      defaultSettings.watermark_x_space = parseInt(
        (page_width -
          defaultSettings.watermark_x -
          defaultSettings.watermark_width * defaultSettings.watermark_cols) /
          (defaultSettings.watermark_cols - 1)
      );
    }
    //debugger;
    //如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔
    if (
      defaultSettings.watermark_rows == 0 ||
      parseInt(
        defaultSettings.watermark_y +
          defaultSettings.watermark_height * defaultSettings.watermark_rows +
          defaultSettings.watermark_y_space *
            (defaultSettings.watermark_rows - 1)
      ) > page_height
    ) {
      defaultSettings.watermark_rows = parseInt(
        (defaultSettings.watermark_y_space +
          page_height -
          defaultSettings.watermark_y) /
          (defaultSettings.watermark_height + defaultSettings.watermark_y_space)
      );
      defaultSettings.watermark_y_space = parseInt(
        (page_height -
          defaultSettings.watermark_y -
          defaultSettings.watermark_height * defaultSettings.watermark_rows) /
          (defaultSettings.watermark_rows - 1)
      );
      if (isNaN(defaultSettings.watermark_y_space)) {
        defaultSettings.watermark_y_space = 1;
      } //1行时,space是NaN --benjamin 20210422
    }
    var x;
    var y;
    if (oTemp != null) {
      //document.body.removeChild(oTemp);//Fragment似乎不能这样移除--benjamin
      $(".mask_div").remove();
    }
    oTemp = document.createDocumentFragment();
    for (var i = 0; i < defaultSettings.watermark_rows; i++) {
      y =
        defaultSettings.watermark_y +
        (defaultSettings.watermark_y_space + defaultSettings.watermark_height) *
          i;
      for (var j = 0; j < defaultSettings.watermark_cols; j++) {
        x =
          defaultSettings.watermark_x +
          (defaultSettings.watermark_width +
            defaultSettings.watermark_x_space) *
            j;

        var mask_div = document.createElement("div");
        mask_div.id = "mask_div" + i + j;
        mask_div.className = "mask_div";
        mask_div.appendChild(
          document.createTextNode(defaultSettings.watermark_txt)
        );
        //设置水印div倾斜显示
        mask_div.style.webkitTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.MozTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.msTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.OTransform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.transform =
          "rotate(-" + defaultSettings.watermark_angle + "deg)";
        mask_div.style.visibility = "";
        mask_div.style.position = "absolute";
        mask_div.style.left = x + "px";
        mask_div.style.top = y + "px";
        mask_div.style.overflow = "hidden";
        mask_div.style.zIndex = "9999";
        mask_div.style.pointerEvents = "none"; //pointer-events:none  让水印不遮挡页面的点击事件
        //mask_div.style.border="solid #eee 1px";
        mask_div.style.opacity = defaultSettings.watermark_alpha;
        mask_div.style.fontSize = defaultSettings.watermark_fontsize;
        mask_div.style.fontFamily = defaultSettings.watermark_font;
        mask_div.style.color = defaultSettings.watermark_color;
        mask_div.style.textAlign = "center";
        mask_div.style.width = defaultSettings.watermark_width + "px";
        mask_div.style.height = defaultSettings.watermark_height + "px";
        mask_div.style.display = "block";
        oTemp.appendChild(mask_div);
      }
    }
    document.body.appendChild(oTemp);

    //var test_div = document.createElement('div');
    //test_div.className = 'test_mask_div';
    //oTemp.appendChild(test_div);
  };
  doWaterMark(settings);
  //window.onresize = function () {
  //    doWaterMark();
  //};
  //$(document).resize(function () {
  //    doWaterMark();
  //});
  //$(window).resize(function () {
  //    doWaterMark(settings);
  //});
  $pf.EleResize.on(document.body, function () {
    doWaterMark(settings);
  });
  //debugger;
};

$pf.clearIframe = function (frame) {
  //var frame = $('iframe', context).add(parent.$('iframe', context));
  if (frame.length > 0) {
    //frame[0].contentWindow.document.write('');
    frame[0].contentWindow.document.clear();
    frame[0].contentWindow.close();
    //frame.remove();
    //if ($.browser.msie) {
    //    CollectGarbage();旧版本ie才有用
    //}
  }
};

/*
找PageBase_Layout.cshtml所在的iframe
多层iframe的结构下,为了找到最外层(多余的,直接用top)
*/
$pf.getMainPageWindow = function () {
  //debugger;
  //if ($('body').hasClass('pfMainPageClass')) {
  //    return window;
  //}
  //var r = window;
  //while (r != top) {
  //    r = parent;
  //    if (r.$('body').hasClass('pfMainPageClass')) {
  //        return r;
  //    }
  //}
  //return window;

  var list = [];
  var r = window;
  while (r != top) {
    list.push(r);
    r = r.parent;
  }
  //list里有所有iframe除了top
  if (list.length < 2) {
    return window;
  }
  return list[list.length - 2]; //这种方法不准确,但暂时没其它办法,因为PageBase_Layout也被编辑弹窗使用了
  ////return r;
};

/*
 *进度查询的请求
 *@interval int 时间间隔
 */
$pf.progressPost = function (
  url,
  data,
  success,
  stopCallback,
  interval,
  dataType
) {
  var newSuccess = function (data, textStatus, jqXHR) {
    var stop = true;
    try {
      success(data, textStatus, jqXHR);
      stop = stopCallback(data, textStatus, jqXHR) !== true;
    } catch (e) {} //以防网络错误造成回调报错而不继续执行
    if (stop) {
      setTimeout(function () {
        $pf.progressPost(url, data, success, stopCallback, interval, dataType);
      }, interval);
    }
  };
  return $pf.post(url, data, newSuccess, dataType);
};

/*
 *复制dom的border,因为jquery在ie中,css('borderRight')取不到值
 *dir:{up:true,right:true,...} 复制的方向,默认全部
 */
$pf.copyDomBorder = function (srcDom, dstDom, dir) {
  //查询连线网某个点的线条形状
  dir = dir || { up: true, right: true, down: true, left: true };
  var s = "";
  if (dir.right) {
    s = srcDom.css("borderRight");
    if ($pf.stringIsNullOrWhiteSpace(s)) {
      //ie中
      dstDom.css("borderRightWidth", srcDom.css("borderRightWidth"));
      dstDom.css("borderRightStyle", srcDom.css("borderRightStyle"));
      dstDom.css("borderRightColor", srcDom.css("borderRightColor"));
      //s = srcDom.css('borderRightWidth') + ' ' + srcDom.css('borderRightStyle') + ' ' + srcDom.css('borderRightColor');
    } else {
      dstDom.css("borderRight", s);
    }
  }
  //if (dir.up && n.right && n.down) { return urd; }
  //if (dir.up && n.down) { return ud; }
  //if (dir.up && n.right) { return ur; }
};
/*
 *3维空间内，点到线段的距离，来自：https://blog.csdn.net/u012138730/article/details/79779996
 *[0]:x [1]:y [2]:z ,当z都为0时，可以当作2维平面使用
 *p和q为线段的两个端点
 */
$pf.distancePtSeg = function (pt, p, q) {
  var pqx = q[0] - p[0];
  var pqy = q[1] - p[1];
  var pqz = q[2] - p[2];
  var dx = pt[0] - p[0];
  var dy = pt[1] - p[1];
  var dz = pt[2] - p[2];
  var d = pqx * pqx + pqy * pqy + pqz * pqz; // qp线段长度的平方
  var t = pqx * dx + pqy * dy + pqz * dz; // p pt向量 点积 pq 向量（p相当于A点，q相当于B点，pt相当于P点）
  if (d > 0)
    // 除数不能为0; 如果为零 t应该也为零。下面计算结果仍然成立。
    t /= d; // 此时t 相当于 上述推导中的 r。
  if (t < 0) t = 0;
  // 当t（r）< 0时，最短距离即为 pt点 和 p点（A点和P点）之间的距离。
  else if (t > 1) t = 1; // 当t（r）> 1时，最短距离即为 pt点 和 q点（B点和P点）之间的距离。
  // t = 0，计算 pt点 和 p点的距离; t = 1, 计算 pt点 和 q点 的距离; 否则计算 pt点 和 投影点 的距离。
  dx = p[0] + t * pqx - pt[0];
  dy = p[1] + t * pqy - pt[1];
  dz = p[2] + t * pqz - pt[2];
  return dx * dx + dy * dy + dz * dz;
};
/*
 *计算点到range的距离，其实就是点到矩形(left,top,width,height)的距离
 *x,y: 点的坐标
 *range: 范围，可理解为矩形
 *坐标方向: 网页的坐标方向，即: 正x(右) 正y(下)
 */
$pf.getDistanceBetweenPointAndRect = function (x, y, inRect) {
  // var rects= inRect instanceof Array?inRect:[inRect];//DOMRectList不是数组
  var rects =
    inRect.length && typeof inRect.length == "number" ? inRect : [inRect];

  var result = -1;
  //debugger;
  for (var i = 0; i < rects.length; i++) {
    var rect = rects[i];
    var xDistance = 0;
    var yDistance = 0;

    if (x < rect.left) {
      xDistance = rect.left - x;
    } else if (x > rect.left + rect.width) {
      xDistance = x - (rect.left + rect.width);
    } else {
      xDistance = 0;
    }

    if (y < rect.top) {
      yDistance = rect.top - y;
    } else if (y > rect.top + rect.height) {
      yDistance = y - (rect.top + rect.height);
    } else {
      yDistance = 0;
    }

    var d = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    if (i === 0 || d < result) {
      result = d;
    }
  }
  return result;
};
/*
 *找到最接近某个点的子元素
 */
$pf.findNearestChild = function (next, x, y) {
  //debugger;
  if (
    next.childNodes === undefined ||
    next.childNodes === null ||
    next.childNodes.length < 1
  ) {
    //console.info(1);
    return next;
  } else {
    var child = next.childNodes;

    var nearestDistance = -1; //最近距离
    var nearestPos = -1; //最近距离
    for (var i = 0; i < child.length; i++) {
      var range = document.createRange();
      range.selectNode(child[i]);
      var rect = range.getClientRects();
      if (rect.length < 1) {
        continue;
      }
      //console.info(rect);
      d = $pf.getDistanceBetweenPointAndRect(x, y, rect);
      if (nearestDistance === -1 || d < nearestDistance) {
        nearestDistance = d;
        nearestPos = i;
      }
    }
    if (nearestPos === -1) {
      return next;
    } //当child都是一个空格的textNode时，getClientRects的length为0--benjamin20190605
    return $pf.findNearestChild(next.childNodes[nearestPos]);
    //return child[nearestPos];
  }
};
/*
 *调用时next可以留空,暂不接收jquery对象
 *由于有document.elementFromPoint(x,y)但没有nodeFrom,所以需要此方法
 */
$pf.selectNodeByXY = function (
  x,
  y //, next
) {
  var next = $pf.findNearestChild(document.elementFromPoint(x, y), x, y);
  //debugger;
  var nearestDistance = -1; //最近距离
  var nearestPos = 0; //最近距离
  var l = next.length || 0;
  var range = document.createRange();
  range.selectNode(next);
  for (var i = 0; i <= l; i++) {
    range.setStart(next, i);
    range.setEnd(next, i);
    var rect = range.getClientRects();
    if (rect.length < 1) {
      continue;
    }
    d = $pf.getDistanceBetweenPointAndRect(x, y, rect);
    //console.info(rect);
    if (nearestDistance === -1 || d < nearestDistance) {
      nearestDistance = d;
      nearestPos = i;
    }
  }
  //console.info({ isTextNode: next.nodeType === 3, node: next, pos: nearestPos });
  return { isTextNode: next.nodeType === 3, node: next, pos: nearestPos };
};

/*
 *保存本地cache数组（localStorage.setItem的扩展）
 *param arr 类型Array
 */
$pf.setLocalStorage = function (key, arr) {
  if (arr === null || arr === undefined || arr.length < 1) {
    localStorage.removeItem(key);
  } else {
    //localStorage.setItem(key, arr.toString());
    localStorage.setItem(key, JSON.stringify(arr));
  }
};
$pf.getLocalStorage = function (key) {
  var s = localStorage.getItem(key);
  if (s !== null && s !== "") {
    //空字符串split后会有length:1
    //return s.split(',');
    return JSON.parse(s);
  } else {
    //没cache就全选
    return null;
  }
};

$pf.listFind = function (list, matchAction) {
  var useKey = typeof matchAction === "string";
  for (var i in list) {
    if (list.hasOwnProperty(i)) {
      if (useKey) {
        if (i === matchAction) {
          return list[i];
        }
      } else {
        if (matchAction(list[i])) {
          return list[i];
        }
      }
    }
  }
  return null;
};

$pf.listSelect = function (list, selectAction) {
  var useKey = typeof selectAction === "string";
  var result = [];
  for (var i in list) {
    if (list.hasOwnProperty(i)) {
      if (useKey) {
        result.push(list[i][selectAction]);
      } else {
        result.push(selectAction(list[i]));
      }
    }
  }
  return result;
};

$pf.setOddEvenRowCss = function (tbody) {
  var odd = true;
  tbody.find("tr").each(function () {
    var tr = $(this);
    if (odd) {
      tr.removeClass("even").addClass("odd");
    } else {
      tr.removeClass("odd").addClass("even");
    }
    odd = !odd;
  });
};

function TreeMatrix() {
  //建立树型矩阵(品类开发进度等树型的打印时使用)

  this.node = {}; //节点坐标矩阵，遍历printInfo时生成node;并记下最大x;y
  this.lastChild = {}; //tree每一层的最后一个节点坐标矩阵
  this.net = {}; //线条网，矩阵
  this.xMax = 0; //指net的x最大值，node的x要比net的多1
  this.yMax = 0; //net和node的y相等
}
(TreeMatrix.prototype.setMatrix = function (matrix, x, y) {
  var me = this;

  if (matrix[x] === undefined) matrix[x] = {};
  matrix[x][y] = 1;
  if (x - 1 > me.xMax) me.xMax = x - 1;
  if (y > me.yMax) me.yMax = y;
}),
  (TreeMatrix.prototype.initByTreeList = function (rows) {
    var me = this;
    //var x = me.getDepth(rows);
    //var y = me.getAllChildrenCount(rows);
    //_node = new bool[x, y];
    //_lastChild = new bool[x, y];
    //_net = new TreeMatrixNet[x - 1, y];
    //_xMax = x - 2;//注意:这里不是_net的x-1,是因为_xMax是最大索引号,而x-1指的是数量
    //_yMax = y - 1;

    var i = 0;
    for (var rowIdx in rows) {
      if (rows.hasOwnProperty(rowIdx)) {
        var row = rows[rowIdx];
        me.setNode(0, i);
        if (rows.length - 1 == i) {
          me.setLastChild(0, i);
        }
        i++;
        $pf.eachChildWithLast(row, function (child, depth, isLast) {
          me.setNode(depth - 1, i);
          if (isLast) {
            me.setLastChild(depth - 1, i);
          }
          i++;
        });
      }
    }
    me.setNetByNode();
  }),
  //TreeMatrix.prototype.getDepth=function( rows)
  //{
  //    var max = 0;
  //    for (var rowsIdx in rows)
  //    {
  //        if (rows.hasOwnProperty(rowIdx)) {
  //            var i=rows[rowIdx];
  //            var row = i;
  //            var d = row.GetDepth();
  //            if (d > max) { max = d; }
  //        }
  //    }
  //    return max;
  //},
  //TreeMatrix.prototype.getAllChildrenCount = function (rows) {
  //    var total = 0;
  //    for (var rowsIdx in rows)
  //    {
  //        if (rows.hasOwnProperty(rowIdx)) {
  //            var i=rows[rowIdx];

  //            total += 1;
  //            var row = i;
  //            total += row.GetAllChildrenCount();
  //        }
  //    }
  //    return total;
  //},
  (TreeMatrix.prototype.setNode = function (x, y) {
    //x即是treecolumn的缩进等级lv;y即是row的行号
    var me = this;
    me.setMatrix(me.node, x, y); //把node阵的y行赋值，因为setNetByNode时要用到
  }),
  (TreeMatrix.prototype.setLastChild = function (x, y) {
    //x即是treecolumn的缩进等级lv;y即是row的行号
    var me = this;
    me.setMatrix(me.lastChild, x, y); //把node阵的y行赋值，因为setNetByNode时要用到
  }),
  (TreeMatrix.prototype.setNetByNode = function () {
    //根据所有节点生成连线网
    var me = this;
    //debugger;
    for (var x = 0; x <= me.xMax; x++) {
      for (var y = 1; y <= me.yMax; y++) {
        //注意网线是从序号1开始的
        if (me.net[x] === undefined) me.net[x] = {};
        if (me.net[x][y] === undefined) me.net[x][y] = {};
        me.net[x][y].right = me.node[x + 1][y] === 1 ? 1 : 0; //右边一格是节点就显示右方向线
        me.net[x][y].up =
          (me.net[x][y - 1] && me.net[x][y - 1].down) || me.node[x][y - 1] === 1 //上格有下方向线或者是节点时，本格加上线
            ? 1
            : 0;
        me.net[x][y].down = !(
          me.net[x][y].up === 0 || me.lastChild[x + 1][y] === 1
        )
          ? 1
          : 0; //如果当前格没有上方向线 或者 右边一格是该层最后一个节点，那当前格没有下方向线
      }
    }
  }),
  (TreeMatrix.prototype.getNetLine = function (x, y) {
    //查询连线网某个点的线条形状
    var me = this;
    var urd = "┝", //(上右下)
      ud = "│", //(上下)
      ur = "┕"; //(上右)
    var n = me.net[x][y];
    if (n.up && n.right && n.down) {
      return urd;
    }
    if (n.up && n.down) {
      return ud;
    }
    if (n.up && n.right) {
      return ur;
    }
    return "  ";
  });

/*
 * 获取浏览器可见范围
 */
$pf.getBrowerViewSize = function () {
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
  var result = {
    width: w,
    height: h,
  };
  //alert(result.height);
  return result;
};

/*
 * 设置居中
 */
$pf.absoluteCenter = function (dom) {
  //debugger;
  var rect = dom.getBoundingClientRect();
  var winSize = sellgirl.getBrowerViewSize();
  dom.style.position = "fixed";

  dom.style.top = (winSize.height - rect.height) / 2 + "px";
  dom.style.left = (winSize.width - $(dom).width()) / 2 + "px";
};

/*
 *使dom和refDom的中心点对齐(未测试)--benjamin
 */
$pf.centerAlign = function (dom, refDom) {
  var $dom = $pf.getJQ(dom);
  var rect = dom.getBoundingClientRect();
  var refRect = refDom.getBoundingClientRect();
  //dom.style.position = 'fixed';
  dom.style.top = (refRect.height - rect.height) / 2 + refRect.top + "px";
  dom.style.left =
    (refRect.width - $dom.width()) / 2 +
    refRect.left -
    parseInt($dom.css("marginLeft").replace("px", "")) +
    "px";
};

/*
 * 原生layer加载效果是挡住整个iframe,为了解决此问题
 */
$pf.generateLayerTo = function (msg, dom) {
  return $.layer({
    time: 0,
    //loading: { type: loadIcon },
    //bgcolor: !loadIcon ? '' : '#fff',
    //shade: [0.1, '#000', !loadIcon ? false : true],
    //border: [7, 0.3, '#000', (loadIcon === 3 || !loadIcon) ? false : true],
    //type: 3,
    title: false, // ['正在查询请稍候', false],
    dialog: { msg: msg, type: 16 },
    //tips: { msg: '正在查询请稍候', follow: '', guide: 0, isGuide: true, style: ['background-color:#FF9900; color:#fff;', '#FF9900'] },
    closeBtn: false, // [0, false]
    success: function (layer) {
      //var dialogP = $('.queryFuncDialog').parents('.ui-dialog-panel');
      var dialogP = dom;
      var layerShade = layer.parent().find(".xubox_shade");
      var dialogPRect = dialogP[0].getBoundingClientRect();
      var layerRect = layer[0].getBoundingClientRect();
      layerShade.width(dialogPRect.width);
      layerShade.height(dialogPRect.height);
      layerShade.css("top", dialogPRect.top + "px");
      layerShade.css("left", dialogPRect.left + "px");

      layer.css(
        "top",
        (dialogPRect.height - layerRect.height) / 2 + dialogPRect.top + "px"
      );
      layer.css(
        "left",
        (dialogPRect.width - layerRect.width) / 2 +
          dialogPRect.left -
          parseInt(layer.css("marginLeft").replace("px", "")) +
          "px"
      );
    },
    //,end: null
  });
};

if (jQuery !== null && jQuery !== undefined) {
  /*
   *把post方法绑定到a按钮上(并防止重复点击
   *a元素当按钮有一个好处,就是宽度可以根据文字自适应
   */
  jQuery.fn.pfPost = function (url, data, success, dataType) {
    var me = this;
    if (me[0].nodeName === "A" || me[0].nodeName === "INPUT") {
      if (me.attr("disabled") !== "disabled") {
        me.attr("disabled", "disabled");
        var jqxhr = $pf.post(url, data, success, dataType);
        if (typeof jqxhr.complete == "function") {
          //jQuery 1.5才有complete方法
          jqxhr.complete(function () {
            me.removeAttr("disabled");
          });
        } else if (typeof jqxhr.done == "function") {
          //jQuery 3.3.1
          jqxhr.done(function () {
            me.removeAttr("disabled");
          });
        }
        return jqxhr;
      }
    }
    return null;
  };
}

/*
提取此方法,是为了便于弹窗上使用
*/
$pf.initFileField = function (dom) {
  dom.change(function (v) {
    //文件上传
    var $fInput = $(this);
    var files = $fInput[0].files;
    if (files !== null && files !== undefined && files.length > 0) {
      //console.info($fInput.parent()[0].innerText);
      $fInput.parent().find("span").text(files[0].name);
    }
  });
};
//RadioButton点label时把input选上,增加体验
$pf.initCheckBoxField = function (dom, chooseLabel) {
  chooseLabel.css("cursor", "default"); //pointer
  chooseLabel.click(function () {
    //RadioButton点label时把input选上,增加体验
    dom.click();
  });
};

$(document).ready(function () {
  $pf.initFileField($(".pf-fileupload input[type=file]"));
  //$('.pf-fileupload input[type=file]').change(function (v) {//文件上传
  //    var $fInput = $(this);
  //    var files = $fInput[0].files;
  //    if (files !== null && files !== undefined && files.length > 0) {
  //        //console.info($fInput.parent()[0].innerText);
  //        $fInput.parent().find('span').text(files[0].name);
  //    }
  //});
  ////debugger;
  var chooseLabel = $("span.choose span.text");
  chooseLabel.css("cursor", "default"); //pointer
  chooseLabel.click(function () {
    //RadioButton点label时把input选上,增加体验
    //debugger;
    var me = $(this);
    var p = me.parent();
    p.find("input[type=radio]").click();
    p.find("input[type=checkbox]").click();
  });
});

//------------------------------
var $pf = $pf || {};
$pf.templateMessage = $pf.templateMessage || {};

$pf.setFocusTo = function (obj, setToEnd) {
  //选择textNode--wxj
  if (obj === null || obj === undefined) {
    return;
  }
  var s = getSelection();
  // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
  if (s.rangeCount > 0) {
    s.removeAllRanges();
  }

  var range = document.createRange();

  range.selectNodeContents(obj); //按左之后插入参数报错
  var startOffset = 0;
  if (setToEnd === true) {
    //debugger;
    if (obj.nodeType === 3) {
      startOffset = obj.nodeValue.length;
    } else {
      startOffset = obj.childNodes.length;
    }
  }
  range.setStart(obj, startOffset);
  range.setEnd(obj, startOffset);
  // range.selectNode(obj);
  s.addRange(range);
  s.collapseToStart();
  return range;
};
$pf.setFocusToX = function (obj, posX) {
  //选择textNode--wxj
  if (obj === null || obj === undefined) {
    return;
  }
  var s = getSelection();
  // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
  if (s.rangeCount > 0) {
    s.removeAllRanges();
  }

  var range = document.createRange();

  range.selectNodeContents(obj); //按左之后插入参数报错
  var startOffset = 0;
  if (posX !== null && posX !== undefined) {
    startOffset = posX;
  }
  range.setStart(obj, startOffset);
  range.setEnd(obj, startOffset);

  // range.selectNode(obj);
  s.addRange(range);
  s.collapseToStart();
  return range;
};
//获得tag,obj可能是:tag里的textNode或tag本身
$pf.getTag = function (obj) {
  if (obj === null || obj === undefined) {
    return null;
  }
  if ($pf.isTag(obj)) {
    return obj;
  }
  var pNode = obj.parentNode; //注意:点击tag的文字时,传入来的是<b>元素内的textNode
  if ($pf.isTag(pNode)) {
    return pNode;
  }
  return null;
};
//是否tag
$pf.isTag = function (obj) {
  return (
    obj !== null &&
    obj !== undefined &&
    obj.tagName === "B" &&
    obj.hasAttribute("pf")
  );
};
$pf.isTagEnd = function (cursorFocus) {
  //光标是tag里的textNode的最后
  var obj = cursorFocus.startContainer;
  var pNode = obj.parentNode;
  return $pf.isTag(pNode) && obj.nodeValue.length === cursorFocus.startOffset;
};
$pf.isTagStart = function (cursorFocus) {
  //光标是tag里的textNode的开始
  var obj = cursorFocus.startContainer;
  var pNode = obj.parentNode;
  return $pf.isTag(pNode) && 0 === cursorFocus.startOffset;
};

//$pf.isEmptySpan = function (obj) {
//    return obj !== null && obj !== undefined && obj.tagName === 'SPAN' && obj.hasAttribute('pf')&&obj.innerHTML==='&nbsp;';
//};
$pf.isEmptySpan = function (obj) {
  return (
    obj !== null &&
    obj !== undefined &&
    obj.tagName === "SPAN" &&
    obj.hasAttribute("pf") &&
    obj.innerHTML.indexOf("&nbsp;") === 0
  );
};
$pf.isTextNode = function (obj) {
  return obj.nodeType === 3;
};
//是textNode的结束位置
$pf.isTextNodeEnd = function (cursorFocus) {
  var obj = cursorFocus.startContainer;
  return obj.nodeType === 3 && cursorFocus.startOffset === obj.nodeValue.length;
};
//下一个textNode
$pf.getNextTextNode = function (obj) {
  var n = obj.nextSibling;
  if (n.nodeType === 3) {
    //textNode
    return n;
  }
  return null;
};
////光标在tag后时,打字会输入到tag里,如:[会员编号]a,因此要修复tag
//$pf.fixTag = function (tag) {
//    var text = tag.innerText;
//    var i = text.indexOf(']');
//    if (i !== text.length - 1) {
//        var prev = text.substr(i + 1, text.length - i - 1);
//        tag.innerText = text.substr(0, i + 1);
//        var n = $pf.getNextTextNode(tag);
//        if (n !== null) {//textNode
//            n.nodeValue = prev + n.nodeValue;
//            $pf.setFocusTo(n);
//        }
//        // tag.nextSibling.innerText=prev+tag.nextSibling.innerText;
//    }
//    // if(text[text.length-1]!==']'){
//    // }
//};
//如果之前光标在tag上,backspace之后虽然tag被删除了,但打字时会以tag的格式为准,生成了<font><b>xx</b></font>
$pf.fixBogusTag = function (cursorFocus) {
  var bNode = cursorFocus.startContainer.parentNode;
  if (bNode.tagName === "B") {
    var fontNode = bNode.parentNode;
    if (fontNode !== undefined && fontNode.tagName === "FONT") {
      var n = fontNode.nextSibling;
      fontNode.parentNode.insertBefore(
        document.createTextNode(cursorFocus.startContainer.nodeValue),
        fontNode
      );
      fontNode.parentNode.removeChild(fontNode);
      cursorFocus.startContainer = n;
      cursorFocus.startOffset = 0;
    }
  }
};
////处理光标上下左右移动
//function dealFocusMove(obj,index){
//	var text = obj.value.slice(0,index);
//	var resL,resR,i=0,j=0;
//	var lastIndex=0;
//	var _lastIndex=0;
//	var regL = /\【/g;
//	var regR = /\】/g;
//	while(resL=regL.exec(text)){
//		i++;
//		lastIndex = regL.lastIndex;
//	}
//	while(resR=regR.exec(text)){
//		j++;
//	}
//	if(i!=j){
//		if(index==lastIndex){
//			var rightText = regR.exec(obj.value.slice(index, obj.value.length));
//			_lastIndex = rightText['index'];
//			index = _lastIndex+index+1;
//		}else{
//			index = lastIndex-1;
//		}
//		obj.selectionStart = index;
//		obj.selectionEnd = index;
//	}
//}

$pf.fixEmptySpan = function (span) {
  var pNode = span.parentNode;
  var n = span.nextSibling;
  var more = span.innerHTML.replace("&nbsp;", "");
  if (more === "&nbsp;") {
    more = " ";
  } //当tag后输入空格再插入tag时,innerHTML为&nbsp;&nbsp; replace之后是&nbsp; 这时生成的textNode文本不会显示为空格.所以加这句解决--wxj20190114
  var moreNode = document.createTextNode(more);
  pNode.insertBefore(moreNode, n);
  //console.info(span);
  for (var i = 1; i < span.childNodes.length; i++) {
    var child = span.childNodes[i];
    //span.removeChild(child);
    pNode.insertBefore(child, n);
  }
  span.innerHTML = "&nbsp;";
  //var range=$pf.setFocusTo(moreNode);
};
//当处于tag后面时,最好移一位,否则下次打字会输入到tag里(如果tag在行首,那光标在tag前时要前移一位)
$pf.focusNextIfNextToTag = function (cursorFocus) {
  //console.info(cursorFocus);
  var obj = cursorFocus.startContainer;
  var range = null;
  if ($pf.isEmptySpan(cursorFocus.startContainer)) {
    //console.info(1);
    ////debugger;
    $pf.fixEmptySpan(cursorFocus.startContainer); //使用了emptySpan方式后,后面打字其实是进入span里了,所以最好把那些移到外面去
    var span = cursorFocus.startContainer;
    //console.info(cursorFocus.startOffset);
    //console.info($pf.isTag(span.previousSibling));
    if (
      //cursorFocus.startOffset === 0 &&//忘记当时为什么有此条件.但现在发现,如果有此条件,会造成:两个连续标签时，如果从右边标签的右边按左方向移到两个标签的中间，再输入文字时会进入左边标签内--benjamin20200323
      $pf.isTag(span.previousSibling)
    ) {
      //console.info(2);
      range = $pf.setFocusTo(span, true);
    }
    //console.info(1);
  } else if ($pf.isTagEnd(cursorFocus)) {
    //backspace删除后有可能进入这里
    range = $pf.setFocusTo(obj.parentNode.nextSibling);
    if (range !== null) {
      cursorFocus.startContainer = range.startContainer;
      cursorFocus.startOffset = range.startOffset;
      $pf.focusNextIfNextToTag(cursorFocus);
    }
    //console.info(2);
    return;
  } else if (
    $pf.isTag(obj.previousSibling) &&
    obj.nodeType === 3 &&
    cursorFocus.startOffset === 0
  ) {
    if (obj.nodeValue === "") {
      obj.nodeValue = " ";
      range = $pf.setFocusTo(obj, true);
      //cursorFocus.startContainer = range.startContainer;
      //cursorFocus.startOffset = range.startOffset;
    } else if (obj.nodeValue.length > 0) {
      range = $pf.setFocusToX(obj, 1);
      ////range.setStart(obj, 1);
      //cursorFocus.startContainer = range.startContainer;
      //cursorFocus.startOffset = range.startOffset;
    }
    //console.info(3);
  }
  //else if ($pf.isTag(obj.nextSibling) && obj.nodeType === 3 && cursorFocus.startOffset === obj.nodeValue.length) {//只有句首有问题,情况很少
  //    if (obj.nodeValue === '') {
  //        obj.nodeValue = ' ';
  //        range = $pf.setFocusTo(obj);
  //    } else if (obj.nodeValue.length>0) {
  //        range = $pf.setFocusToX(obj, obj.nodeValue.length-1);
  //        //range.setStart(obj, 1);
  //    }
  //}
  if (range !== null) {
    cursorFocus.startContainer = range.startContainer;
    cursorFocus.startOffset = range.startOffset;
    //console.info(4);
  }
  //console.info(5);
};
//处理鼠标定位光标(改为b类型的tag后--by wxj)
$pf.dealFocusExtend = function (cursorFocus, direction) {
  // debugger;
  var tag = $pf.getTag(cursorFocus.startContainer);
  if (tag !== null) {
    var range = null;
    if (cursorFocus.startOffset !== 0) {
      //光标不在tag的首位
      // var n=direction==='left'?tag:tag.nextSibling;//永远要防止光标在tag上
      if (direction === "left") {
        range = $pf.setFocusTo(tag.previousSibling, true); //奇怪这里设置后,startContainer竟然是textarea
      } else {
        range = $pf.setFocusTo(tag.nextSibling); //奇怪这里设置后,startContainer竟然是textarea
      }
    } else {
      //光标在tag的首位(当tag在行首时,点击行首,是此情况)
      range = $pf.setFocusTo(tag.previousSibling, true);
    }
    if (range !== null) {
      cursorFocus.startContainer = range.startContainer;
      cursorFocus.startOffset = range.startOffset;
    }
  }
  $pf.focusNextIfNextToTag(cursorFocus);
};
//获取光标位置
$pf.getFocus = function (elem) {
  // 获取选定对象
  var selection = getSelection();
  // 设置最后光标对象
  var lastEditRange = selection.getRangeAt(0);
  if (lastEditRange !== null) {
    return {
      startOffset: lastEditRange.startOffset,
      startContainer: lastEditRange.startContainer, //一定是textNode
    };
  }
  return null;
};
function getIdxRelativeParent(obj) {
  var cs = obj.parentNode.childNodes;
  for (var i = 0; i < cs.length; i++) {
    if (cs[i] === obj) {
      return i;
    }
  }
}
function getChildByIdx(p, idx) {
  return p.childNodes[idx];
}
//backspace删除tag
$pf.dealFocusL = function (cursorFocus) {
  var start = getSelection().getRangeAt(0).startContainer;
  var tag = $pf.getTag(start);
  if (tag !== null) {
    var text = tag.innerText;
    if (
      text !== null // && text[text.length - 1] !== ']' //tag后加空格之后没必要这条件了
    ) {
      var range = null;
      if (tag.nextSibling !== null) {
        range = $pf.setFocusTo(tag.nextSibling);
      } else if (tag.previousSibling !== null) {
        range = $pf.setFocusTo(tag.previousSibling, true);
      }
      tag.parentNode.removeChild(tag);
      if (range !== null) {
        cursorFocus.startContainer = range.startContainer;
        cursorFocus.startOffset = range.startOffset;
      }
    }
  }
  $pf.focusNextIfNextToTag(cursorFocus);
};
$pf.getNextDom = function (obj) {
  if (obj.nextSibling !== null) {
    return obj.nextSibling;
  }
  if (!$pf.isMsgArea(obj.parentNode)) {
    return $pf.getNextDom(obj.parentNode);
  }
  return null;
};
//$pf.dealFocusR = function (cursorFocus) {
//    //console.info(cursorFocus.startContainer.nextSibling);
//    //if ($pf.isEmptySpan(cursorFocus.startContainer.nextSibling)) {
//    //    $pf.fixEmptySpan(cursorFocus.startContainer.nextSibling);
//    //}
//	// console.info(cursorFocus);
//	// console.info(cursorFocus.startContainer.previousSibling);
//	var delobj=null;
//	if(cursorFocus.startOffset===0){//首行为tag且光标在行首时进入
//		delobj=cursorFocus.startContainer;
//	}else{
//		delobj=$pf.isTag(cursorFocus.startContainer.parentNode)
//		?cursorFocus.startContainer.parentNode.nextSibling
//		:cursorFocus.startContainer.nextSibling;//当光标处于连续两个tag之间时,startContainer为<b>元素中的textNode,它的next是null的
//	}

//	var tag=$pf.getTag(delobj);
//	if(tag!==null){
//		var text=tag.innerText;
//		if(text!==null&&text[0]!=='['){
//		    var n = tag.nextSibling;
//		    var nn = $pf.getNextDom(n);
//		    var pNode = tag.parentNode;
//		    pNode.removeChild(tag);
//		    pNode.removeChild(n);
//		    var range = $pf.setFocusTo(nn);
//		    if (range !== null) {

//		        cursorFocus.startContainer =range.startContainer;
//		        cursorFocus.startOffset = range.startOffset;
//		    }
//			//cursorFocus.startContainer=n;
//			//cursorFocus.startOffset=0;
//		}
//	}
//};
//是否为不完整的Tag(正在删除)
$pf.isIncompleteTag = function (obj) {
  var tag = $pf.getTag(obj);
  if (tag === null) {
    return false;
  }
  var text = tag.innerText;
  return !(text !== null && text[0] === "[" && text[text.length - 1] === "]");
};
//delete删除tag
$pf.dealFocusR = function (cursorFocus) {
  //注意进入这里时,delete是已经删除一个字符的状态
  var current = cursorFocus.startContainer;
  var delobj = null; //delobj一定是一个不完整的tag
  if ($pf.getTag(current) !== null) {
    //当前为tag
    if ($pf.isIncompleteTag(current)) {
      delobj = current;
    } else {
      var next = $pf.getNextDom(current);
      if ($pf.isIncompleteTag(next)) {
        delobj = next;
      }
    }
  } else if ($pf.isTextNodeEnd(cursorFocus)) {
    //当前是textNode
    var next = $pf.getNextDom(current);
    if ($pf.isIncompleteTag(next)) {
      delobj = next;
    }
  }
  if (delobj !== null) {
    var tag = $pf.getTag(delobj);
    var emptySpan = tag.nextSibling;
    var n = $pf.getNextDom(emptySpan);
    var pNode = tag.parentNode;
    pNode.removeChild(tag);
    pNode.removeChild(emptySpan);
    var range = $pf.setFocusTo(n);
    if (range !== null) {
      cursorFocus.startContainer = range.startContainer;
      cursorFocus.startOffset = range.startOffset;
    }
  }
};
$pf.newTag = function (tagText) {
  var tag = document.createElement("b");
  tag.innerText = "[" + tagText + "]";
  tag.setAttribute("pf", "pf");
  return tag;
};
$pf.newEmptySpan = function () {
  var obj = document.createElement("span");
  obj.innerHTML = "&nbsp;";
  obj.setAttribute("pf", "pf");
  return obj;
};
$pf.isMsgArea = function (obj) {
  return obj.tagName === "DIV" && obj.className === "msg-area";
};
////加标签--wxj
$pf.getAddTag = function (tagText, cursorFocus) {
  var range = null;
  if (
    $pf.isEmptySpan(cursorFocus.startContainer.parentNode) &&
    cursorFocus.startContainer.parentNode.innerHTML !== "&nbsp;"
  ) {
    //当在EmptySpan后面打字时,文字会进入span元素的textNode内(这样会影响其它操作),测试发现addTag时把进入的文字搬出来是最适合的
    //debugger;
    var span = cursorFocus.startContainer.parentNode;
    $pf.fixEmptySpan(span, cursorFocus);
    range = $pf.setFocusToX(span.nextSibling, cursorFocus.startOffset - 1);
    cursorFocus.startContainer = range.startContainer;
    cursorFocus.startOffset = range.startOffset;
    //console.info('fixed');
  }
  //
  var newTag = $pf.newTag(tagText);
  if ($pf.isEmptySpan(cursorFocus.startContainer)) {
    //console.info(1);
    var span = cursorFocus.startContainer;
    var emptySpan = $pf.newEmptySpan();
    var pNode = span.parentNode;
    if (cursorFocus.startOffset === 0) {
      pNode.insertBefore(newTag, span);
    } else {
      var n = span.nextSibling;
      pNode.insertBefore(newTag, n);
      pNode.insertBefore(emptySpan, n);
      range = $pf.setFocusTo(emptySpan);
    }
  } else if (
    $pf.isMsgArea(cursorFocus.startContainer) // && cursorFocus.startContainer.childNodes.length === 0
  ) {
    //textarea为空时
    //console.info(2);
    var msgArea = cursorFocus.startContainer;
    //if (msgArea.innerHTML === '') {
    var msgArea = cursorFocus.startContainer;
    var lNode = document.createTextNode(" ");
    var rNode = document.createTextNode(" ");
    var emptySpan = $pf.newEmptySpan();
    msgArea.appendChild(lNode);
    msgArea.appendChild(newTag);
    msgArea.appendChild(emptySpan);
    msgArea.appendChild(rNode);
    range = $pf.setFocusTo(rNode);
    //}
  } else if ($pf.isTag(cursorFocus.startContainer)) {
    //startContainer为tag元素时
    //console.info(3);
    var tag = $pf.getTag(cursorFocus.startContainer);
    var pNode = tag.parentNode;
    //var newTag = $pf.newTag(tagText);
    if (cursorFocus.startOffset === 0) {
      pNode.insertBefore(newTag, tag);
      range = $pf.setFocusTo(tag);
    } else {
      pNode.insertAfter(newTag, tag);
      range = $pf.setFocusTo(newTag);
    }
  } else if ($pf.isEmptySpan(cursorFocus.startContainer.parentNode)) {
    //当用拖动时出现此情况--benjamin20190524
    var span = cursorFocus.startContainer.parentNode;
    var emptySpan = $pf.newEmptySpan();
    var pNode = span.parentNode;

    //以前分情况其实是不对的--benjamin20190603
    //if (cursorFocus.startOffset === 0) {
    //    pNode.insertBefore(newTag, span);
    //} else {
    //    var n = span.nextSibling;
    //    pNode.insertBefore(newTag, n);
    //    pNode.insertBefore(emptySpan, n);
    //    range = $pf.setFocusTo(emptySpan);
    //}

    var n = span.nextSibling;
    pNode.insertBefore(newTag, n);
    pNode.insertBefore(emptySpan, n);
    range = $pf.setFocusTo(emptySpan);
  } else if ($pf.isTextNode(cursorFocus.startContainer)) {
    //textNode
    //debugger;
    //console.info(4);
    var textNode = cursorFocus.startContainer;
    var idx = cursorFocus.startOffset;
    var pNode = textNode.parentNode;
    var text = textNode.nodeValue; //innerText;

    var l = text.substring(0, idx);
    var r = text.substring(idx, text.length);
    var lNode = document.createTextNode(l);
    var rNode = document.createTextNode(r);
    var rSpan = $pf.newEmptySpan();
    //var rNode = r === '' ? $pf.newEmptySpan(): document.createTextNode(r);
    //var tag = $pf.newTag(tagText);
    //tag.innerText = '[' + tagText + ']';
    //tag.setAttribute('pf', 'pf');

    pNode.insertBefore(lNode, textNode);
    pNode.insertBefore(newTag, textNode);
    pNode.insertBefore(rSpan, textNode);
    pNode.insertBefore(rNode, textNode);
    pNode.removeChild(textNode);

    range = $pf.setFocusTo(rSpan);
  } else if (cursorFocus.startContainer.nodeType === 1) {
    //nodeType===1,br时--benjamin20190603
    var br = cursorFocus.startContainer;
    var pNode = br.parentNode;
    var emptySpan = $pf.newEmptySpan();
    //var newTag = $pf.newTag(tagText);
    if (cursorFocus.startOffset === 0) {
      pNode.insertBefore(newTag, br);
      pNode.insertBefore(emptySpan, br);
      range = $pf.setFocusTo(br);
    }
    //else {
    //    var n = span.nextSibling;
    //    pNode.insertBefore(newTag, n);
    //    pNode.insertBefore(emptySpan, n);
    //    range = $pf.setFocusTo(emptySpan);
    //}
  }
  if (range !== null) {
    cursorFocus.startContainer = range.startContainer;
    cursorFocus.startOffset = range.startOffset;
  }
  $pf.focusNextIfNextToTag(cursorFocus);
};

//-----------------------------
//在这里只是用vue的渲染函数
var vm = new Vue({
  el: "#div-template",
  data: {
    data1: [
      {
        id: 1,
        name: "客户名称",
      },
      {
        id: 2,
        name: "客户联系人",
      },
    ],
    data2: [
      {
        id: 3,
        name: "会员姓名",
      },
      {
        id: 4,
        name: "会员等级",
      },
    ],
    data3: [
      {
        id: 5,
        name: "门店名称",
      },
      {
        id: 6,
        name: "消费时间",
      },
    ],
  },
});

//在这里主要是对可编辑区域的操作,主要是监控按键操作
// var obj = document.querySelector('textarea');
var msgAreaF = $("div.msg-area");
var obj = msgAreaF[0];

//首先定义焦点位置为空，这样初始化页面之后点击关键字，关键字就不会添加到文本中
var cursorIndex = null;
var cursorFocus = null;
//这里定义一个最后一次按键是为了判断左键是不是由于按左中括号而带动的。
var lastKeyCode = 0;
//记录所添加的关键字
var allKeyWords = [];
//把所有的关键字以内容为key,id为value保存，以便于提交的时候获取相应id
var keyWordsJson = {};
////这里处理
//var newData = vm.data1.concat(vm.data2).concat(vm.data3);
//var i = 0, len = newData.length;
//for (i; i < len; i++) {
//    if (keyWordsJson[newData[i].name] !== null) {
//        keyWordsJson[newData[i].name] = newData[i].id;
//    }
//}
//点击可编辑区域时要对光标更新
obj.addEventListener("click", function (e) {
  cursorFocus = $pf.getFocus(obj);
  $pf.dealFocusExtend(cursorFocus);
  //console.info(cursorFocus);
});

obj.addEventListener(
  "keyup",
  function (e) {
    //每次在文本域中输入的时候都要获取其光标位置，以便于其他操作
    cursorFocus = $pf.getFocus(obj); //一定要,否则点参数时插入位置不对--wxj
    //由于我们是禁止输入中文中括号的，而中文中括号输入左右情况不同，需要分别处理
    if (e.keyCode == 219) {
      e.preventDefault();
      //这里获取到光标左侧的内容
      var leftChar = obj.innerText.slice(cursorIndex - 1, cursorIndex);

      //只有输入结束的是右中括号，而且它的前一个字符是左中括号才把它删除，防止把关键字删除掉
      if (
        /\】/g.test(leftChar) &&
        obj.innerText.charAt(cursorIndex - 2) === "【"
      ) {
        obj.innerText =
          obj.innerText.slice(0, cursorIndex - 2) +
          obj.innerText.slice(cursorIndex, obj.innerText.length);
      }
    } else if (e.keyCode == 221) {
      e.preventDefault();
      //右中括号就好办多了，因为它不会自动带出左中括号
      var leftChar = obj.innerText.slice(cursorIndex - 1, cursorIndex);
      if (/\】/g.test(leftChar)) {
        obj.innerText =
          obj.innerText.slice(0, cursorIndex - 1) +
          obj.innerText.slice(cursorIndex, obj.innerText.length);
      }
    }
    //防止上下左右键移动光标进入关键字中
    if (
      (e.keyCode == 37 ||
        e.keyCode == 39 ||
        e.keyCode == 38 ||
        e.keyCode == 40) &&
      lastKeyCode !== 219
    ) {
      // dealFocusMove(obj, cursorIndex);
      $pf.dealFocusExtend(cursorFocus, e.keyCode == 37 ? "left" : "");
    } else if (e.keyCode == 8) {
      //backspace删除的时候删除整个关键字
      $pf.dealFocusL(cursorFocus);
    } else if (e.keyCode == 46) {
      //delete删除的时候也是删除整个关键字
      // dealFocusR(obj, cursorIndex, allKeyWords);
      $pf.dealFocusR(cursorFocus);
    } else {
      var lb = $("#msg-area-count");
      var v = obj.innerText.replace(/\[[^\[\]]+\]\s/g, "");
      if (v !== null) {
        var count = v.length;
        lb.text("共 " + count + " 字");
      }
      //var tag=$pf.getTag(cursorFocus.startContainer);
      //if(tag!==null){
      //	$pf.fixTag(tag);//中文会有问题
      //}
    }
    if (e.keyCode !== 37 && e.keyCode !== 39) {
      //这里防止手动按得左右键影响左中括号判断
      // lastKeyCode = e.keyCode;
    }
    $pf.fixBogusTag(cursorFocus);
    //console.info(cursorFocus);
  },
  false
);

obj.addEventListener(
  "keydown",
  function (e) {
    if (e.keyCode == 221 || e.keyCode == 219) {
      //这里防止按下英文中括号，你没看错，这里就是坑，英文的可以直接阻止默认事件，但是中文的不可以
      e.preventDefault();
    }
    if ((e.keyCode == 37 || e.keyCode == 39) && lastKeyCode === 219) {
      //这里是防止按下中文中括号左键的时候带动左右键的按下，这样保证光标一直在最后
      e.preventDefault();
    }
  },
  false
);

//增加拖参数功能--benjamin20190522
function allowDrop(ev) {
  ev.preventDefault();
}
//function allowOver(ev) {
//    ev.preventDefault();
//    return true;
//}
function drag(ev) {
  //debugger;
  //ev.originalEvent.dataTransfer.setData("Text", ev.target.innerHTML);//vsCode自动排版会使li内部有换行，innerHTML会变成有换行的字符，最后转为<br/>
  ev.originalEvent.dataTransfer.setData("Text", ev.target.innerText);
}
function drop(ev) {
  ev.preventDefault();
  var x = ev.clientX;
  var y = ev.clientY;

  var selection = getSelection();
  if (selection.rangeCount < 1) {
    //console.info('first');
    $pf.setFocusTo(msgAreaF[0]);
  }

  var result = $pf.selectNodeByXY(x, y);
  var t = ev.originalEvent.dataTransfer.getData("Text");
  //debugger;
  $pf.setFocusToX(result.node, result.pos);
  cursorFocus = $pf.getFocus(obj);
  $pf.dealFocusExtend(cursorFocus);
  $pf.getAddTag(t, cursorFocus);

  //////console.info(result);
  ////if (result !== null && result.isTextNode) {
  ////    var t = ev.originalEvent.dataTransfer.getData("Text");
  ////    $pf.setFocusToX(result.node, result.pos);
  ////    cursorFocus = $pf.getFocus(msgAreaF[0]);
  ////    $pf.dealFocusExtend(cursorFocus);
  ////    $pf.getAddTag(t, cursorFocus);
  ////}
}
$(".param-btn")
  .attr("draggable", true)
  .on("dragover", allowDrop)
  //.on('dragover', allowOver)
  .on("dragstart", drag);
msgAreaF.on("drop", drop);

//现在做添加关键字事件，首先明白一点，就是只有我们在文本域中有光标的时候点击添加关键字才可以添加，而点击其他地方失去光标，再点击关键字的时候是不可以添加的
//所以我们给document添加事件,利用事件冒泡
document.addEventListener("click", function (e) {
  // debugger;
  if (e.target !== obj && e.target.getAttribute("isFocus")) {
    //关键字
    // console.info('document-paramBtn');
    if (
      cursorFocus !== null &&
      $pf.objectToBool(obj.getAttribute("contenteditable"))
    ) {
      //要添加东西当然要先放入光标了，这里会记住之前的光标位置，所以直接focus即可
      obj.focus();

      allKeyWords.push(e.target.innerHTML);

      $pf.getAddTag(e.target.innerText, cursorFocus);
    }
  } else if (e.target == obj || e.target.parentNode == obj) {
    // cursorFocus = $pf.getFocus(obj);
    // console.info('document-textarea');
  } else {
    //点击其他地方要将光标位置置空，防止点击关键字添加
    cursorIndex = null;
    // console.info('document-outTextarea');
  }
  //console.info(cursorFocus);
});

////最后我们处理提交模板的内容

//var oBtn = document.querySelectorAll('button')[0];
//oBtn.addEventListener('click', function () {
//    //模板名称
//    var templatetypename = document.querySelector('[data-type="templateName"]').value || "";
//    //模板原始内容
//    var templatename = obj.value || "";
//    var reg = /\【([^\【\】]+)\】/g;
//    var res;
//    //我们把模板做一次变更，方便后端识别，模板关键字变为这种形式：[*]
//    var templateformula = templatename.replace(reg, '[*]') || "";
//    var keywords = [];
//    //取出所有的关键字id，这里的顺序与模板内容的关键字一一对应
//    for (var i = 0; i < allKeyWords.length; i++) {
//        keywords.push(keyWordsJson[allKeyWords[i]]);
//    }

//    console.log(templatetypename, templatename, templateformula, keywords);
//}, false);
