<!--HTML5播放器,自动读取变量mp3FolderPath这个文件夹下的文件,自动识别是video还是audio,20180117-->
    <link rel="stylesheet" type="text/css" href="./css/sellgirl_player_list.css">
    <script type="text/javascript" src="script/html5media.min.js"></script>
    <div class="audioContainer">
        <div class="videoLayer">
        </div>
        <div class="sellgirl_player_list" >
            <div class="sellgirl_player_list_toolbar">
                <a style="clear: both" href="#"  onclick="return nextPlayMode(this)">&lt;Order Repeat&gt;</a>
            </div>
            <hr />
            <div class="sellgirl_player_list_top">

            <%
Set Fso = CreateObject("Scripting.FileSystemObject")
Set X = Fso.GetFolder(Server.mapPath(mp3FolderPath))
 int i
                        

function getFileName(str)
	dim regEx
	set regEx=New RegExp
	regEx.Pattern="(.+)\.[^\.]+$"
	regEx.Ignorecase=True
	regEx.Global=True
	getFileName=regEx.Replace(str,"$1")
End function

function containFileName(names,fname)
    Dim r
    Dim myArr1
    myArr1=Split(names,",")
    r=0
    for each F in myArr1
        If F=fname Then
            r=1
        End If
    Next
    containFileName=r
End function

Dim strFiles
Dim tmpFileName
strFiles=""
tmpFileName=""
                
for each F in X.files
    tmpFileName=getFileName(F.Name)
    If strFiles="" Then
    Else
        strFiles=strFiles&","
    End If
    If containFileName(strFiles,tmpFileName)=1 Then
    Else
        strFiles=strFiles&tmpFileName
    End If
Next
                
Dim arrFiles
arrFiles=Split(strFiles,",")

i=0

for each n in arrFiles
    tmpFileName=""
    for each F in X.files
        If InStr(F.Name,n&".")>0 Then
            If tmpFileName="" Then
            Else
                tmpFileName=tmpFileName&","
            End If
            tmpFileName=tmpFileName&Replace(F.Name,n&".","")
        End If
    Next
    Response.Write "<a onclick='liClick(this)' href='#' src='"&mp3FolderPath&n&"' sgIdx='"&i&"' sgFmts='"&tmpFileName&"'>"&Replace(n,"_"," ")&"</a>"
    i=i+1
