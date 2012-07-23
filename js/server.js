/*
 * server.js
 * Version: 04-06-2012
 * 
 * This file uses ScriptDoc for documentation. https://wiki.appcelerator.org/display/tis/ScriptDoc+(SDOC)+2.0+Specification
 * This file encapsulates functions within the 'Server' namespace. These functions are for server-side scripts in IBM BPM 
 * and are callable within IBM BPM service parameters, scripts, pre and post scripts.
 * Usage:
 * var date = Server.toGregorianFormat(someDate);
 */
function Server() {}

/*
 * START: Constants
 */
Server.CURRENCY_DECIMAL_PLACES = 2;

Server.CONTACT_REQUESTOR = 'Requestor';
Server.CONTACT_CUST_REP = 'Customer Rep';
Server.CONTACT_IBM_REP = 'IBM Rep';

Server.APPR_REQUIREMENTS = 'Requirements Approver';
Server.APPR_DELIVERY = 'Delivery Approver';
Server.APPR_CUST_REVIEW = 'Review Approver';
Server.APPR_LOCAL_PE = 'Local PE Approver';
Server.APPR_IBM_COUNTERSIGN = 'IBM Countersign Approver';
Server.APPR_TDA = 'TDA Approver';
Server.APPR_DPE = 'DPE Approver';
Server.APPR_RISK = 'Risk Approver';
Server.APPR_COMMERCIAL = 'Commercial Approver';
Server.APPR_PRICE = 'Price Approver';
Server.APPR_LEGAL = 'Legal Approver';
/*
 * END: Constants
 */

/**
 * Creates and returns a new Contact
 * @param {string} assignment
 * @param {string} name
 * @param {string} phone
 * @param {string} email
 * @author Harry Lee
 */
Server.newContact = function(assignment, name, phone, email) {
    var contact = new tw.object.Contact();
    contact.assignment = assignment;
    contact.name = name;
    contact.phone = phone;
    contact.email = email;
    
    return contact;
}

/**
 * Creates and returns a new Approver
 * @param {string} assignment
 * @param {string} contact
 * @param {string} date
 * @param {string} decision
 * @param {string} reason
 * @author Harry Lee
 */
Server.newApprover = function(assignment, contact, date, decision, reason) {
    var appr = new tw.object.Approver();
    appr.assignment = assignment;
    appr.contact = contact;
    appr.date = date;
    appr.decision = decision;
    appr.reason = reason;
    
    return appr;
}

/**
 * Creates and returns a new Comment
 * @param {Contact} contact
 * @param {Date} date
 * @param {String} content
 */
Server.newComment = function(contact, date, step, isPublic, content) {
    var c = new tw.object.Comment();
    c.contact = contact;
    c.date = date;
    c.step = step;
    c.isPublic = isPublic;
    c.content = content;
    
    return c;
}

/**
 * Use this to get a javascript number type out of a textfield that is expecting to hold numeric data. If data in textfield is 1,000 this function will return 1000 (number type)
 * @example: Server.integer(textfield.value)
 * @author Harry Lee
 */
Server.integer = function(value) {
    var num;
    
    //remove any commas that exists
    value += ''; //make it a string
    num = value.replace(/\,/g, '');
    num = num.replace(/\ /g, '');
    
    //if there's a decimal point, get only everything before the point
    var temp = num.split('.');
    num = temp[0];
    
    if (num == '') //isNaN('') or isNaN(' ') or isNaN('  '), etc, == false (strange indeed!)
        return null;
    
    if (isNaN(num))
        return null;
    
    return Number(num);
}

/**
 * Use this to get a javascript number type out of a textfield that is expecting to hold numeric data. If data in textfield is 1,000 this function will return 1000 (number type)
 * @example: Server.decimal(textfield.value)
 * @author Harry Lee
 */
Server.decimal = function(value) {
    var num;
    
    //remove any commas that exists
    value += ''; //make it a string
    num = value.replace(/\,/g, '');
    num = num.replace(/\ /g, '');
    
    if (num == '') //isNaN('') or isNaN(' ') or isNaN('  '), etc, == false (strange indeed!)
        return null;
    
    if (isNaN(num))
        return null;
    
    return Number(num);
}

