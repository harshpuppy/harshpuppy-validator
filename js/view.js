/*
 * The View library contains methods relating to the coach
 */
function View() {}

View.Comment = function(name, phone, email, date, step, content) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.date = date;
    this.step = step;
    this.content = content;
}

View.Comment.prototype = {
    name: null,
    phone: null,
    email: null,
    date: null,
    step: null,
    content: null
}

//Note: Virtual fields/control will have a class 'virtual=true'

View.setIsNumeric = function($input, datatype) {
    if (datatype == 'Decimal' || datatype == 'Integer') {
        $input.prop('isnumeric', true);
    }
    else {
        $input.prop('isnumeric', false);
    }
}

/**
 * A property would render as a column. So take the word 'property' synonymously as 'column'
 * @param {assocArray}  properties = {propName:datatype, name:string}
 * @example     View.table('table_vendor', vendors, 'tw.local.vendors', {name:String, vendorNo:String, quoteValue:Decimal}, ['Name', 'Vendor No', 'Quote Value']};
 */
View.table = function(tableId, array, binding, properties, headers, tableOptions) {
    var propertyCount = Lib.assocArrayLength(properties)
    if (propertyCount!= headers.length) {
        alert("Error: Number of properties do not match number of headers");
        return;
    }
    
    var showAddButton = true;
    var showDeleteLink = true;
    
    
    var $tbl = $('<table cellspacing="0" class="tableControlNoLabel twControl twTable">');
    $tbl.prop('id', tableId);
    $tbl.prop('binding', binding);
    $tbl.prop('recordCount', array.length);
    $tbl.prop('recordIdCounter', array.length - 1);
    
    var $tbody = $('<tbody>');
    var $tr;
    
    //Start: header
    $tr = $('<tr class="tableControlHeader twTableHeaderTR" id="_Header">');
    
    for (var i=0; i < propertyCount; i++) {
        $tr.append( $('<th width="" class="twTableTH">').append(  $('<p align="left" class="twLabel">').text(headers[i])  ) );
    }
    $tr.append('<th width="1%">&nbsp;</th>');
    $tbody.append($tr);
    //End: header
    
    //Start: body
    for (var i=0; i < array.length; i++) {
        var $tr = $('<tr class="tableControlDataRow evenRow twTableTR ">');
        $tr.prop('id', tableId + '_' + i);
        
        for (var index in properties) {
            var propName = index;
            var basetype = properties[index];
            
            var $td = $('<td class="twTableTD">');
            
            $input = $('<input class="inputTextNoLabel_Full twControl twInputText" />');
            $input.prop('id', tableId + '_' + propName + '_' + i);
            $input.prop('name', binding + '[' + i + '].' + propName);
            $input.prop('basetype', basetype);
            $input.prop('type', 'text');
            var val = eval('array' + '[' + i + '].' + propName);
            $input.prop('value', val);
            
            View.setIsNumeric($input, basetype);
            $input.prop('locale', Lib.LOCALE);
            
            $input.addClass('virtual');
            
            $td.append($input);
            $tr.append($td);
        }
        
        $tr.append( $('<td>') );
        $tbody.append($tr);
    }
    //End: body
    
    //Table Options:
    //Start: Add Button
    if (showAddButton) {
        var $tr = $('<tr class="tableControlDataRow ">');
        $tr.addClass('addButtonRow');
        var $td = $('<td colspan="' + (propertyCount + 1) + '">');
        
        var $button = $('<button class="layoutButton " type="button" onclick="javascript: View.tableAddRow(\'' + tableId + '\');">');
        $button.text('Add a new row');
        $button.appendTo($td.appendTo($tr.appendTo($tbody)));
    }
    //End: Add Button
    
    $tbl.append($tbody);
    
    return $tbl;
}



