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
  var currentProvider = 'ajax',
      providers = {
        ajax: {},
        electron: {}
      }
  ;

  /////////////////////////////////////////////////////////////////////////////

  function ajaxCreator(path, tp, data, fn) {
    av.ajax({
      url: path,
      type: tp,
      data: data,
      success: function (res) {
        if (res && res.ok) {
          return av.isFn(fn) && fn(false, res);
        }
        return av.isFn(fn) && fn(false, res);
      }, 
      error: function (error) {
        return av.isFn(fn) && fn(error);
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////

  //Save document ajax
  providers.ajax.save = function (data, fn) {
    ajaxCreator('/save', 'post', data, fn);
  };

  //New document, ajax
  providers.ajax.new = function (data, fn) {
    ajaxCreator('/new', 'post', data, fn);
  };

  //Do a pull, ajax
  providers.ajax.pull = function (data, fn) {
    ajaxCreator('/pull', 'post', data, fn);
  };

  //Load index, ajax
  providers.ajax.index = function (data, fn) {
    ajaxCreator('/documents', 'get', data, fn);
  };

  /////////////////////////////////////////////////////////////////////////////

  //Save document, electron
  providers.electron.save = function (data, fn) {

  };

  //New document, electron
  providers.electron.new = function (data, fn) {

  };

  //Do a pull, electron
  providers.electron.pull = function (data, fn) {

  };

  //Load index, electron
  providers.electron.index = function (data, fn) {

  };

  /////////////////////////////////////////////////////////////////////////////

  //Build the exports
  function buildExports() {
    //Look at the first provider to figure things out
    Object.keys(providers[Object.keys(providers)[0]]).forEach(function (fname) {
      gitly.dlayer[fname] = function (data, fn) {
        if (typeof providers[currentProvider] !== 'undefined') {
          if (typeof providers[currentProvider][fname] !== 'undefined') {
            return providers[currentProvider][fname](data, fn);
          }
          return av.isFn(fn) && fn(currentProvider + ' does not have the ' + fname + ' data point');
        }
        return av.isFn(fn) && fn(currentProvider + ' is not a valid data provider');      
      };
    });    
  }

  gitly.dlayer = {};
  buildExports();

})();