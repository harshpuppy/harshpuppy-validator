/*
 * Version: 15-05-2012
 */
Lib.Contact = function(name, phone, email) {
    this.name = name;
    this.phone = phone;
    this.email = email;
}

Lib.Contact.prototype = {
    name: null,
    phone: null,
    email: null,
    
    show: function() {
        alert(this.name + this.phone + this.email);
    }
}

Lib.ContactList = function(nameId, phoneId, emailId, contacts, params) {
    this.nameId = nameId;
    this.phoneId = phoneId;
    this.emailId = emailId;
    this.contacts = contacts;
    this.params = params;
    this.updateRanOnce = false;
}

Lib.ContactList.prototype = {
    nameId: null,
    phoneId: null,
    emailId: null,
    contacts: null,
    params: null,
    updateRanOnce: null,
    
    init: function() {
        if (typeof this.params == 'undefined' || this.params == null)
            this.params = new Array();
        
        if (typeof this.params['uniqueAmongNamesIds'] == 'undefined')
            this.params['uniqueAmongNamesIds'] = '';
        
        if (typeof this.params['changeBlankEntryDisplayValue'] == 'undefined')
            this.params['changeBlankEntryDisplayValue'] = false;
        
        if (typeof this.params['phoneIsReadOnly'] == 'undefined')
            this.params['phoneIsReadOnly'] = true;
        
        if (typeof this.params['emailIsReadOnly'] == 'undefined')
            this.params['emailIsReadOnly'] = true;
        
        
        var name = $('#' + this.nameId);
        var phone = $('#' + this.phoneId);
        var email = $('#' + this.emailId);
        
        //clone the fields
        var fakePhone = phone.clone();
        var fakeEmail = email.clone();
        
        fakePhone.attr('id', Lib.FAKE_PREFIX + fakePhone.attr('id'));
        fakePhone.attr('name', ''); //must clear this binding. if we do not clear this, we will have two bound fields with the same data and will have duplicated the data on the phone field twice. If you enter '123', the next screen u'd see '123123' which is wrong.
        fakeEmail.attr('id', Lib.FAKE_PREFIX + fakeEmail.attr('id'));
        fakeEmail.attr('name', '');
        
        //make orig fields invisible
        phone.hide();
        email.hide();
        
        //make fake fields diabled?
        fakePhone.prop('disabled', this.params['phoneIsReadOnly']);
        fakePhone.prop('readonly', this.params['phoneIsReadOnly']);
        fakeEmail.prop('disabled', this.params['emailIsReadOnly']);
        fakeEmail.prop('readonly', this.params['emailIsReadOnly']);
        
        //insert them before respective orig fields
        fakePhone.insertBefore(phone);
        fakeEmail.insertBefore(email);
        
        if (this.params['phoneIsReadOnly'] == false)
        {
            attachValidation(fakePhone.attr('id'), 'validate[custom[phone_au]]');
        }
        
        var thisObject = this;
        name.change(function(){
            thisObject.update();
        });
        
        if (this.params['phoneIsReadOnly'] == false) {
            fakePhone.change(function() {
                $('#' + this.phoneId).val( $('#' + fakePhone.attr('id')).val() );
            });
        }
        
        if (this.params['changeBlankEntryDisplayValue'] == true) {
            $("#" + this.nameId + " > option").each(function() {
                if ($(this).val() == "") {
                    $(this).text(Lib.SELECT_BLANK_ENTRY_DISPLAY_VALUE);
                    return;
                }
            });
        }
        
        //update it for the first time
        this.update();
    },
    
    update: function() {
        if ($('#' + this.nameId).val() != '') {
        
            var name = $('#' + this.nameId).val();
            
            for (var i=0; i < this.contacts.length; i++) {
                //alert(name + this.contacts.length + this.contacts[i].name);
                if (this.contacts[i].name == name) {
                    
                    if (this.updateRanOnce == false && this.params['phoneIsReadOnly'] == false) {
                        /*
                         * Do nothing
                         * This is best explained with an example
                         * Consider the contact Ben with phone 1234 and email ben@mail.com
                         * - If the phone field is read-only, when the Ben is selected from the dropdown list, 1234 is loaded into the phone field
                         * - But if phone field is not read-only (aka writable), then when the page first loads and update() is called for the first time, we do not want to load 1234 into phone field
                         * It is only when update() is called from the 2nd time on do we want to override the phone field with the contact's associated phone data
                         * This behavior is also for email field
                         */
                    }
                    else {
                        this.updatePhone(this.contacts[i].phone);
                    }
                    
                    if (this.updateRanOnce == false && this.params['emailIsReadOnly'] == false) {
                        /* Do nothing */
                    }
                    else {
                        this.updateEmail(this.contacts[i].email);
                    }
                    
                    
                    this.updateRanOnce = true;
                    
                    //Ensure unique among other contact groups
                    var uniqueAmongNamesIdsArray = this.params['uniqueAmongNamesIds'].split(',');
                    
                    if (this.params['uniqueAmongNamesIds'] != "" && uniqueAmongNamesIdsArray.length > 0) {
                        for (var j=0; j < uniqueAmongNamesIdsArray.length; j++) {
                            var aName = document.getElementById(uniqueAmongNamesIdsArray[j]); //$('#' + uniqueAmongNamesIdsArray[j]);
                            if ( $('#' + this.nameId).val() == aName.options[aName.options.selectedIndex].value ) {
                                
                                var blankEntryFound = false;
                                //find the first blank entry, if there isn't a blank entry at all in the list of options, we'll add one
                                for (var h=0; h < aName.options.length; h++) {
                                    if (aName.options[h].value == '') {
                                        aName.options[h].selected = true;
                                        blankEntryFound = true;
                                        break;
                                    }
                                }
                                
                                if (blankEntryFound == false) {
                                    $('#' + uniqueAmongNamesIdsArray[j]).prepend('<option value="">' + Lib.SELECT_BLANK_ENTRY_DISPLAY_VALUE + '</option>');
                                    aName.options[0].selected = true;
                                }
                                
                                $('#' + uniqueAmongNamesIdsArray[j]).change();
                                break;
                            }
                        }
                    }
                    return;
                }
            }
        
            
        }
        
        //will reach this if we name is empty OR we can't find the contact info
        this.updatePhone('');
        this.updateEmail('');
    },
    
    updatePhone: function(value) {
        $('#' + this.phoneId).val(value);
        $('#' + Lib.FAKE_PREFIX + this.phoneId).val(value);
    },

    updateEmail: function(value) {
        $('#' + this.emailId).val(value);
        $('#' + Lib.FAKE_PREFIX + this.emailId).val(value);
    }
}
    
    // /* Static members */