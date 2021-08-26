<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta charset="utf-8" />
    <title>My Songs</title>
    <!--<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=0.46, maximum-scale=0.46">-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta content="telephone=no" name="format-detection">
    <style>        
        .audioContainer {/*sellgirl_mp3Player.asp里生效*/
            position: absolute;
            z-index: 2;
        }
        .sellgirl_player_list {
            position: absolute;/*如果a用了float:left,一定要有这句才撑得开*/
        }
        .sellgirl_player_list_top a {
            float: left;/*在iphone中,如果没有这句,不会优先换行,但PC浏览器中没有这句也无区别*/
        }
    </style>
    <script  type="text/JavaScript"  src="script/jquery-1.7.1.min.js" ></script>
    <script type="text/javascript" src="http://sellgirl.com/Content/js/sellgirl/EleResize.js"></script>
    <script type="text/javascript" src="http://sellgirl.com/Content/js/sellgirl/sellgirl.js"></script>
    <!--<script type="text/javascript" src="http://192.168.1.52:19005/Content/js/sellgirl/EleResize.js"></script>
    <script type="text/javascript" src="http://192.168.1.52:19005/Content/js/sellgirl/sellgirl.js"></script>-->
    <script type="text/JavaScript"><!--
        $(function () {
            //背景图片
            sellgirl.backgroundImg(document.body, 'img/web_sasha_1920x1080_02.jpg', { w: 2300, h: 2300, s: { x: 0, y: 1150 }, e: { x: 2300, y: 1150 } });
        });
    //-->
    </script>

</head>
<body style="margin: 0px;">
    <!--<canvas id="h5Image" style="position:absolute;z-index:2;"></canvas>-->
        <%@  language="vbscript" codepage="65001" %>
    <%        
dim mp3FolderPath
        mp3FolderPath="./mp3/"
         %>
    <!--#include file="sellgirl_mediaPlayer.asp"-->
</body>
</html>
