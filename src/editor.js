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
  var unsavedChanges = false,
      events = av.events()
  ;

  function showEditor() {
    av.style(gitly.dom.editorContainer, {
      'pointer-events': 'all',
      'opacity': 1
    }); 

    av.style(gitly.dom.middle, {
      overflow: 'hidden'
    });

    av.style(gitly.dom.doEdit, {
      display: 'none'
    });
  }

  function hideEditor(fn) {
    function doHide() {
      av.style(gitly.dom.editorContainer, {
        'pointer-events': 'none',
        'opacity': 0
      }); 

      av.style(gitly.dom.doEdit, {
        display: ''
      });

      av.style(gitly.dom.middle, {
        overflow: ''
      });

      if (av.isFn(fn)) {
        fn();
      }
    }
    
    if (unsavedChanges) {
      if (confirm('You have unsaved changes. Discard?')) {
        doHide();
        unsavedChanges = false;
      }
    } else {
      doHide();
    }
  }

  function hasUnsaved() {
    return unsavedChanges;
  }

  function clearUnsaved() {
    unsavedChanges = false;
  }

  function editDocument(doc) {
    gitly.dom.mainEditor.value = doc.header + doc.contents;
  }

  function getValue() {
    return gitly.dom.mainEditor.value;
  }

   function getCurrentWord() {
     var word,
        offset = gitly.dom.mainEditor.selectionStart,
        start = 0,
        text = gitly.dom.mainEditor.value,
        stop = gitly.dom.mainEditor.value.length,
        char
    ;
    
    function isPunct(char) {
      return char === ' ' || 
             char === '.' || 
             char === ',' || 
             char === '?' || 
             char === '!' || 
             char === ';' || 
             char === ':' || 
             char === '-' ||
             char === '\''; 
    }
    
    if (offset === stop) {
      return;
    }
    
    /*
      Actually, we need to go forward until we hit either punctionation, space, 
      or the end of the value.
      Then we need to go backwards from the anchor.
      This is our range.
    */
    for (var i = offset; i < text.length; i++) {
      char = text[i];
      if (isPunct(char)) {
        stop = i;
        break;
      }
    }
    
    for (var i = offset; i >= 0; i--) {
      char = text[i];
      if (isPunct(char)) {
        start = i + 1;
        break;
      }
    } 
    
    word = text.substr(start, stop - start).replace(/\s/g, '');
    if (!isPunct(word)) {
      console.log(word + ' ' + start + ' ' + stop);
      return word;
    }
  }

  function enterNoDistractions() {

  }

  function leaveNoDistractions() {
    
  }

  /////////////////////////////////////////////////////////////////////////////

  av.ready(function () {
    av.on(gitly.dom.doEdit, 'click', showEditor);
    av.on(gitly.dom.editorExit, 'click', hideEditor);
    av.on(gitly.dom.editorSave, 'click', gitly.documents.saveCurrent);

    av.registerHotkey('META+s', 'inEditor', gitly.documents.saveCurrent);
    av.registerHotkey('CTRL+s', 'inEditor', gitly.documents.saveCurrent);

    av.on(gitly.dom.mainEditor, 'keyup', function (e) {
      unsavedChanges = true;
    });

    av.on(gitly.dom.mainEditor, 'focus', function () {
      av.setHotkeyContext('inEditor');
    });

    av.on(gitly.dom.mainEditor, 'blur', function () {
      av.setHotkeyContext('default');
    });

    av.on(gitly.dom.mainEditor, 'keydown', function (e) {
      var mainEditor = gitly.dom.mainEditor;
      if (e.keyCode === 9) {
        if (e.shiftKey) {
          //Right so we need to un-tab the current line
        } else {
          var s = mainEditor.selectionStart;
          mainEditor.value = mainEditor.value.substr(0, mainEditor.selectionStart) + '\t' + mainEditor.value.substr(mainEditor.selectionStart);              
          s += 1;
          mainEditor.setSelectionRange(s, s);
        }
        return av.nodefault(e);
      }
    });
  });

  /////////////////////////////////////////////////////////////////////////////

  gitly.editor = {
    //Listen to events
    on: events.on,
    //Show editor
    show: showEditor,
    //Hide editor
    hide: hideEditor,
    //Return true if there are unsaved changes
    hasUnsaved: hasUnsaved,
    //Clear current unsaved
    clearUnsaved: clearUnsaved,
    //Edit a document
    edit: editDocument,
    //Get current editor value
    get: getValue
  };

})();