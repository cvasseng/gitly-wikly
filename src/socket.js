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
   var socket = io.connect();

    socket.on('Refreshed', function (files) {      
      av.SnackBar('Detected remote changes, re-indexing');
      gitly.index.fetch();

      if (files && av.isArr(files)) {
        //Add the files to the log
        files.forEach(function (file) {
          gitly.git.log('<b style="color:#33AA33;">' + file + '</b> changed');          
        });
      }
    }); 

    socket.on('HideLoader', function () { 
      gitly.dom.doPull.className = 'icon fa fa-git';     
      gitly.hideLoadIndicator();
       av.style(gitly.dom.doPull, {
        color: ''
      });

      gitly.git.log('pull completed.');
     // gitly.git.hideLog();
    });

    socket.on('RemoteChanges', function () {
     // av.SnackBar('There are remote changes. Better pull!');
      av.style(gitly.dom.doPull, {
        color: '#AA3333'
      });
    });
});