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
  var container = gitly.dom.toolbarBody,
      defaultIcons = [
        
        //Home
        {
          icon: 'home',
          tooltip: 'Home',
          fn: gitly.documents.home
        },

        //View all
        {
          icon: 'archive',
          tooltip: 'View All Documents',
          fn: gitly.documents.viewAll
        },
        
        //New
        {
          icon: 'file-text-o',
          tooltip: 'New Document',
          fn: function () {
            av.Prompt('Document Name', function (name) {
              gitly.documents.new(name);
            });
          }
        },

        //Git log
        {
          icon: 'comment-o',
          tooltip: 'Pull Log',
          fn: gitly.git.showLog
        },

        //Import
        {
          icon: 'cloud-download',
          tooltip: 'Import URL',
          fn: gitly.import.show
        },

        //Git pull
        {
          icon: 'git',
          tooltip: 'Git Pull',
          fn: gitly.git.pull
        }
      ]
  ; 

  /////////////////////////////////////////////////////////////////////////////

  function addIcon(i) {
    var icon = av.cr('div', 'icon fa fa-' + i.icon);
    av.on(icon, 'click', i.fn);
    av.ap(container, icon);    
  }

  //Initialize defaults
  defaultIcons.forEach(addIcon);

  /////////////////////////////////////////////////////////////////////////////

  gitly.toolbar = {
    addIcon: addIcon
  };
});