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

  //Add a new tag
  function addCat(cat, entries) {
    var item = av.cr('div', 'item'),
        title = av.cr('span', '', cat),
        right = av.cr('div', 'subtitle', entries.length + ' entries')
    ;

    av.showOnHover(item, right);

    av.on(item, 'click', function () {
      gitly.editor.hide(function () {
        gitly.documents.loadSet('Documents categorized as ' + cat, entries);
        window.history.pushState({
            type: 'cateogry',
            category: cat
        }, window.document.title, '#/category/' + cat);
      });
    });

    av.ap(gitly.dom.categories,
      av.ap(item,
        right,
        title
      )
    );
  }

  //Clear tags
  function clear() {
    gitly.dom.categories.innerHTML = '';
  }

  /////////////////////////////////////////////////////////////////////////////

  //When a new index has been loading, flush categories
  gitly.index.on('Loaded', function (indexTree) {
    gitly.dom.categories.innerHTML = '';

    Object.keys(indexTree.categories || {}).forEach(function(cat) {
      addCat(cat, indexTree.categories[cat]);
    });
  });

  /////////////////////////////////////////////////////////////////////////////

  gitly.categories = {
    clear: clear,
    add: addCat
  };

})();