Next

            %>
        </div></div>
    </div>
    <script type="text/javascript">
        //缓存
        function sNumber(num, key) {
            if (num !== null && num !== undefined) {
                localStorage.setItem(key, num.toString());
            }
            return localStorage.getItem(key) == null ||localStorage.getItem(key)== 'undefined' ? 0 : parseInt(localStorage.getItem(key));
        }
        function sCurIdx(curIdx) {
            return sNumber(curIdx, 'sellgirl_mediaPlayer_curIdx');
        }
        function sPlayMode(playMode) {
            return sNumber(playMode, 'sellgirl_mediaPlayer_playMode');
        }

        var medias = {};
        var curIdx = sCurIdx();//0;
        var playMode = sPlayMode()//0;//0为顺序播放
        function getPlayLis() {//获得播放列表li
            return document.getElementsByClassName('sellgirl_player_list_top')[0].children;
        }

        if (getPlayLis().length - 1 < curIdx) { curIdx = sCurIdx(0); }//当服务器中删除了视频文件时,当前idx可能已经太大了

        function setDefaultBg(oldSrc) {
            var lis = getPlayLis();
            for (var i = 0; i < lis.length; i++) {
                if (decodeURIComponent('./' + oldSrc.replace(window.location.href.replace(/[^\/]*$/, ''), '')) == lis[i].attributes.getNamedItem('src').nodeValue + '.' + lis[i].attributes.getNamedItem('sgFmts').nodeValue.split(',')[0]) {
                    lis[i].style.backgroundColor = '';// 'white';//如果加了白色,会挡住 a:hover时的背景色
                }
            }

        }
        function srcIsVideo(src) {
            var lcSrc = src.toLowerCase();
            //var formats = ['.mp4', '.ogg', '.mkv'];
            var formats = ['mp4', 'mkv'];//改为多source后--20180728
            for (var i = 0; i < formats.length; i++) {
                if (lcSrc.indexOf(formats[i]) > -1) { return true; }
            }
            return false;
        }
        function mediaIsStopped(media) {
            return media.ended || media.paused;
        }
        function createVideo(src,isVideo) {
            isVideo = (isVideo !== false);//默认true
            var oVideo = document.createElement(isVideo ? "video" : "audio");
            oVideo.autoplay = 'autoplay';
            oVideo.controls = 'controls';
            oVideo.className = 'classAudio';
            oVideo.autobuffer = 'autobuffer';
            //oVideo.src = src;
            oVideo.addEventListener('ended', function () {
                switch (playMode) {
                    case 0:
                        play(curIdx + 1);
                        break;
                    case 1:
                        play(curIdx);
                        break;
                    default:
                        break;
                }
            });
            return oVideo;
        }
        function liClick(li) {
            var idx = parseInt(li.attributes.getNamedItem('sgIdx').nodeValue);
            sCurIdx(idx);
            if (idx === curIdx && medias[idx]) {//当重播时
                if (!medias[idx].ended) { medias[idx].currentTime=0; }
                medias[idx].play();
                return;
            }

            var aus = document.getElementsByClassName('classAudio');
            var videoLayer = document.getElementsByClassName('videoLayer')[0];
            if (aus && aus.length > 0) {
                //setDefaultBg(aus[0].src);//iphone不支持此属性currentSrc
                setDefaultBg(aus[0].childNodes[0].src);//iphone不支持此属性currentSrc.改为多个source之后要用第一个子节点的url去找当前播放地址
                
                if (!mediaIsStopped(aus[0])) { aus[0].pause(); }
                if (!medias[curIdx]) { medias[curIdx] = aus[0]; }
                videoLayer.removeChild(aus[0]);
            }

            var src = li.attributes.getNamedItem('src').nodeValue;
            //debugger;
            //var isVideo = srcIsVideo(src);
            var isVideo = srcIsVideo(li.attributes.getNamedItem('sgFmts').nodeValue);//改为多source之后--20180728
            if (!medias[idx]) {
                medias[idx] = createVideo(src,isVideo);
            } else {
                if (isVideo) {//iphone上,如果不重新load的话,有时切换到不同格式时就会显示不了video的图像,没办法先加这句;华为手机上,即使load了也没用,视频直接停了,所以干脆重新创建element
                    var oldVideo = medias[idx];
                    medias[idx] = createVideo(src);
                    delete oldVideo;
                } else if (medias[idx].currentTime!=0) {
                    medias[idx].currentTime = 0;
                }
                if (mediaIsStopped(medias[idx])) { medias[idx].play(); }
            }
            //为了兼容多种浏览器，同时声称多个source节点--20180728var childs = f.childNodes; 
            var childs = medias[idx].childNodes;
            for (var i = childs.length-1; i >=0 ; i--) {
                medias[idx].removeChild(childs[i]);
            }
            var fmts = li.attributes.getNamedItem('sgFmts').nodeValue.split(',');
            for (var i = 0; i < fmts.length; i++) {
                var oSource = document.createElement("source");
                oSource.src = src +'.'+ fmts[i];
                oSource.type = 'audio/' + fmts[i];
                medias[idx].appendChild(oSource);
            }

            videoLayer.appendChild(medias[idx]);
            curIdx = idx;
            li.style.backgroundColor = 'lightblue';
        }
        function play(idx) {
            var lis = getPlayLis();
            if (!lis[idx]) { idx = 0 };
            liClick(lis[idx]);
        }
        function setPlayModelLabel(dom) {
            switch (playMode) {
                case 0:
                    dom.innerHTML = "&lt;Order Repeat&gt;";
                    break;
                case 1:
                    dom.innerHTML = "&lt;Single Repeat&gt;";
                    break;
                default:
                    break;
            }
        }

        var oldOnLoad = window.onload;
        window.onload = function () {
            if (oldOnLoad) { oldOnLoad();}
            liClick(getPlayLis()[curIdx]);
            setPlayModelLabel(document.getElementsByClassName('sellgirl_player_list_toolbar')[0].children[0]);
        }
        function nextPlayMode(dom) {
            playMode = playMode > 0 ? 0 : playMode + 1;
            sPlayMode(playMode);
            setPlayModelLabel(dom);
        }

    </script>