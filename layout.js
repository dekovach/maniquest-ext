$(document).ready(function () {
    const NEW_BUNDLE_OPTION = "new-bundle-option";

    var self = this;
    self.model = {
        bundles: [],
        selectedBundleIndex: 0,

        setSelectedBundleIndexByValue: function(value) {
            this.selectedBundleIndex = this.bundles.findIndex(item => item.bundle_id == value);
        },

        addEmptyBundle: function() {
            this.bundles.push({
                    "bundle_id": "",
                    "bundle_name": "",
                    "bundle_keyword": "",
                    "bundle_engines": [[], []]
            });
            this.selectedBundleIndex = this.bundles.length - 1;
        },

        getBundle: function () {
            return this.bundles[this.selectedBundleIndex];
        },

        persistModel: function() {
            chrome.storage.local.set({
                config_data: this.bundles
            }, function() {});
        }
    }
    // var bundles = [];

    $("#bundle-header input").addClass("ui-widget ui-widget-content ui-corner-all");

    var bundleSelect = $("#bundle-select").selectmenu({
        select: changeBundleSelection
    });

    $("#bundle-header .action-button").button();

    var panelsSortable = $("#search-panels").sortable({
        axis: "x",
        handle: "h3.panel-header",
        containment: "#search-panels"
    }).disableSelection();

    function restoreOptions() {
        chrome.storage.local.get({
            config_data: []
        }, function (data) {
            self.model.bundles = data.config_data;
            self.model.selectedBundleIndex = 0;
            updateBundleSelect();
            var bundle = self.model.getBundle();
            bundleSelect.val(bundle.bundle_id).selectmenu("refresh");
            updateBundleHeader(bundle)
            updatePanelsView(bundle);
        });
    }

    function changeBundleSelection(event, data) {
        // TODO confirm if changes to be discarted
        var bundleId = data.item.value;
        if (bundleId == NEW_BUNDLE_OPTION) {
            self.model.addEmptyBundle();
        } else {
            self.model.setSelectedBundleIndexByValue(bundleId);
        }
        updateBundleHeader();
        updatePanelsView();
    }

    function updateBundleSelect() {
        $.each(self.model.bundles, function () {
            bundleSelect.append($("<option />").val(this.bundle_id).text(this.bundle_name));
        });
        bundleSelect.append( $("<option />").val(NEW_BUNDLE_OPTION).text("New Bundle...") );
    }

    function updateBundleHeader() {
        var bundle = self.model.getBundle();
        $("#bundle-id").val(bundle.bundle_id);
        $("#bundle-name").val(bundle.bundle_name);
        $("#bundle-keyword").val(bundle.bundle_keyword);
    }

    function updatePanelsView() {
        var bundle = self.model.getBundle();

        panelsSortable.children(".search-panel").remove();

        var numPanels = bundle.bundle_engines.length;
        for (var i = 0; i < numPanels; i++) {
            var engs = bundle.bundle_engines[i];
            var bundleEl = createPanel(i, numPanels, $("#search-panels"), engs);
        }

        // $("span.edit-engine").on("click", function(event) {
        //     editSearchEngine(this);
        //     event.stopPropagation(); 
        //     event.preventDefault();
        // });
        panelsSortable.sortable("refresh")
    }

    function createPanel(index, numPanels, container, engines = []) {
        var bundleEl = $(
            `<div class="search-panel split-1-${numPanels} l-box ui-header-reset">` +
            '    <h3 class="panel-header ui-corner-top ui-state-default">' +
            '        <span class="panel-delete action-icon ui-icon ui-icon-trash"></span>' +
            index +
            '    </h3>' +
            '    <div class="panel-content">' +
            '         <button class="add-engine-btn ui-corner-all ui-button">Add</button>' +
            '    </div>' +
            '</div>');
        // return bundleEl;

        container.append(bundleEl);
        var enginesListEl = createEnginesList(index, engines);
        bundleEl.find(".panel-content").append(enginesListEl);
        enginesListEl.sortable({
            handle: '.handle'
        }).disableSelection();
    }

    function createEnginesList(index, engines) {
        var res = '<ul id="engines-sortable-' + index + '" class="sortable">';
        for (eng in engines) {
            res += createEngineListitem(engines[eng].engine, engines[eng].url);
        }
        res += '</ul>';
        return $(res);
    }

    function createEngineListitem(engine, url) {
        var res = '<li class="engine-item ui-state-default" ' +
            'data-url="' + url + '" ' +
            'data-engine="' + engine + '" >' +
            '    <span class="engine-name">' + engine + '</span>' +
            '    <span class="handle action-icon ui-icon ui-icon-grip-dotted-vertical"></span>' +
            '    <span class="edit-engine action-icon ui-icon ui-icon-pencil"></span>' +
            '    <span class="remove-engine action-icon ui-icon ui-icon-trash"></span>' +
            '</li>';
        return res;
    }

    restoreOptions();

    $("#add-panel").button({
        icon: "ui-icon-plus"
    }).on("click", function (event) {
        event.preventDefault();
        var numPanels = $(".search-panel").length;
        if (numPanels < 5) {
            var newPanel = createPanel(numPanels, numPanels + 1, $("#search-panels"));
            $(".search-panel").switchClass(`split-1-${numPanels}`, `split-1-${numPanels + 1}`, 500 /* animation duration */);

            // $("#search-panels").append(newPanel);
        } else {
            alert("Maximum number of search panels is 5.")
        }
    });

    $("#search-panels").on("click", ".panel-delete", function (event) {
        // remove panel
        var panel = $(event.target).closest(".search-panel");
        var numPanels = $(".search-panel").length;
        var numEnginesInPanel = panel.find("li.ui-state-default").length;
        if (numPanels > 2) {
            if (numEnginesInPanel > 0) {
                confirmDelete(function () {
                    panel.remove();
                    $(".search-panel").switchClass(`split-1-${numPanels}`, `split-1-${numPanels - 1}`, 1000);
                });
            } else {
                panel.remove();
                $(".search-panel").switchClass(`split-1-${numPanels}`, `split-1-${numPanels - 1}`, 1000);
            }
        } else {
            alert("Less than 2 panels makes no sense.");
        }
    });

    $("#search-panels").on("click", "button.add-engine-btn", function (event) {
        $(event.target).next("ul.sortable").addClass("target");
        engineDialog.dialog("option", "isEdit", false);
        engineDialog.dialog("open");
        event.stopPropagation();
        event.preventDefault();
    });

    $("#search-panels").on("click", ".edit-engine", function (event) {
        var engineElem = $(this).parent();
        $("#engine").val(engineElem.data("engine"));
        $("#url").val(engineElem.data("url"));
        engineDialog.dialog("option", "isEdit", true);
        engineDialog.dialog("option", "engineElem", engineElem);
        engineDialog.dialog("open");
        event.stopPropagation();
        event.preventDefault();
    });

    $("#search-panels").on("click", ".remove-engine", function (event) {
        $(this).parent().remove();
        event.stopPropagation();
        event.preventDefault();
    });

    var engineDialog = $("#engine-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "OK": addEditEngine,
            Cancel: function () {
                engineDialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
        }
    });

    var form = engineDialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addEditEngine();
    });

    function addEditEngine(event) {
        var engine = $("#engine").val();
        var url = $("#url").val();

        var isEdit = engineDialog.dialog("option", "isEdit");
        if (isEdit) {
            var engineElem = engineDialog.dialog("option", "engineElem");
            engineElem.data("engine", engine);
            engineElem.data("url", url);
            engineElem.find("span.engine-name").text(engine);
        } else {
            var liEl = createEngineListitem(engine, url);
            $("ul.target").append($(liEl));
        }

        $("ul.target").removeClass("target");
        engineDialog.dialog("close");
    }

    function confirmDelete(callbackFn) {
        $("#dialog-confirm").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            autoOpen: true,
            buttons: {
                "Delete item": function () {
                    callbackFn();
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    }

    $("#dialog-confirm").dialog({
        autoOpen: false
    });

    $("#save-bundle").click(function (event) {
        var bundle_id = $("#bundle-id").val();
        var bundle_name = $("#bundle-name").val();
        var bundle_keyword = $("#bundle-keyword").val();

        var valid = true;
        valid &= bundle_id.trim().length > 0;
        valid &= self.model.bundles.every((item) => item.bundle_id != bundle_id);
        valid &= bundle_name.trim().length > 0;

        if (!valid) {
            alert("Config can't be saved! \nBundle id and name must be unique and non-empty.");
            return;
        }

        var bundle = self.model.getBundle();
        bundle.bundle_id = bundle_id;
        bundle.bundle_name = bundle_name;
        bundle.bundle_keyword = bundle_keyword;

        var bundle_engines = [];

        $("#search-panels .search-panel").each(function (i, item) {
            var engines = [];
            $(item).find("li.engine-item").each(function (j, liElem) {
                engines.push({
                    engine: $(liElem).data("engine"),
                    url: $(liElem).data("url")
                });
            });
            bundle_engines.push(engines);
        });

        bundle.bundle_engines = bundle_engines;

        // console.log(self.model.bundles);
        self.model.persistModel();
    });

});