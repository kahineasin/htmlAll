///服务调用
function reference(
  applicationId,
  applicationKey,
  secertKey,
  signature_algorithm,
  flag,
  crypto
) {
  this.applicationId = applicationId;
  this.applicationKey = applicationKey;
  this.secertKey = secertKey;
  this.signature_algorithm = signature_algorithm;
  this.flag = flag;
  this.crypto = crypto;
  this.timestamp = "";
  this.nonce = "";
  this.authorization = "";
  this.postData = "";
  this.signature = "";
  this.signatureString = "";
}

///请求
reference.prototype.request = function (
  httpMethod,
  url,
  token,
  postData,
  body,
  callback
) {
  this.callback = callback;
  var httpMethod = httpMethod.toUpperCase();
  var authData = this.get_authorizationData();

  var requestData = [];
  this.combine(requestData, authData);

  if (httpMethod == "POST" && postData != null && body == false)
    this.combine(requestData, postData);

  var sig_url = this.flag == true ? url : this.get_pathAndQuery(url);
  this.signature = this.generate_signature(
    this.secertKey,
    httpMethod,
    sig_url,
    token,
    requestData
  );
  authData.push({ key: "signature", value: this.signature });

  if (token != "") authData.push({ key: "token", value: token });

  this.authorization = this.generate_authorizationString("OAuth", authData);

  if (httpMethod == "POST" && postData != null && body == false) {
    this.postData = this.generate_postData(postData);
  } else {
    this.postData = postData;
  }

  return this.http_request(
    url,
    httpMethod,
    this.authorization,
    "application/x-www-form-urlencoded",
    this.postData,
    null,
    callback
  );
};

///生成签名
reference.prototype.generate_signature = function (
  secertKey,
  httpMethod,
  requestUrl,
  token,
  data
) {
  this.signatureString =
    httpMethod.toUpperCase() +
    "&" +
    this.encode(requestUrl) +
    "&" +
    this.generate_signatureString(
      httpMethod.toUpperCase(),
      requestUrl,
      data,
      "="
    );
  if (this.signature_algorithm == "HMACSHA1") {
    var key = secertKey + (token == "" ? "" : "&" + token);
    var hash = this.crypto.HmacSHA1(this.signatureString, key);
    return this.crypto.enc.Base64.stringify(hash);
  }
  return "";
};

///生成认证头
reference.prototype.generate_authorizationString = function (authType, data) {
  var authString = authType + " ";
  for (var i = 0; i < data.length; i++) {
    authString =
      authString +
      data[i].key +
      '="' +
      this.encode(data[i].value.toString()) +
      '"';

    if (i < data.length - 1) authString = authString + ",";
  }

  return authString;
};

///生成签名字符串
reference.prototype.generate_signatureString = function (
  httpMethod,
  url,
  parameters,
  spliter
) {
  var parameterIndex = url.indexOf("?");
  if (parameterIndex > -1) {
    var urlParameterString = url.substring(parameterIndex + 1);
    url = url.substring(0, parameterIndex);
    var urlParameters = urlParameterString.split("&");
    var pkv;
    for (var i = 0; i < urlParameters.length; i++) {
      pkv = urlParameters[i].split("=");
      parameters.push({ key: pkv[0], value: pkv[1] });
    }
  }

  var pairs = [];
  this.combine(pairs, parameters);

  pairs.sort(this.compare);
  var sigString = "";
  for (var i = 0; i < pairs.length; i++) {
    //sigString = sigString + pairs[i].key + spliter + this.encode(pairs[i].value);
    sigString =
      sigString +
      pairs[i].key +
      spliter +
      this.encode(pairs[i].value == null ? "" : pairs[i].value.toString()); //为了可以用非string的value值--benjamin 20210831

    if (i < pairs.length - 1) sigString = sigString + "&";
  }

  debugger;
  return sigString;
};

///比较器
reference.prototype.compare = function (a, b) {
  if (a.key.toLowerCase() > b.key.toLowerCase()) return 1;
  else if (a.key.toLowerCase() < b.key.toLowerCase()) return -1;
  else return 0;
};

