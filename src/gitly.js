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

var gitly = {
  showLoadIndicator: function () {
    av.style(gitly.dom.progress, {
      opacity: 1
    });
  },
  hideLoadIndicator: function () {
    av.style(gitly.dom.progress, {
      opacity: 0
    });
  }
};

av.ready(function () {
  av.on(window, 'popstate', function (e) {
    if (typeof gitly.index === 'undefined') {
      return;      
    }
    
    var indexTree = gitly.index.get();

    if (!indexTree) {
      return;
    }

    if (e.state.type === 'document') {
      gitly.documents.load(e.state.page);        
    } else if (e.state.type === 'tag') {
      if (indexTree.tags[e.state.tag]) {
        gitly.documents.loadSet('Documents tagged with ' + e.state.tag, indexTree.tags[e.state.tag]); 
      }
    } else if (e.state.type === 'category') {
      if (indexTree.categories[e.state.category]) {
        gitly.documents.loadSet('Documents categorized as ' + e.state.category, indexTree.categories[e.state.category]); 
      }
    }
  });
});