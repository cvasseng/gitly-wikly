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

function Create() {

  var fs = require('fs'),
      templates = {},
      hb = require('handlebars'),
      async = require('async'),
      exports = {}
  ;

  function loadTemplates(tdir, fn) {    
    var funs = []
    ;

    if (!tdir || tdir.length === 0) {
      return fn('Invalid path supplied to loadTemplates');
    }

    if (tdir[tdir.length - 1] !== '/') {
      tdir += '/';
    }

    fs.readdir(tdir, function (err, files) {
      if (err) {
        return console.log('Error fetching templates:', err);
      }

      files.forEach(function (file) {
        if (file.indexOf('.handlebars') > 0) {
          funs.push(
            function (next) {
              fs.readFile(tdir + file, function (err, data) {
                if (err) return next(err);
                templates[file.replace('.handlebars', '')] = hb.compile(data.toString());
                next(false);
              });
            }
          );
        }
      });
      async.waterfall(funs, fn);
    });    
  }
  
  function compile(tmpl, data) {
    if (!templates[tmpl]) {
      console.log('Could not find template ' + tmpl + ', unable to compile it.');
      return;
    }
    return templates[tmpl](data);
  }

  function dmp(tmpl, fname, data, fn) {      
    if (!templates[tmpl]) {
      console.log('Could not find template ' + tmpl + ', unable to dump it.');
      return;
    }
            
    fs.writeFile(fname, templates[tmpl](data), function (err) {
      fn(err);
    });
  }
  
  exports = {
    load: loadTemplates,
    dmp: dmp,
    compile: compile
  };

  return exports;
};

module.exports = Create;