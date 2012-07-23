/*
 * Version: 15-05-2012
 */
Lib.Cookie = function() {}

/* ============================================================================================================================= */
/* START: Screen Position Restorer and Cookie Functions */
/* Repositions the scroll position of a reloaded page to be the same as that before clicking Add Row button or Delete link of a table */
/* Usage: Lib.Cookie.restoreScreenPosition(); //Must be in window.onload. Cannot work if just $(document).ready() */
/*
    e.g.:
    var f = window.onload;
    window.onload = function() {
        f();
        Lib.Cookie.restoreScreenPosition();
    }
*/
/* ============================================================================================================================= */
Lib.Cookie.COOKIE_SCROLL_POS_NAME = 'scrollPos';
//We want the cookie for a page to only be used for that page. Therefore we need to the Lib.Cookie.lombardiTaskId which changes from one activity to another. However, there
//is also the case where a single human service would contain multiple coaches. As the user goes from one to another, the task ID would still be the same. Therefore,
//we need the Lib.Cookie.lombardiComponentId. A combination of these two variables will ensure we can uniquely differentiate one page from another
Lib.Cookie.lombardiTaskId = null;
Lib.Cookie.lombardiComponentId = null;

/*
Author: Harry Lee
*/
Lib.Cookie.setScrollPosInCookie = function() {
    var x = $(window).scrollLeft();
    var y = $(window).scrollTop();
    
    var value = x + ',' + y;
    Lib.Cookie.setCookie(Lib.Cookie.COOKIE_SCROLL_POS_NAME, value, 100);
}

/*
Author: Harry Lee
*/
Lib.Cookie.updateScrollPos = function() {
    var top = Lib.Cookie.getScrollTopFromCookie();
    $(window).scrollTop(top);
}

/*
Author: Harry Lee
*/
Lib.Cookie.getScrollLeftFromCookie = function() {
    var val = Lib.Cookie.getCookie(Lib.Cookie.COOKIE_SCROLL_POS_NAME);
    
    if (val == null)
        return 0;
    
    return Number(val.split(',')[0]);
}

/*
Author: Harry Lee
*/
Lib.Cookie.getScrollTopFromCookie = function() {
    var val = Lib.Cookie.getCookie(Lib.Cookie.COOKIE_SCROLL_POS_NAME);
    
    if (val == null)
        return 0;
    
    return Number(val.split(',')[1]);
}

/*
Author: Harry Lee
*/
Lib.Cookie.setCookie = function(cookieName, value, expiryDays)
{
    var expiryDate;
    var cookieValue;
    
    value = value + ''; //make it a string
    
    expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    cookieValue = escape(value) + ((expiryDays == null) ? "" : ";expires=" + expiryDate.toUTCString());
    
    document.cookie = cookieName + "=" + cookieValue;
}

Lib.Cookie.getCookieValue = function(cookieName) {
    return Lib.Cookie.getCookie(cookieName);
}

/*
Author: Harry Lee
*/
Lib.Cookie.getCookie = function(cookieName)
{
    var name, val;
    var cookies;
    
    cookies = document.cookie.split(";");
    
    for (var i=0; i < cookies.length; i++)
    {
        name = cookies[i].substr(0, cookies[i].indexOf("="));
        name = name.replace(/^\s+|\s+$/g, "");
        
        if (name == cookieName)
        {
            val = cookies[i].substr(cookies[i].indexOf("=") + 1);
            return unescape(val);
        }
    }
    
    return null;
}

/*
Author: Harry Lee
*/
Lib.Cookie.deleteCookie = function(cookieName) {
    Lib.Cookie.setCookie(cookieName, 0, -1);
}

/*
Author: Harry Lee
*/
Lib.Cookie.getUrlVars = function()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/*
Author: Harry Lee
*/
Lib.Cookie.makeUniqueCookieName = function(prefix) {
    //We want to get the task ID from the URL (e.g. http://au04vap003tr282:9080/teamworks/fauxRedirect.lsw?applicationInstanceId=guid%3Af1e1cb53ea1bfa7f%3A-8e6ae7b%3A135b3eb3656%3A-7ffe&zWorkflowState=2&zTaskId=t8103&applicationId=2&zComponentName=Coach&zComponentId=3003.2c34e278-e9ca-49dd-9002-497700afaa55&zDbg=0)
    Lib.Cookie.lombardiTaskId = Lib.Cookie.getUrlVars()["zTaskId"];
    Lib.Cookie.lombardiComponentId = Lib.Cookie.getUrlVars()["zComponentId"];
    return prefix + '_' + Lib.Cookie.lombardiTaskId + '_' + Lib.Cookie.lombardiComponentId;
}

/*
Author: Harry Lee
Call this in an onLoad function
*/
Lib.Cookie.restoreScreenPosition = function() {
    Lib.Cookie.COOKIE_SCROLL_POS_NAME = Lib.Cookie.makeUniqueCookieName(Lib.Cookie.COOKIE_SCROLL_POS_NAME);
    
    $('.layoutButton[name^="_ADD_ROW_"],[name^="_DELETE_ROW_"]').click(function() { Lib.Cookie.setScrollPosInCookie(); });
    $('.layoutButton').not('[name^="_ADD_ROW_"],[name^="_DELETE_ROW_"]').click(function() { Lib.Cookie.deleteCookie(Lib.Cookie.COOKIE_SCROLL_POS_NAME); });
    
    $(window).scrollTop(Lib.Cookie.getScrollTopFromCookie());
    $(window).scrollLeft(Lib.Cookie.getScrollLeftFromCookie());
}
/* ============================================================================================================================= */
/* END: Screen Position Restorer and Cookie Functions*/
/* ============================================================================================================================= */