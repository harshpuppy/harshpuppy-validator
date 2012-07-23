/*
 * Version: 15-05-2012
 * Author: Harry Lee
 */
Lib.Tab = function(sectionId, visibility, title)
{
    this.sectionId = sectionId;
    this.visibility = visibility;
    this.title = title;
}

Lib.Tab.prototype = {
    sectionId: null,
    visibility: null,
    title: null
}


Lib.TabGroup = function(tabs) {
    this.tabs = tabs;
    this.tabGroupId = Lib.TabGroup.tabGroupCount;
    this.tabGroupCookieName = 'tabgroup-' + this.tabGroupId + '-selectedTab';
    this.tabGroupDivId = 'tabgroup-' + this.tabGroupId;
    
    Lib.TabGroup.tabGroupCount++;
}

/* Static members */
Lib.TabGroup.tabGroupCount = 0; //counts the number of tab groups as we can have >1 tab group in a coach

Lib.TabGroup.prototype = {
    tabs: new Array(),
    tabGroupId: null,
    tabGroupCookieName: null,
    tabGroupDivId: null,
    
    init: function() {
        /*
        The coach is divided into sections, each section will come under its own tab. Each tab has its own div (called tabDiv) which the section needs to be in.
        First, move each section into tabDiv. We MUST use Dojo's to move and not jQuery else Dojo will complain.
        Second, we add an event handler to each of the tabs so that when clicked, we keep track of what's the currently viewed tab so that if we were to reload the page, we'll be back at the last viewed tab (e.g. when we add a new table row, the page will refresh)
        */
        var tabContent;
        var tab;
        
        this.tabGroupCookieName = Lib.Cookie.makeUniqueCookieName(this.tabGroupCookieName);
        
        //insert the neccessary HTML
        var html = '<div id="tabs">';
        html += '   <ul>';
        for (var i=0; i < theTabs.length; i++) {
            if (theTabs[i].visibility != "NONE") {
                html += '       <li><a href="#tab-' + theTabs[i].sectionId + '">' + theTabs[i].title + '</a></li>';
            }
            else
                $('#' + theTabs[i].sectionId).hide(); //make sure they are hidden
        }
        html += '   </ul>';
        
        for (var i=0; i < theTabs.length; i++) {
            if (theTabs[i].visibility != "NONE") {
                html += '<div id="tab-' + theTabs[i].sectionId + '"></div>';
            }
        }
        html += '</div>';
        
        $('#holder').append(html);
        
        
        
        for (var i=0; i < theTabs.length; i++) {
            if (theTabs[i].visibility == "NONE")
                continue;
            
            var tabContent = dojo.byId(theTabs[i].sectionId);
            var tab = dojo.byId("tab-" + theTabs[i].sectionId);
            dojo.place(tabContent, tab, "first");
        }
        
        var tabOpts = {
            select:handleTabSelect
        };
    
        
        $(function() {
            $( '#' + this.tabGroupDivId).tabs(tabOpts);
        });
        
        
        $('#' + this.tabGroupDivId).bind('tabsshow', function(event, ui) {
            var $theTabs = $('#' + this.tabGroupDivId).tabs();
            var selected = $theTabs.tabs('option', 'selected');
            
            setCookie(this.tabGroupCookieName, selected, 3);
        
            $('#' + MAIN_FORM_ID).validationEngine('hideAll');
            
            //we only want to revalidate when the user changes tabs AFTER he clicked on the fake submit button
            if (isFakeSubmitBtnClicked == true) {
                $('#' + MAIN_FORM_ID).validationEngine('validate'); //this will show the prompts for the control in the current tab AND the approval controls
            }
            else if (isFakeSaveBtnClicked == true) {
                //only revalidate the controls in newly selected tab so that we only show the prompts in that tab
                var currSelectedTab = $('.ui-tabs-panel:not(.ui-tabs-hide)');
                var currTabId = currSelectedTab.prop("id");
                
                validateControls( $('#' + currTabId).find("[class*='validate[']") ); //just to show the validation prompts in the currently selected tab
            }
        });
        
        
        //set the visibility of the tabs
        for (var i=0; i < theTabs.length; i++) {
            switch(theTabs[i].visibility) {
                case "FULL":
                case "REQUIRED":
                    $('#' + theTabs[i].sectionId).show();
                    break;
                case "READ":
                    disable(theTabs[i].sectionId);
                    break;
            }
        }
    },
    
    getSelectedTabIndex: function() {
        var index = Lib.Cookie.getCookieValue(this.tabGroupCookieName);
        
        if (index == null)
            return 0;
        else
            return parseInt(index);
    },
    
    getTabLabel: function(tabDivId) {
        //take out the prepending TAB_PREFIX first
        var divId = tabDivId.slice(TAB_PREFIX.length);
        
        for (var i=0; i < this.tabs.length; i++) {
            if (this.tabs[i].sectionId == divId) {
                return this.tabs[i].title;
            }
        }
        
        return null;
    },
    
    getTabDivIdFromLabel: function(tabLabel) {
        for (var i=0; i < this.tabs.length; i++) {
            if (this.tabs[i].title == tabLabel) {
                return TAB_PREFIX + this.tabs[i].sectionId;
            }
        }
        
        return null;
    },
    
    getTabDivIdOfControl: function(controlId) {
        for (var i=0; i < this.tabs.length; i++) {
            if ($("#" + TAB_PREFIX + this.tabs[i].sectionId).find("#" + controlId).length == 1) {
                return TAB_PREFIX + this.tabs[i].sectionId;
            }
        }
        
        return null;
    },
    
    goToTab: function(tabDivId) {
        var index = $('#' + this.tabGroupDivId + ' a[href="#' + tabDivId + '"]').parent().index();
        $('#' + this.tabGroupDivId).tabs('select', index);
        
        $('html,body').animate({scrollTop: 0}, 500);
    },
    
    selectTab: function(tabId) {
        var $tabs = $('#' + this.tabGroupDivId).tabs();
        $tabs.tabs('select', tabId);
    },
    
    handleTabSelect: function(event, tab) {
        $('#mainForm').validationEngine('hide');
    }
}