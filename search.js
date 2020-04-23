var engines = [];
window.onload = init;

function init(){
	var searchForm = document.getElementById("search_form");
	searchForm.addEventListener("submit", function(event) {
		event.preventDefault();
		search();
	})
	
	loadSearchEngines();
	addFocusShortcut();
	focusAndSelectSearch();
}

function search(){
	var keyword = document.getElementById("keyword").value;
	var engineGroupId = parseInt(document.getElementById("engineGroup").value);
	var queryEngines = engines[engineGroupId].engines;
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
		// ifrm.contentWindow.console.log= function() { /* nop to suppress logs from iframes */ };
	}

	updateURLSearchParams(keyword, engines[engineGroupId].group);
}

function loadSearchEngines(){
	fetch("engines.json")
		.then(response => response.json())
		.then(json => {
			engines = json; 
			queryByParameter();
		});
}

function queryByParameter() {
	const urlParams = new URLSearchParams(window.location.search);
	var keyword = urlParams.get("s");
	var group = urlParams.get("g");
	if (keyword) {
		document.getElementById("keyword").setAttribute("value", keyword);
		if (group) {
			groupId = engines.map(eng => eng.group).indexOf(group);
			if(groupId && groupId != -1){
				document.getElementById("engineGroup").value = groupId;
			}
		}
		search();
	}
}

function updateURLSearchParams(keyword, group) {
	window.history.pushState({s: keyword, g: group}, "ManiQuest", `?s=${keyword}&g=${group}`);
}

function searchFocusShortcut(e) {
	var key = e.which || e.keyCode;
	if (key == 19 && e.ctrlKey) { // ctrl + 's'
		// console.log(Date.now() + " : " + key);
		focusAndSelectSearch();
	}
}

function addFocusShortcut(){
	document.addEventListener("keypress", searchFocusShortcut, true);
	document.getElementById("keyword").addEventListener("click", focusAndSelectSearch);
	// cross origin security blocking error
	// var iframe1 = document.getElementById("iframe1");
	// iframe1.contentWindow.addEventListener('keypress', searchFocusShortcut)	;
}

function focusAndSelectSearch(){
	var searchInput = document.getElementById("keyword");
	searchInput.select();
}


