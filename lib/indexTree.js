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

//I can't remember why this is called an index tree anymore..

const utils = require('./utils');
const fse = require('fs-extra');
const fs = require('fs');
const async = require('async');
const path = process.cwd();

var indexTree = false;

/* Build search index for a given document 
 * Parses the document contents, and adds all words 
 * (except those in a short ignore list) to
 * the global search index with a back reference to the document.
 * 
 * This function is quite slow..
 */
function buildSearchIndex(document) {
  var t = '', 
      si,
      cc,
      ignored = {
        'a': true,
        'the': true,
        'it': true,
        'in': true,
        'of': true,
        'its': true,
        'and': true,
        'as': true,
        'is': true,
        'by': true,
        'to': true,
        'at': true,
        'was': true,
        'i': true,
        'his': true,
        'her': true,
        'this': true,
        'with': true,
        'my': true,
        'for': true
      },
      endPunct = {
        '.': true,
        '?': true,
        ',': true,
        ':': true,
        ';': true
      }
  ;

  for (var i = 0; i < document.contents.length; i++) {
    cc = document.contents[i].toLowerCase().charCodeAt(0);
    if (document.contents[i] === ' ' || document.contents[i] === '\n' || endPunct[document.contents[i]]) {
      t = t.toLowerCase();
      if (t.length && !ignored[t]) {

        indexTree.searchIndex[t] = indexTree.searchIndex[t] || {
          entries: 0,
          documents: {}
        };

        si = indexTree.searchIndex[t];

        si.documents[document.title] = si.documents[document.title] || [];
        si.documents[document.title].push(i);

        si.entries++;
      }

      t = '';
    } else if (cc >= 97 && cc <= 122){
      t += document.contents[i];
    }
  }
}

/* Build references for a document
 * Extracts "[[token]]"
 */
function buildReferences(doc) {
  doc.myReferences = [];

  utils.tokenizeString(doc.contents, false, false, false, function (property) {
    var ref = utils.trimLeadingSpaces(property[0]);

    indexTree.references[ref] = indexTree.references[ref] || [];
    indexTree.references[ref].push(doc.title);
    doc.myReferences.push(ref);

    utils.log(3, 'Found reference to "', ref, '" in ', doc.title);

    return '[[' + ref + ']]';
  });
}

/* Add a meta entry to a document */
function addMeta(document, key, value) {
  var transform = {
    title: function () {
      document.title = value;
    },
    tags: function () {            
      document.tags = value.split(',');

      document.tags.forEach(function (tag) {
        tag = utils.trimLeadingSpaces(tag);      
        indexTree.tags[tag] = indexTree.tags[tag] || [];
        indexTree.tags[tag].push(document.title);
      });
    },
    categories: function () {
      document.categories = value.split(',');

      document.categories.forEach(function (tag) {
        tag = utils.trimLeadingSpaces(tag);      
        indexTree.categories[tag] = indexTree.categories[tag] || [];
        indexTree.categories[tag].push(document.title);
      });
    },
    author: function () {      
      document.authors = value.split(',');

      document.authors.forEach(function (author) {
        indexTree.authors[author] = indexTree.authors[author] || [];
        indexTree.authors[author].push(author);
      });
    },
    type: function () {
      document.type = value;
    }
  };

  //Trim leading spaces
  value = utils.trimLeadingSpaces(value);        
  if (typeof transform[key] != undefined && utils.isFn(transform[key])) {
    transform[key]();
  } else {
    //This is not a built-in meta entry, so add it to the document meta.
    document.meta[key] = value;          
  }
}

/* Extract meta from a file, and process it */
function processMeta(document, data) {
  var dstart = data.indexOf('===\n'),
      meta
  ;

  data = data.toString();

  //Should extract the meta data here, and then set contents
  //to the actual markdown body.
  if (dstart > 0) {
    meta = data.substr(0, dstart).split('\n');

    meta.forEach(function (line) {
      var pair = line.indexOf(':');

      if (pair > 0) {                  
        addMeta(document, line.substr(0, pair), line.substr(pair + 1));                  
      }
    });

    dstart += '===\n'.length;
  } else {
    dstart = 0;
  }
  
  document.header = data.substr(0, dstart);
  document.contents = data.substr(dstart);  
}

/* Process a document */
function processDocument(document, data, path) {
  //Parse the meta data                      
  processMeta(document, data);                      
  //Create a document map entry
  indexTree.documents[document.title] = path;
  //Build search index - this is slow..
  buildSearchIndex(document);
  //Extract references
  buildReferences(document);
}

