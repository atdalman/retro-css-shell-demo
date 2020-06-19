import $ from "jquery";
$.get('/localhost:', {name:'Steve'}, function (data, textStatus, jqXHR) {$('p').append(data.firstName);});
