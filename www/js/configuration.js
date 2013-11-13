require(['jquery',
         'vendor/jquery-ui',
         'vendor/jquery.scrollTo-min',
         'vendor/jquery.validate.min'],

function ($) {
    "use strict";

    // IDs
    var ALERT_DISPLAY_ID = "#alert-display";
    var ALERT_EDITOR_ID = "#alert-editor";
    var ALERT_TOGGLE_ID = "#toggle-alerts";
    var ALERT_FAV_UPDATE_ID = "#update-alerts";
    var CONSTANT_DISPLAY_ID = "#constant-display";
    var CONSTANT_EDITOR_ID = "#constant-editor";
    var CONSTANT_TOGGLE_ID = "#toggle-constants";
    var CONSTANT_FAV_UPDATE_ID = "#update-constants";
    var FUNCTION_DISPLAY_ID = "#function-display";
    var FUNCTION_EDITOR_ID = "#function-editor";
    var FUNCTION_TOGGLE_ID = "#toggle-functions";
    var FUNCTION_FAV_UPDATE_ID = "#update-functions";

    // Scrolling
    var SCROLL_SPEED = 200;
    var SCROLL_OPTIONS = {offset: -100}

    // Editors
    var functionEditor;
    var constantEditor;
    var alertEditor;

    // Autocomplete
    var equationAutoCompleteData;
    var autoCompleteOpen = false;

    $(function () {
        initFunctionConfig();
        initConstantConfig();
        initAlertConfig();
        
        initEquationAutoComplete();
        initDataTypes();
        // Init editor reset buttons
        $(document).find('.button.editor-reset').click(resetEditor);
    });

    // =================================================================================================
    // FUNCTION CONFIG
    // =================================================================================================
    function initFunctionConfig() {
        if (!hasConfig(FUNCTION_EDITOR_ID))
            return;
        
        // Init the favorites toggle button
        $(FUNCTION_TOGGLE_ID).button();
        $(FUNCTION_TOGGLE_ID).change(toggleFavorites);
        
        // Init the favorites update button
        $(FUNCTION_FAV_UPDATE_ID).click(updateFavoriteFunctions);

        // Init the edit and delete buttons
        $(FUNCTION_DISPLAY_ID).find('.delete-function').click(deleteFunction);
        $(FUNCTION_DISPLAY_ID).find('.edit-function').click(editFunction);
        
        // Init the editor form
        functionEditor = $(FUNCTION_EDITOR_ID)[0];
        functionEditor.reset();
        
        $(functionEditor).validate({
            submitHandler: submitFunction,
            rules: {
	            name: "required",
	            value: "required"
	        },
	        errorElement: "div",
            errorPlacement: function(error, element) {
                $(element).prev().before(error);
            },
	        onkeyup: false
        });
    }

    function editFunction(event) {
        var editButton = event.target;
        var functionData = getRowData(editButton);
        setFunctionEditorData(functionData);
        editConfig(functionEditor, functionData);
    }

    function submitFunction() {
        $.post('/HomeWatch/engineer/submit-function.php', getFunctionEditorData())
        .done(function(data) {
            functionEditor.reset();
            location.reload();
        })
        .fail(function(data) {
            alert("Error submitting function: " + (data.responseText ? data.responseText : data.statusText));
        });
        
        return false;
    }

    function deleteFunction(event) {
        var deleteButton = event.target;
        var functionID = getRowData(deleteButton).id;
        
        $.post('/HomeWatch/engineer/delete-function.php', {id: functionID})
        .done(function(data) { window.location.reload(); })
        .fail(function(data) { alert("Error deleting function: " + data.statusText); });
    }

    function getFunctionEditorData() {
        var functionEditorContents = $(functionEditor).contents();
        
        return {
            id: functionEditorContents.find('input[name=id]').val(),
            name: functionEditorContents.find('input[name=name]').val(),
            value: functionEditorContents.find('input[name=value]').val(),
            description: functionEditorContents.find('input[name=description]').val(),
			data_type: functionEditorContents.find('select[name=data_type]').val(),
			data_type_new_name: functionEditorContents.find('input[name=data_type_new_name]').val(),
			data_type_new_unit: functionEditorContents.find('input[name=data_type_new_unit]').val()
        };
    }

    function setFunctionEditorData(fn) {
        var functionEditorContents = $(functionEditor).contents();
        functionEditorContents.find('input[name=name]').val(fn.name);
        functionEditorContents.find('input[name=value]').val(fn.value);
        functionEditorContents.find('input[name=description]').val(fn.description);
        functionEditorContents.find('input[name=id]').val(fn.id);
        functionEditorContents.find('select[name=data_type]').val('data_type'+fn.data_type_id);
    }

    function updateFavoriteFunctions() {
        var favorites = getFavorites($(FUNCTION_DISPLAY_ID));
        
        $.post('/HomeWatch/engineer/update-favorite-functions.php', { favorites: favorites })
        .done(function(data) { window.location.reload(); })
        .fail(function(data) { alert("Error updating favorite functions: " + data.statusText); });
    }

    // =================================================================================================
    // CONSTANT CONFIG
    // =================================================================================================
    function initConstantConfig() {
        if (!hasConfig(CONSTANT_EDITOR_ID))
            return;
            
        // Init the favorites toggle button
        $(CONSTANT_TOGGLE_ID).button();
        $(CONSTANT_TOGGLE_ID).change(toggleFavorites);
        
        // Init the favorites update button
        $(CONSTANT_FAV_UPDATE_ID).click(updateFavoriteConstants);
        
        // Init the edit and delete buttons
        $(CONSTANT_DISPLAY_ID).find('.delete-constant').click(deleteConstant);
        $(CONSTANT_DISPLAY_ID).find('.edit-constant').click(editConstant);
        
        constantEditor = $(CONSTANT_EDITOR_ID)[0];
        constantEditor.reset();
        
        // Init the editor form
        $(constantEditor).validate({
            submitHandler: submitConstant,
            rules: {
	            name: "required",
	            value: {
	                required: true,
	                number: true
                }
	        },
	        errorElement: "div",
            errorPlacement: function(error, element) {
                $(element).prev().before(error);
            },
	        onkeyup: false
        });
    }

    function editConstant(event) {
        var editButton = event.target;
        var constantData = getRowData(editButton);
        setConstantEditorData(constantData);
        editConfig(constantEditor, constantData);
    }

    function submitConstant() {
        $.post('/HomeWatch/engineer/submit-constant.php', getConstantEditorData())
        .done(function(data) {
            constantEditor.reset();
            location.reload();
        })
        .fail(function(data) {
            alert("Error submitting constant: " + data.statusText);
        });
        
        return false;
    }

    function deleteConstant(event) {
        var deleteButton = event.target;
        var constantID = getRowData(deleteButton).id;
        
        $.post('/HomeWatch/engineer/delete-constant.php', {id: constantID})
        .done(function(data) { window.location.reload(); })
        .fail(function(data) { alert("Error deleting constant: " + data.statusText); });
    }

    function getConstantEditorData() {
        var constantEditorContents = $(constantEditor).contents();
        
        return {
            id: constantEditorContents.find('input[name=id]').val(),
            name: constantEditorContents.find('input[name=name]').val(),
            value: constantEditorContents.find('input[name=value]').val(),
            description: constantEditorContents.find('input[name=description]').val()
        };
    }

    function setConstantEditorData(constant) {
        var constantEditorContents = $(constantEditor).contents();
        constantEditorContents.find('input[name=name]').val(constant.name);
        constantEditorContents.find('input[name=value]').val(constant.value);
        constantEditorContents.find('input[name=description]').val(constant.description);
        constantEditorContents.find('input[name=id]').val(constant.id);
    }

    function updateFavoriteConstants() {
        var favorites = getFavorites($(CONSTANT_DISPLAY_ID));
        
        $.post('/HomeWatch/engineer/update-favorite-constants.php', { favorites: favorites })
        .done(function(data) { window.location.reload(); })
        .fail(function(data) { alert("Error updating favorite constants: " + data.statusText); });
    }

    // =================================================================================================
    // ALERT CONFIG
    // =================================================================================================
    function initAlertConfig() {
        if (!hasConfig(ALERT_EDITOR_ID))
            return;
               
        // Init the favorites toggle button
        $(ALERT_TOGGLE_ID).button();
        $(ALERT_TOGGLE_ID).change(toggleFavorites);
        
        // Init the favorites update button
        $(ALERT_FAV_UPDATE_ID).click(updateFavoriteAlerts);
        
        // Init the edit and delete buttons
        $(ALERT_DISPLAY_ID).find('.delete-alert').click(deleteAlert);
        $(ALERT_DISPLAY_ID).find('.edit-alert').click(editAlert);
        
        // Init the editor form
        alertEditor = $(ALERT_EDITOR_ID)[0];
        alertEditor.reset();
        
        $(alertEditor).validate({
            submitHandler: submitAlert,
            rules: {
	            name: "required",
	            value: "required"
	        },
	        errorElement: "div",
            errorPlacement: function(error, element) {
                $(element).prev().before(error);
            },
	        onkeyup: false
        });
    }

    function editAlert(event) {
        var editButton = event.target;
        var alertData = getRowData(editButton);
        setAlertEditorData(alertData);
        editConfig(alertEditor, alertData);
    }

    function submitAlert() {
        $.post('/HomeWatch/manager/submit-alert.php', getAlertEditorData())
        .done(function(data) {
            alertEditor.reset();
            location.reload();
        })
        .fail(function(data) {
            alert("Error Submitting Alert: " + data.statusText);
        });
        
        return false;
    }

    function deleteAlert(event) {
        var deleteButton = event.target;
        var rowData = getRowData(deleteButton);
        var alertID = rowData.id;
        var alertValue = rowData.value;
        
        $.post('/HomeWatch/manager/delete-alert.php', {id: alertID, value: alertValue})
        .done(function(data) { window.location.reload(); })
        .fail(function(data) { alert("Error deleting alert: " + data.statusText); });
    }

    function getAlertEditorData() {
        var alertEditorContents = $(alertEditor).contents();
        
        return {
            id: alertEditorContents.find('input[name=id]').val(),
            name: alertEditorContents.find('input[name=name]').val(),
            value: alertEditorContents.find('input[name=value]').val(),
            description: alertEditorContents.find('input[name=description]').val()
        };
    }

    function setAlertEditorData(alert) {
        var alertEditorContents = $(alertEditor).contents();
        alertEditorContents.find('input[name=name]').val(alert.name);
        alertEditorContents.find('input[name=value]').val(alert.value);
        alertEditorContents.find('input[name=description]').val(alert.description);
        alertEditorContents.find('input[name=id]').val(alert.id);
    }

    function updateFavoriteAlerts() {
        var favorites = getFavorites($(ALERT_DISPLAY_ID));
        
        $.post('/HomeWatch/engineer/update-favorite-alerts.php', { favorites: favorites })
        .done(function(data) { window.location.reload(); })
        .fail(function(data) { alert("Error updating favorite alerts: " + data.statusText); });
    }

    // =============================================================================================
    // GENERAL CONFIG
    // =============================================================================================
    function hasConfig(editorID) {
        return $(editorID)[0] != null;
    }
    
    function getRowData(rowElement) {
        var row = $(rowElement).closest("tr");
        
        return {
            id: row.attr('id').match(/\d+/)[0],
            data_type_id: $(row.children(".data_type")).attr('dt_id').match(/\d+/)[0],
            name: $(row.children(".name")[0]).text(),
            value: $(row.children(".value")).text(),
            description: $(row.children(".description")).text(),
            favorite: row.find(".favorite")[0].checked ? 1 : 0
        };
    }

    function getFavorites(configDisplay) {
        var favorites = [];
        
        $(configDisplay).find(".favorite").each(function() {
            var rowData = getRowData(this);
            if (rowData.favorite) {
                favorites.push(rowData.id);
            }
        });
        
        return favorites;
    }

    function editConfig(editor, data) {
        $.scrollTo(editor, SCROLL_SPEED, SCROLL_OPTIONS);
        
        // Make the legend red and add (EDITING "NAME") to text
        var legend = $(editor).find("legend")[0];
        legend.style.color = 'red';
        legend.innerHTML = legend.innerHTML.replace(/\(.*$/, ""); // Remove any existing (EDITING "NAME") text
        legend.innerHTML += " (EDITING \"" + data.name + "\")";
    }

    function resetEditor(event) {
        var clearButton = event.target;
        var form = $(clearButton).closest("form")[0];
        form.reset();
        
        var legend = $(form).find("legend")[0];
        legend.style.color = 'black';

        legend.innerHTML = legend.innerHTML.replace(/\(.*$/, "");
    }

    function toggleFavorites(event) {
        var toggleButton = event.target;
        var configDisplay = $(toggleButton).closest(".config-display")[0];
        
        if (toggleButton.checked) {
          $(configDisplay).find("input:not(:checked)").parents("tr").css('display', 'none');
        } else {
          $(configDisplay).find("input:not(:checked)").parents("tr").css('display', 'table-row');
        }
    }

    function initEquationAutoComplete() {
        $.get("/HomeWatch/engineer/autocomplete-data.php")
        .done(function(data) {
            equationAutoCompleteData = $.map(data, function (value, key) { return "$" + key + '$'; });
            
            if (hasConfig(FUNCTION_EDITOR_ID))
                addEquationAutoComplete($(FUNCTION_EDITOR_ID + " input[name=value]")[0]);
            
            if (hasConfig(ALERT_EDITOR_ID))
                addEquationAutoComplete($(ALERT_EDITOR_ID + " input[name=value]")[0]);
        })
        .error(function(data) {
            alert("Failed to get equation variables: " + data.statusText);
        });
    } 

    function initDataTypes() {
    	$.get("/HomeWatch/engineer/data-types.php")
    	.done(function(data) {
    		$('select.data_type').append($("<option />").val('').text("Not Selected"));
    		$('select.data_type').append($("<option />").val('data_type_new').text("New Data Type"));
    		for (var i in data)
    			$('select.data_type').append($("<option />").val('data_type'+i).text(data[i]));

    		$('select.data_type')
    		.change(function() {
    			$.each([$('input.data_type_new_name'), $('label.data_type_new_name'), 
    			        $('input.data_type_new_unit'), $('label.data_type_new_unit')], 
    			        function(ind,el) {
    				if ($('select.data_type').val() == 'data_type_new')
    					el.show();
    				else
    					el.hide();
    			});


    		});
    	})
    	.error(function(data) {
    		alert("Failed to get data types: " + data.statusText);
    	});
    }

    function addEquationAutoComplete(textbox) {
        $(textbox).autocomplete(
            { source: equationAutoCompleteData,
              autoFocus: false,
              disabled: true,
              focus: function(event, ui) {
                  autoCompleteOpen = true;
                  
                  // Get the text up to the caret position and replace the last variable tag with the focused item value
                  var replaceText = textbox.value.substring(0, textbox.selectionStart);
                  replaceText = replaceText.replace(/\$([^\$\s]+\$|[^\$]*)$/, ui.item.value);
                  
                  // Apply the text to the textbox
                  var endText = textbox.value.substr(textbox.selectionStart);
                  textbox.value = replaceText + endText;
                  
                  // Set the caret position to the end of the replaced text
                  textbox.selectionStart = textbox.selectionEnd = replaceText.length;
                  
                  // Let jquery-ui know that the event has been handled
                  event.preventDefault();
              },
              select: function(event, ui) {
                  // Let jquery-ui know that we have already handled inserting the selection text (in the focus handler)
                  event.preventDefault();
                  $(textbox).autocomplete("disable");
              },
              close: function(event, ui) {
                  autoCompleteOpen = false;
              }
        });
        
        $(textbox).keyup(onDBVarAutoCompleteTextChanged); 
    }

    function onDBVarAutoCompleteTextChanged(event) {
        if (autoCompleteOpen) return;
        
        var textbox = event.target;
        
        // Try to match the start of a variable up to the caret position
        var text = textbox.value.substring(0, textbox.selectionStart);        
        var match = text.match(/\$[^\$]*$/);
        
        // If there is a match, open the autocomplete box for that match
        if (match) {
            $(textbox).autocomplete("enable");
            $(textbox).autocomplete("search", match[0]);
        }
    }
});

