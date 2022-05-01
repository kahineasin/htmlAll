function sellGirlList() {
    $('.sellgirl-list').children().css("white-space", "nowrap");
}
function changeCss(dom) {
    if (dom.find('.sellgirl-list')) {
        setTimeout(sellGirlList, 100);
    }
    //if (dom.hasClass('sellgirl-list')) {
    //    setTimeout(sellGirlList, 100);
    //    //alert(dom.attr('class'));
    //}
}
function sellGirlClear() {
    $('.clear').css("clear", "both");
}
$(document).ready(function () {
    //try{
        if ($(document).find('.sellgirl-list')) {
            setTimeout(sellGirlList, 100);
        }
        if ($(document).find('clear')) {
            setTimeout(sellGirlClear, 100);
        }
        var layer = $('.sellgirl-layer');
        if (layer) { layer.click(function () { changeCss($(this)); }); }

        if (sellgirl.formUtil) {
            for (var i in sellgirl.formUtil) {
                if (sellgirl.formUtil.hasOwnProperty(i)) {
                    sellgirl.formUtil[i]();
                }
            }
        }
        if ($('#usercode').length > 0) {
            $('#usercode').focus();
        }
        if ($('#usercode').length > 0) {
            $('#usercode').focus();
        }
    //} catch (e) { }
});