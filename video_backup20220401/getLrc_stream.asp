<%@Language="vbscript" Codepage="65001"%> 
<%
''创建一个xml的对象
    response.CharSet="utf-8"

    dim fileStr
        if Request.QueryString("level")="" then
            fileStr = Server.MapPath("./") & "/lrc/" & Request.QueryString("fileName") & ".lrc"
        else
            fileStr = Server.MapPath("./") & "/lrc/"&Request.QueryString("level")&"/" & Request.QueryString("fileName") & ".lrc"
        end if

Set fs=Server.CreateObject("Scripting.FileSystemObject")
If fs.FileExists(fileStr) Then 
    Set ccObjStream = Server.CreateObject("ADODB.Stream")
    With ccObjStream
    .Type = 2
    .Mode = 3
    .Open
    .Charset = "utf-8"
    .Position = ccObjStream.Size
    .LoadFromFile fileStr
    End With
    Response.Write ccObjStream.ReadText 
    ccObjStream.Close
end if
%> 