function search(){
	var keyword = document.getElementById("keyword").value;
	document.getElementById("thefreedictionary").src = "https://www.thefreedictionary.com/" + keyword;
	document.getElementById("rechnikoffnet").src = "https://recnik.off.net.mk/recnik/angliski-makedonski/" + keyword + "*";
	document.getElementById("dictcc").src = "https://m.dict.cc/?s=" + keyword;
}

var engines = [];

function searchEngines(){
	var keyword = document.getElementById("keyword").value;
	var selectedEngine = parseInt(document.getElementById("engineGroup").value);
	var queryEngines = engines[selectedEngine].engines;
	var enginesDOM = document.getElementById("engines");
	
	for (var i = 1; i<=3; i++) {
		var altDOM = document.getElementById("alternative" + i);
		altDOM.innerHTML = "<span>More: </span>";
		for (var j = 0; j<queryEngines[i-1].alternatives.length; j++) {
			var a = document.createElement("a");
			var alt = queryEngines[i-1].alternatives[j];
			a.href = queryEngines[i-1].alternatives[j].baseUrl.replace("%s", keyword);
			a.innerHTML = alt.engine;
			a.target = "about:blank";
			altDOM.appendChild(a);
		}
		var ifrm = document.getElementById("iframe"+i)
		ifrm.src = queryEngines[i-1].baseUrl.replace("%s", keyword);
		ifrm.contentWindow.console.log= function() { /* nop to suppress logs from iframes */ };
	}
}

function loadSearchEngines(){
	fetch("engines.json")
		.then(response => response.json())
		.then(json => {engines = json; queryByParameter()});
}

function queryByParameter() {
	const urlParams = new URLSearchParams(window.location.search);
	var keyword = urlParams.get("s");
	var group = urlParams.get("g");
	if (keyword) {
		document.getElementById("keyword").setAttribute("value", keyword);
		if (group) {
			document.getElementById("engineGroup").value = group;
		}
		searchEngines();
	}
}

function searchFocusShortcut(e) {
	var key = e.which || e.keyCode;
	if (key == 19 && e.ctrlKey) {
		// console.log(Date.now() + " : " + key);
		focusAndSelectSearch();
	}
}

function addFocusShortcut(){
	document.addEventListener("keypress", searchFocusShortcut, true);
	// cross origin security blocking error
	// var iframe1 = document.getElementById("iframe1");
	// iframe1.contentWindow.addEventListener('keypress', searchFocusShortcut)	;
}

function focusAndSelectSearch(){
	var searchInput = document.getElementById("keyword");
	searchInput.select();
}

function init() {
	var searchForm = document.getElementById("search_form");
	searchForm.addEventListener("submit", function(event) {
		event.preventDefault();
		searchEngines();
	})

	loadSearchEngines();
	addFocusShortcut();
	focusAndSelectSearch();
}

window.onload = init;