///获取签名数据
reference.prototype.get_authorizationData = function (
  applicationId,
  applicationKey,
  algorithm
) {
  var data = [];
  data.push({ key: "appid", value: this.applicationId });
  data.push({ key: "appkey", value: this.applicationKey });
  data.push({ key: "signature_algorithm", value: this.signature_algorithm }); //HMACSHA1
  data.push({ key: "timestamp", value: this.get_timestamp() });
  data.push({ key: "nonce", value: this.get_nonce() });

  return data;
};

/**
 * 生成要提交的数据
 *
 * 旧版不能跳过空参数
 * @deprecated
 * @param data
 * @returns
 */
reference.prototype.generate_postDataOld = function (data) {
  var dataString = "";
  for (var i = 0; i < data.length; i++) {
    dataString =
      dataString + data[i].key + "=" + this.encode(data[i].value.toString());

    if (i < data.length - 1) dataString = dataString + "&";
  }

  return dataString;
};
reference.prototype.generate_postData = function (data) {
  let list = [];
  for (let i = 0; i < data.length; i++) {
    try {
      list.push(
        data[i].key +
          "=" +
          this.encode(data[i].value == null ? "" : data[i].value.toString())
      );
    } catch (e) {
      console.info("ReferenceService.generatePostData");
      console.info(e);
    }
  }

  debugger;
  return list.join("&");
};

///发送实际的请求
reference.prototype.http_request = function (
  url,
  method,
  authorization,
  contentType,
  data,
  headers,
  callback
) {
  var request = new XMLHttpRequest();
  request.open(method, url, true);
  if (method == "POST")
    request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
  else request.setRequestHeader("Content-Type", "text/html;charset=utf-8");

  request.setRequestHeader("Authorization", authorization);
  if (method == "POST") {
    request.send(data);
  } else {
    request.send(null);
  }
  request.onreadystatechange = callback;
};

///从键值队中获取值
reference.prototype.get_value = function (key, data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].key == key) {
      return data[i].value;
    }
  }
};

///获取时间截
reference.prototype.get_timestamp = function () {
  if (this.timestamp == "")
    return (new Date().getTime() - new Date("1970/01/01").getTime()).toString();
  else return this.timestamp;
};

reference.prototype.set_timestamp = function (value) {
  this.timestamp = value;
};

///获取随机字符串
reference.prototype.get_nonce = function () {
  if (this.nonce == "") {
    var str = "";
    var index = 0;
    while (index < 10) {
      str = str + String.fromCharCode(65 + Math.random() * 26);
      index++;
    }

    return str;
  } else return this.nonce;
};

reference.prototype.set_nonce = function (value) {
  this.nonce = value;
};

///编码字符
reference.prototype.encode = function (data) {
  var str = "";
  for (var i = 0; i < data.length; i++) {
    if (data[i] == " ") str = str + "+";
    else {
      var chars = encodeURIComponent(data[i]);
      if (chars.length > 1) str = str + chars.toLowerCase();
      else str = str + data[i];
    }
  }

  return str;
};

///将数据data2复制到data1
reference.prototype.combine = function (data1, data2) {
  for (var i = 0; i < data2.length; i++) data1.push(data2[i]);
};

///取得rawurl
reference.prototype.get_pathAndQuery = function (url) {
  url = url.replace("http://", "").replace("https://", "");
  var index = url.indexOf("/");
  return url.substring(index);
};

//获取到postdata
reference.prototype.get_postData = function () {
  return this.postData;
};

//获取授权头
reference.prototype.get_authorization = function () {
  return this.authorization;
};

//解码base64
reference.prototype.base64_decode = function (base64String) {
  return this.crypto.enc.Utf8.stringify(
    this.crypto.enc.Base64.parse(base64String)
  );
};

//编码base64
reference.prototype.base64_encode = function (string) {
  var src = this.crypto.enc.Utf8.parse(string);
  return this.crypto.enc.Base64.stringify(src);
};

//返回签名
reference.prototype.get_signature = function () {
  return this.signature;
};

///返回签名串
reference.prototype.get_signatureString = function () {
  return this.signatureString;
};
