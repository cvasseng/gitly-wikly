/*

Copyright (c) 2016, Chris Vasseng

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in the 
Software without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to 
the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF 
OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

av.ready(function () {
  av.on(gitly.dom.searchInput, 'keyup', function (e) {
    var words = gitly.dom.searchInput.value.toLowerCase().split(' '),
        results = 0,
        docs = [],
        resCount = av.cr('div'),
        indexTree = gitly.index.get(),

        matches = {}
    ;   

    if (!indexTree) {
      return;
    }

    gitly.dom.mainContent.innerHTML = '<h1>Searching for "' + gitly.dom.searchInput.value + '"</h1>';
    av.ap(gitly.dom.mainContent, resCount);

    if (indexTree && indexTree.searchIndex) {
      words.forEach(function(word) {
        if (indexTree.searchIndex[word]) {
          //Found a hit
          results += indexTree.searchIndex[word].entries;

          Object.keys(indexTree.searchIndex[word].documents).forEach(function (key) {
            var doc = indexTree.files[indexTree.documents[key]],
                docLink = av.cr('h3', '', key + ' - ' + indexTree.searchIndex[word].documents[key].length + ' hit(s)'),
                summaries = av.cr('div', ''),
                from,
                go = av.cr('span', 'gw-link', 'Go to document...')                 
            ;

            indexTree.searchIndex[word].documents[key].some(function (pos, i) {
              from = pos - 100; if (from < 0) from = 0;                                

              av.ap(summaries,
                av.cr('div', 'gw-search-summary', (from ? '...' : '') + doc.contents.substr(from, 200).replace(word, '<span class="hit">' + word + '</span>') + (from + 200 < doc.contents.length ? '...' : ''))
              );

              if (i > 5) return true;
            });
            
            av.on(go, 'click', function () {
              gitly.documents.load(key);
            });

            av.ap(gitly.dom.mainContent, docLink, summaries, go);
          });            
        }
      });
    }

    resCount.innerHTML = results + ' results';


  });
});
