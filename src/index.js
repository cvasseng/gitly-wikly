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

(function () {
  var indexTree = false,
      hasLoaded = false,
      events = av.events()
  ;

  //Fetch the document library
  function fetchIndex(noShow, fn) {

    gitly.dlayer.index({}, function (err, result) {
      var u, s, l = document.location.toString();

      indexTree = result = result || {};

      events.emit('Loaded', indexTree);

      if (!hasLoaded) {
        //Parse the current URL and set loadedDocument to it
        u = l.indexOf('#');
        if (u >= 0) {
          s = l.substr(u + 1).split('/');
          if (s.length > 1) {
            if (s[1] === 'document') {
              gitly.documents.overrideLoaded(s[2]);                  
            }
          }
        }

        hasLoaded = true;
      }
      
      gitly.documents.load(gitly.documents.loaded() || 'index', noShow);   

      if (av.isFn(fn)) {
        fn();
      }
    });
  }
  

  /////////////////////////////////////////////////////////////////////////////

  av.ready(fetchIndex);

  /////////////////////////////////////////////////////////////////////////////
  
  //Public interface
  gitly.index = { 
    //Listen to index events
    on: events.on,
    //Fetch the index
    fetch: fetchIndex,
    //Get the current index object - may be false
    get: function () {
      return indexTree;
    }
  };

})();