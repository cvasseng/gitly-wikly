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
  var refWin = av.Window({
        title: 'Reference Peek',
        width: 650,
        height: 450
      })
  ;


  gitly.referencePeek = function (ref) {
    var indexTree = gitly.index.get(),
        left = av.cr('div', 'gw-peek-left gw-box-size'),
        right = av.cr('div', 'gw-peek-right gw-box-size'),
        info = av.cr('div', '', 'Select a document on the left side to peek'),
        last = info,
        lastTitle = false
    ;

    if (!indexTree) {
      return;
    }

    refWin.show();
    refWin.setTitle('Peeking at ' + ref);
    refWin.body.innerHTML = '';

    av.ap(refWin.body, left, av.ap(right, info));

    if (indexTree.references && indexTree.references[ref]) {

     // refWin.body.innerHTML = '<i><b>' + ref + '</b> is referenced in ' + indexTree.references[ref].length + ' document(s)</i>';

      indexTree.references[ref].forEach(function (name) {
        var doc = indexTree.files[indexTree.documents[name]],
            title = av.cr('div', 'title', name),
            summary = av.cr('div', 'gw-box-size summary')
        ;

        av.ap(left, title);
        av.ap(right, summary);  

        // var doc = indexTree.files[indexTree.documents[name]],
        //     container = av.cr('div', 'gw-doc-peek'),
        //     summary = av.cr('div', 'summary'),
        //     load = av.cr('div', 'goto', 'Go to document...'),
        //     header = av.cr('h4', '', doc.title)
        // ;
        // if (doc) {

        av.on(title, 'click', function () {
          if (last) {
            av.style(last, {
              display: 'none'
            });
          }

          if (lastTitle) {
            lastTitle.className = 'title';
          }

          av.style(summary, {
            display: 'block'
          });

          title.className = 'title title-selected';

          last = summary;
          lastTitle = title;
        });

        //   av.on(load, 'click', function () {
        //     loadDocument(doc.title);
        //   });

        summary.innerHTML = marked(doc.contents);

        //   av.ap(refWin.body, 
        //     av.ap(container,
        //       header,
        //       summary,
        //       load
        //     )
        //   );
        // }
      });


    }
  };

  refWin.hide();

});