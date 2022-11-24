# Check if shift is pressed
```javascript
  $(document).on('keyup keydown', function(e){shifted = e.shiftKey} );
  element.onclick(e)
  e.shiftKey
```

# time now
milliseconds

```javascript
performance.now() 
```

# keyboard events
https://javascript.info/keyboard-events

# shift key
https://stackoverflow.com/questions/7479307/how-can-i-detect-shift-key-down-in-javascript
```javascript
var onkeydown = (function (ev) {
  var key;
  var isShift;
  if (window.event) {
    key = window.event.keyCode;
    isShift = !!window.event.shiftKey; // typecast to boolean
  } else {
    key = ev.which;
    isShift = !!ev.shiftKey;
  }
  if ( isShift ) {
    switch (key) {
      case 16: // ignore shift key
        break;
      default:
        alert(key);
        // do stuff here?
        break;
    }
  }
});
```

## another example
```js
$('#whichkey').bind('mousemove',function(e){
    if (e.buttons & 1 || (e.buttons === undefined && e.which == 1)) {
        $('#log').html('left button pressed');
    } else if (e.buttons & 2 || (e.buttons === undefined && e.which == 3)) {
        $('#log').html('right button pressed');
    } else {
        $('#log').html('no button pressed');
    }
```

# import .css
(preferred) Remove

```js
import './style.css'
```

Add this

```html
<link rel="stylesheet" href="./style.css" type="text/css" /> in your HTML <head>
```

# mouse coordinates on canvas

[mouse](https://www.geeksforgeeks.org/how-to-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/)

# ev buttons
[ev.buttons](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons)
