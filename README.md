harshpuppy-validator
====================

A simple, easy-to-use jQuery-based form validator


Author: Harry Lee
Updated: 2012-07-28

Validator is a client-side validation framework, giving developers the ability to validate 
fields with functions or regular expressions
Failed validation(s) would prevent the page from submission and provide error messages.

Requirements:
-jQuery
-jQuery-ui with highlight effect

Steps to use:
1) include the neccessary JS and CSS files
2) insert <div id="notifications"></div> to your HTML for where you want errors to display
3) call init()
4) add rules
5) call validate()

Example:
<script src="js/jquery-1.7.2.min.js"></script>
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