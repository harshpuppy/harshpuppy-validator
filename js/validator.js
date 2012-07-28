/**
 * VALIDATOR
 * A simple, easy to use jQuery based form validator
 * Author: Harry Lee
 * Updated: 2012-07-28
 * 
 * Validator is a client-side validation framework, giving developers the ability to validate 
 * fields with functions or regular expressions
 * Failed validation(s) would prevent the page from submission and provide error messages.
 * 
 * Requirements:
 * -jQuery
 * -jQuery-ui with highlight effect
 * 
 * Steps to use:
 * 1) include the neccessary JS and CSS files
 * 2) insert <div id="notifications"></div> to your HTML for where you want errors to display
 * 3) call init()
 * 4) add rules
 * 5) call validate()
 * 
 * Example:
 *  <script src="js/jquery-1.7.2.min.js"></script>
    <script src="js/jquery-ui-1.8.20.custom.min.js"></script>
    <script src="js/validator.js"></script>
    <link rel="stylesheet" type="text/css" href="css/validator.css"/>
    <script language="JavaScript">
        $(document).ready( function() {
            Validator.init();
            Validator.text('name', 'Name', 'required');
            Validator.text('name', 'Name', 'negative');
            Validator.text('email', 'Email', 'email');
            Validator.radio('age', 'Under-age', 'required');
            Validator.select('category', 'Categories', 'required');
            Validator.checkbox('interests', 'Interests', 'required');
        });
    </script>
    
 */
function Validator() {}

/* BEGIN: Default Configurations (Configure in Validator.init method) */
Validator.ALLOW_COMMA_IN_NUMBERS = true;
Validator.NOTIFICATION_AREA = null;
/* END: Default Configurations */

/* BEGIN: Auxillary Variables */
Validator.validations = new Array();
Validator.failedControls = new Array();
Validator.errorBackgroundInterval = null;
Validator.errorBackgroundToggle = true;
/* END: Auxillary Variables */

/* BEGIN: Rules */
Validator.rules = {
    'required': {
        'text': '{label} is required.',
        'logic': function(value) {
            return (value == null || value == '' ? false : true);
        }
    },
    'email': {
        'text': '{label} must be a valid email address.',
        'logic': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i
    },
    'integer': {
        'text': '{label} must be an integer.',
        'logic': /^[\-]?\d+$/
    },
    'decimal': {
        'text': '{label} must be a decimal',
        'logic': /^[\-]?[\d]+(\.\d*)?$/
    },
    'positive': {
        'text': '{label} must be positive',
        'logic': /^[\d]+(\.\d*)?$/
    },
    'negative': {
        'text': '{label} must be negative',
        'logic': /^\-[\d]+(\.\d*)?$/
    },
    'min': {
        'text': '{label} must be at least {param1}',
        'logic': function(value, param1) {
            value = Validator.number(value);
            if (value == null)
                return false;
            
            return (value >= param1 ? true : false);
        }
    },
    'max': {
        'text': '{label} must be at most {param1}',
        'logic': function(value, param1) {
            value = Validator.number(value);
            if (value == null)
                return false;
                
            return (value <= param1 ? true : false);
        }
    },
    'range': {
        'text': '{label} must be between {param1} and {param2}',
        'logic': function(value, param1, param2) {
            value = Validator.number(value);
            if (value == null)
                return false;
                
            return (value >= param1 && value <= param2 ? true : false);
        }
    },
    'minSize': {
        'text': '{label} must have at least {param1} character(s)',
        'logic': function(value, param1) {
            value += '';
            return (value.length >= param1 ? true : false);
        }
    },
    'maxSize': {
        'text': '{label} must have at most {param1} character(s)',
        'logic': function(value, param1) {
            value += '';
            return (value.length <= param1 ? true : false);
        }
    },
    'minDate': {
        'text': '{label} must be {param1} or later',
        'logic': function(value, param1) {
            var vDate = Date.parse(value);
            var pDate = Date.parse(param1);
            
            if (isNaN(vDate) || isNan(pDate))
                return false;
            
            return (vDate - pDate >= 0 ? true : false);
        }
    },
    'maxDate': {
        'text': '{label} must be {param1} or later',
        'logic': function(value, param1) {
            var vDate = Date.parse(value);
            var pDate = Date.parse(param1);
            
            if (isNaN(vDate) || isNan(pDate))
                return false;
            
            return (vDate - pDate <= 0 ? true : false);
        }
    },
    'decimalPlaces': {
        'text': '{label} must have {param} place(s)',
        'logic': function(value) {
            //check if value is a number, round to x places
            //if value is not a number, return false
        }
    },
    'url': {
        'text': '{label} must be a valid URL',
        'logic': /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
    },
    'phone': {
        'text': '{label} must be a valid phone number',
        'logic': /^[+]?[\d]{5}$/
    }
}
/* END: Rules */

