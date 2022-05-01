
var sellgirl = sellgirl || {};
sellgirl.html5 = sellgirl.html5 || {};
/*
* html5 虚线
*/
sellgirl.html5.dashedLine = function(ctx,x,y,x2,y2,dashArray)
    {
        var temp = 0.1;
        if (!dashArray)
            dashArray = [ 10, 5 ];
        var dashCount = dashArray.length;
        ctx.moveTo(x + temp, y + temp);

        var dx = (x2 - x), dy = (y2 - y);
        var slope = dx ? dy / dx : 1e15;
        var distRemaining = Math.sqrt(dx * dx + dy * dy);
        var dashIndex = 0, draw = true;
        while (distRemaining >= 0.1 && dashIndex < 10000)
        {
            var dashLength = dashArray[dashIndex++ % dashCount];
            if (dashLength == 0)
                dashLength = 0.001; // Hack for Safari
            if (dashLength > distRemaining)
                dashLength = distRemaining;
            var xStep = Math
					.sqrt(dashLength * dashLength / (1 + slope * slope));
            x += xStep;
            y += slope * xStep;
            ctx[draw ? 'lineTo' : 'moveTo'](x + temp, y + temp);
            distRemaining -= dashLength;
            draw = !draw;
        }
        // Ensure that the last segment is closed for proper stroking
        ctx.moveTo(0, 0);
    }