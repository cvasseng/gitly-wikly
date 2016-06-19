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

var express = require('express'),
    expressLess = require('express-less'),
    templates = require('./../lib/templates')(),
    gitly = require('./../lib/main'),
    app = express(),
    bodyParser = require('body-parser'), 
    server = require('http').Server(app),
    io = require('socket.io')(server),
    fse = require('fs-extra'),   
    colors = require('colors'),
    fs = require('fs'),
    path = process.cwd()    
;

console.log('Gitly Wikly!'.yellow);

///////////////////////////////////////////////////////////////////////////////
// Helpers

function attachWatch() {
  return;
  gitly.utils.log(3, 'Now listening for changes in ', path);
  fs.watch(path + '/', {
    recursive: true
  }, function (event, filename) {
    if (filename.indexOf('.md') > 0) {
      gitly.utils.log(3, filename, 'has changed outside of gitly, re-indexing');
      indexFiles(function () {
        //Should send a socket event here to tell the client to re-request the index tree
        io.sockets.emit('Refreshed');
      });          
    }
  });
}

///////////////////////////////////////////////////////////////////////////////
// Express setup

app.use(bodyParser.json({limit: '50mb'}));
app.use('/css', expressLess(__dirname + '/../less', {debug: true}));

app.use('/', express.static(__dirname + '/../public'));
app.use('/deps', express.static(__dirname + '/../deps'));
app.use('/src', express.static(__dirname + '/../src'));

///////////////////////////////////////////////////////////////////////////////
// Routes

//Returns the current document tree
app.get('/documents', function (req, res) {
  res.header('Content-type', 'application/json');
  res.send(JSON.stringify(gitly.itree.get(), undefined, '\t'));
});

app.post('/new', function (req, res) {
  gitly.document.new(req.body.title, function (err, result) {
    if (err) return res.send({
      ok: false,
      error: err
    });

    res.send({
      ok: true,
      document: result
    });
  });
});

app.post('/pull', function (req, res) {
  gitly.git.pull(
    function (files) {
      io.sockets.emit('Refreshed', files);
      io.sockets.emit('HideLoader');
    }, 
    function () {    
      io.sockets.emit('HideLoader');
    }
  );
  res.send(true);
});

app.post('/save', function (req, res) {
  gitly.document.save(req.body.document, req.body.contents, function (err) {
    if (err) return res.send({
      ok: false,
      error: err
    });    

    res.send({
      ok: true,
      document: req.body.document
    });
  });
});

app.post('/import', function (req, res) {
  gitly.document.import(req.body.title, req.body.categories, req.body.tags, req.body.url, function (err, fname) {
    if (err) {
      gitly.utils.log(0, err);
      return res.send({
        ok: false,
        error: err
      })
    }      
   
    res.send({
      ok: true,
      file: fname
    });
  }); 
});

///////////////////////////////////////////////////////////////////////////////

templates.load(__dirname + '/../templates', function () {
  //Create the index if it's not there already
  gitly.utils.exists('./index.md', function (yes) {
    if (!yes) {
      fse.copy(__dirname + '/../templates/index.handlebars', 'index.md', function () {
        gitly.utils.log(3, 'Created index');
        gitly.itree.index(attachWatch);      
      });
    } else {
      gitly.itree.index(attachWatch);        
    }
  });
});

gitly.git.init(path, function () {
  //Called when there are remote changes 
  io.sockets.emit('RemoteChanges');
});

io.on('connection', function (socket) {

});

console.log('Now serving on port 9554'.green);
server.listen(9554);
