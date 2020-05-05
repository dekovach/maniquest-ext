$(document).ready(function () {

	var self = this;
	this.model = new ManiModel();

	var bundleSelect = $("#bundle-select").selectmenu({
		select: changeBundleSelection
	});

	$("#bundle-header input").addClass("ui-widget ui-widget-content ui-corner-all");

	$("button").button();

	$("#bundle-config").button({
		icon: "ui-icon-gear",
		showLabel: true
	});

	$("#bundle-config").click(function (event) {
		window.open("config.html");
	});

	function restoreOptions(index = 0) {
		const urlParams = new URLSearchParams(window.location.search);
		const query = urlParams.get("s");
		const bundleId = urlParams.get("b");
		self.model.loadModel(function () {
			if (bundleId) {
				self.model.setSelectedBundleIndexByValue(bundleId);
			} else {
				self.model.setSelectedBundleIndex(index);
			}
			updateView();
			if (query) {
				$("#query").val(query);
				search();
			}
		});

	}

	function updateView() {
		updateBundleSelect();
		var bundle = self.model.getBundle();
		if (bundle) {
			bundleSelect.val(bundle.bundle_id);
		}
		bundleSelect.selectmenu("refresh");
		updatePanelsView(bundle);
	}

	function changeBundleSelection(event, data) {
		var bundleId = data.item.value;
		self.model.setSelectedBundleIndexByValue(bundleId);
		updatePanelsView();
	}

	function updateBundleSelect() {
		bundleSelect.find("option").remove();
		$.each(self.model.bundles, function () {
			bundleSelect.append($("<option />").val(this.bundle_id).text(this.bundle_name));
		});
		var bundle = self.model.getBundle();
	}

	function updatePanelsView() {
		var bundle = self.model.getBundle();

		$("#search-panels").children(".search-panel").remove();

		if (!bundle) return;

		var numPanels = bundle.bundle_engines.length;
		for (var i = 0; i < numPanels; i++) {
			var engs = bundle.bundle_engines[i];
			var bundleEl = createPanel(i, numPanels, $("#search-panels"), engs);
		}
	}

	function createPanel(index, numPanels, container, engines = []) {
		var mainEngine = "";
		var selectMenuString = "";

		if (engines && engines.length > 0) {
			mainEngine = engines[0];
			if (engines.length > 1) {
				// has alternatives
				selectMenuString = '<span class="header-right"><select class="alternatives-menu"> </select><span> ';
			}
		}
		var bundleEl = $(
			`<div class="search-panel split-1-${numPanels} l-box ui-header-reset">` +
			// '    <div class="alternatives"></div>' +
			'    <h3 class="search-panel-header panel-header ui-corner-top ui-state-default">' +
			`        ${mainEngine.engine}` +
			selectMenuString +
			'    </h3>' +
			'    <div class="panel-content">' +
			`        <iframe src="about:blank" id="iframe-${index}" seamless></iframe>` +
			'    </div>' +
			'</div>');

		bundleEl.data("url", mainEngine.url);
		container.append(bundleEl);

		if (selectMenuString.length > 0) {
			var alternativesMenuSelect = bundleEl.find("select.alternatives-menu");
			for (var i = 1; i < engines.length; i++) {
				var optionEl = $("<option />").val(engines[i].url).text(engines[i].engine);
				alternativesMenuSelect.append(optionEl);
			}

			alternativesMenuSelect.selectmenu({
				classes: {
					"ui-selectmenu-button": "alternatives-menu ui-button-icon-only demo-splitbutton-select"
				},
				position: { my: "right top", at: "right bottom", collision: "flip" },
				select: function (event, data) {
					var query = $("#query").val();
					var url = data.item.value;
					url = url.replace("%s", query);
					window.open(url, "_blank");
				}
			});
		}
	}

	restoreOptions();

	$("#search-button").click(search);

	function search() {
		var bundle = self.model.getBundle();
		var query = $("#query").val();
		$(".panel-content iframe").each(function (i, iframe) {
			var url = $(iframe).closest(".search-panel").data("url");
			if (url) {
				$(iframe).attr("src", url.replace("%s", query));
			}
		})

		updateURLSearchParams(query, bundle.bundle_id);
	}

	function updateURLSearchParams(query, bundle) {
		window.history.pushState({ s: query, b: bundle }, "ManiQuest", `?s=${query}&b=${bundle}`);
	}

	$("#query").click(function (event) {
		event.target.select();
	});

	$(document).keypress(function (event) {
		var key = event.which || event.keyCode;
		if (key == 19 && event.ctrlKey) { // ctrl + 's'
			// console.log(Date.now() + " : " + key);
			$("#query").select();
		}
	});
});