/**
 * The following function returns the description of a code from Name value pair List
 * @param {} codeList       Name-Value Pair list (Name = description , value = code)
 * @param {} code           The code that needs to be translated
 * @param {} description    Name returned from the list. If not found it returns value  "Description not found"
 * @return {} 
 * @example description = returnDescription(code, codeList);
 * @author Raj Mehra
 */ 
Server.returnDescription = function(code, codeList) {
 
    var j = 0;
    while (j < codeList.length){         
        if (code == codeList[j].value) return codeList[j].name;
        j++;
    }
    return "Description not found";
}


/**
 * Return the number of whole days between two dates
 * @param {TWDate} startDate
 * @param {TWDate} endDate
 * @return {integer} days
 * @example 
 * @author Raj Mehra
 */
Server.getDaysBetween = function(startDate, endDate) {
    //Returns number of days between to dates.
    var millisecondsPerDay = 86400000; // Day in milliseconds
    var dStart = new TWDate();
    dStart.setFullYear(startDate.getFullYear());
    dStart.setMonth(startDate.getMonth());
    dStart.setDate(startDate.getDate());
    dStart.setHours(0);  // Start just after midnight
    var dEnd = new TWDate();
    dEnd.setFullYear(startDate.getFullYear());
    dEnd.setMonth(startDate.getMonth());
    dEnd.setDate(startDate.getDate());
    dEnd.setHours(23);  // End just before midnight
    var diff = endDate - startDate;  // Milliseconds between datetime objects    
    return Math.ceil(diff / millisecondsPerDay);
};


/**
 * Return the number of whole week days between two dates. If both days are the same return 1
 * @param {TWDate} startDate
 * @param {TWDate} endDate
 * @return {integer} days
 * @author Raj Mehra
 */
Server.workingDaysBetweenDates = function(startDate, endDate) {
//Calculates business days between two dates (minus weekends)
    
    // Calculate days between dates
    var millisecondsPerDay = 86400000; // Day in milliseconds
    var dStart = new TWDate();
    dStart.setFullYear(startDate.getFullYear());
    dStart.setMonth(startDate.getMonth());
    dStart.setDate(startDate.getDate());
    dStart.setHours(0);  // Start just after midnight
    var dEnd = new TWDate();
    dEnd.setFullYear(startDate.getFullYear());
    dEnd.setMonth(startDate.getMonth());
    dEnd.setDate(startDate.getDate());
    dEnd.setHours(23);  // End just before midnight
    var diff = endDate - startDate;  // Milliseconds between datetime objects    
    var days = Math.ceil(diff / millisecondsPerDay);

    if (days == 1) return 1;
    
    // Subtract two weekend days for every week in between
    var weeks = Math.floor(days / 7);
    var days = days - (weeks * 2);

    // Handle special cases
    var startDay = startDate.getDay();
    var endDay = endDate.getDay();
    
    // Remove weekend not previously removed.   
    if (startDay - endDay > 1)         
        days = days - 2;      
    
    // Remove start day if span starts on Sunday but ends before Saturday
    if (startDay == 0 && endDay != 7)
        days = days - 1  
            
    // Remove end day if span ends on Saturday but starts after Sunday
    if (endDay == 7 && startDay != 0)
        days = days - 1  
    
    return days-1;
}


/**
 * Return a new Date object that has the specified number of week days added to an initial date
 * @param {integer} d       number of week days to add
 * @param {TWDate} theDate  original date
 * @return {TWDate} nDate   new Date incremented by d week days
 * @author Raj Mehra
 */