View.tableAddRow = function(tableId) {
    var $tbl = $('#' + tableId);
    var recordIdCounter = Number($tbl.prop('recordIdCounter')) + 1;
    var binding = $('#' + tableId).prop('binding');
    
    $tbl.prop('recordIdCounter', Number($tbl.prop('recordIdCounter')) + 1); //update record ID counter
    $tbl.prop('recordCount', Number($tbl.prop('recordCount')) + 1); //update record count
    
    //clone first record row and just edit the elements then append
    //also change the IDs of the elements
    var $newTr = $('.twTableTR').first().clone(true, true);
    $newTr.css('opacity', 0);
    $newTr.prop('id', tableId + '_' + recordIdCounter);
    
    $('#' + tableId).find('.addButtonRow').before($newTr);
    
    $('#' + $newTr.prop('id')).find(':input').each(function() {
        var temp = $(this).prop('id').split('_');
        temp[temp.length - 1] = recordIdCounter;
        $(this).prop('id', temp.join('_'));
        
        switch ($(this).prop('type')) {
            case 'checkbox':
            case 'radio':
                $(this).prop('checked', false)
                break;
            case 'text':
                break;
            case 'select':
                $(this).val(0);
                break;
        }
        
        $(this).val('');
    });
    
    $newTr.animate({
        opacity: 1.0
    });
    
}


View.tableDeleteRow = function(tableId, recordId) {
    //get current number of rows in the table excluding the header and the add button row if there's any
    // var addBtnRowCount = $('#' + tableId + ' .addButtonRow').length;
    // var headerRowCount = $('#' + tableId + ' .twTableHeaderTR').length;
    // var recordCount = $('#' + tableId + ' tr').length - addBtnRowCount - headerRowCount;
    var $tbl = $('#' + tableId);
    var recordIdCounter = Number($tbl.prop('recordIdCounter')) + 1;
    var binding = $('#' + tableId).prop('binding');
    
    $tbl.prop('recordIdCounter'); //update record ID counter
    $tbl.prop('recordCount', Number($tbl.prop('recordCount')) + 1); //update record count
    
    $tr = $('#' + tableId + '_' + recordId);
    
    $tr.animate({
        opacity: 0.0
    }, function() {
        $(this).remove();
    });
}


View.textField = function(textFieldId, binding, val, properties) {
    if (typeof properties == 'undefined')
        properties = {};
    
    if (typeof properties['datatype'])
        properties['datatype'] = Lib.TYPE_STRING;
    
    var $tf = $('<input type="text" class="inputText_Full twControl twInputText"/>');
    $tf.prop('name', binding); //just use binding as the name
    $tf.prop('id', textFieldId);
    $tf.prop('binding', binding);
    $tf.prop('basetype', properties['datatype']);
    $tf.val(val);
    
    View.setIsNumeric($input, properties['datatype']);
    $tf.prop('locale', Lib.LOCALE);
    $tf.addClass('virtual');
    
    return $tf;
}

View.virtualDataStr = function() {
    $input = $('.virtual');
    
    $input.each(function() {
        var basetype = $(this).prop('basetype');
        var val = $(this).val();
        var binding = $(this).prop('binding');
    })
}

View.autoTotalGroups = new Array();

View.AutoTotalGroup = function(autoTotalId, inputIds, tableInputIds, options) {
    this.autoTotalId = autoTotalId;
    this.inputIds = inputIds;
    this.tableInputIds = tableInputIds;
    this.options = options;
}

View.AutoTotalGroup.prototype = {
    autoTotalId: null,
    inputIds: null,
    tableInputIds: null,
    options: null,
    
    update: function() {
        var total = 0.0;
        var errorDetected = false;
        
        //sum up individual inputs
        for (var i=0; i < this.inputIds.length; i++) {
            var val = $('#' + this.inputIds[i]).val();
            val = Lib.decimal(val);
            
            if (val == null) {
                errorDetected = true;
                break;
            }
            
            total += val;
        }
        
        if (!errorDetected) {
            //sum up table inputs
            for (var i=0; i < this.tableInputIds.length; i++) {
                
                $('[id^="' + this.tableInputIds[i] + '_"][type!="hidden"]').each(function() {
                    var val = $(this).val();
                    val = Lib.decimal(val);
                    
                    if (val == null){
                        errorDetected = true;
                        return false;
                    }
                    
                    total += val;
                })
                
                
                if (errorDetected){
                    break;
                }
            }
        }
        
        if (errorDetected)
            $('#' + this.autoTotalId).val('');
        else {
            total = Lib.decimalPlaces(total, this.options['decimalPlaces']);
            $('#' + this.autoTotalId).val(total);
        }
    }
}

