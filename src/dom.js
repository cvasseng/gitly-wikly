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

    //Export an interface to the dynamic nodes
    gitly.dom = {
      searchInput: av.cr('input', 'gw-box-size'),

      categories: av.cr('div', 'gw-listbox'),
      tags: av.cr('div', 'gw-listbox'),
      latest: av.cr('div', 'gw-listbox'),

      exportedReferences: av.cr('div', 'gw-listbox'),
      externalReferences: av.cr('div', 'gw-listbox'),
      documentMeta: av.cr('div', 'gw-listbox'),

      doEdit: av.cr('div', 'doedit fa fa-pencil-square-o'),
      mainContent: av.cr('div', 'gw-main-content'),
      mainEditor: av.cr('textarea', 'gw-editor'),

      editorExit: av.cr('div', 'icon fa fa-times'),
      editorSave: av.cr('div', 'icon fa fa-floppy-o'),

      toolbarBody: av.cr('div', 'gw-main-toolbar'),

      collections: av.cr('div', 'gw-listbox gw-box-size'),

      // viewAll: av.cr('div', 'icon fa fa-archive'),
      // goHome: av.cr('div', 'icon fa fa-home'),
      // createNew: av.cr('div', 'icon fa fa-file-text-o'),
      // doPull: av.cr('div', 'icon fa fa-git'),
      // showLog: av.cr('div', 'icon fa fa-comment-o'),
      // import: av.cr('div', 'icon fa fa-cloud-download'),

      middle: av.cr('div', 'middle gw-box-size', ''),
      editorContainer: av.cr('div', 'gw-editor-container'),

      log: av.cr('div', 'gw-log gw-box-size'),
      logContainer: av.cr('div', 'gw-log-container'),
      closeLog: av.cr('div', 'close fa fa-times-circle'),

      progress: av.cr('div', 'gw-progress-indicator fa fa-circle-o-notch fa-spin fa-3x fa-fw')
    };

    //Put everything together
    av.ap(document.body, 

      av.ap(gitly.dom.logContainer,
          gitly.dom.closeLog,
          av.cr('h3', 'title', 'PULL LOG'),
          gitly.dom.log
      ),

      gitly.dom.progress,
      av.ap(av.cr('div', 'gw-box-size gw-main'),

        //Left panel
        av.ap(av.cr('div', 'left gw-box-size gw-noselection'),

          av.ap(av.cr('div', 'gw-box-size sticky'),
            av.ap(gitly.dom.toolbarBody//,
              // gitly.dom.goHome,
              // gitly.dom.createNew,
              // gitly.dom.viewAll,              
              // gitly.dom.showLog,
              // gitly.dom.import,
              // gitly.dom.doPull
            ),
            av.cr('hr'),
            av.ap(av.cr('div', 'gw-search-box'),
              gitly.dom.searchInput,
              av.cr('div', 'icon fa fa-search')
            )
          ),

          av.cr('div', 'gw-top-left-padding'),
          av.cr('h1', '', 'CATEGORIES'),
          gitly.dom.categories,
          av.cr('h1', '', 'TAGS'),
          gitly.dom.tags,
          //av.cr('h1', '', 'COLLECTIONS'),
          //gitly.dom.collections,
          av.cr('hr'),
          av.cr('div', 'gw-info', 'Gitly Wikly v0.0.1')
        ),

        //Middle panel
        av.ap(gitly.dom.middle,
          gitly.dom.mainContent,
          av.ap(gitly.dom.editorContainer,
            gitly.dom.mainEditor,
            av.ap(av.cr('div', 'toolbar'),
              gitly.dom.editorSave,
              gitly.dom.editorExit
            )
          ),
          gitly.dom.doEdit
        ),

        //Right panel
        av.ap(av.cr('div', 'right gw-box-size gw-noselection', ''),
          av.cr('h1', '', 'CROSS REFERENCES'),
          gitly.dom.externalReferences,
          av.cr('h1', '', 'EXPORTED REFERENCES'),
          gitly.dom.exportedReferences,
          av.cr('h1', '', 'DOCUMENT META'),          
          gitly.dom.documentMeta          
        )
      )
    );
});