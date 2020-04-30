'use strict';

chrome.runtime.onInstalled.addListener(function() {
    saveSearchEngines();
});

function saveSearchEngines() {
	fetch("config-data.json")
		.then(response => response.json())
		.then(json => {
			chrome.storage.local.set({config_data: json}, function() {
              });
		});
}