/* Create a new index tree */
function resetTree() {
  //Create a blank index tree
  indexTree = {
    //Author tree
    authors: {},
    //Search index
    searchIndex: {},
    //Cross-references
    references: {},
    //The files
    files: {},
    //Should be a key/array pair
    categories: {},
    //Should be a key/array pair
    tags: {},
    //Should be a key/value pair mapping between titles and filenames
    documents: {
      index: path + '/index.md'
    }
  };
}

/* Flush tags + categories for a given document name */
function flushGlobalsForDocument(documentName) {

  //Filter out references to the document in a given object
  function flushRefs(ns) {
    Object.keys(ns).forEach(function (key) {
      ns[key] = ns[key].filter(function (title) {
        return title !== documentName;
      });
    });
  }

  //Flush tags + cats + authors + refs
  flushRefs(indexTree.tags);
  flushRefs(indexTree.categories);
  flushRefs(indexTree.authors);
  flushRefs(indexTree.references);
  
  //Remove from documents
  delete indexTree[documentName];

  //TODO: Flush search index
}

/* Flush locals for a document */
function flushLocalsForDocument(document) {
  if (document) {    
    document.meta = {};
    document.authors = ['No One'];
    document.tags = ['Untagged'];
    document.categories = ['No Category'];
  }
}

/* Reindex a single file */
function reindex(fname, fn) {
  var document;

  if (indexTree) {
    if (exists(fname)) {

      document = indexTree.files[fname];
      
      flushGlobalsForDocument(document.title);
      flushLocalsForDocument(document);
      
      //We can now load the document text, and process it normaly
      fs.readFile(item.path, function (err, data) {    
        if (err) return utils.isFn(fn) && fn(err);                  
        processDocument(document, data, document.path);
        utils.isFn(fn) && fn(false, document);
      });
      
    }
    return utils.isFn(fn) && fn('file does not exist');
  }
  return utils.isFn(fn) && fn('index tree not loaded');
}

/* Builds the index "tree"
 * Loads all the markdown files in the current folder recursivly
 */
function indexFiles(fn) {
  var funs = [];

  resetTree();

  //Fetch files
  fse.walk(path)
    .on('data', function (item) {
      var document = {};

      if (item.path.indexOf('.md') === item.path.length - 3) {
        document = {
          contents: '',
          type: 'document',
          header: '',
          authors: ['No One'],
          tags: ['Untagged'],
          meta: {},
          categories: ['No Category'],
          path: item.path,
          title: item.path.substr(item.path.lastIndexOf('/') + 1).replace('.md', ''),
          stats: item.stats
        };

        indexTree.files[item.path] = document;

        utils.log(4, 'Added file to indexing tree:', item.path);

        //Read the file contents
        funs.push(function (next) {
          fs.readFile(item.path, function (err, data) {    
            if (err) return next(err);                  
            processDocument(document, data, item.path);
            next(false);
          });
        });
      }
    })
    .on('end', function () {
      async.waterfall(funs, function (err) {
        if (err) {
          utils.log(0, 'Error indexing files:', err);          
        } else {
          utils.log(2, 'Files indexed!');
        }
        if (fn) {
          fn(err);
        }
      });      
    })
  ;
}

///////////////////////////////////////////////////////////////////////////////

function exists(f) {
  if (indexTree && f) {
    return typeof indexTree.files[f] !== 'undefined';
  }
  return false;
}

function categories() {
  if (indexTree) {
    return indexTree.categories;
  }
  return {};
}

function tags() {
  if (indexTree) {
    return indexTree.tags;
  }
  return {};
}

function files() {
  if (indexTree) {
    return indexTree.files;
  }
  return {};
}

function documents() {
  if (indexTree) {
    return indexTree.documents;
  }
  return {};
}

function authors() {
  if (indexTree) {
    return indexTree.authors;
  }
  return {};
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  //Re-index everything
  index: indexFiles,
  //Re-index a given file
  reindex: reindex,
  //Check if a file exists
  exists: exists,

  //Get the categories available
  getCategories: categories,
  //Get the tags available
  getTags: tags,
  //Get actual files
  getFiles: files,
  //Get filenames - this is the document title -> filename mapping
  getFilenames: documents,
  //Get authors
  getAuthors: authors,

  //Get the index tree
  get: function () {
    return indexTree;
  }
};