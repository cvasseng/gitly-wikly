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
  var loadedDocument = false,
      unsavedChanges = false,
      events = av.events()
  ;

  //Save the current document
  function saveCurrent(e, d) {
    if (loadedDocument) {

      gitly.dlayer.save(
        {         
          document: loadedDocument,
          contents: gitly.editor.get()        
        },
        function (err, res) {
          if (err) {
            av.SnackBar('ERROR SAVING ' + err);
          } else {
            gitly.index.fetch(!d);
            gitly.editor.clearUnsaved();
            av.SnackBar('DOCUMENT SAVED');
          }
          gitly.dom.mainEditor.focus();
        }
      );
    }
  }

  function createNewDocument(name) {
    gitly.dlayer.new(
      {
        title: name
      },
      function (err, res) {
        if (err) {
          av.SnackBar('Error creating the document: ' + res.error);
        } else {
          av.SnackBar('Document created');

          events.emit('NewDocument');

          loadedDocument = name;
          gitly.index.fetch(false, function () {
            gitly.editor.show();
          });
        }
      }
    );
  }

  function highlightReferences(str) {
    return av.matchAndReplaceWithin(str, false, false, false, function (property) {
      return '<span class="gw-reference-sentence">' + property[0] + '</span>';
    });
  }

  function extractManuscript(str) {
    return av.matchAndReplaceWithin(str, '[!manuscript', 'manuscript!]', '--->' , function (property) {
        console.log(property);
      if (property.length > 1) {
        return  '<div class="chapter">' + property[0] + '</div>' +
                '<div class="manuscript">' + property[1].replace(/\n/g, '<br/>').replace(/(\t)|(\s\s\s\s)/g, '<div class="tab">&nbsp;</div>')+ '</div>';
      } else {
        //return '<div class="manuscript">' + property[0].replace(/\t/g, '&nbsp;&nbsp;') + '</div>';        
        return '<b>Whops!</b> You have an error in your manuscript syntax!\nExpected `[!manuscript <chapter name> ---> <body> manuscript!]`';
      }

    });
  }

  function buildDocumentMeta(doc) {
    gitly.dom.documentMeta.innerHTML = '';
    if (doc.meta) {
      Object.keys(doc.meta).forEach(function (key) {
        av.ap(gitly.dom.documentMeta,
          av.cr('div', 'item'),
          av.cr('div', '', key + ': ' + doc.meta[key])
        );
      });
    }
  }

  function buildDocumentExpRefs(doc) {
    gitly.dom.exportedReferences.innerHTML = '';
    doc.myReferences.forEach(function (ref) {
      av.ap(gitly.dom.exportedReferences, av.cr('div', 'item', ref));
    });
  }

  function buildDocumentXRefs(data, doc, indexTree) {
    gitly.dom.externalReferences.innerHTML = '';
    Object.keys(indexTree.references).forEach(function (ref) {  
      var node, right, others;

      if (data.indexOf(ref) >= 0) {

        //This is where it gets sucky, we need to check that there are more than this document
        //referencing.
        others = indexTree.references[ref].filter(function (source) {
          return source !== doc.title;
        });

        if (others.length === 0) {
          return;
        }

        node = av.cr('div', 'item');
        right = av.cr('div', 'subtitle', 'ref. in ' + indexTree.references[ref].length + ' document(s)');

        av.showOnHover(node, right);

        av.on(node, 'click', function () {
          gitly.referencePeek(ref);
        });

        data = data.replace(ref, '<span class="gw-reference-found" onclick="gitly.referencePeek(\'' + ref + '\')">' + ref + '</span>');

        av.ap(gitly.dom.externalReferences, 
          av.ap(node,
            right,
            av.cr('span', '', ref)
          )
        );
      }
    });

    return data;
  }

  function loadDocument(name, noShow) {      
    var indexTree = gitly.index.get() || {documents: {}, files: {}},
        fname = indexTree.documents[name],
        doc = indexTree.files[fname],
        data = '',
        badges = '',
        cr        
    ;

    if (!indexTree) {
      return;
    }

    if (!doc) {
      doc = indexTree.files[name];
      fname = name;
    }

    loadedDocument = false;              

    av.style(gitly.dom.doEdit, {
      display: 'none'
    });        
  

    if (typeof doc !== 'undefined') {
      loadedDocument = fname;

      //Ugly..
      doc.categories.forEach(function (cat) {
        badges += '<span class="gw-badge-category">' + cat + '</span>'
      });

      doc.tags.forEach(function (tag) {
        badges += '<span class="gw-badge-tag">' + tag + '</span>'
      });

      data = ['# ', doc.title ,'\n', badges, '\n\n', highlightReferences(extractManuscript(doc.contents))].join('');      
      
      gitly.editor.edit(doc);

      //Build the meta
      buildDocumentMeta(doc);
      //Build the "Exported references" view
      buildDocumentExpRefs(doc);
      //Find a list of all cross-references - super expensive
      data = buildDocumentXRefs(data, doc, indexTree);

      window.document.title = 'GitlyWikly - ' + doc.title;
      
      window.history.pushState({
        type: 'document',
        page: doc.title
      }, window.document.title, '#/document/' + doc.title);

      gitly.dom.mainContent.innerHTML = marked(data);  

      if (!noShow) {
        av.style(gitly.dom.doEdit, {
          display: ''
        });
      }
    } else {
      cr = av.cr('span', 'gw-link', 'Create it!');

      av.on(cr, 'click', function () {
        createNewDocument(name);
      });

      av.ap(gitly.dom.mainContent, 
        av.cr('h1', '', 'Ops, the document doesn\'t exist...'),
        av.cr('span', '', 'The requested document '),
        av.cr('b', '', name),
        av.cr('span', '', ' does not exist.'),
        av.cr('br'),
        av.cr('br'),
        cr
      );
    } 
  }

  //Load a set of documents (ie a document index)
  function loadDocumentSet(name, set) {
    loadedDocument = false;

    if (!set || !set.length) {
      gitly.dom.mainContent.innerHTML = 'No results';
    } else {
      set.sort();
      gitly.dom.mainContent.innerHTML = '<h1>' + name + '</h1>';
      set.forEach(function (entry) {
        var e = av.cr('li', 'link', entry);

        av.on(e, 'click', function () {
          loadDocument(entry);
        });

        av.ap(gitly.dom.mainContent, e);
      });
    }

    av.style(gitly.dom.doEdit, {
      display: 'none'
    });
  }

  function loaded() {
    return loadedDocument;
  }

  function overrideLoaded(n) {
    loadedDocument = n;
  }

  function home() {
    gitly.editor.hide(function () {
      loadDocument('index');
    });
  }

  function viewAll() {
    gitly.editor.hide(function () {
      var indexTree = gitly.index.get();

      if (indexTree) {
        loadDocumentSet('All Documents', Object.keys(indexTree.documents).map(function (key) {
          return key;
        }));
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////  

  gitly.documents = {
    //New document
    new: createNewDocument,
    //Listen to event
    on: events.on,
    //Load a single document
    load: loadDocument,
    //Load a set of documents
    loadSet: loadDocumentSet,
    //Get the currently loaded document
    loaded: loaded,
    //Save current document
    saveCurrent: saveCurrent,
    //Override loaded 
    overrideLoaded: overrideLoaded,
    //Go home
    home: home,
    //View all documents
    viewAll: viewAll
  };

})();