Server.addWeekDays = function(d, theDate) {
        var cal1 = new java.util.GregorianCalendar(
        theDate.getFullYear(),
        theDate.getMonth(),
        theDate.getDate());
    
    var day = theDate.getDay()-1;    //weekday number 2 through 6
    var wkEnd = 0;              //number of weekends needed
    var m = d % 5;              //number of weekdays for partial week
    if (d < 0) {
        wkEnd = Math.ceil(d/5);        //Yields a negative number of weekends
        switch (day) {
        case 6:
            if (m == 0 && wkEnd < 0) wkEnd++;
            break;
        case 0:
            if (m == 0)
                d++    //decrease - part of weekend
            else
                d--;    //increase - part of weekend
            break;
        default:
            if (m <= -day) wkEnd--; //add weekend if not enough days to cover
        }
    }
    else if (d > 0) {
        wkEnd = Math.floor(d/5);
        switch (day) {
        case 6:
            if (m == 0)
                d--
            else 
                d++;
            break;
        case 0:
            if (m == 0 && wkEnd > 0) wkEnd--;
            break;
        default:
            if (5 - day < m) wkEnd++;
        }
    }
    d += wkEnd * 2;
    
    cal1.add(java.util.Calendar.DATE, d);
    var nDate = new tw.object.Date();
    nDate.setMilliseconds(0);
    nDate.setFullYear(cal1.get(java.util.Calendar.YEAR));
    nDate.setMonth(cal1.get(java.util.Calendar.MONTH));
    nDate.setDate(cal1.get(java.util.Calendar.DAY_OF_MONTH));
    nDate.setHours(cal1.get(java.util.Calendar.HOUR));
    nDate.setMinutes(cal1.get(java.util.Calendar.MINUTE));
    nDate.setSeconds(cal1.get(java.util.Calendar.SECOND));
    return nDate;
}


/**
 * Takes numeric data type or string (will convert to a number) then round to a predetermined number of dec places. Returns a float
 * @param {number,string} val
 * @param {integer} decimalPlaces
 * @return {float} 
 * @example var v = Server.precision('123.456', 2);
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.precision = function(val, decimalPlaces) {
    val = parseFloat(val);
    var v = new Number(val);
    return parseFloat(val.toFixed(decimalPlaces));
}


/**
 * Takes numeric data type or string (will convert to a number) then round to a predetermined number of dec places. Returns a float
 * @param {number,string} val 
 * @return {float} 
 * @example var v = Server.currency('123.456');
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.currency = function(val) {
    return precision(val, Server.CURRENCY_DECIMAL_PLACES);
}


/**
 * Takes numeric data type and optional seperators with a precision. E.g. 25 -> $ 25.00. Returns a string
 * @param {number} number
 * @param {string} decimalSeparator
 * @param {string} thousandsSeparator
 * @param {number} nDecimalDigits
 * @return {string} 
 * @example 25 -> $ 25.00
 * @author Mark Connell
 */
Server.numberToCurrency = function(number, decimalSeparator, thousandsSeparator, nDecimalDigits){
    //default values
    decimalSeparator = decimalSeparator || '.';
    thousandsSeparator = thousandsSeparator || ',';
    nDecimalDigits = nDecimalDigits == null? 2 : nDecimalDigits;

    var fixed = number.toFixed(nDecimalDigits), //limit/add decimal digits
        parts = new RegExp('^(-?\\d{1,3})((?:\\d{3})+)(\\.(\\d{'+ nDecimalDigits +'}))?$').exec( fixed ); //separate begin [$1], middle [$2] and decimal digits [$4]

    if(parts){ //number >= 1000 || number <= -1000
        return "$ " + parts[1] + parts[2].replace(/\d{3}/g, thousandsSeparator + '$&') + (parts[4] ? decimalSeparator + parts[4] : '');
    }else{
        return "$ " + fixed.replace('.', decimalSeparator);
    }
}


