/*
 * Version: 31-05-2012
 */
function Lib() {}

Lib.FAKE_PREFIX = "fake__";
Lib.CURRENCY_DECIMAL_PLACES = 2;
Lib.SELECT_BLANK_ENTRY_DISPLAY_VALUE = "-- Select --";
Lib.DATA_TYPE_SENSITIVE_CLASS = 'dataTypeSensitive'; //there is no such css class. This is simply used for marking fields that are data type sensitive so they can be identified on the coach level

Lib.TYPE_STRING = 'String';
Lib.TYPE_INTEGER = 'Integer';
Lib.TYPE_DECIMAL = 'Decimal';
Lib.TYPE_BOOL = 'Boolean';

Lib.LOCALE = 'en_AU';

Lib.top = null;
Lib.left = null;
Lib.trackingScreenPos = false;

Lib.screenPos = function() {
    if (Lib.top != null)
        $(window).scrollTop(Lib.top);
    
    if (Lib.left != null)
        $(window).scrollLeft(Lib.left);
}

Lib.trackScreenPos = function() {
    if (Lib.trackingScreenPos == false) {
        $(window).scroll(function() {
            Lib.updateScreenPos();
        })
        Lib.trackingScreenPos = true;
    }
}

Lib.updateScreenPos = function() {
    Lib.left = $(window).scrollLeft();
    Lib.top = $(window).scrollTop();
}

/*
Author: Harry Lee
Returns date string in Gregorian format
*/
Lib.toGregorianFormat = function(date) {
    var y;
    var m;
    var d;
    
    y = date.getFullYear();
    m = date.getMonth() + 1;
    d = date.getDate();
    
    m = (m < 10 ? '0' + m : m);
    d = (d < 10 ? '0' + d : d);
    
    return y + '-' + m + '-' + d;
}

/**
 * Disables the element and all of its children elements
 * @author: Harry Lee
 */
Lib.disable = function(elementId) {
    $('#' + elementId).prop('disabled', true).prop('readonly', false).addClass('disabled').removeClass('readonly');
    $('#' + elementId).find(':input').prop('disabled', true).prop('readonly', false).addClass('disabled').removeClass('readonly');
}

/**
 * Enables the element and all of its children elements
 * @author: Harry Lee
 */
Lib.enable = function(elementId) {
    $('#' + elementId).prop('disabled', false).prop('readonly', false).removeClass('disabled readonly');
    $('#' + elementId).find(':input').prop('disabled', false).prop('readonly', false).removeClass('disabled readonly');
}

/**
 * Makes readonly the element and all of its children elements
 * @author: Harry Lee
 */
Lib.readonly = function(elementId) {
    $('#' + elementId).prop('readonly', true).prop('disabled', false).addClass('readonly').removeClass('disabled');
    $('#' + elementId).find(':input').prop('readonly', true).prop('disabled', false).addClass('readonly').removeClass('disabled');
}

/**
 * Takes numeric data type or string (will convert to a number) then round to a predetermined number of dec places. Returns a float
 * @author: Harry Lee
 */
Lib.currency = function(val) {
    val = parseFloat(val);
    var v = new Number(val);
    return parseFloat(val.toFixed(Lib.CURRENCY_DECIMAL_PLACES));
}

/**
 * Takes numeric data type or string (will convert to a number) then round to a given number of dec places. Returns a float
 * @author: Harry Lee
 */
Lib.decimalPlaces = function(val, decimalPlaces) {
    val = parseFloat(val);
    var v = new Number(val);
    return parseFloat(val.toFixed(decimalPlaces));
}

/**
 * Use this to get a javascript number type out of a textfield that is expecting to hold numeric data. If data in textfield is 1,000 this function will return 1000 (number type)
 * @example Lib.integer(textfield.value)
 * @author: Harry Lee
 */
Lib.integer = function(value) {
    var num;
    
    //remove any commas that exists
    value += ''; //make it a string
    num = value.replace(/\,/g, '');
    num = num.replace(/\ /g, '');
    
    //if there's a decimal point, get only everything before the point
    var temp = num.split('.');
    num = temp[0];
    
    if (num == '') //isNaN('') or isNaN(' ') or isNaN('  '), etc, == false (strange indeed!)
        return 0;
    
    if (isNaN(num))
        return null;
    
    return Number(num);
}

/**
 * Use this to get a javascript number type out of a textfield that is expecting to hold numeric data. If data in textfield is 1,000 this function will return 1000 (number type)
 * @example Lib.decimal(textfield.value)
 * @author: Harry Lee
 */
Lib.decimal = function(value) {
    var num;
    
    //remove any commas that exists
    value += ''; //make it a string
    num = value.replace(/\,/g, '');
    num = num.replace(/\ /g, '');
    
    if (num == '') //isNaN('') or isNaN(' ') or isNaN('  '), etc, == false (strange indeed!)
        return 0;
    
    if (isNaN(num))
        return null;
    
    return Number(num);
}

/**
 * Why do we need this? Sometimes certain integer or decimal fields cause the process to crash with an error like "Internal Script error: com.lombardisoftware.core.TeamWorksRuntimeException: String "14,000" cannot be converted to "Decimal" type. The value is not double."
 * If this happens, call this function in a coach's onLoad function. This function will set to false the isnumeric attribute of all numeric fields. This appears to stop the error from happening and does not appear to produce any consequence.
 * @author: Harry Lee
 */
Lib.setAllIsNumericFalse = function() {
    $(':text[isnumeric=true]').each(function(index, element) {
        var e = $('#' + element.id);
        e.attr('isnumeric', 'false');
    });
}

/**
 * Used by dateFormat function. See dateFormat function.
 * @author: Harry Lee
 */
