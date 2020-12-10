var fs = require('fs');
var http = require('http');
var URI = require('URIjs');
var c = console;

var urlMap  = new Map();
var urlList = [ ];
var urlIdx  = 0;
var count = 0;
urlList.push(process.argv[2]); // 新增第一個網址

crawNext(); // 開始抓


function crawNext() { // 下載下一個網頁
  if (urlIdx >= 3) 
    return;
  var url = urlList[urlIdx];
  if (url.indexOf('http://')!==0) {
    urlIdx ++;
    crawNext();
    return;
  }
  //c.log('url[%d]=%s', urlIdx, url); 
  urlMap[url] = { downlioad:false };
  pageDownload(url, function (data) {
    var page = data.toString();
    urlMap[url].download = true;
    var filename = urlToFileName(url);
	//Save page to data
    fs.writeFile('data/'+filename, page, function(err) {
    });
    var refs = getMatches(page, /\shref\s*=\s*["'#]([^"'#]*)[#"']/gi, 1);
	/* console.log(refs); */
    for (i in refs) {
      try {
      var refUri = URI(refs[i]).absoluteTo(url).toString();
	  /* console.log("log :"+refUri); */
      /* c.log('ref=%s', refUri); */
      if (refUri !== undefined && urlMap[refUri] === undefined)
        urlList.push(refUri);
      } catch (e) {}
    }
	var myJSON = JSON.stringify(urlList);
	fs.writeFile('json/'+count+'.json', myJSON, function(err) {
    });
	count++;
	console.log(myJSON);
    urlIdx ++;
    crawNext();	
  });
}
// 下載一個網頁
function pageDownload(url, callback) {
  http.get(url, function(res) {
    res.on('data', callback);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}
// 取得正規表達式比對到的結果成為一個陣列
function getMatches(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        matches.push(match[index]);
    }
    return matches;
}

function mapToObj(map){
	const obj={};
	for(let [k,v] of map){
		obj[k] = v;
		return obj;
	}
	const json = JSON.stringify(myJson);
	console.log(json);
}
/* /* function saveAsJson(map) {
  return JSON.stringify([...map]);
  return JSON.stringify(strMapToObj(strMap));
  fs.writeFile('test.json', JSON.stringify(strMapToObj(map)));
} */
/*  將網址改寫為合法的檔案名稱 */
function urlToFileName(url) {
  return url.replace(/[^\w]/gi, '_');
}
