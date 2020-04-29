$(document).ready(function () {
    $("#tabs").tabs();
    $("#groups").sortable({
        items: "li:not(.ui-state-disabled)",
        handle: ".handle"
    });
    $("#groups").disableSelection();


    dialog = $("#add-bundle-form").dialog({
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

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addNewBundle();
    });

    $("#add_bundle_btn").on("click", function () {
        dialog.dialog("open");
    });

    function restoreOptions() {
        // Use default value color = 'red' and likesColor = true.
        chrome.storage.local.get({
            config_data: []
        }, function (data) {
            bundles = data.config_data
            for (var i = 0; i < bundles.length; i++) {
                $("#groups").append('<li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s handle"></span>' + bundles[i].bundle_name + '</li>');
            }
            $("#groups").sortable("refresh")
            //   document.getElementById('tab-1').innerHTML = items.engine_bundles;
        });
    }

    restoreOptions();

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