$(document).ready(function () {
    var bundles = [];

    $("#tabs").tabs();


    var accordion = $("#bundles-accordion")
        .accordion({
            header: "> div > h3",
            collapsible: true
        })
        .sortable({
            axis: "y",
            handle: ".handle",
            stop: function (event, ui) {
                // IE doesn't register the blur when sorting
                // so trigger focusout handlers to remove .ui-state-focus
                ui.item.children("h3").triggerHandler("focusout");

                // Refresh accordion to handle new order
                $(this).accordion("refresh");
            }
        });

        accordion.disableSelection();

    function restoreOptions() {
        var self = this;
        chrome.storage.local.get({
            config_data: []
        }, function (data) {
            self.bundles = data.config_data
            updateView();
        });
    }

    function updateView() {
        for (var i = 0; i < this.bundles.length; i++) {
            var groupEl = $(
                '<div class="group">' + 
                '    <h3><span class="handle action-icon ui-icon ui-icon-grip-dotted-vertical"></span>' + 
                '    <span class="edit-bundle action-icon ui-icon ui-icon-pencil"></span>' +
                '    <span class="remove-bundle action-icon ui-icon ui-icon-trash"></span>' +
                    this.bundles[i].bundle_name + '</h3>' +
                '    <div class="group-content">' +
                '         <button id="add-engine-btn" class="ui-corner-all ui-button">Add</button>' +
                '        ' + getEnginesList(i, this.bundles[i].bundle_engines) +
                '    </div>' +
                '</div>');
            $("#bundles-accordion").append(groupEl);
            $(groupEl).find('#engines-sortable-' + i).sortable({
                handle: '.handle'
            }).disableSelection();
        }

        $("span.edit-engine").on("click", function(event) {
            editSearchEngine(this);
            event.stopPropagation(); 
            event.preventDefault();
        });
        accordion.accordion("refresh")
    }

    function getEnginesList(index, engines) {
        var res = '<ul id="engines-sortable-' + index + '" class="sortable">';
        for (eng in engines){
            res += '<li class="ui-state-default" ' + 
            'data-url="' + engines[eng].url + '" ' + 
            'data-name="' + engines[eng].engine + '" >' +
            '    <span>' + engines[eng].engine + '</span>'+ 
            '    <span class="handle action-icon ui-icon ui-icon-grip-dotted-vertical"></span>' + 
            '    <span class="edit-engine action-icon ui-icon ui-icon-pencil"></span>' +
            '    <span class="remove-engine action-icon ui-icon ui-icon-trash"></span>' +
            '</li>';
        }
        res += '</ul>';
        return res;
    }

    restoreOptions();

    function editSearchEngine(elem) {
        var engineElem = $(elem).parent();
        $("#engine-name").val(engineElem.data("name"));
        $("#url").val(engineElem.data("url"));
        
        engineDialog.dialog("open");
    }

    function saveEngine() {

    }

    var engineDialog = $("#engine-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Edit a search engine": saveEngine,
            Cancel: function () {
                engineDialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
        }
    });

    var dialog = $("#add-bundle-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Create a search bundle": addNewBundle,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    var form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addNewBundle();
    });

    $("#add-bundle-btn").on("click", function () {
        dialog.dialog("open");
    });

    function addNewBundle() {
        console.log("saving...");

        var valid = true;
        allFields.removeClass("ui-state-error");

        valid = valid && checkLength(bundle_name, "bundle name", 3, 16);
        valid = valid && checkLength(bundle_keyword, "keyword", 1, 10);

        if (valid) {
            console.log("form is valid");
        }

        dialog.dialog("close");
    }

    emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        bundle_name = $("#bundle_name"),
        bundle_keyword = $("#bundle_keyword"),
        allFields = $([]).add(bundle_name).add(bundle_keyword),
        tips = $(".validateTips");

    function updateTips(t) {
        tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " +
                min + " and " + max + ".");
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }
});