/*
 * Version: 15-05-2012
 */
/*
 * This file contains functions for different environments.
 * The standard function is designed to help make different coaches uniform in configuration in any environment
 */
Lib.Config = function() {}
/*
Author: Harry Lee
This is a standardization funciton. Should be called in every coach for the purpoes of consistency across the process.
Must be called in the window.onload function:
e.g.:
var f = window.onload;
window.onload = function() {
    f();
    standard();
}
*/
Lib.Config.standard = function() {
    //Add labels to document attachment tables
    $('.twDocAttachment legend[class="twLabel"] ~ div.twDocAttachmentNoDocs').before('Click on a Title/Name to view revisions');
    $('.twDocViewer').before('Click on a File Name/URL to view its contents');
    
    //restore screen pos after table add/delete
    Lib.Cookie.restoreScreenPosition();
}

Lib.Config.dev = function() {
    /* Your code here */
}

Lib.Config.test = function() {
    /* Your code here */
}

Lib.Config.prod = function() {
    /* Your code here */
}