/*
 * Version: 12-06-2012
 */
Lib.Etc = function() {}

/* ============================================================================================================================= */
/* START: Export Table(s) to CSV File */
/* Author: Harry Lee */
/*
    The following functions include a wrap-around and editions to the solution found on:
    http://wiki.lombardi.com/display/commwiki/Coach+Table+Excel+Export+Example
    
    Wrap-around and editions solves the following issue(s):
    - difficulties having more than one export link on a coach that exports different tables
    
    Usage:
    Paste into a custom HTML control:
        <script_>Lib.Etc.exportCSVLink(<tableIds>, <fileName>);</script_>
        Example: <script_>Lib.Etc.exportCSVLink('carTable,truckTable', 'export.csv');</script_>
    or
    Simply insert the following code into a custom HTML control, then replace tableIds with a comma-seperated (no spaces) string of table IDs you want that link to export.
        <a href="javascript: void(0);" onclick="javascript: Lib.Etc.doSubmitExport(<tableIds>, <fileName>)"><img src="/portal/jsp/images/reporting/enabled/export_16x16.gif" align="left">Export</a>
        Example: <a href="javascript: void(0);" onclick="javascript: Lib.Etc.doSubmitExport('carTable,truckTable', 'export.csv')"><img src="/portal/jsp/images/reporting/enabled/export_16x16.gif" align="left">Export</a>
*/
/* ============================================================================================================================= */
Lib.Etc.dataFormInserted = false;
Lib.Etc.b = "";

Lib.Etc.exportCSVLink = function(tableIdsToExport, fileName) {
    document.write('<a href="javascript: void(0);" onclick="javascript: Lib.Etc.doSubmitExport(\'' + tableIdsToExport + '\', \'' + fileName + '\')"><img src="/portal/jsp/images/reporting/enabled/export_16x16.gif" align="left">Export</a>');
}


Lib.Etc.doSubmitExport = function(tableIdsToExport, fileName) {
    var tableArr = tableIdsToExport.split(",");
    
    if (Lib.Etc.dataFormInserted == false) {
        Lib.Etc.dataFormInserted = true;
        
        var form = document.createElement('div');
        form.innerHTML = '<form name="exportData" method="post" target="_new" action="data-redirect.jsp"><input type="hidden" name="contentType" value="text/csv"><input type="hidden" name="data" value=""><input id="exportFileName" type="hidden" name="fileName" value="filename=' + fileName + '"></form>';
        //Work around a bug in IE: http://support.microsoft.com/default.aspx/kb/927917
        document.getElementsByTagName("H1")[0].appendChild(form);
    }
    
    //set the filename
    document.getElementById('exportFileName').value = 'filename=' + fileName;
    //reset the data
    document.forms.exportData.data.value = '';
    
    
    for (var i=0;i<tableArr.length;i++) {
        addTableToCSV(tableArr[i]);
    }
    document.forms["exportData"].submit();
}

// a comma delimited list of the ids of the tables that you want to include in the excel export
Lib.Etc.addExportData = function(csvTable) {
    if (document.forms.exportData == null || document.forms.exportData.data == null) {
        return;
    }
    document.forms.exportData.data.value = document.forms.exportData.data.value + "\n\n" + csvTable;  
}

Lib.Etc.replaceTag = function(regexInput, inputString, replValue) {
    var re = new RegExp(regexInput, "g");
    Lib.Etc.b = inputString.replace(re, replValue);
}

Lib.Etc.addTableToCSV = function(tableId) {
    var table;

    try {
    table = document.getElementById(tableId);

    var a = table.innerHTML;

    //replace existing commas with semi-colons. Poor mans way of handling embedded commas in a csv file
    a = a.replace(/,/g, ";");

    //insert commas at the end of a table cell
    a = a.replace(/<\/td>/g, ",");
    a = a.replace(/<\/TD>/g, ",");
    a = a.replace(/<\/th>/g, ",");
    a = a.replace(/<\/TH>/g, ",");

    //insert a newline tag at the end of every row. Need to do this before removing all tags
    a = a.replace(/<\/tr>/g, "---newline---");
    a = a.replace(/<\/TR>/g, "---newline---");

    //remove whitespace (regexs found via google)  
    // This is required otherwise java script replace does not work properly
    a = a.replace(/\r/g, " ");
    a = a.replace(/[^ A-Za-z0-9`~!@#\$%\^&\*\(\)-_=\+\\\|\]\[\}\{'";:\?\/\.>,<]/g, "");
    a = a.replace(/'/g, "");
    a = a.replace(/ +/g, " ");  
    a = a.replace(/^\s/g, "");
    a = a.replace(/\s$/g, "");  

    //remove Java Script
    replaceTag("\<script(.*?)\"\>(.*?)\<\/script\>", a,""); 
    a = Lib.Etc.b; 

    //remove html tags
    a = a.replace(/<\/?[^>]+(>|$)/g, "");

    //remove whitespace (regexs found via google)
    a = a.replace(/\r/g, " ");
    a = a.replace(/[^ A-Za-z0-9`~!@#\$%\^&\*\(\)-_=\+\\\|\]\[\}\{'";:\?\/\.>,<]/g, "");
    a = a.replace(/'/g, "");
    a = a.replace(/ +/g, " ");
    a = a.replace(/^\s/g, "");
    a = a.replace(/\s$/g, "");

    //put newlines in
    a = a.replace(/---newline---/g, "\n");

    //replace &nbsp which the coach designer inserts
    a = a.replace(/\&nbsp;/g, " ");

    //a now holds a resonable csv that I can put in excel
    addExportData(a);
        return true;
    } catch (e) {
        alert("Table Export Error: " + e);
    }
    return true;
}
/* ============================================================================================================================= */
/* END: Export Table(s) to CSV FIle */
/* ============================================================================================================================= */