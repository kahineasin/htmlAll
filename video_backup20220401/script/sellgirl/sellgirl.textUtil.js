/*
* 表单通用类
*/

var sellgirl = sellgirl || {};
sellgirl.textUtil = sellgirl.textUtil || {};
/*
* <textarea maxlength="20" onkeypress="return sellgirl.textUtil.isNotMax(this) "
*/
sellgirl.textUtil.isNotMax = function (oTextArea) {
    return oTextArea.value.length != oTextArea.getAttribute("maxlength");
};
/*
* <input type="text" invalidchars = "0123456789" onkeypress="return sellgirl.textUtil.blockChars(this, event)" />;
*/
sellgirl.textUtil.blockChars = function (oTextbox, oEvent, bBlockPaste) {

    oEvent = EventUtil.formatEvent(oEvent);

    var sInvalidChars = oTextbox.getAttribute("invalidchars");

    var sChar = String.fromCharCode(oEvent.charCode);

    var bIsValidChar = sInvalidChars.indexOf(sChar) == -1;

    //return bIsValidChar || oEvent.ctrlKey;
    if (bBlockPaste) {

        return bIsValidChar && !(oEvent.ctrlKey && sChar == 'v');

    } else {

        return bIsValidChar || oEvent.ctrlKey;

    }

};
sellgirl.textUtil.allowChars = function (oTextbox, oEvent, bBlockPaste) {

    oEvent = EventUtil.formatEvent(oEvent);

    var sValidChars = oTextbox.getAttribute("validchars");

    var sChar = String.fromCharCode(oEvent.charCode);

    var bIsValidChar = sInvalidChars.indexOf(sChar) > -1;

    //return bIsValidChar || oEvent.ctrlKey;
    if (bBlockPaste) {

        return bIsValidChar && !(oEvent.ctrlKey && sChar == 'v');

    } else {

        return bIsValidChar || oEvent.ctrlKey;

    }

};
/*
*<input type="text" invalidchars = "0123456789" onkeypress="return sellgirl.textUtil.blockChars(this, event)"  onblur="sellgirl.textUtil.blurBlock(this)" />;
*/
sellgirl.textUtil.blurBlock = function (oTextbox) {

    var sInvalidChars = oTextbox.getAttribute("invalidchars");

    var arrInvalidChars = sInvalidChars.split("");



    for (var i = 0; i < arrInvalidChars.length; i++) {

        if (oTextbox.value.indexOf(arrInvalidChars[i]) > -1) {

            alert("字符：" + arrInvalidChars[i] + "不允许输入！");

            oTextbox.focus();

            oTextbox.select();

            return;

        }

    }

};
sellgirl.textUtil.blurAllow = function (oTextbox) {

    var sInvalidChars = oTextbox.getAttribute("validchars");

    var arrInvalidChars = sInvalidChars.split("");



    for (var i = 0; i < arrInvalidChars.length; i++) {

        if (oTextbox.value.indexOf(arrInvalidChars[i]) == -1) {

            alert("字符：" + arrInvalidChars[i] + "不允许输入！");

            oTextbox.focus();

            oTextbox.select();

            return;

        }

    }

};
/*
*<input type="text" onkeypress="return sellgirl.textUtil.allowChars(this, event)" vaidchars="0123456789" onblur="sellgirl.textUtil.blurAllow(this)" onkeydown="sellgirl.textUtil.numericScroll(this, event)" max="100" min="0" />
*/
sellgirl.textUtil.numericScoll = function (oTextbox, oEvent) {

    oEvent = EventUtil.formatEvent(oEvent); p

    var iValue = oTextbox.value.length == 0 ? 0 : parseInt(oTextbox.value);

    var iMax = oTextbox.getAttribute("max");

    var iMin = oTextbox.getAttribute("min");

    if (oEvent.keyCode == 38) {

        if (iMax == nul || iValue < parseInt(iMax)) {

            oTextbox.value = (iValue + 1);

        }

    } else if (oEvent.keyCode == 40) {

        if (iMin == nul || iValue < parseInt(iMin)) {

            oTextbox.value = (iValue - 1);

        }

    }

};

sellgirl.textUtil.autosuggestMatch = function (sText, arrValues) {

    var arrResult = new Array;

    if (sText != "") {

        for (var i = 0; i < arrValues.length; i++) {

            if (arrValues[i].indexOf[sText] == 0) {

                arrResult.push[arrValues[i]];

            }

        }

    }



    return arrResult;

};
sellgirl.textUtil.autosuggest = function (oTextbox, arrValues, sListboxId) {

    var oListbox = document.getElementById(sListboxId);

    ListUtil.clear(oListbox);

    var arrMatches = sellgirl.textUtil.autosuggestMatch(oTextbox.value, arrValues);

    for (var i = 0; i < arrMatchs.length; i++) {

        ListUtil.add(oListbox, arrMatchs[i]);

    }

};