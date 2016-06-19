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
  function addTag(tag, entries) {
    var item = av.cr('div', 'item'),
        title = av.cr('span', '', tag),
        right = av.cr('div', 'subtitle', entries.length + ' entries')
    ;

    av.showOnHover(item, right);

    av.on(item, 'click', function () {
      gitly.editor.hide(function () {
        gitly.documents.loadSet('Documents tagged with ' + tag, entries);

        window.history.pushState({
            type: 'tag',
            tag: tag
        }, window.document.title, '#/tag/' + tag);
      });
    });

    av.ap(gitly.dom.tags,
      av.ap(item,
        right,
        title
      )
    );
  }

  //Clear tags
  function clear() {
    gitly.dom.tags.innerHTML = '';
  }

  /////////////////////////////////////////////////////////////////////////////

  //When a new index has been loading, flush categories
  gitly.index.on('Loaded', function (indexTree) {
    gitly.dom.tags.innerHTML = '';

    Object.keys(indexTree.tags || {}).forEach(function(tag) {
      addTag(tag, indexTree.tags[tag]);
    });
  });

  /////////////////////////////////////////////////////////////////////////////

  gitly.tags = {
    clear: clear,
    add: addTag
  };

})();