/**
 * Automatically sums up one or more input fields and assigns that total into a specified input. The total is updated as the inputs' values change. This features has two techniques to update the total.
 * 1) Using event handlers so that once an input changes, the total is immediately updated
 * 2) Using an interval timer that scans all the inputs and updates the total at regular intervals
 * The event handler technique is preferred; no wastage of CPU if no changes are done; but depending on the script on the page, this may not always be possible (e.g. If you dynamically change the value of an input, depending on how you do it, its change event may not fire)
 * The timer technique suffers from a performance hit if no changes are made; but does not involve dynamically adding event handlers and the performance penalty is unnoticeable is the number of inputs are low 
 * @param {String}  autoTotalId
 * @param {String[]}  inputIds - You can pass an empty array
 * @param {String[]}  [tableInputIds] - Optional
 * @param {String{}}  [options] - Optional:
 *                                  useEventHandlers:{Boolean}  - True: Implement update by attaching event handlers to each of the inputs; False: Use an interval timer to scan through all the inputs to update the total
 *                                  decimalPlaces:{Integer}     - No of decimal places for the total
 * @example     View.autoTotal('total', ['total2011', 'total2012'], ['rate', 'quote']};
 * @example     View.autoTotal('total', ['total2011', 'total2012']};
 * @example     View.autoTotal('total', [], ['rate', 'quote']};
 */
View.autoTotal = function(autoTotalId, inputIds, tableInputIds, options) {
    if (typeof options == 'undefined' || options == null)
        options = {};
    
    if (typeof options['useEventHandlers'] == 'undefined' || options['useEventHandlers'] == null)
        options['useEventHandlers'] = true;
        
    if (typeof options['decimalPlaces'] == 'undefined' || options['decimalPlaces'] == null)
        options['decimalPlaces'] = Lib.CURRENCY_DECIMAL_PLACES;
    
    var group = new View.AutoTotalGroup(autoTotalId, inputIds, tableInputIds, options);
    View.autoTotalGroups.push(group);
    var index = View.autoTotalGroups.length - 1;
    
    if (options['useEventHandlers']) {
        //add event handlers to individual inputs
        for (var i=0; i < inputIds.length; i++) {
            $('#' + inputIds[i]).change(function() {
                group.update();
            });
        }
        
        //add event handlers to table inputs
        for (var i=0; i < tableInputIds.length; i++) {
            $('[id^="' + tableInputIds[i] + '_"][type!="hidden"]').change(function() {
                group.update();
            });
        }
    }
    else {
        setInterval('View.autoTotalGroups[' + index + '].update()', 500);
    }
    
    group.update();
}

View.autoExpandTextArea = function(txtAreaId, maxHeight, options) {
    if (typeof options == 'undefined' || options == null)
        options = {};
    
    if (typeof options['defaultHeight'] == 'undefined')
        options['defaultHeight'] = null;
    
    var $input = $('#' + txtAreaId);
    
    if (options['defaultHeight'] != null)
        $input.css('height', options['defaultHeight']);
    
    $input.click( function() { $(this).animate({ height: maxHeight }, 'slow'); } );
}

View.radioGroupValue = function(controlId) {
    var name = $('#' + controlId + ' input[type="radio"]').prop('name');
    $radio = $('input:radio[name="' + name + '"]:checked');
    
    if ($radio.length == 0)
        return null;
    else
        return $('input:radio[name="' + name + '"]:checked').val();
}

