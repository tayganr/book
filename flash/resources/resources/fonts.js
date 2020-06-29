var fontSize;

function increaseFontSize()
{
    fontSize = fontSize * 1.2;

    // Write/update a cookie to expire in one year.
    createCookie("plainTextFontSize", fontSize, 365);
    setFontSize(fontSize);
}

function decreaseFontSize()
{
    fontSize = fontSize / 1.2;

    // Write/update a cookie to expire in one year.
    createCookie("plainTextFontSize", fontSize, 365);
    setFontSize(fontSize);
}

function initFonts()
{
    fontSize = readCookie("plainTextFontSize");

    // If no cookie has bene found, start at 11pt.
    if (fontSize == null)
    {
        fontSize = 11;
    }
    setFontSize(fontSize);
}

function setFontSize(size)
{
    document.getElementById("plainTextBody").style.fontSize = size + "pt";
}

function createCookie(name,value,days)
{
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');

        for(var i=0;i < ca.length;i++) 
        {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
    
