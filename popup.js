let openSearchPage = document.getElementById('openSearchPage');

openSearchPage.onclick = function(element) {
	console.log(chrome.extension.getURL("search.html"));
	chrome.tabs.create({ url: chrome.extension.getURL("search.html") });
};
