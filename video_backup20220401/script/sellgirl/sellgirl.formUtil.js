/*
* 表单通用类
*/

var sellgirl = sellgirl || {};
sellgirl.formUtil = sellgirl.formUtil || {};
sellgirl.formUtil.focusOnFirst = function () {
    if (document.forms.length > 0) {
        for (var i = 0; i < document.forms[0].elements.length; i++) {
            var oField = document.forms[0].elements[i];
            if (oField.type != "hidden") {
                oField.focus();
                return;
            }
        }
    }
};
sellgirl.formUtil.setTextBoxes = function () {
    var colInputs = document.getElementsByTagName("input");
    var colTextAreas = document.getElementsByTagName("textarea");
    var i = 0;
    for (i = 0; i < colInputs.length; i++) {
        if ("text" == colInputs[i].type || "password" == colInputs[i].type) {
            colInputs[i].onfocus = function () {
                this.select();
            }
        }
    }
    for (i = 0; i < colTextAreas.length; i++) {
        colTextAreas[i].onfocus = function () {
            this.select();
        }
    }
};
/*
*   <input maxlength="4" onkeyup="sellgirl.formUtil.tabForward(this)" />
*/
sellgirl.formUtil.tabForward = function (oTextbox) {
    if (arguments.length < 1) return; //因为sellgirl.loader里循环调用所有成员函数时排除这个

    var oForm = oTextbox.form;

    //确保该文本框不是表单的最后一个字段
    if (oForm.elements[oForm.elements.length - 1] == oTextbox
   && oTextbox.value.length == oTextbox.getAttribute("maxlength")) {
        for (var i = 0; i < oForm.elements.length; i++) {

            if (oForm.elements[i] == oTextbox) {

                for (var j = i + 1; j < oForm.elements.length; j++) {

                    if (oForm.elements[j].type != "hidden") {

                        oForm.elements[j].focus();
                        return;

                    }

                }
                return;

            }

        }
    }
};