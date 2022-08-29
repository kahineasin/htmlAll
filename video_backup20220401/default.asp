<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta charset="utf-8" />
    <%@  language="vbscript" codepage="65001" %>
    <%        
dim pageTitle
pageTitle="Princess Sasha's songs"
         %>
    <title><%Response.Write pageTitle %></title>
    <!--<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=0.46, maximum-scale=0.46">-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0" />
    <!--<meta name="viewport" content="initial-scale=1.0" />-->
<!--    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">-->
    <!--<meta content="telephone=no" name="format-detection">-->

    <script  type="text/JavaScript"  src="script/jquery-1.7.1.min.js" ></script>
    <script type="text/javascript" src="http://sellgirl.com/Content/js/sellgirl/EleResize.js"></script>
    <script type="text/javascript" src="script/flv.min.js"></script>
    <script type="text/javascript" src="http://sellgirl.com/Content/js/sellgirl/sellgirl.js"></script>
    <script  type="text/JavaScript"  src="script/pfUtil.js" ></script>
    <!--<script type="text/javascript" src="http://192.168.1.52:19005/Content/js/sellgirl/EleResize.js"></script>
    <script type="text/javascript" src="http://192.168.1.52:19005/Content/js/sellgirl/sellgirl.js"></script>-->
    <script type="text/javascript">
        $(function() {
            //背景图片
            //sellgirl.backgroundImg(document.body, 'img/web_sasha_1920x1080_02.jpg', { w: 2300, h: 2300, s: { x: 0, y: 1150 }, e: { x: 2300, y: 1150} }, { opacity: 0.5 }, { thumbnail: 'img/web_sasha_thumbnail.jpg' });
        });
    </script>

</head>
<body style="margin: 0px;">
    <!--<canvas id="h5Image" style="position:absolute;z-index:2;"></canvas>-->
    <%        
dim mp3FolderPath        
        if Request.QueryString("level")="" then
            mp3FolderPath="./video/"
        else
            mp3FolderPath="./video/"&Request.QueryString("level")+"/"
        end if
         %>
    <!--#include file="sellgirl_mediaPlayer.asp"-->
</body>
</html>