/**
 * Formats a number to 3-number-comma-seperated format. E.g. '120000' -> '120,000'
 * @param {number,string} val 
 * @return {string} 
 * @example var v = Server.currencyFormat(120000);
 *          var v = Server.currencyFormat('120000');
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.currencyFormat = function(val) {
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
 * Calculates a non-inclusive difference in days between two dates
 * @param {Date} date1
 * @param {Date} date2
 * @return {integer} 
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.daysBetweenDates = function(date1, date2) {
    var msInADay = 1000 * 60 * 60 * 24;
    var ms1 = date1.getTime();
    var ms2 = date2.getTime();
    var msDiff = Math.abs(ms1 - ms2);
    
    return Math.round(msDiff / msInADay);
}


/**
 * Returns date string in Gregorian format (date only)
 * @param {Date} date 
 * @return {string} 
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.toGregorianFormat = function(date) {
    var yr;
    var mth;
    var day;
    
    yr = date.getFullYear();
    mth = date.getMonth() + 1;
    day = date.getDate();
    
    mth = (mth < 10 ? '0' + mth : mth);
    day = (day < 10 ? '0' + day : day);
    
    return yr + '-' + mth + '-' + day;
}


/**
 * Returns date string in Gregorian format (date and time)
 * @param {Date} date
 * @return {string} 
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.toGregorianDateTime = function(date) {
    var yr;
    var mth;
    var day;
    var hr;
    var min;
    var sec;
    
    yr = date.getFullYear();
    mth = date.getMonth() + 1;
    day = date.getDate();
    hr = date.getHours();
    min = date.getMinutes();
    sec = date.getSeconds();
    
    mth = (mth < 10 ? '0' + mth : mth);
    day = (day < 10 ? '0' + day : day);
    hr = (hr < 10 ? '0' + hr : hr);
    min = (min < 10 ? '0' + min : min);
    sec = (sec < 10 ? '0' + sec : sec);
    
    return yr + '-' + mth + '-' + day + ' ' + hr + ':' + min + ':' + sec;
}


/**
 * Gets a Contact in contacts (array of contacts) that has supplied assignment; otherwise return null.
 * @param {string} assignment
 * @param {Contact[]} contacts
 * @return {Contact} 
 * @example var v = Server.getContact('Customer Rep', contacts);
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.getContact = function(assignment, contacts) {
    for (var i=0; i < contacts.length; i++) {
        if (contacts[i].assignment == assignment) {
            return contacts[i];
        }
    }
    
    return null;
}


/**
* Replaces a Contact in contacts (array of contacts) with the same assignment property; otherwise adds the Contact to the array
* @param {Contact} contact
* @param {Contact[]} contacts
* @author Harry Lee harrylmh@au.ibm.com
*/
Server.setContact = function(contact, contacts) {
    for (var i=0; i < contacts.length; i++) {
        if (contacts[i].assignment == assignment) {
            contacts[i] = contact;
            return;
        }
    }
    
    contacts.insertIntoList(contacts.length, contact);
    return;
}


/**
 * Get a subset of an array of approvers that matches the assignments
 * @param {string[]} assignments
 * @param {Approver[]} approvers
 * @return {Approver[]} subset of approvers
 * @example var myApprovers = Server.getApprovers(new Array('Legal Approver', 'Customer Approver'), approvers);
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.getApprovers = function(assignments, approvers) {
    var returnValues = new tw.object.arrayOf.Approver();
    
    for (var i=0; i < assignments.length; i++) {
        
        for (var j=(approvers.length - 1); j >= 0; j--) { //search backwards because we want the latest approver of that assignment type
            if (approvers[j].assignment == assignments[i]) {
                returnValues.insertIntoList(returnValues.length, approvers[j]);
                break;
            }
        }
    }
    
    return returnValues;
}


/**
 * Get an approver from an array of approvers that matches the assignment. Else returns null.
 * @param {string, Date} assignments
 * @param {Approver[]} approvers
 * @return {Approver} Approver object
 * @example var myApprovers = Server.getApprover('Legal Approver', approvers);
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.getApprover = function(assignment, approvers) {
    for (var j=(approvers.length - 1); j >= 0; j--) { //search backwards because we want the latest approver of that assignment type
        if (approvers[j].assignment == assignment) {
            return approvers[j];
        }
    }
    
    return null;
}


/**
 * Adds an array of new approvers to a primary array of approvers
 * @param {string, Date} assignments
 * @param {listOf.Approver} approvers
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.addApprovers = function(newApprovers, approvers) {
    for (var i=0; i < newApprovers.listLength; i++) {
        approvers.insertIntoList(approvers.length, newApprovers[i]);
    }
}


/**
 * Add an approver to an array of approvers
 * @param {Approver} newApprover
 * @param {listOf.Approver} approvers
 * @author Harry Lee harrylmh@au.ibm.com
 */
Server.addApprover = function(newApprover, approvers) {
    approvers.insertIntoList(approvers.length, newApprover);
}

Server.parseVirtualData = function(virtualDataStr, virtualBindings) {
    var assignments = virtualDataStr.split('>');
    
    for (var i=0; i < assignments.length; i++) {
        var side = assignments[i].split('<');
        var binding = side[0];
        var val = side[1];
        var bindingType = null;
        
        //check if binding is in virtualBindings
        for (var z=0; z < virtualBindings.length; z++) {
            if (virtualBindings[z].name == binding) {
                bindingType = virtualBindings[z].value;
                break;
            }
        }
        
        if (bindingType == null)
            continue;
        
        Server.safeAssign(binding, val, bindingType);
    }
}