View.radioChangeHandler = function(controlId, handlerFunc) {
    $('#' + controlId + ' input[type="radio"]').change(handlerFunc);
}

/*
Author: Harry Lee
If you want to disable a table that has delete links, the Add A Row button and the fields in the tables get disabled but the delete link still appear and are live.
Use the function to remove them.
*/
View.removeTableDeleteLinks = function(tableId) {
    $('#' + tableId + ' a.layoutButton').remove();
}

/*
Author: Harry Lee
Makes all or some of the table's rows read-only, by removing their delete links and making their data read-only.
Use case: Old rows cannot be edited, but newer ones edited/deleted and new rows can be added.
*/
View.makeTablePartiallyReadOnly = function(tableId, numberOfReadOnlyRowsFromTop) {
    //remove delete link
    //make fields in each row readOnly (disabled attribute + readOnly css class)
    var $rows = $('tr[id^="' + tableId + '_"]');
    $rows.each(function(index) {
        if (index == numberOfReadOnlyRowsFromTop)
            return false;
        
        $(this).find('a.layoutButton').remove();
        $(this).find('input,select,textarea').attr('disabled', true);
        //$(this).find('input,select,textarea').addClass("readOnly");
    });
}

/**
 * Creates a side panel and moves sections on the main form
 * sections - {sectionId:sectionTitle, 'section_customer':'Customer Details'}
 * @example View.sidePanel()
 */
View.accordionSidePanel = function(sections, options) {
    if (typeof options == 'undefined' || options == null)
        options = {};
    
    if (typeof options['width'] == 'undefined' || options['width'] == null)
        options['width'] = 400;
    
    var formId = Lib.getCoachFormId();
    // if (typeof options['defaultHeight'] == 'undefined')
        // options['defaultHeight'] = null;
    
    $('body').css('padding-left', options['width']);
    $('#' + formId).prepend('<div id="sidePanel">');
    $('#sidePanel').css('left', 5);
    $('#sidePanel').css('top', 3);
    $('#sidePanel').css('width', (options['width'] - 8) );
    $('#sidePanel').css('position', 'fixed');
    
    $('#sidePanel').append( $('<div id="accordion">') );
    
    for (var index in sections) {
        $('#accordion').append('<h3><a href="#">' + sections[index] + '</a></h3><div id="acc_' + index + '"></div>');
        $('#' + index).find('script').remove();
        $('#acc_' + index).append( $('#' + index) );
    }
    
    $( "#accordion" ).accordion({
        autoHeight: false,
        navigation: true
    });
    
    $('.ui-accordion .ui-accordion-header a').css('font-size', '11px');
}

View.fileViewerDialog = function(dialogId, docViewerId, docAttachId, docAttachLabel, options, exclusiveWithIds) {
    if (typeof options == 'undefined' || options == null) {
        options = {
            title:'File Viewer: ' + docAttachLabel,
            width:850,
            height:500,
            closeOnEscape:true,
            autoOpen:false,
            show:'fade',
            hide:'explode'
        };
    }
    
    if (typeof exclusiveWithIds == 'undefined' || exclusiveWithIds == null)
        exclusiveWithIds = [];
    
    
    var daId = View.setDocAttachmentId(docAttachId, docAttachLabel);
    
    $('body').append('<div id="' + dialogId + '">');
    var $dialog = $('#' + dialogId);
    var $docViewer = $('#' + docViewerId);
    
    $docViewer.find('script').remove();
    
    $dialog.append( $docViewer.parent() );
    $('fieldset#' + docViewerId + ' > iframe').css('height', (options['height'] - 110) );
    
    $dialog.dialog(options);
    
    var count = 0; //so it doesn't load the first time
    $('#' + docViewerId + ' > iframe').load(function() {
        if ($.browser.mozilla && count == 0) { //fixes a mozilla problem
            count++;
            return;
        }
        
        $(window).scrollTop( $('#' + daId).position().top );
        
        for (var i=0; i < exclusiveWithIds.length; i++) {
            if (dialogId == exclusiveWithIds[i])
                continue;
            else {
                var $otherDialog = $('#' + exclusiveWithIds[i]);
                
                if ($otherDialog.length == 0)
                    continue;
                
                if ($otherDialog.dialog('isOpen'))
                    $otherDialog.dialog('close');
            }
        }
        
        $dialog.dialog('open');
    });
    
}

