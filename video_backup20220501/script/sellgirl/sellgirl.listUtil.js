/*
* 表单通用类
*/

var sellgirl = sellgirl || {};
sellgirl.listUtil = sellgirl.listUtil || {};

sellgirl.listUtil.getSelectedIndexs = function (oListbox) {

    var arrIndexes = new Array;

    for (var i = 0; i < oListbox.options.length; i++) {

        if (oListbox.options[i].selected) {

            arrIndexes.push(i);

        }

    }

    return arrIndexes;

};
sellgirl.listUtil.add = function(oListbox, sName, sValue) {

    var oOption = document.createElement("option");

    oOption.appendChild(document.createTextNode(sName));

    if (arguments.length == 3) {

        oOption.setAttribute("value", sValue);

    }

    oListbox.appendChild(oOption);

};
sellgirl.listUtil.remove = function(oListbox, iIndex) {

    oListbox.remove(iIndex);

};
sellgirl.listUtil.clear = function(oListbox) {

    for (var i=oListbox.options.length -1;i>=0; i--) {

        sellgirl.listUtil.remove(oListbox, i);

    }

};
sellgirl.listUtil.move = function(oListboxFrom, oListboxTo, iIndex) {

    var oOption = oListboxFrom.options[iIndex];

    if (oOption != null) {

        oListboxTo.append(oOption);

    }

};
sellgirl.listUtil.shiftUp = function(oListbox, iIndex) {

    if (iIndex > 0) {

        var oOption = oListbox.options[iIndex];

        var oPrevOption = oListbox.options[iIndex - 1];

        oListbox.insertBefore(oOption, oPrevOption);

    }

};

sellgirl.listUtil.shiftDown = function(oListbox, iIndex) {

    if (iIndex > 0) {

        var oOption = oListbox.options[iIndex];

        var oNextOption = oListbox.options[iIndex + 1];

        oListbox.insertBefore(oNextOption , oOption);

    }

};