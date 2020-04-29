$(document).ready(function () {
    $("#search-panels").sortable({
        axis: "x",
        handle: ".handle"
    }).disableSelection();
});