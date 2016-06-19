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

const utils = require('./utils.js');
const indexTree = require('./indexTree.js');

var simpleGit = false;

function gitCommit(file, fn) {
  var itree = indexTree.get();

  if (simpleGit && itree && itree.files[file]) {
    utils.log(3, 'Git - committing file', file);
    simpleGit
      .add(file)
      .commit('changed "' + itree.files[file].title + '"')      
      .pull(function (err, update) {
        if (update && update.summary.changes) {
          indexTree.index(function () {            
            if (utils.isFn(fn)) {
              fn(false, file);
            }      
          });  
        } else {
          if (utils.isFn(fn)) {
            fn(false, file);
          }  
        }
      })
      .push('origin', 'master')
    ;
  }
}

function gitPull(fn, no) {
  if (simpleGit) {    
    utils.log(3, 'Git - pulling');
    simpleGit.pull(function(err, update) {
      var didChange = false;

      //SO the return from pull is kind of unpredictable.
      //You'd think that the summaries would be correct - not so!
      //In some cases, only the insertions/deletions objects are set,
      //and even if there are changes in there, the summary remains at 0.

      if (update) {
        if (update.summary.changes || update.summary.insertions || update.summary.deletions) {
          didChange = true;
        } else {
          didChange = Object.keys(update.insertions).length;
          if (!didChange) {
            didChange = Object.keys(update.deletions).length;   
            if (!didChange) {
              didChange = update.files.length;
            }         
          }
        }
      }

      utils.log(2, 'Git - pull completed', err, update);
      if (didChange) {
        utils.log(2, 'git - Remote changed, rebuilding index');
        indexTree.index(function () {
          if (utils.isFn(fn)) {
            fn(update.files);
          }        
        });   
      } else {
        if (utils.isFn(no)) {
          no();
        }
      }
    });    
  }
}

//Create the git handler
function initGit(path, fn) {
  utils.exists('.git', function (yes) {
    if (yes) {
      utils.log(2, 'Found git repo, enabled auto integrations');
      simpleGit = require('simple-git')(path);
     // gitPull();

      setInterval(function () {
        utils.log(3, 'git - looking for updates');
        simpleGit
          .fetch('origin', 'master')
          .status(function (err, status) {
            if (status && status.behind && utils.isFn(fn)) {
              utils.log(3, 'git - remote changes detected');
              fn();
            }          
          }
        );
      }, 60000);
    }
  });  
}

module.exports = {
  commit: gitCommit,
  pull: gitPull,
  init: initGit
};