# umd and import
https://stackoverflow.com/questions/51461723/import-umd-javascript-modules-into-browser

https://blog.sessionstack.com/how-javascript-works-the-module-pattern-comparing-commonjs-amd-umd-and-es6-modules-437f77548437

https://stackoverflow.com/questions/51461723/import-umd-javascript-modules-into-browser
Might have some hints on import from umd file

# iterate through dictionary
https://stackoverflow.com/questions/34913675/how-to-iterate-keys-values-in-javascript

```js
dict = {0:{1:'a'}, 1:{2:'b'}, 2:{3:'c'}}
for (var key in dict){
  console.log( key, dict[key] );
}

0 Object { 1="a"}
1 Object { 2="b"}
2 Object { 3="c"}
```

# umd understanding
https://stackoverflow.com/questions/60365052/why-is-functionglobal-factory-used-in-so-many-js-libraries

```
As mentioned by several people in the comments, the real answer is that this is the structure of UMD modules.

I'm writing this as an answer primarily because it's hard to illustrate this in comments. But you can clearly see what the code is doing in your Vue.js example:

    ┌──────────────────┐       ┌──────────────────┐
    │                  ▼       ▼                  │
    │    (function (global, factory) {            │
    │                                             │
    │                                             │
    │        /* deleted for clarity */            │
    │                 ┌───────────────────────────┘
    │                 │
    │    }(this, function () { 'use strict';
    │       │
    └───────┘
             /* */

         })
So basically it is an IIFE. You can rewrite this construct more clearly if you give the anonymous functions names:

// rename function () { 'use strict' ...
function Vue () { 'use strict';
    /* */
}

// rename function (global, factory) ...
function UMD (global, factory) {
    /* deleted for clarity */ 
}

UMD(this, Vue);
So global is basically this which when referenced from outside of any function points to the global object (window in browsers and not named in node.js) and factory is a function that creates the Vue.js object (or jQuery in the case of jQuery). Basically factory is the implementation of the library.

This structure is written in such a way as not to create any unnecessary variables or functions in the global scope and thus avoid polluting the global scope and avoid variable/function name clashes with other libraries.

As for why it assigns this to global? That's because window is (was?) a completely unprotected variable in global scope (that's why node.js does not give it a name) and any 3rd party code can overwrite it with a different thing or modify it. If you want the original global object of the browser while using unknown 3rd party code you need to use this this trick.
```

# Add img dynamically
[image](https://stackoverflow.com/questions/72217858/the-server-responded-with-a-mime-type-of-image-png-html-javascript)