Lib.dateFormatInterpret = function(dateObj, formatChar) {
    var DAY_NAMES = new Array(7);
    var MONTH_NAMES = new Array(12);
    DAY_NAMES[0] = "Sun";
    DAY_NAMES[1] = "Mon";
    DAY_NAMES[2] = "Tue";
    DAY_NAMES[3] = "Wed";
    DAY_NAMES[4] = "Thu";
    DAY_NAMES[5] = "Fri";
    DAY_NAMES[6] = "Sat";
    
    MONTH_NAMES[0] = "Jan";
    MONTH_NAMES[1] = "Feb";
    MONTH_NAMES[2] = "Mar";
    MONTH_NAMES[3] = "Apr";
    MONTH_NAMES[4] = "May";
    MONTH_NAMES[5] = "Jun";
    MONTH_NAMES[6] = "Jul";
    MONTH_NAMES[7] = "Aug";
    MONTH_NAMES[8] = "Sep";
    MONTH_NAMES[9] = "Oct";
    MONTH_NAMES[10] = "Nov";
    MONTH_NAMES[11] = "Dec";

    switch (formatChar) {
        case "y":
            return dateObj.getYear();
            break;
        case "Y":
            return dateObj.getFullYear();
            break;
        case "d":
            if (dateObj.getDate() < 10)
                return "0" + dateObj.getDate();
            else
                return dateObj.getDate();
            break;
        case "n":
            return dateObj.getMonth() + 1;
            break;
        case "m":
            if (dateObj.getMonth() < 10)
                return "0" + (dateObj.getMonth() + 1);
            else
                return dateObj.getMonth() + 1;
            break;
        case "M":
            return MONTH_NAMES[dateObj.getMonth()];
            break;
        case "j":
            return dateObj.getDate();
            break;
        case "D":
            return DAY_NAMES[dateObj.getDay()];
            break;
        default:
            return formatChar;
            break;
    }
}

/*
Function: dateFormat(dateObj, formatStr)
Author: Harry Lee
Returns a date in string form according to the format given. Only a limited format is available at this time:
Format char     Desc                                                        E.g.
d               Day of the month, 2 digits with leading zeros               01 to 31
D               A textual representation of a day, three letters            Mon through Sun
j               Day of the month without leading zeros                      1 to 31
m               Numeric representation of a month, with leading zeros       01 through 12
M               A short textual representation of a month, three letters    Jan through Dec
n               Numeric representation of a month, without leading zeros    1 through 12
Y               A full numeric representation of a year, 4 digits           Examples: 1999 or 2003
y               A two digit representation of a year                        Examples: 99 or 03
*/
Lib.dateFormat = function(dateObj, formatStr) {
    result = "";
    
    for (var i=0; i < formatStr.length; i++)
    {
        result += dateFormatInterpret(dateObj, formatStr.charAt(i));
    }
    
    return result;
}

/**
 * This method exists because the main form on the coach does not have an ID we could use to quickly reference it.
 * @author Harry Lee
 */
Lib.getCoachFormId = function() {
    var $form = $('form[action="coach.lsw"]');
    
    if ($form.length == 0)
        return null;
    
    if ($form.prop('id') == '') {
        $form.prop('id', 'coachForm');
    }
    
    return $form.prop('id');
}



/**
 * Makes 1000000 into 1,000,000
 * @author Harry Lee
 */
Lib.currencyFormat = function(val) {
    var str = val + '';
    
    if (str.length < 4) {
        return str;
    }
    
    var count = 1;
    for (var index=str.length-1; index >= 1; index--) {
        if (count % 3 == 0) {
            var temp = str.substring(index);
            str = str.substring(0, index) + ',' + temp;
        }
        count++;
    }
    
    return str;
}

/**
 * Checks if an element is visible or not
 */
Lib.isVisible = function(obj)
{
    if (obj == document)
        return true
    
    if (!obj)
        return false
    
    if (!obj.parentNode)
        return false
    
    if (obj.style) {
        if (obj.style.display == 'none')
            return false
        if (obj.style.visibility == 'hidden')
            return false
    }
    
    //get the computed style for other browsers
    if (window.getComputedStyle) {
        var style = window.getComputedStyle(obj, "")
        if (style.display == 'none')
            return false
        if (style.visibility == 'hidden')
            return false
    }
    
    //Get computed style for internet explorer
    var style = obj.currentStyle
    if (style) {
        if (style['display'] == 'none')
            return false
        if (style['visibility'] == 'hidden')
            return false
    }
    
    return isVisible(obj.parentNode)
}

/**
 * Quickly adds a tooltip to an element
 * @author Harry Lee
 */
Lib.tooltip = function(ctrlId, content) {
    new dijit.Tooltip({
        connectId: [ctrlId],
        label: "<div style='text-align: left;'>" + content + "</div>"
    });
}

/**
 * Returns length of an associative array
 * @author Harry Lee
 */
Lib.assocArrayLength = function(assocArray) {
    var c = 0;
    
    for (var index in assocArray)
        c++;
    
    return c;
}

/**
 * Escape HTML entities in a string
 * @author Harry Lee
 */
Lib.escape = function(charsToReplace, str) {
    for (var i=0; i < charsToReplace.length; i++) {
        var c = str.charAt(i);
        
        switch(c) {
            case '<':
                str = str.replace(/</g,'&lt;');
                break;
            case '>':
                str = str.replace(/>/g,'&gt;');
                break;
            case '&':
                str = str.replace(/&/g,'&amp;');
                break;
            case '"':
                str = str.replace(/"/g,'&quot;');
                break;
        }
    }
    
    return str;
}

/**
 * Adds slashes before single and double quotes in a string
 * @author Harry Lee
 */
Lib.addSlashes = function(str) {
    str = str.replace(/["]/g, '\\"');
    str = str.replace(/[']/g, "\\'");
    return str;
}