/**
 * Doc Attachments do not have IDs. Use this method give it an ID so that javascipt/css can reference it for operations
 */
View.setDocAttachmentId = function(docAttachId, docAttachLabel) {
    var $legend = $('div.twDocAttachment > fieldset > legend:contains("' + docAttachLabel + '")').first();
    
    if ($legend.length < 1)
        return null;
    
    var $div = $legend.parent().parent();
    
    if ($div.prop('id') == '') {
        $div.prop('id', docAttachId);
    }
    
    return $div.prop('id');
}

View.notificationCount = 0;
View.notification = function(msg, options) {
    if (typeof options == 'undefined' || options == null) {
        options = {
            highlight: true,
            addClass: null
        };
    }
    //create div
    var $newDiv = $('<div class="notification">');
    $newDiv.prop('id', 'view_notification_' + View.notificationCount);
    
    if (options['addClass'] != null)
        $newDiv.addClass(options['addClass']);
    
    View.notificationCount++;
    
    //add msg to div
    $newDiv.html( msg );
    
    //prepend div to
    //$('table.controlLayout > tbody > tr:nth-child(3) td.sectionBodyCenterControl:first').prepend( $newDiv );
    View.pageContentTop().prepend( $newDiv );
    
    if (options['highlight'])
        $newDiv.effect("highlight", {}, 10000);
}

View.pageContentTop = function() {
    var $contentTop = $('table.controlLayout > tbody > tr:nth-child(1) td.sectionBodyCenterControl:first');
    if ($contentTop.length == 0)
        return null;
    else
        return $contentTop;
}

/**
 * highlight: Highlight the element after scrolling to it
 */
View.scrollToElement = function(ctrlId, options) {
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

View.commentHistory = function(divId, comments, options) {
    if (typeof options == 'undefined' || options == null) {
        options = {
            height:200
        };
    }
    
    var $div = $('#' + divId);
    $div.addClass('commentHistory');
    
    if (comments.length == 0) {
        //$div.css('height', 10);
        $div.css('padding', 10);
        $div.append('There are currently no comments made. You can add your comment below.')
        return;
    }
    
    $div.css('height', options['height']);
    
    for (var i=0; i < comments.length; i++) {
    	var $commentBubble = $('<span>');
    	$commentBubble.addClass('commentBubble');
    	
    	if (i == 0)
    		$commentBubble.css('margin-top', 10);
    	
    	if (i == (comments.length - 1))
    		$commentBubble.css('margin-bottom', 10);
    	
    	var date = comments[i].date;
    	var person = '<b>' + comments[i].name;
    	var step = comments[i].step;
    	var content = comments[i].content;
    	
    	var $tbl = $('<table>');
    	$tbl.addClass('commentBubbleTable');
        var $tr = $('<tr>');
        $tr.append( $('<td class="commentBubbleDate">').append(date) );
        $tr.append( $('<td class="commentBubbleName">').append(person) );
        $tr.append( $('<td class="commentBubbleStep">').append(step) );
        $tbl.append( $tr );
        
        //var person = '<b>' + comments[i].name + '</b> @ &quot;' + comments[i].step + '&quot; step<br/>';
        $commentBubble.append($tbl);
        $commentBubble.append(content);
        
        $div.append($commentBubble);
        
        if (i <= (comments.length - 2) )
        	$div.append( $('<div class="commentBubbleVerticalLine">') );
    }
    
    $div[0].scrollTop = $div[0].scrollHeight; //scroll to bottom of history for latest comment
}
