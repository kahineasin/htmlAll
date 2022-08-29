function LearningCard(opts) {
    opts = opts || {};

    //this.url = opts.url;
    this.urlParams = opts.urlParams || {};
    this.userData = opts.userData;
    this.onGotCard = opts.onGotCard;//拿到卡的回调

    this.isTakingCard = false;
    this.lastTakingTime = null;
    this.cards = [];
    this.currentCard = {};
    this.timerCaches = [];
    this.requireNum = 10;//保存的卡数
    this.onGotSomeCard = null;
    this.onGotNum = null;
}
LearningCard.prototype.startTaking = function () {
    var me = this;
    me.isTakingCard = true;
    me.lastTakingTime = new Date();
};
LearningCard.prototype.endTaking = function () {
    var me = this;
    me.isTakingCard = false;
};
LearningCard.prototype.isTaking = function () {//是否正在取卡,超时4秒认为不是正在取
    var me = this;
    if (!me.isTakingCard) { return false; }
    var s1 = me.lastTakingTime.getTime(), s2 = (new Date()).getTime();
    var total = (s2 - s1) / 1000;
    return total < 4;
};
//private
LearningCard.prototype.getOneNewCard = function () {
    var me = this;
    if (me.isTaking()) {
        setTimeout(function () {
            me.getOneNewCard.call(me);
        }, 1000);
        return;
    }
    me.startTaking();
    sellgirl.ajax({
        url: '/api/usersoft/getCardContent/1',
        //param: utils.formatString('&userCode={0}&needFeature={1}&noNeedFeature={2}', me.userData.userCode, me.userData.needFeature, me.userData.noNeedFeature),
        param: utils.formatString('&userCode={0}&needFeature={1}&noNeedFeature={2}', me.userData.userCode, me.urlParams.needFeature || '', me.urlParams.noNeedFeature||''),
        async: true,
        success: function (xmlHttpReq) {
            if (xmlHttpReq != 'null') {//后台有可能返回空值,例如系统中并没有录入英文时         
                me.endTaking();
                me.cards.push({
                    cardId: xmlHttpReq.ProductId,
                    cardCode: xmlHttpReq.ProductCode,
                    cardName: xmlHttpReq.ProductName,
                    frequency: xmlHttpReq.Frequency,
                });
                //alert('get card'+cards.length);
                if (!me.currentCard.cardId) {//这句只有打开页面时有用    
                    me.takeOneCard();
                    //alert('第一次拿当前卡');
                } else {
                    //me.enableNextBtn();
                    if (me.onGotCard) {
                        me.onGotCard();
                    }
                }

                if (me.onGotSomeCard && me.cards.length == me.onGotNum) {
                    //var cards = [];
                    //for (var i = 0; i < me.onGotNum; i++) {
                    //    cards.push(me.takeOneCard());
                    //}
                    //me.onGotSomeCard(cards);
                    me.onGotSomeCard();
                    me.onGotSomeCard = null;
                    me.onGotNum = null;
                }
            }
        }
    });
};
//private
LearningCard.prototype.clearTimerCache = function () {
    var me = this;
    for (var i = me.timerCaches.length - 1; i >= 0; i--) {
        clearTimeout(me.timerCaches[i]);
    }
    me.timerCaches = [];
};
//private
LearningCard.prototype.takeOneCard = function () {//取一个卡到当前卡
    var me = this;
    me.currentCard = me.cards[0];
    me.cards.splice(0, 1);
    me.fullTenCard();
    //setNextBtnStatus();
    return me.currentCard;
};
//public
LearningCard.prototype.fullTenCard = function ()//补满10个卡
{
    var me = this;
    me.clearTimerCache();
    var n = me.requireNum - me.cards.length;
    for (var i = 0; i < n; i++) {//补够10个卡,因为fullTenCard可以多次调用的,所以实际chards数量可能会比10大
        var timerCache = setTimeout(function () {
            me.getOneNewCard.call(me);
        }, 1000 * i);//用了延迟就不会影响第一次的页面加载.另外,如果加载页面时连续请求10次又不使用延迟,页面会等待10次完成后才加载,很慢.
        me.timerCaches.push(timerCache);
    }
};
//public
LearningCard.prototype.takeSomeCard = function (num, callback) {//取一个卡到当前卡
    var me = this;
    if (me.cards.length < num) {
        me.onGotSomeCard = callback;
        me.onGotNum = num;
    } else {
        callback();
    }
};