/* BEGIN: Data types */
Validator.Error = function(validation, text) {
    this.validation = validation;
    this.text = text;
}
/* END: Data types */

/**
 * Initialize/change configurations. This method must be called when the page loads
 */
Validator.init = function() {
    Validator.ALLOW_COMMA_IN_NUMBERS = true;
    Validator.NOTIFICATION_AREA = $('#notifications');
}

/**
 * Converts a numerical string to a number
 * @param {String} value - the string to be converted to a number
 */
Validator.number = function(value) {
    var properNum;
    
    //remove any commas that exists
    value += ''; //make it a string
    
    if (Validator.ALLOW_COMMA_IN_NUMBERS) {
        properNum = value.replace(/\,/g, '');
    }
    
    if (properNum == '') //isNaN('') or isNaN(' ') or isNaN('  '), etc, == false (strange indeed!)
        return null;
    
    if (isNaN(properNum))
        return null;
    
    return Number(properNum);
}

/**
 * Adds a rule to a text field control
 * @param {String} id - ID of the control
 * @param {String} label - Label for the control
 * @param {String} rule - The name of the rule
 * @param {ANY_TYPE[]} params - Optional. Array of Strings or numbers as parameters for the rule
 */
Validator.text = function(id, label, rule, params) {
    if (typeof params == 'undefined' || params == null) {
        params = new Array();
    }
    
    Validator.validations.push({
        type: 'text',
        id: id,
        label: label,
        rule: rule,
        params: params
    });
}

/**
 * Adds a rule to a select control (i.e. dropdown list). Supports select controls that allow multiple selections. 
 * @param {String} id - ID of the control
 * @param {String} label - Label for the control
 * @param {String} rule - The name of the rule
 * @param {ANY_TYPE[]} params - Optional. Array of Strings or numbers as parameters for the rule
 */
Validator.select = function(id, label, rule, params) {
    if (typeof params == 'undefined' || params == null) {
        params = new Array();
    }
    
    Validator.validations.push({
        type: 'select',
        id: id,
        label: label,
        rule: rule,
        params: params
    });
}

/**
 * Adds a rule to a checkbox control group
 * @param {String} id - ID of any checkbox control in the checkbox group
 * @param {String} label - Label for the checkbox group
 * @param {String} rule - The name of the rule
 * @param {ANY_TYPE[]} params - Optional. Array of Strings or numbers as parameters for the rule
 */
Validator.checkbox = function(id, label, rule, params) {
    if (typeof params == 'undefined' || params == null) {
        params = new Array();
    }
    
    Validator.validations.push({
        type: 'checkbox',
        id: id,
        label: label,
        rule: rule,
        params: params
    });
}

/**
 * Adds a rule to a radio button control group
 * @param {String} id - ID of any radio button control in the radio button group
 * @param {String} label - Label for the radio button group
 * @param {String} rule - The name of the rule
 * @param {ANY_TYPE[]} params - Optional. Array of Strings or numbers as parameters for the rule
 */
Validator.radio = function(id, label, rule, params) {
    if (typeof params == 'undefined' || params == null) {
        params = new Array();
    }
    
    Validator.validations.push({
        type: 'radio',
        id: id,
        label: label,
        rule: rule,
        params: params
    });
}

/**
 * Resets Validator's state. Clear the error messages and error handling.
 */
Validator.reset = function() {
    //clear the error messages
    $('.v_errorMsg').remove();
    
    //clear error handling
    $('.v_errorField').removeClass('v_errorField');
}

/**
 * Method that handles the validation errors. Controls how the errors are displayed. Replace this method if you want errors to be shown differently.
 * @param {Validator.Error[]} errors - the array holding the validations made from the last validate operation
 */
Validator.handleErrors = function(errors) {
    if (errors.length > 0) {
        $('body').animate({
            scrollTop: Validator.NOTIFICATION_AREA.position().top
        }, 'slow');
    }
    
    for (var i=0; i < errors.length; i++) {
        var text = errors[i].text;
        var validation = errors[i].validation;
        var type = validation['type'];
        var id = validation['id'];
        var label = validation['label'];
        
        //if control is group of radio buttons or checkboxes, scroll it to the first item of the group
        text = text.replace(/{label}/g, '<a href="javascript: void(0)" onclick="Validator.scrollToElement(\'' + id + '\')">' + label + '</a>');
        
        //only add class if it's not radio button group or checkboxes
        //if (type != 'checkbox' && type != 'radio')
        $('#' + id).addClass('v_errorField');
        
        Validator.notification(text, {highlight: true, addClass: 'v_errorMsg'});
    }
}

/**
 * Adds a notification to the Notification Area
 * @param {String} msg - The notification message
 * @param {options} options - Options for the notification
 */
