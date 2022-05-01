<!--HTML5播放器,自动读取变量mp3FolderPath这个文件夹下的文件,自动识别是video还是audio,20180117-->
<link rel="stylesheet" type="text/css" href="./css/sellgirl_player_list.css">

<script type="text/javascript" src="script/html5media.min.js"></script>

<div class="audioContainer">
    <div class="videoLayer">
    </div>
    <div class="sellgirl_player_list_container">
        <div class="sellgirl_player_list">
            <div class="sellgirl_player_list_toolbar">
                <!-- <a style="clear: both" href="javascript:;"  onclick="return nextPlayMode(this)">&lt;Order Repeat&gt;</a> -->
                <a href="javascript:;" id="nextPlayModeBtn" >&lt;随机播放&gt;</a> <a href="javascript:;" id="playNextBtn"
                    >&lt;下一首&gt;</a> <a id="selectSongBtn" href="javascript:;"
                        >&lt;选歌...&gt;</a> <a href="javascript:;" id="nextLrcModeBtn"
                            >&lt;单行歌词...&gt;</a>
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
    Response.Write "<a  href='#' src='"&mp3FolderPath&n&"' sgIdx='"&i&"' sgFmts='"&tmpFileName&"'>"&Replace(n,"_"," ")&"</a>"
    i=i+1
Next

                %>
            </div>
        </div>
    </div>
    <br />
    <div class="sellgirl_player_lrcContainer">
        <ul id="lrclist" class="sellgirl_player_lrc">
            <!-- 保证歌词在正中间 -->
        </ul>
        <!-- <p>无歌词</p> -->
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function() {
        sellgirl.createMusicPlayer($('.audioContainer')).ready();
    });
</script>

