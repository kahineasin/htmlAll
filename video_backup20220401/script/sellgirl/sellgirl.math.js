/*
* 数学运算类
*/
var sellgirl = sellgirl || {};
sellgirl.math = sellgirl.math || {};

/*
* 科学记数法
*/
sellgirl.math.num2e=function(num) {
    var p = Math.floor(Math.log(num) / Math.LN10);
    var n = num * Math.pow(10, -p);
    return n + 'e' + p;
}