Validator.notificationCount = 0;
Validator.notification = function(msg, options) {
    if (typeof options == 'undefined' || options == null) {
        options = {
            highlight: true,
            addClass: null
        };
    }
    
    //create div
    var $newDiv = $('<div class="notification">');
    $newDiv.prop('id', 'view_notification_' + Validator.notificationCount);
    
    if (options['addClass'] != null)
        $newDiv.addClass(options['addClass']);
    
    Validator.notificationCount++;
    
    //add msg to div
    $newDiv.html( msg );
    
    //prepend div to
    //$('table.controlLayout > tbody > tr:nth-child(3) td.sectionBodyCenterControl:first').prepend( $newDiv );
    Validator.NOTIFICATION_AREA.append( $newDiv );
    
    if (options['highlight'])
        $newDiv.effect("highlight", {}, 10000);
}

/**
 * highlight: Highlight the element after scrolling to it
 * @param {String} elementId - ID of the element to scroll to
 * @param {options} options - options
 */
Validator.scrollToElement = function(ctrlId, options) {
    if (typeof options == 'undefined' || options == null) {
        options = {
            highlight: false,
            highlightDuration: 1000
        };
    }
    
    if (typeof options['highlightDuration'] == 'undefined' || options['highlightDuration'] == null) {
        options['highlightDuration'] = 1000;
    }
    //check if ctrl is in tabs, if it is, activate that tab first
    
    $('body').animate({
        scrollTop: $('#' + ctrlId).position().top
    }, 'slow', function() {
        $('#' + ctrlId).effect("highlight", {}, options['highlightDuration']);
    });
}

/**
 * Validates the rules. This is the engine, the core of Validator
 */
Validator.validate = function() {
    /*
     * - reset
     * - for each validation,
     * - get the value of a field
     * - run the rule logic on the field
     * - handle the validation result
     * - handle validation errors
     * - return true if there is no validation error
     */
    //clear the failed registry
    Validator.failedControls = new Array();
    
    Validator.reset();
    
    var errors = new Array();
    
    for (var i=0; i < Validator.validations.length; i++) {
        var validation = Validator.validations[i];
        var type = validation['type'];
        var id = validation['id'];
        var label = validation['label'];
        var rule = validation['rule'];
        var params = validation['params'];
        var isAFailedCtrl = false;
        
        if ($.inArray(id, Validator.failedControls) != -1) {
            isAFailedCtrl = true;
        }
        
        if (isAFailedCtrl)
            continue;
        
        /* BEGIN: GET VALUE(S) */
        var value = null;
        switch(type) {
            case 'text':
                value = $('#' + id).val();
            break;
            case 'checkbox':
                value = new Array(); //since this is a checkbox group, values are captured in an array rather than as single string
                var cbxName = $('#' + id).prop('name');
                var $boxes = $('input[name=' + cbxName + ']');
                $boxes.each(function() {
                   if ($(this).prop('checked') == true) {
                       value.push($(this).val());
                   }
                });
            break;
            case 'select':
                if ($('#' + id).prop('multiple') == true) {
                    value = new Array(); //since this is a (multiple) select, values are captured in an array rather than as single string
                    var $options = $('#' + id + ' option:selected');
                    $options.each(function() {
                       if ($(this).prop('selected') == true) {
                           value.push($(this).val());
                       }
                    });
                }
                else {
                    value = $('#' + id).val();
                }
            break;
            case 'radio':
                var rdoName = $('#' + id).prop('name');
                var $buttons = $('input[name=' + rdoName + ']');
                $buttons.each(function() {
                   if ($(this).prop('checked') == true) {
                       value = $(this).val();
                       return false;
                   }
                });
            break;
        }
        /* END: GET VALUE(S) */
        
        /* BEGIN: RUN RULE AND GET RESULT */
        var logic = Validator.rules[rule]['logic'];
        var result = false;
        if (typeof logic == 'function') {
            result = logic(value, params[0], params[1], params[2]);
        }
        else {
            result = logic.test(value);
        }
        /* END: RUN RULE AND GET RESULT */
        
        /* BEGIN: HANDLE RESULT */
        /*
         * If validation fails, add the field to the failed registry so that any remaining 
         * validations for it will be skipped; add a error css class to the field, and generate 
         * and add the error message to the array so that all error messages are later inserted 
         * to the page at once
         */
        if (result == false) {
            Validator.failedControls.push(id);
            
            var text = Validator.rules[rule]['text'];
            
            text = text.replace(/{param1}/g, params[0]);
            text = text.replace(/{param2}/g, params[1]);
            text = text.replace(/{param3}/g, params[2]);
            
            var error = new Validator.Error(validation, text);
            
            errors.push(error);
        }
        /* END: HANDLE RESULT */
        
    } //each loop
    
    
    /* BEGIN: HANDLE ERRORS */
    Validator.handleErrors(errors);    
    /* END: HANDLE ERRORS */
   
    return (errors.length > 0 ? false : true);
}
