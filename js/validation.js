/*
 * Version: 15-05-2012
 */
Lib.Validation = function() {}

Lib.Validation.MAIN_FORM_ID = "mainForm";
Lib.Validation.FAKE_BUTTONS_DIV_ID = "fakeBtns";
Lib.Validation.formUsingTabs = false;
Lib.Validation.validationRegister = new Array(); //an array of control IDs with validations attached
Lib.Validation.tablesWithValidationRegister = new Array(); //an array of table IDs with validations
Lib.Validation.realOkBtnId = null;
Lib.Validation.realCancelProcBtnId = null;

/*
NOTE: You may also implement your own fakeSubmitBtnOnClick()

Params:
- usingTabs (optional, boolean, default false)
- fakeSubmitBtnOnClickHandler (optional, string, default validateAllInTabsOnly or validateAll) When the fake Submit btn is clicked, the framework will the appropriate validation function but if you want to use your own custom handler function for the fake submit button click event, pass in the name of the function. Note that you must call validateAll or ValidateAllIntabsOnly in your custom handler
- submitBtnLabel (optional, string, default "OK")
- Lib.Validation.realOkBtnId (required, string)
Example usage: setupValidationFramework({"Lib.Validation.realOkBtnId" : "ButtonGroup0_ok"});
*/
Lib.Validation.setupValidationFramework = function(params) {
    Lib.Validation.initMainCoachForm();
    
    if (typeof params["usingTabs"] == 'undefined')
        params['usingTabs'] = false;
    
    Lib.Validation.formUsingTabs = params['usingTabs'];
    
    if (typeof params["fakeSubmitBtnOnClickHandler"] == 'undefined') {
        if (params['usingTabs'] == true)
            params["fakeSubmitBtnOnClickHandler"] = "Lib.Validation.defaultFakeSubmitBtnOnClick(true)";
        else
            params["fakeSubmitBtnOnClickHandler"] = "Lib.Validation.defaultFakeSubmitBtnOnClick(false)";
    }
    
    if (typeof params["submitBtnLabel"] == 'undefined')
        params['submitBtnLabel'] = "OK";
    
    Lib.Validation.realOkBtnId = params['Lib.Validation.realOkBtnId']; //no need to check if undefined cos it's a required param
    
    Lib.Validation.insertFakeBtn(Lib.Validation.realOkBtnId, 'fakeSubmitBtn', params['submitBtnLabel'], params["fakeSubmitBtnOnClickHandler"]);
    
    Lib.Validation.augmentAllTables();
    
    //attach the validation engine
    $("#mainForm").validationEngine({promptPosition : "topLeft", scroll : false});
    
    Lib.Validation.markRequiredFields();
    
    $('#coachErrorMsg').hide(); //Recommended. With this validation framework, we don't need to see the lombardi validation messages. So hide them
}

/* Author: Harry Lee */
/* Usage: Lib.Validation.insertFakeBtn('okBtn', 'fakeOkBtn', 'Submit', fakeSubmitOnClick()); */
Lib.Validation.insertFakeBtn = function(realBtnId, fakeBtnId, fakeBtnLabel, fakeBtnOnClickHandler) {
    $('#' + realBtnId).after('<button id="' + fakeBtnId + '" type="button" onclick="javascript: ' + fakeBtnOnClickHandler + '">' + fakeBtnLabel + '</button>');
    $('#' + realBtnId).hide();
}

/* Author: Harry Lee */
/* Usage: Lib.Validation.insertCancelProcBtn('cancelProcBtn', 'Cancel Addendum'); */
Lib.Validation.insertCancelProcBtn = function(realBtnId, fakeBtnLabel) {
    if (typeof fakeBtnLabel == 'undefined')
        fakeBtnLabel = "Cancel Process";
    
    Lib.Validation.realCancelProcBtnId = realBtnId;
    $('#' + realBtnId).after('<div id="dialogCancelProcess" title="Cancel the process?" style="display:none;z-index:9999"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>The entire process will be cancelled. Are you sure?</p></div>');
    Lib.Validation.insertFakeBtn(realBtnId, 'fakeCancelProcBtn', fakeBtnLabel, 'Lib.Validation.fakeCancelProcBtnOnClick()');
}

