$(document).ready(function () {
    var self = this;
    self.model = {
        bundles: [],
        selectedBundleIndex: 0,
        getBundle: function () {
            return this.bundles[this.selectedBundleIndex];
        }
    }
    // var bundles = [];

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
        self.model.selectedBundleIndex = self.model.bundles.findIndex(item => item.bundle_id == bundleId);
        updateBundleHeader();
        updatePanelsView();
    }

    function updateBundleSelect() {
        $.each(self.model.bundles, function () {
            bundleSelect.append($("<option />").val(this.bundle_id).text(this.bundle_name));
        });
    }

    function updateBundleHeader() {
        var bundle = self.model.getBundle();
        $("#bundle-id").val(bundle.bundle_id);
        $("#bundle-keyword").val(bundle.bundle_keyword);
    }

    function updatePanelsView() {
        var bundle = self.model.getBundle();

        panelsSortable.children(".search-panel").remove();

        var numPanels = bundle.bundle_engines.length;
        for (var i = 0; i < numPanels; i++) {
            var engs = bundle.bundle_engines[i];
            var bundleEl = createPanel(i, numPanels);
            $("#search-panels").append(bundleEl);
            var enginesListEl = createEnginesList(i, engs);
            bundleEl.find(".panel-content").append(enginesListEl);
            enginesListEl.sortable({
                handle: '.handle'
            }).disableSelection();
        }

        // $("span.edit-engine").on("click", function(event) {
        //     editSearchEngine(this);
        //     event.stopPropagation(); 
        //     event.preventDefault();
        // });
        panelsSortable.sortable("refresh")
    }

    function createPanel(index, numPanels) {
        var bundleEl = $(
            `<div class="search-panel split-1-${numPanels} l-box ui-header-reset">` +
            '    <h3 class="panel-header ui-corner-top ui-state-default">' +
            '        <span class="panel-delete action-icon ui-icon ui-icon-trash"></span>' +
            index +
            '    </h3>' +
            '    <div class="panel-content">' +
            '         <button id="add-engine-btn" class="ui-corner-all ui-button">Add</button>' +
            '    </div>' +
            '</div>');
        return bundleEl;
    }

    function createEnginesList(index, engines) {
        var res = '<ul id="engines-sortable-' + index + '" class="sortable">';
        for (eng in engines) {
            res += '<li class="ui-state-default" ' +
                'data-url="' + engines[eng].url + '" ' +
                'data-name="' + engines[eng].engine + '" >' +
                '    <span>' + engines[eng].engine + '</span>' +
                '    <span class="handle action-icon ui-icon ui-icon-grip-dotted-vertical"></span>' +
                '    <span class="edit-engine action-icon ui-icon ui-icon-pencil"></span>' +
                '    <span class="remove-engine action-icon ui-icon ui-icon-trash"></span>' +
                '</li>';
        }
        res += '</ul>';
        return $(res);
    }

    restoreOptions();

    $("#add-panel").button({
        icon: "ui-icon-plus"
    }).on("click", function (event) {
        event.preventDefault();
        var numPanels = $(".search-panel").length;
        if (numPanels < 5) {
            var newPanel = createPanel(numPanels, numPanels+1);
            $(".search-panel").switchClass(`split-1-${numPanels}`, `split-1-${numPanels+1}`, 1000);
            $("#search-panels").append(newPanel);
        } else {
            alert("Maximum number of search panels is 5.")
        }
    });

});