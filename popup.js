let openSearchPage = document.getElementById('open-search-page');
openSearchPage.onclick = function(element) {
	chrome.tabs.create({ url: chrome.extension.getURL("search.html") });
};

let openConfigPage = document.getElementById('open-config-page');
openConfigPage.onclick = function(element) {
	chrome.tabs.create({ url: chrome.extension.getURL("config.html") });
};