Lib.Validation.fakeCancelProcBtnOnClick = function() {
    $( "#dialogCancelProcess" ).dialog({
        resizable: false,
        modal: true,
        height:140,
        buttons: {
            "Cancel Process": function() {
                Lib.Validation.detachAllValidations();
                $( this ).dialog( "close" );
                $('#' + Lib.Validation.realCancelProcBtnId).click();
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });
}

Lib.Validation.defaultFakeSubmitBtnOnClick = function(usingTabs) {
    var formIsValid = false;
    
    if (usingTabs == true) {
        formIsValid = Lib.Validation.validateControlsInTabs( $(".ui-tabs-panel").find("[class*='validate[']") );
    }
    else {
        formIsValid = Lib.Validation.validateControls( $("[class*='validate[']") );
    }
    
    if (formIsValid == true)
        $('#' + Lib.Validation.realOkBtnId).click();
}

/*
Author: Harry Lee
The main form of the coach does not have an ID, and therefore cannot use jQuery with it. 
To use jQuery validation on the fields in the form, we must assign it an ID. 
This function gives it an ID and returns the main form object
*/
Lib.Validation.initMainCoachForm = function() {
    var forms = $('form');
    forms[1].id = Lib.Validation.MAIN_FORM_ID;
    
    return $('#' + Lib.Validation.MAIN_FORM_ID);
}

/*
Author: Harry Lee
Lombardi adds an additional control for the date selector that bears a different ID from the one defined in the coach designer.
This is the control that holds the value you see on the browser. Use this function to get the ID.
*/
Lib.Validation.findDateSelectorIdFromControlId = function(controlId) {
    var temp = $("div[widgetid='" + controlId + "']").find("input.dijitReset");
    
    if (temp.length == 1) //it should be unique
        return temp[0].id;
    else
        return null;
}

/*
Author: Harry Lee
Fields that require data may be the Validation Framework for the validation instead of Lombardi's required feature (the required checkbox in the PD properties pane). If so, the label for the field will not be marked red to indicate that it is required. Use this function to mark the label of all such fields red with asterisk.
*/
Lib.Validation.markRequiredFields = function() {
    $(':input[class*="validate["]').each(function() {
        var className = $(this).prop('class');
        var classes = className.split(" ");
        
        for (var i=0; i < classes.length; i++) {
            if (classes[i].search("validate") == 0) {
                foundValidation = true;
                var temp = classes[i];
                temp = temp.substr(9);
                temp = temp.substr(0, temp.length - 1);
                temp = temp.replace(/, /g, ",");
                
                var parts = temp.split(",");
                for (var j=0; j < parts.length; j++) {
                    if (parts[j] == "required") {
                        var id = $(this).prop('id');
                        
                        if ($(this).prop('type') == 'radio') {
                            id = id.split('_');
                            id.pop();
                            id = id.join('_');
                        }
                        
                        var label = $('label[for=' + id + ']');
                        
                        if (label.hasClass('label_Req') == false) {
                            var html = label.html();
                            label.addClass('label_Req');
                            label.html(html + "*");
                        }
                    }
                }
                break;
            }
        }
    });
}

/*
Author: Harry Lee
Use this function for textfields, radio buttons, dropdown lists, textareas
- controlId: id of the control
- rules: eg. "validate[required]]", "validate[required,custom[email]]"
- params: array of
    - tableId: pass the id of the table if this control is in a repeated table
    - dataTypeSensitive: boolean; default false; applicable only if control is in a repeated table; set this to true if the field expects a certain type. e.g. a numeric field expects a number and not a string. Why we need this param? Because type-sensitive fields in tables need to be checked when the user clicks on the 'Add new row' button.
*/
Lib.Validation.attachValidation = function(controlId, rules, params) {
    var ctrlType; //value can be 'else', 'radio', 'checkbox', 'droplist', ...
    if (typeof params == 'undefined' || params == null)
        params = new Array();
    
    if (typeof params['tableId'] == 'undefined')
        params['tableId'] = null;
    
    if (typeof params['dataTypeSensitive'] == 'undefined')
        params['dataTypeSensitive'] = false;
    
    Lib.Validation.validationRegister.push(controlId);
    
    //identify what type of control is this...
    if ($('#' + controlId).is('.twSingleSelectRadio'))
        ctrlType = 'radio';
    else
        ctrlType = 'else';
    
    if (params['tableId'] == null) {
        switch (ctrlType) {
            case 'radio':
                $('input:radio[id^=' + controlId + '_]').each(function(index) {
                    $(this).addClass(rules);
                });
                break;
            default:
                $('#' + controlId).addClass(rules);
                break;
        }
    }
    else {
        var table = $('#' + params['tableId']);
        
        tablesWithValidationRegister.push( params['tableId'] );
        //Lib.Validation.augmentTable(params['tableId']);
        
        var tableRowCount = table.find('tbody').find('.twTableTR').length;
        for (var i=0; i < tableRowCount; i++) {
            $('#' + controlId + '_' + i).addClass(rules);
            
            if (params['dataTypeSensitive']) {
                $('#' + controlId + '_' + i).addClass(M_DATA_TYPE_SENSITIVE_CLASS);
            }
        }
    }
}
//javascript: var a = $('#deliverablesTableName_7').val(); if (typeof a != 'undefined'){alert(1);}else{alert(2);}
/*
Author: Harry Lee
Use this function for date fields
- controlId: id of the control
- rules: eg. "validate[required]]", "validate[required,custom[email]]"
- params: array of
    - tableId: pass the id of the table if this control is in a repeated table
*/
Lib.Validation.attachDateValidation = function(controlId, rules, params) {
    if (typeof params == 'undefined' || params == null)
        params = new Array();
    
    if (typeof params['tableId'] == 'undefined')
        params['tableId'] = null;
    
    Lib.Validation.validationRegister.push(controlId);
    
    if (params['tableId'] == null)
        $('#' + Lib.Validation.findDateSelectorIdFromControlId(controlId) ).addClass(rules);
    else {
        var table = $('#' + params['tableId']);
        
        tablesWithValidationRegister.push( params['tableId'] );
        //Lib.Validation.augmentTable(params['tableId']);
        
        var tableRowCount = $('#' + table.id).find('tbody').find('.twTableTR').length;
        for (var i=0; i < tableRowCount; i++) {
            $('#' + Lib.Validation.findDateSelectorIdFromControlId(controlId + '_' + i) ).addClass(rules);
        }
    }
}

/*
Author: Harry Lee
*/
Lib.Validation.detachValidations = function(controls) {
    for (var i=0; i < controls.length; i++) {
        var newClasses = $('#' + controls[i].id).attr('class').replace(/\bvalidate\S+/g, 'validate[]');
        $('#' + controls[i].id).attr('class', newClasses);
    }
}

/*
Author: Harry Lee
*/
Lib.Validation.detachAllValidations = function() {
    $('#' + Lib.Validation.MAIN_FORM_ID).validationEngine('hideAll');
        
    var $elements = $("[class*='validate[']");
    $elements.each(function(index) {
        $(this)[0].className = $(this)[0].className.replace(/\bvalidate\S+/g, 'validate[]');
    });
}

/*
Author: Harry Lee
Use this function for document attachment controls
e.g. Lib.Validation.validateDocAttachment('Your Files', {'minCount':1});
- minCount (optional, integer, default -1)
*/
Lib.Validation.validateDocAttachment = function(controlLabel, params) {
    var isValid = true;
    
    if (typeof params["minCount"] == 'undefined')
        params['minCount'] = 0;
    
    if (params['minCount'] > 0) {
        if (Lib.Validation.docAttachmentCount(controlLabel) < params['minCount']) {
            //var pos = $('legend.twLabel:contains(' + controlLabel + ')').offset();
            var lblElement = $('legend.twLabel:contains(' + controlLabel + ')');
            var msg = controlLabel + ": Minimum " + params['minCount'] + " document(s) required";
            Lib.Validation.stickyMsg(msg, {'scrollToElement':lblElement});
            isValid = false;
        }
    }
    
    return isValid;
}

/*
Author: Harry Lee
Counts how many documents has been currently uploaded for a doc upload control.
*/
Lib.Validation.docAttachmentCount = function(controlLabel) {
    return $('legend.twLabel:contains(' + controlLabel + ')').parent().find('table.docAttachmentTable').children('tbody').children('tr').length;
}

/*
Author: Harry Lee
TECHNICAL NOTE: Simply testing $("#mainForm").validationEngine('validate') for a true before we click 
the real submit button is not going to work. The validation engine appears to only validate controls in 
the current active tab, and skips the rest, resulting in a 'true' as long as the controls in the current 
active tab validates. Therefore, we need to manually validate every control that needs validation
e.g. Lib.Validation.validateControls( $("[class*='validate[']") );
*/
Lib.Validation.validateControls = function(controls) {
    var formIsValid = true;
    
    $('#' + Lib.Validation.MAIN_FORM_ID).validationEngine('hideAll');
    
    for (var i=0; i < controls.length; i++) {   
        if ( $("#" + Lib.Validation.MAIN_FORM_ID).validationEngine('validateField', "#" + controls[i].id) == true )
            formIsValid = false;
    }
    
    return formIsValid;
}

/*
Author: Harry Lee
Validates given controls, and identify and growl the tabs that contains eroneous controls
e.g. Lib.Validation.validateControlsInTabs( $(".ui-tabs-panel").find("[class*='validate[']") );
*/
Lib.Validation.validateControlsInTabs = function(controls) {
    var formIsValid = true;
    var tabsWithErrors = new Array();
    
    $('#' + Lib.Validation.MAIN_FORM_ID).validationEngine('hideAll');
    
    
    for (var i=0; i < controls.length; i++) {
        
        if ( $('#' + Lib.Validation.MAIN_FORM_ID).validationEngine('validateField', "#" + controls[i].id) == true ) { //such a call would Returns *false* if the input validates, *true* if it contains errors. 
            //find out which tab does the control reside
            var tabDivId = getTabDivIdOfControl(controls[i].id);
            var index = $('#' + M_TABS_DIV_ID + ' a[href="#' + tabDivId + '"]').parent().index();
            
            //hide all prompts that belong to tabs other than the currently selected tab
            if (getSelectedTabIndex() != index) {
                $("#" + controls[i].id).validationEngine('hidePrompt');
            }
            
            formIsValid = false;
            
            var tabLabel = getTabLabel(tabDivId);
            
            if (jQuery.inArray(tabLabel, tabsWithErrors) == -1) { //if not already there, add it
                tabsWithErrors.push(tabLabel);
            }
        }
    }
    
    if (formIsValid == false) {
        //clear any existing jGrowl first
        $("div.jGrowl").jGrowl("close");
        
        for (var i=0; i < tabsWithErrors.length; i++) {
            var tabDivId = getTabDivIdFromLabel(tabsWithErrors[i]);
            var msg = tabsWithErrors[i] + " tab contains error(s)";
            Lib.Validation.stickyMsg(msg, {'customOnClickHandler':"goToTab(\"" + tabDivId + "\")"});
        }
    }
    
    return formIsValid;
}

Lib.Validation.validateDataTypeSensitive = function() {
    var $elements = $('.' + M_DATA_TYPE_SENSITIVE_CLASS);
    //alert($elements.length);
    if (Lib.Validation.formUsingTabs) {
        return Lib.Validation.validateControlsInTabs($elements);
    }
    else {
        return Lib.Validation.validateControls($elements);
    }
}


Lib.Validation.getTableFromColumnCtrlId = function(columnControlId) {
    //javascript: alert( $('#' + cellControlId + '_0').parentsUntil('table').parent().find('button').css('display', 'block') );
    var retVal = $('#' + columnControlId + '_0').parentsUntil('table').parent()[0];
    
    if (retVal == undefined)
        retVal = null;
    
    return retVal;
}

/*
Author: Harry Lee
Add fake controls of 'Add a New Row' button and 'Delete' links if the table has them. Table will also be registered.
NOTE: There is no need to augment a table if none of its fields require validation
*/
Lib.Validation.augmentTable = function(tableId) {
    if (jQuery.inArray(tableId, tablesWithValidationRegister) == -1) {
        Lib.Validation.augmentTableAddRowBtn(tableId);
        Lib.Validation.augmentTableDeleteLinks(tableId);
    }
}

Lib.Validation.augmentAllTables = function() {
    $('.repeatingTable').each(function() {
        Lib.Validation.augmentTable(this.id);
    });
}

/*
Author: Harry Lee
Inserts a fake add new row button to the specified table. The fake add row button will run validations attached to the table controls(if any are attached).
Why do we need this?
We need this function because without it, the default 'add new row' button will invoke the validations of the form (including outside the table) and therefore, preventing
the creation of a new row until all validations in the form are done.
*/
Lib.Validation.augmentTableAddRowBtn = function(tableId) {
    if ($('#' + tableId).find('button').length == 1) {
        var realBtn = $('#' + tableId).find('button');
        var container = $('#' + tableId).find('button').parent();
        realBtn.id = tableId + '_addRowBtn'; //give it an ID so we can refer to it in the future
        realBtn.css('display', 'none');
        
        container.prepend('<input id="' + tableId + '_fakeAddRowBtn" type="button" value="Add a new row" onClick="javascript: Lib.Validation.fakeAddRowBtnOnClick(\'' + tableId + '\');"/>');
    }
}


/*
Author: Harry Lee
Augments the Delete links in tables. When clicked, the augmented link will set all the fields in the row to blank, then proceeds on with the normal processing of the deletion
Why do we need this?
If you enter invalid data into a row's field then click the Delete link, Lombardi will return a type mismatched error. A row must have either valid data or blank data to be deleted.
*/
Lib.Validation.augmentTableDeleteLinks = function(tableId) {
    $rows = $('#' + tableId).find('.tableControlDataRow');
    
    if ($rows.length == 0) //NOTE: the last row might be just the "Add A New Row" Button
        return;
    
    var i = 0;
    $rows.each(function(index) {
        var $delLink = $(this).find('a.layoutButton');
        var container = $delLink.parent();
        //alert(tableId + '|' + index + '|' + i + '|' + $delLink.length);
        if ($delLink.length == 1) {
            $delLink.addClass('invisible');
            $delLink[0].id = tableId + '_delete_' + i; //give it an ID so we can refer to it in the future
            
            container.prepend('<a id="' + tableId + '_fakeDelete_' + i + '" href="javascript: void(0)" class="layoutButton" onClick="javascript: augmentedTableDeleteLinkOnClick(\'' + tableId + '\', ' + i + ');">Delete</a>');
            /*
            var onClk = $delLink.attr('onclick');
            $delLink.attr('onclick', 'augmentedTableDeleteLinkOnClick("' + tableId + '", ' + i + ');' + onClk);
            i++;
            */
        }
        i++;
    });
}


Lib.Validation.augmentedTableDeleteLinkOnClick = function(tableId, rowNum) {
    /*
    We want to validate all controls with M_DATA_TYPE_SENSITIVE_CLASS but we must first remove the M_DATA_TYPE_SENSITIVE_CLASS class from the row so that it doesn't get validated.
    If validation is unsuccessful, we re-add the M_DATA_TYPE_SENSITIVE_CLASS class back to the row controls
    */
    var rowInputs = $('#' + tableId + '_' + rowNum).find('input, select, textarea');
    
    rowInputs.removeClass(M_DATA_TYPE_SENSITIVE_CLASS);
    
    //validate all datatype sensitive controls in all table
    if (Lib.Validation.validateDataTypeSensitive() == false) {
        rowInputs.addClass(M_DATA_TYPE_SENSITIVE_CLASS);
        return;
    }
    
    //set the value of all fields in the row to ""
    rowInputs.attr('disabled', true);
    //rowInputs.addClass('disabled');
    rowInputs.val('');
    
    $('#' + tableId + '_delete_' + rowNum).click();
}

Lib.Validation.fakeAddRowBtnOnClick = function(tableId) {
    var safeToAddRow = true;
    var tabsWithErrors = new Array();
    
    //validate all datatype sensitive controls in all table
    safeToAddRow = Lib.Validation.validateDataTypeSensitive();
    
    //submit only if no errors
    if (safeToAddRow == true) {
        //var realBtn = $('#' + tableId + '_addRowBtn');
        var realBtn = $('#' + tableId).find('button');
        Lib.Validation.detachAllValidations();
        realBtn.click();
    }
    else {
        $("div.jGrowl").jGrowl("close");
        
        if (Lib.Validation.formUsingTabs) {
            Lib.Validation.stickyMsg("To add a new row, the following errors must first be corrected");
            
            for (var i=0; i < tabsWithErrors.length; i++) {
                var tabDivId = getTabDivIdFromLabel(tabsWithErrors[i]);
                var msg = tabsWithErrors[i] + " tab contains error(s)";
                Lib.Validation.stickyMsg(msg, {'customOnClickHandler':"goToTab(\"" + tabDivId + "\")"});
            }
        }
        else {
            Lib.Validation.stickyMsg("To add a new row, the errors on the form must first be corrected");
        }
    }
}

Lib.Validation.addslashes = function(str) {
    str = str.replace(/\\/g,'\\\\');
    str = str.replace(/\'/g,'\\\'');
    str = str.replace(/\"/g,'\\"');
    str = str.replace(/\0/g,'\\0');
    return str;
}

/*
Params:
- scrollToElement - the element to which we want to scroll to if we click the sticky msg
- customOnClickHandler - takes precedence over scrollToElement
*/
Lib.Validation.stickyMsg = function(message, params) {
    var msg;
    
    if (typeof params == 'undefined' || params == null)
        params = new Array();
    
    if (typeof params['scrollToElement'] == 'undefined' || params['scrollToElement'] == null)
        params['scrollToElement'] = 0;
    else
        params['scrollToElement'] = params['scrollToElement'].position().top;
    
    if (typeof params['customOnClickHandler'] == 'undefined' || params['customOnClickHandler'] == null)
        params['customOnClickHandler'] = null;
    
    if (params['customOnClickHandler'] != null) //customOnClickHandler takes precedence
        msg = "<a href='javascript: void(0)' onclick='javascript: " + params['customOnClickHandler'] + "' style='color:#FFFFFF'>" + message + "</a>";
    else if (params['scrollToElement'] != null)
        msg = "<a href='javascript: void(0)' onclick='javascript: " + "$(\"html,body\").animate({scrollTop: " + (params['scrollToElement'] - 200) + "}, 500);" + "' style='color:#FFFFFF'>" + message + "</a>";
    else if (params['customOnClickHandler'] == null && params['scrollToElement'] == null)
        msg = message;
    
    $.jGrowl(msg, { sticky: true });
}