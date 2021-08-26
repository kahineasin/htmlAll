<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta charset="utf-8" />
    <title>My Video</title>
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
</head>
<body style="margin: 0px;">
        <%@  language="vbscript" codepage="65001" %>
    <%        
dim mp3FolderPath
        mp3FolderPath="./video/"
         %>
    <!--#include file="sellgirl_mediaPlayer.asp"-->
</body>
</html>
