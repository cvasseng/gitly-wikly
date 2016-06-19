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
  function pull() {
    gitly.showLoadIndicator();
    //av.SnackBar('Pulling latest from git');

    av.style(gitly.dom.doPull, {
      color: ''
    });

    log('started pull...');

    showLog();

    gitly.dom.doPull.className = 'icon fa fa-circle-o-notch fa-spin fa-fw';

    gitly.dlayer.pull({}, function (err, res) {

    });
  };

  function showLog() {
    av.style(gitly.dom.logContainer, {
      bottom: '0px',
      opacity: 1
    });
  }

  function hideLog() {
    av.style(gitly.dom.logContainer, {
      bottom: '-220px',
      opacity: 0.5
    });
  }

  function log(txt) {
    av.ap(gitly.dom.log, 
      av.cr('div', '', av.timestamp() + ': ' + txt)
    );
  }

  av.on(gitly.dom.closeLog, 'click', hideLog);
  //av.on(gitly.dom.showLog, 'click', showLog);

  gitly.git = {
    showLog: showLog,
    hideLog: hideLog,
    log: log,
    pull: pull
  };

});