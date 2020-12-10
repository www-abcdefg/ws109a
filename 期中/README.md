# 期中作業(網路爬蟲)
## 什麼是網路爬蟲
* 網路爬蟲（英語：web crawler），也叫網路蜘蛛（spider），是一種用來自動瀏覽全球資訊網的網路機器人。其目的一般為編纂網路索引。
## 常見的網路爬蟲
* 搜尋引擎
* 網路服務商
* 數據搜集
* 盜文採集、垃圾流量網站
* 資安威脅
## 作業:code
* [code](https://github.com/www-abcdefg/ws109a/blob/master/%E6%9C%9F%E4%B8%AD/code.js)
...
        const request = require("request");
        const cheerio = require("cheerio");

        const pttCrawler = () => {
            request({
                url: "https://www.ptt.cc/bbs/Stock/index.html",
                method: "GET"
            }, (error, res, body) => {
                // 如果有錯誤訊息，或沒有 body(內容)，就 return
                if (error || !body) {
                    return;
                }

                const data = [];// 建立一個儲存結果的容器
                const $ = cheerio.load(body); // 載入 body
                const list = $(".r-list-container .r-ent");
                for (let i = 0; i < list.length; i++) {
                    const title = list.eq(i).find('.title a').text();//公告
                    const author = list.eq(i).find('.meta .author').text();//作者
                    const date = list.eq(i).find('.meta .date').text();//日期
                    const link = list.eq(i).find('.title a').attr('href');//網址

                    data.push(( title),(author),(date),(link));
                    //data.push({title,author,date,link});//有標題的ex  title: '[公告] Stock 股票板板規 V3   (2020/11/20 編修)'
                }

                console.log(data);
            });
        };
        pttCrawler();
        // 一天爬一次資料
        setInterval(pttCrawler,  24* 60 * 60 * 1000);
...
## 作業:code1
* [code1](https://github.com/www-abcdefg/ws109a/blob/master/%E6%9C%9F%E4%B8%AD/code1.js)
...
        var fs = require('fs');
        var http = require('http');
        var URI = require('URIjs');
        var c = console;

        var urlMap  = { };
        var urlList = [ ];
        var urlIdx  = 0;

        urlList.push(process.argv[2]); // 新增第一個網址

        crawNext(); // 開始抓

        function crawNext() { // 下載下一個網頁
        if (urlIdx >= urlList.length) 
            return;
        var url = urlList[urlIdx];
        if (url.indexOf('http://')!==0) {
            urlIdx ++;
            crawNext();
            return;
        }
        c.log('url[%d]=%s', urlIdx, url);
        urlMap[url] = { downlioad:false };
        pageDownload(url, function (data) {
            var page = data.toString();
            urlMap[url].download = true;
            var filename = urlToFileName(url);
            fs.writeFile('data/'+filename, page, function(err) {
            });
            var refs = getMatches(page, /\shref\s*=\s*["'#]([^"'#]*)[#"']/gi, 1);
            for (i in refs) {
            try {
            var refUri = URI(refs[i]).absoluteTo(url).toString();
            c.log('ref=%s', refUri);
            if (refUri !== undefined && urlMap[refUri] === undefined)
                urlList.push(refUri);
            } catch (e) {}
            }
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
        // 將網址改寫為合法的檔案名稱
        function urlToFileName(url) {
        return url.replace(/[^\w]/gi, '_');
        }
... 
## 作業:code2
* [code2](https://github.com/www-abcdefg/ws109a/blob/master/%E6%9C%9F%E4%B8%AD/code2.js)
...
        import { get, post } from './esearch.js'
        var urlList = [
        // 'http://msn.com', 
        'https://en.wikipedia.org/wiki/Main_Page'
        ]

        var urlMap = {}

        async function getPage(url) {
        try {
            const res = await fetch(url);
            return await res.text();  
        } catch (error) {
            console.log('getPage:', url, 'fail!')
        }
        }

        function html2urls(html) {
        var r = /\shref\s*=\s*['"](.*?)['"]/g
        var urls = []
        while (true) {
            let m = r.exec(html)
            if (m == null) break
            urls.push(m[1])
        }
        return urls
        }

        // await post(`/web/page/${i}`, {url, page})
        function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function craw(urlList, urlMap) {
        var count = 0
        for (let i=0; i<urlList.length; i++) {
        // for (let i=0; i<10; i++) {
            var url = urlList[i]
            console.log('url=', url)
            await sleep(2000);//delay
            if (!url.startsWith("https://en.wikipedia.org/wiki")) continue;
            console.log(url, 'download')
            count ++
            if (count >=10) break
            try {
            var page = await getPage(url)
            await post(`/web9/page/${count}`, {url, page})
            // await Deno.writeTextFile(`data/${i}.txt`, page)
            var urls = html2urls(page)
            // console.log('urls=', urls)
            for (let surl of urls) {
                var purl = surl.split(/[#\?]/)[0]
                var absurl = purl
                if (surl.indexOf("//")<0) { // 是相對路徑
                absurl = (new URL(purl, url)).href
                // console.log('absurl=', absurl)
                }
                if (urlMap[absurl] == null) {
                urlList.push(absurl)
                urlMap[absurl] = 0
                }
            }
            } catch (error) {
            console.log('error=', error)
            }
        }
        }

        await craw(urlList, urlMap)
...
## 描述與步驟
* code
    * 程式碼參考網路上資料讀懂並略作改寫
    * 步驟:
        * 安裝套件
            * 1.npm i request
            * 2.npm install cheerio
        * 寫程式碼
        * 執行方法： node code.js
* code1
    * 程式碼參考鍾誠老師gitlab上程式碼 了解程式碼並做部分改寫
    * 步驟:
        * 安裝套件: npm install URIjs
        * 寫程式碼
        * 執行方法： node code1 "網址"
* code2
    * 程式碼參考鍾誠老師gitlab上程式碼 了解程式碼並做部分改寫
    * 步驟:
        * [安装并运行 Elasticsearch](https://www.elastic.co/guide/cn/elasticsearch/guide/current/running-elasticsearch.html)
        * 寫程式碼
        * 執行方式: deno rum -A code2.js
## 作品參考來源:code參考網路上資料老師的gitlab上程式碼
**作品中所參考的資料，及我對其理解及改篇的程度。**
* 1.資料參考[使用 Node.js 來爬蟲吧！](https://b-l-u-e-b-e-r-r-y.github.io/post/PTTCrawler/)
* 2.對這個編譯器原始碼我可以理解
## 作品參考來源:code1參考老師的gitlab上程式碼
**作品中所參考的資料，及我對其理解及改篇的程度。**
* [網站設計進階](https://gitlab.com/ccckmit/course/-/wikis/%E9%99%B3%E9%8D%BE%E8%AA%A0/%E6%9B%B8%E7%B1%8D/%E7%B6%B2%E7%AB%99%E8%A8%AD%E8%A8%88/httpCrawler)
* 2.對這個編譯器原始碼我大部分可以理解
## 作品參考來源:code1參考老師的gitlab上程式碼
**作品中所參考的資料，及我對其理解及改篇的程度。**
* [ws](https://gitlab.com/ccc109/ws/-/tree/master/deno/14-elasticsearch)
* 2.對這個編譯器原始碼我大部分可以理解