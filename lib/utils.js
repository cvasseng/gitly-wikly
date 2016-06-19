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

const fs = require('fs');
const colors = require('colors');

/*
  Yes, util files are bad practice.
  But the scope of this system is so small, that there's a very
  limited amount of "util" functions, so what the heck...
*/

module.exports = {

  trimLeadingSpaces: function (value) {
    while(value.length > 0 && value[0] === ' ') {
      value = value.substr(1);
    }
    return value;
  },

  //Wrapped in case we want to support log levels at some point..
  log: function(level) {
    var a = Array.prototype.slice.call(arguments);
    a.splice(0, 1);  
    console.log.apply(undefined, [(new Date()).toString().yellow].concat(a));
  },

  //Return true if what is a function
  isFn: function (what) {
    return (what && (typeof what === 'function') || (what instanceof Function));
  },

  //Check if a file or path exists
  exists: function (path, fn) {
    fs.access(path, fs.R_OK | fs.W_OK, (err) => {
      fn(!err);    
    });  
  },
  
  //Extract and replace tokens from a string
  tokenizeString: function (str, lDel, rDel, splitter, fn) {
    var l = lDel ? lDel.split('') : ['[', '['], 
        r = rDel ? rDel.split('') : [']', ']'],
        sp = splitter || '|',
        prop = '',
        inside = false,
        hit = false,
        res = '',
        cname = 'link'
    ;

    function check(a, from) {      
      for (var j = from; j < from + a.length; j++) {
        if (str[j] != a[j - from]) {
          return false;
        }
      }
      return true;
    }

    for (var i = 0; i < str.length; i++) {
      if (inside) {
        if (check(r, i)) {
          //We reached the end.
          prop = prop.split(sp);

          if (fn) {
            res += fn(prop);
          } 
          
          i += l.length - 1;
          inside = false;
        } else {
          prop += str[i];
        }
      } else if (check(l, i)) {
        prop = '';
        i += l.length - 1;
        inside = true;
      } else {
        res += str[i];
      }
    }
    return res;
  }
};