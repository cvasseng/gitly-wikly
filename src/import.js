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
  var container = av.cr('div', 'gw-log-container'),
      iURL= av.cr('input', 'gw-box-size'),
      iCategories= av.cr('input', 'gw-box-size'),
      iTags = av.cr('input', 'gw-box-size'),
      iTitle = av.cr('input', 'gw-box-size'),
      doImport = av.cr('button', '', 'Import'),
      close = av.cr('div', 'close fa fa-times-circle'),

      progress = av.cr('div', 'gw-import-progress')
  ;

  function show() {
    av.style(container, {
      bottom: '0px'
    });

    iURL.value = '';
    iTitle.value = '';
    iCategories.value = '';
    iTags.value = '';
  }

  function hide() {
    av.style(container, {
      bottom: '-220px'
    });
  }

  function showProgress() {
    av.style(progress, {
      opacity: 1,
      'pointer-events': 'all'
    });
  }

  function hideProgress() {
    av.style(progress, {
      opacity: 0,
      'pointer-events': 'none'
    });
  }

  iURL.placeholder = 'URL';
  iTitle.placeholder = 'Title (leave blank to guess)';
  iCategories.placeholder = 'Categories (separate by comma)';
  iTags.placeholder = 'Tags (separate by comma)';

  av.on(close, 'click', hide);

  av.ap(document.body, 
    av.ap(progress,
      av.cr('div', 'gw-dimmer'),
      av.ap(av.cr('div', 'progress'),
        av.cr('div', 'title', 'IMPORTING'),
        av.cr('div', 'fa fa-circle-o-notch fa-spin fa-fw')
      )
    ),

    av.ap(container,
      close,
      av.cr('h3', 'title', 'IMPORT SOURCE'),
      av.ap(av.cr('div'), iURL),
      av.ap(av.cr('div'), iTitle),
      av.ap(av.cr('div'), iCategories),
      av.ap(av.cr('div'), iTags),
      doImport
    )
  );

 // av.on(gitly.dom.import, 'click', show);

  av.on(doImport, 'click', function () {
    showProgress();
    hide();

    //av.SnackBar('Importing ' + url);
    av.ajax({
      url: '/import',
      type: 'post',
      data: {
        url: iURL.value,
        title: iTitle.value,
        tags: iTags.value,
        categories: iCategories.value
      },
      success: function (res) {
        if (res && res.ok === true) {
          gitly.index.fetch(false, function () {
            gitly.documents.load(res.file);            
            gitly.editor.show();
          });
        } else if (res) {
          av.SnackBar(res.error);
        }

        hideProgress();
      },
      error: function () {
        hideProgress();
      }
    });    
  });


  gitly.import = {
    show: show
  };

});