Server.safeAssign = function(binding, val, datatype) {
    switch(datatype) {
        case 'String':
            var extractions = Server.extract(val);
            val = Server.escape(val);
            val = Server.removeRestrictedChars(val);
            eval( binding + ' = \"' + val + '\";' );
            
            eval(binding + " = Server.reinsert(" + binding + ", extractions);" );
            
            eval(binding + " = Server.unescape(" + binding + ");");
            break;
        case 'Integer':
            break;
        case 'Decimal':
            break;
        case 'Boolean':
            break;
    }
    
    Server.reinsert(val, e);
}

/**
 * Extract ., =, (, ), {, and } into a registry in the form of an array [[char,index], [';',25]]
 */
//we 
Server.extract = function(str) {
    var extractions = new Array();
    
    for (var i=0; i < str.length; i++) {
        var c = str.charAt(i);
        
        switch (c) {
            case '.':
            case '=':
            case '(':
            case ')':
            case '{':
            case '}':
                extractions.push(new Array(c, i));
                break;
        }
    }
    
    return extractions;
}

Server.removeRestrictedChars = function(str) {
    return str.replace(/[.=(){}]/g, '');
}

/**
 * To ensure each extracted character gets inserted accurately into their former position, we must insert from the back of the string and work our way to the front since the string will only get longer and this might screw up positioning
 */
Server.reinsert = function(str, extractions) {
    for (var i=0; i < extractions.length; i++) {
        var chr = extractions[i][0];
        var index = extractions[i][1];
        str = Lib.insert(str, chr, index);
    }
    
    return str;
}

Server.insert = function(str, chr, index) {
    return str.substring(0, index) + chr + str.substring(index);
}

Server.addSlashes = function(str) {
    str = str.replace(/["]/g, '\\"');
    str = str.replace(/[']/g, "\\'");
    return str;
}

Server.escape = function(str) {
    return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
}

Server.unescape = function(str) {
    return str.replace(/[&quot;]/g,'"').replace(/[&amp;]/g,'&');
}

/**
 * Adds a new comment into the comments array
 * @param {Comment} newComment
 * @param {Comment[]} comments
 * @author Harry Lee
 */
Server.addComment = function(newComment, comments) {
    comments.insertIntoList(comments.length, newComment);
}

Server.getComments = function(comments, options) {
    if (typeof options == 'undefined' || options == null) {
        options = {
            isPublic:true,
            isPrivate:false
        };
    }
    
    var commentsCollection = new tw.object.arrayOf.Comment();
    
    for (var i=0; i < comments.length; i++) {
        if ((comments[i].isPublic == true && options['isPublic'] == true) || (comments[i].isPublic == false && options['isPrivate'] == true)) {
            commentsCollection.insertIntoList(commentsCollection.length, comments[i]);
        }
    }
    
    return commentsCollection;
}

/**
 * This function converts a server-based object array to a data string that can be intepreted by the client (browser) as a client-based object array
 */
Server.serverArrayToClientArray = function(clientVarName, dataType, serverArray) {
    var returnStr = '';// 'var ' + clientVarName + ' = new Array();';
    
    switch (dataType) {
        case 'Comment':
            for (var i=0; i < serverArray.length; i++) {
                var name = Server.addSlashes(serverArray[i].contact.name);
                var phone = Server.addSlashes(serverArray[i].contact.phone);
                var email = Server.addSlashes(serverArray[i].contact.email);
                var step = Server.addSlashes(serverArray[i].step);
                var content = Server.addSlashes(serverArray[i].content);
                var date = serverArray[i].date;
                returnStr += clientVarName + '.push( new View.Comment("' + name + '", "' + phone + '", "' + email + '", "' + date + '", "' + step + '", "' + content + '") );'
            }
            break;
    }
    
    return returnStr;
}

/*
var e = Lib.extract(".s.o;m=e(t)h{ing}");
s2 = Lib.removeRestrictedChars(".s.o;m=e(t)h{ing}");
Lib.reinsert(s2, e);
*/