"strict"

var whiteListURL = '/whitelist';
var blackListURL = '/blacklist';
var whiteList = 'whiteList';
var blackList = 'blackList';

function addInTable(table) {
  return function (data) {
    if (data.status === 'fail') {
      alert('fail load list :(');
      return;
    }

    for(var key in data.result) {
      $('.' + table).append(
        '<option id="' + key + '" onclick="removeSite(' + table + ','+ key +')">' + data.result[key] + '</option>');
    }
  }
}

function loadFilterLists(url, toClass){
  $.get(url, addInTable(toClass));
};

function removeSite(list, id){
  var url = (list === whiteList)? whiteListURL : blackListURL;

  $.ajax({
    type: "delete",
    url: url + '/' + id,
    data: {},
    success: function(data){
      if (data.status === 'fail'){
          alert('fail delete ' + id +' site');
          return;
        }

      $('.' + table).find('#'+id).remove();
    }
  });
}

function addSite(list){
  var url = (list === whiteList)? whiteListURL : blackListURL;

  var site = $('.input_' + list).val();

  $.post(url, {site}, addInTable(list));
}

function removeAll(list){
  var url = (list === whiteList)? whiteListURL : blackListURL;

  $.ajax({
    type: "delete",
    url: url,
    data: {},
    success: function(data){
      if (data.status === 'fail'){
          alert('fail delete all');
          return;
        }

      $('.' + list).find('option').remove();
    }
  });
}

loadFilterLists(whiteListURL, whiteList);
loadFilterLists(blackListURL, blackList);
