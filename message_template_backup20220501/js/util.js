
var $pf = $pf || {};

$pf.setFocusTo = function (obj, setToEnd) {//选择textNode--wxj
    if (obj === null || obj === undefined) { return; }
    var s = getSelection()
    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
    if (s.rangeCount > 0) { s.removeAllRanges(); }

    var range = document.createRange();

    range.selectNodeContents(obj);//按左之后插入参数报错
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
$pf.setFocusToX = function (obj, posX) {//选择textNode--wxj
    if (obj === null || obj === undefined) { return; }
    var s = getSelection()
    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
    if (s.rangeCount > 0) { s.removeAllRanges(); }

    var range = document.createRange();

    range.selectNodeContents(obj);//按左之后插入参数报错
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
    if (obj === null || obj === undefined) { return null; }
    if ($pf.isTag(obj)) { return obj; }
    var pNode = obj.parentNode;//注意:点击tag的文字时,传入来的是<b>元素内的textNode
    if ($pf.isTag(pNode)) { return pNode; }
    return null;
};
//是否tag
$pf.isTag = function (obj) {
    return obj !== null && obj !== undefined && obj.tagName === 'B' && obj.hasAttribute('pf');
};
$pf.isTagEnd = function (cursorFocus) {//光标是tag里的textNode的最后
    var obj = cursorFocus.startContainer;
    var pNode = obj.parentNode;
    return $pf.isTag(pNode) && obj.nodeValue.length === cursorFocus.startOffset;
};
$pf.isTagStart = function (cursorFocus) {//光标是tag里的textNode的开始
    var obj = cursorFocus.startContainer;
    var pNode = obj.parentNode;
    return $pf.isTag(pNode) && 0 === cursorFocus.startOffset;
};

//$pf.isEmptySpan = function (obj) {
//    return obj !== null && obj !== undefined && obj.tagName === 'SPAN' && obj.hasAttribute('pf')&&obj.innerHTML==='&nbsp;';
//};
$pf.isEmptySpan = function (obj) {
    return obj !== null && obj !== undefined && obj.tagName === 'SPAN' && obj.hasAttribute('pf') && obj.innerHTML.indexOf('&nbsp;') === 0;
};
$pf.isTextNode = function (obj) {
    return obj.nodeType === 3;
};
//是textNode的结束位置
$pf.isTextNodeEnd = function (cursorFocus) {
    var obj=cursorFocus.startContainer;
    return obj.nodeType === 3&&cursorFocus.startOffset===obj.nodeValue.length;
};
//下一个textNode
$pf.getNextTextNode = function (obj) {
    var n = obj.nextSibling;
    if (n.nodeType === 3) {//textNode
        return n;
    }
    return null;
};
//光标在tag后时,打字会输入到tag里,如:[会员编号]a,因此要修复tag
$pf.fixTag = function (tag) {
    var text = tag.innerText;
    var i = text.indexOf(']');
    if (i !== text.length - 1) {
        var prev = text.substr(i + 1, text.length - i - 1);
        tag.innerText = text.substr(0, i + 1);
        var n = $pf.getNextTextNode(tag);
        if (n !== null) {//textNode
            n.nodeValue = prev + n.nodeValue;
            $pf.setFocusTo(n);//wxjtodo
        }
        // tag.nextSibling.innerText=prev+tag.nextSibling.innerText;
    }
    // if(text[text.length-1]!==']'){
    // }
};
//如果之前光标在tag上,backspace之后虽然tag被删除了,但打字时会以tag的格式为准,生成了<font><b>xx</b></font>
$pf.fixBogusTag = function (cursorFocus) {
    var bNode = cursorFocus.startContainer.parentNode;
    if (bNode.tagName === 'B') {
        var fontNode = bNode.parentNode;
        if (fontNode !== undefined && fontNode.tagName === 'FONT') {
            var n = fontNode.nextSibling;
            fontNode.parentNode.insertBefore(document.createTextNode(cursorFocus.startContainer.nodeValue), fontNode);
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
//$pf.fixEmptySpan = function (span) {
//    var pNode = span.parentNode;
//    var n = span.nextSibling;
//    //console.info(span);
//    for (var i = 1; i < span.childNodes.length; i++) {
//        var child = span.childNodes[i];
//        span.removeChild(child);
//        pNode.insertBefore(child,n);
//    }
//};
$pf.fixEmptySpan = function (span) {
    var pNode = span.parentNode;
    var n = span.nextSibling;
    var more = span.innerHTML.replace('&nbsp;', '');
    var moreNode = document.createTextNode(more);
    pNode.insertBefore(moreNode, n);
    //console.info(span);
    for (var i = 1; i < span.childNodes.length; i++) {
        var child = span.childNodes[i];
        //span.removeChild(child);
        pNode.insertBefore(child, n);
    }
    span.innerHTML = '&nbsp;';
    //var range=$pf.setFocusTo(moreNode);
};
//当处于tag后面时,最好移一位,否则下次打字会输入到tag里(如果tag在行首,那光标在tag前时要前移一位)
$pf.focusNextIfNextToTag = function (cursorFocus) {
    //console.info(cursorFocus);
    var obj = cursorFocus.startContainer;
    var range = null;
    if ($pf.isEmptySpan(cursorFocus.startContainer)) {
        //$pf.fixEmptySpan(cursorFocus.startContainer);//使用了emptySpan方式后,后面打字其实是进入span里了,所以最好把那些移到外面去
        var span = cursorFocus.startContainer;
        if (cursorFocus.startOffset === 0 && $pf.isTag(span.previousSibling)) {
            range = $pf.setFocusTo(span, true);
        }
    } else if ($pf.isTagEnd(cursorFocus)) {//backspace删除后有可能进入这里
        range = $pf.setFocusTo(obj.parentNode.nextSibling);
        if (range !== null) {
            cursorFocus.startContainer = range.startContainer;
            cursorFocus.startOffset = range.startOffset;
            $pf.focusNextIfNextToTag(cursorFocus);
        }
        return;
    } else if ($pf.isTag(obj.previousSibling) && obj.nodeType === 3 && cursorFocus.startOffset === 0) {
        if (obj.nodeValue === '') {
            obj.nodeValue = ' ';
            range = $pf.setFocusTo(obj, true);
            //cursorFocus.startContainer = range.startContainer;
            //cursorFocus.startOffset = range.startOffset;
        } else if (obj.nodeValue.length > 0) {
            range = $pf.setFocusToX(obj, 1);
            ////range.setStart(obj, 1);
            //cursorFocus.startContainer = range.startContainer;
            //cursorFocus.startOffset = range.startOffset;
        }
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
    }
};
//处理鼠标定位光标(改为b类型的tag后--by wxj)
$pf.dealFocusExtend = function (cursorFocus, direction) {
    // debugger;
    var tag = $pf.getTag(cursorFocus.startContainer);
    if (tag !== null) {
        var range = null;
        if (cursorFocus.startOffset !== 0) {//光标不在tag的首位
            // var n=direction==='left'?tag:tag.nextSibling;//永远要防止光标在tag上
            if (direction === 'left') {
                range = $pf.setFocusTo(tag.previousSibling, true);//奇怪这里设置后,startContainer竟然是textarea
            } else {
                range = $pf.setFocusTo(tag.nextSibling);//奇怪这里设置后,startContainer竟然是textarea
            }
        } else {//光标在tag的首位(当tag在行首时,点击行首,是此情况)
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
    var selection = getSelection()
    // 设置最后光标对象
    var lastEditRange = selection.getRangeAt(0);
    if (lastEditRange !== null) {
        return {
            startOffset: lastEditRange.startOffset,
            startContainer: lastEditRange.startContainer//一定是textNode
        };
    }
    return null;

};
function getIdxRelativeParent(obj) {
    var cs = obj.parentNode.childNodes;
    for (var i = 0; i < cs.length; i++) {
        if (cs[i] === obj) { return i; }
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
        if (text !== null// && text[text.length - 1] !== ']' //tag后加空格之后没必要这条件了
            ) {
            var range = null;
            if (tag.nextSibling !== null) {
                range = $pf.setFocusTo(tag.nextSibling);
            } else if (tag.previousSibling !== null) {
                range = $pf.setFocusTo(tag.previousSibling, true);
            }
            tag.parentNode.removeChild(tag);
            if (range !== null) {
                cursorFocus.startContainer = range.startContainer;//wxjtodo
                cursorFocus.startOffset = range.startOffset;
            }
            //cursorFocus.startContainer = $pf.isTag(n) ? n.firstChild : n;//wxjtodo
        }
    }
    $pf.focusNextIfNextToTag(cursorFocus);
};
$pf.getNextDom = function (obj) {
    if (obj.nextSibling !== null) { return obj.nextSibling; }
    if (!$pf.isMsgArea(obj.parentNode)) { return $pf.getNextDom(obj.parentNode); }
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
    if (tag === null) { return false; }
    var text = tag.innerText;
    return !(text !== null && text[0] === '[' && text[text.length - 1] === ']');
};
//delete删除tag
$pf.dealFocusR = function (cursorFocus) {//注意进入这里时,delete是已经删除一个字符的状态
    var current = cursorFocus.startContainer;
    var delobj = null;//delobj一定是一个不完整的tag
    if ($pf.getTag(current) !== null) {//当前为tag
        if ($pf.isIncompleteTag(current)) {
            delobj = current;
        } else {
            var next = $pf.getNextDom(current);
            if ($pf.isIncompleteTag(next)) {
                delobj = next;
            }
        }
    } else if ($pf.isTextNodeEnd(cursorFocus)) {//当前是textNode
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
    tag.innerText = '[' + tagText + ']';
    tag.setAttribute('pf', 'pf');
    return tag;
};
$pf.newEmptySpan = function () {
    var obj = document.createElement("span");
    obj.innerHTML = '&nbsp;';
    obj.setAttribute('pf', 'pf');
    return obj;
};
$pf.isMsgArea = function (obj) {
    return obj.tagName === 'DIV' && obj.className === 'msg-area';
};
////加标签--wxj
$pf.getAddTag = function (tagText, cursorFocus) {
    var range = null;
    if ($pf.isEmptySpan(cursorFocus.startContainer.parentNode) && cursorFocus.startContainer.parentNode.innerHTML !== '&nbsp;') {
        //当在EmptySpan后面打字时,文字会进入span元素的textNode内(这样会影响其它操作),测试发现addTag时把进入的文字搬出来是最适合的
        var span = cursorFocus.startContainer.parentNode;
        $pf.fixEmptySpan(span, cursorFocus);
        range = $pf.setFocusToX(span.nextSibling, cursorFocus.startOffset - 1);
        cursorFocus.startContainer = range.startContainer;
        cursorFocus.startOffset = range.startOffset;
    }
    //
    var newTag = $pf.newTag(tagText);
    if ($pf.isEmptySpan(cursorFocus.startContainer)) {
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
    } else if ($pf.isMsgArea(cursorFocus.startContainer)// && cursorFocus.startContainer.childNodes.length === 0
        ) {//textarea为空时
        var msgArea = cursorFocus.startContainer;
        //if (msgArea.innerHTML === '') {
        var msgArea = cursorFocus.startContainer;
        var lNode = document.createTextNode(' ');
        var rNode = document.createTextNode(' ');
        var emptySpan = $pf.newEmptySpan();
        msgArea.appendChild(lNode);
        msgArea.appendChild(newTag);
        msgArea.appendChild(emptySpan);
        msgArea.appendChild(rNode);
        range = $pf.setFocusTo(rNode);
        //}
    } else if ($pf.isTag(cursorFocus.startContainer)) {//startContainer为tag元素时
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
    } else if ($pf.isTextNode(cursorFocus.startContainer)) {//textNode
        var textNode = cursorFocus.startContainer;
        var idx = cursorFocus.startOffset;
        var pNode = textNode.parentNode;
        var text = textNode.nodeValue;//innerText;

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
    }
    if (range !== null) {
        cursorFocus.startContainer = range.startContainer;
        cursorFocus.startOffset = range.startOffset;
    }
    $pf.focusNextIfNextToTag(cursorFocus);
};
