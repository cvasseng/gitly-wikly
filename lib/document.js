#!/usr/bin/env node

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

const utils = require('./utils');
const indexTree = require('./indexTree');
const git = require('./git');
const fs = require('fs');
const request = require('request');
const sanitizeHtml = require('sanitize-html');
const path = process.cwd();

var templates = false;

///////////////////////////////////////////////////////////////////////////////

//Save a document
function saveDocument(name, contents, fn) {
  var itree = indexTree.get()      
  ;

  if (!name) {
    return utils.isFn(fn) && fn('missing document name');
  }

  if (itree) {
    if (typeof itree.files[name] === 'undefined') {
      return utils.isFn(fn) && fn('file does not exist');
    }

    fs.writeFile(name, contents, function (err) {
      if (err) {
        return utils.isFn(fn) && fn(err);
      }
      indexTree.index(function (err) {
        if (err) {
          return utils.isFn(fn) && fn(err);
        }

        if (utils.isFn(fn)) {
          fn(false, name);
        }        

        git.commit(name);
      });
    });

  } else {
    return utils.isFn(fn) && fn('no index tree loaded');
  }
}

//Create a new document
function createDocument(title, fn) {
  var itree = indexTree.get(),
      fname = path + '/' + title.replace(/\s/g, '_') + '.md'
  ;  

  if (!title) {
    return utils.isFn(fn) && fn('missing document name');
  }

  if (!templates) {
    return utils.isFn(fn) && fn('no templates loaded');
  }
   
  if (indexTree.exists(fname)) {   
    return utils.isFn(fn) && fn('document already exists');
  }

  if (itree) {
    templates.dmp(
      'new',
      fname,
      {
        title: title,
        date: new Date()
      },
      function (err) {
        if (err) {
          return utils.isFn(fn) && fn(err);
        }
        indexTree.index(function (err) {
          if (err) {
            return utils.isFn(fn) && fn(err);
          }

          if (utils.isFn(fn)) {
            fn(false, fname);
          }

          git.commit(fname);
        });        
      }
    );
  } else if (utils.isFn(fn)) {
    fn('no index tree loaded');
  }
}

//Import a document
function importDoucment(title, categories, tags, url, fn) {
  var fname;

  if (!templates) {
    return utils.isFn(fn) && fn('no templates loaded');
  }

  if (url) {

    utils.log(3, 'importing ' + url);

    if (url[url.length - 1] === '/') {
      return utils.isFn(fn) && fn('cannot import paths');
    }

    if (!tags) tags = 'Untagged';
    if (!categories) categories = 'Imported';
    
  
    request(url, function (error, response, body) {
      if (error) return utils.isFn(fn) && fn(error);

      if (!title) {      
        title = url.substr(url.lastIndexOf('/') + 1);

        //We could be parsing an html page, so try to extract <title>THING</title>
        utils.tokenizeString(body, '<title>', '</title>', '~', function (p) {
          title = p[0];
        });
      }
      
      fname = path + '/' + title.replace(/\s/g, '_') + '.md';

      if (indexTree.exists(fname)) {      
        return utils.isFn(fn) && fn('file ' + fname + ' already exists');
      }

      templates.dmp(
        'import',
        fname,
        {
          title: title,
          date: new Date(),
          categories: categories,
          tags: tags,
          url: url,
          body: sanitizeHtml(body, {
            allowedTags: [ 
              'b', 
              'i', 
              'em', 
              'strong', 
              'p', 
              'pre', 
              'table', 
              'tr', 
              'td', 
              'th', 
              'thead', 
              'tbody', 
              'center', 
              'h1', 
              'h2', 
              'h3', 
              'h4', 
              'h5', 
              'blockquote', 
              'ol', 
              'li', 
              'cite', 
              'img'
            ],
            allowedAttributes: {
              table: ['style', 'width', 'height'],
              th: ['style', 'scope', 'width', 'height'],
              td: ['style', 'scope', 'width', 'height'],
              tr: ['style', 'scope', 'width', 'height'],
              img: ['src', 'alt', 'width', 'height', 'style']
            },
            transformTags: {
              img: function(tagName, attribs) {
                var s = '', 
                    u = url.substr(0, url.lastIndexOf('/'))
                ;
                
                if (attribs.src) {
                  if (attribs.src.indexOf('//') === 0) {
                    s = 'https:' + attribs.src;
                  } else {
                    s = u + '/' + attribs.src;                    
                  }
                }  

                return {
                    tagName: 'img',
                    attribs: {
                        src: s
                    }
                };
              }
            }
          })          
        },
        function (err) {
          if (err) return utils.isFn(fn) && fn(err);
          indexTree.index(function (err) {
            if (!err) {
              //To speed things up, call the handler right away rather than post-commit
              utils.isFn(fn) && fn(false, fname);
              git.commit(fname);
            } else if (utils.isFn(fn)) {
              fn(err);
            }
          });
        }
      );
    });
  } else {
    return utils.isFn(fn) && fn('no url specified');
  }
}

function setTemplates(t) {
  templates = t;
}

function importProvider(provider) {
  if (provider && provider.name) {

    return true;
  }
  return false;
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  setTemplates: setTemplates,
  import: importDoucment,
  save: saveDocument,
  new: createDocument,
  import: importDoucment,
  importProvider: importProvider
};