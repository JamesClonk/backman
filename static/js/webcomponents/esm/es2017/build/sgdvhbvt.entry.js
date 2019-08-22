/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as commonjsGlobal, c as unwrapExports, d as createCommonjsModule, a as anime } from './chunk-55a98941.js';
import { a as selectReducer, b as SelectActionTypes } from './chunk-ad9f4763.js';
import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList, i as isDesktopOrLarger } from './chunk-c2033b1f.js';
import { a as createAndInstallStore, b as mapStateToProps } from './chunk-6a8011c5.js';

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/** Error message constants. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

class ItunesAutocomplete {
    constructor() {
        this.artists = [];
        this.loading = false;
        this.onChange = throttle(this.fetch, 500);
    }
    fetch(keyword) {
        if (keyword.length < 3) {
            return;
        }
        this.loading = true;
        fetch(`https://itunes.apple.com/search?term=${encodeURI(keyword)}&entity=musicArtist&limit=10`, {
            method: "post"
        })
            .then((payload) => payload.json())
            .then((payload) => this.artists = payload.results.map((result) => result.artistName))
            .then(() => this.loading = false);
    }
    render() {
        return (h("sdx-select", { label: "Your favourite artist on iTunes", placeholder: "Search artists...", changeCallback: (selection) => this.onChange(selection[0]), keyboardBehavior: "autocomplete", filterFunction: () => true, loading: this.loading }, this.artists.map((artist) => h("sdx-select-option", null, artist))));
    }
    static get is() { return "sdx-itunes-autocomplete"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "artists": {
            "state": true
        },
        "loading": {
            "state": true
        }
    }; }
}

class LoadingSpinner {
    render() {
        return (h("div", { class: "component" }));
    }
    static get is() { return "sdx-loading-spinner"; }
    static get encapsulation() { return "shadow"; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}.component{-webkit-animation:sprite 1.25s steps(75) infinite;animation:sprite 1.25s steps(75) infinite;width:27px;height:27px;background-position:0 0;background-size:2025px 27px;background-repeat:no-repeat;-webkit-backface-visibility:hidden;backface-visibility:hidden;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAD9IAAAA2CAMAAAAWasMiAAADAFBMVEUAAAACEVQAEVUAEVUDEVQBEVUAEVUAEVUAEVUAEVUAEVUIEVMCEVQBEVU/EUkAEVUAEVUBEVUJEVMBEVUBEVUCEVQAEVUAEVUGEVQAEVUAEVUAEVUAEVUAEVUAEVUAEVUAEVUBEVUAEVUPEVIAEVUAEVUAEVULEVMDEVQGEVQAEVUAEVUBEVUAEVUAEVW7ESoAEVUBEVUAEVXNESWEETbTESQYEVASEVKgETDUESQAEVXUESQFEVTOESXaESIAEVVhET6YETI7EUfVESOzESzbESJNEUNuETvYESPRESTWESOYETGNETQIEVOSETNIEURWEUFuETtVEUGgETByETvSESQHEVSqES49EUfbESLKESYjEU3VESQ7EUe2EStlET6EETbPESXZESPLESbBESg1EUkkEUxvETsAEVUAEVUVEVC0ESsqEUsAEVUiEU2XETIOEVFVEUEAEVXBESjVESStES3NESW3ESsFEVSrES4CEVQHEVQhEU1YEUHSESTbESKzESxuETs9EUezESxhET66ESq5ESqEETYsEUsHEVMuEUo7EUcjEU28ESlvETvZESODETaYETGEETbOESVuETtwETvZESPcESKXETJWEUHaESIBEVXbESJvETu5ESqkES/QESW9ESlXEUGYETG0ESs5EUi9ESmFETYjEU24ESoPEVGbETEjEU0BEVUBEVWpES4OEVEOEVGCETfPESUTEVDGESenES8PEVEiEU09EUenES+nES+DETYDEVQ9EUenES/NESYREVEkEUwPEVGNETSFETbdESLTESTGESdtETvNESWYETENEVEOEVHSESRZEUB/ETc9EUc+EUdWEUFKEUQTEVBVEUF7ETikES8IEVMjEU25ESqnES+aETGZETFmET6FETZQEUIAEVUEEVQjEU0PEVE9EUdXEUFwETuFETaXETLNESanES+zESzZESO9ESndESLGESfSESTWESTbESK2ESuaETEJEVJ/EThmET5QEUI/EUcwEUoaEU8SEVECEVUj6SkJAAAA4nRSTlMAHPeeCig5nPTimhIQaAK44GAJhz839ugU5LLFZMOu+6TTwgeXoDwaLB++3TT+yAWnahUKHREPBRQg+SkiGZ2MKQmdOB7fNw9pY0CfOTIn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\")}\@-webkit-keyframes sprite{0%{packground-position:0 0}to{background-position:-2025px 0}}\@keyframes sprite{0%{packground-position:0 0}to{background-position:-2025px 0}}"; }
}

var bodyScrollLock_min = createCommonjsModule(function (module, exports) {
!function(e,t){t(exports);}(commonjsGlobal,function(exports){function r(e){if(Array.isArray(e)){for(var t=0,o=Array(e.length);t<e.length;t++)o[t]=e[t];return o}return Array.from(e)}Object.defineProperty(exports,"__esModule",{value:!0});var l=!1;if("undefined"!=typeof window){var e={get passive(){l=!0;}};window.addEventListener("testPassive",null,e),window.removeEventListener("testPassive",null,e);}var d="undefined"!=typeof window&&window.navigator&&window.navigator.platform&&/iP(ad|hone|od)/.test(window.navigator.platform),c=[],u=!1,a=-1,s=void 0,v=void 0,f=function(t){return c.some(function(e){return !(!e.options.allowTouchMove||!e.options.allowTouchMove(t))})},m=function(e){var t=e||window.event;return !!f(t.target)||(1<t.touches.length||(t.preventDefault&&t.preventDefault(),!1))},o=function(){setTimeout(function(){void 0!==v&&(document.body.style.paddingRight=v,v=void 0),void 0!==s&&(document.body.style.overflow=s,s=void 0);});};exports.disableBodyScroll=function(i,e){if(d){if(!i)return void console.error("disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.");if(i&&!c.some(function(e){return e.targetElement===i})){var t={targetElement:i,options:e||{}};c=[].concat(r(c),[t]),i.ontouchstart=function(e){1===e.targetTouches.length&&(a=e.targetTouches[0].clientY);},i.ontouchmove=function(e){var t,o,n,r;1===e.targetTouches.length&&(o=i,r=(t=e).targetTouches[0].clientY-a,!f(t.target)&&(o&&0===o.scrollTop&&0<r?m(t):(n=o)&&n.scrollHeight-n.scrollTop<=n.clientHeight&&r<0?m(t):t.stopPropagation()));},u||(document.addEventListener("touchmove",m,l?{passive:!1}:void 0),u=!0);}}else{n=e,setTimeout(function(){if(void 0===v){var e=!!n&&!0===n.reserveScrollBarGap,t=window.innerWidth-document.documentElement.clientWidth;e&&0<t&&(v=document.body.style.paddingRight,document.body.style.paddingRight=t+"px");}void 0===s&&(s=document.body.style.overflow,document.body.style.overflow="hidden");});var o={targetElement:i,options:e||{}};c=[].concat(r(c),[o]);}var n;},exports.clearAllBodyScrollLocks=function(){d?(c.forEach(function(e){e.targetElement.ontouchstart=null,e.targetElement.ontouchmove=null;}),u&&(document.removeEventListener("touchmove",m,l?{passive:!1}:void 0),u=!1),c=[],a=-1):(o(),c=[]);},exports.enableBodyScroll=function(t){if(d){if(!t)return void console.error("enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.");t.ontouchstart=null,t.ontouchmove=null,c=c.filter(function(e){return e.targetElement!==t}),u&&0===c.length&&(document.removeEventListener("touchmove",m,l?{passive:!1}:void 0),u=!1);}else 1===c.length&&c[0].targetElement===t?(o(),c=[]):c=c.filter(function(e){return e.targetElement!==t});};});
});

var bodyScrollLock = unwrapExports(bodyScrollLock_min);

class Select {
    constructor() {
        this.invokeSelectCallback = () => null;
        this.invokeChangeCallback = () => null;
        this.dimensionMetaData = this.getDimensionMetaData();
        this.clicking = false;
        this.placeholderWhenOpened = null;
        this.componentChildrenWillLoadComplete = false;
        this.componentDidLoadComplete = false;
        this.hasFilterInputFieldElFocus = false;
        this.hadFilterInputFieldElFocus = false;
        this.maxDropdownHeight = Infinity;
        this.lightDOMHiddenFormInputEls = [];
        this.easing = {
            inQuadOutQuint: [0.550, 0.085, 0.320, 1]
        };
        this.blockScrollingWhenOpened = false;
        this.filter = "";
        this.display = "closed";
        this.foundMatches = 0;
        this.focussed = false;
        this.filterInputFieldElValue = "";
        this.placeholder = "";
        this.multiple = false;
        this.label = "";
        this.disabled = false;
        this.loading = false;
        this.keyboardBehavior = "focus";
        this.filterable = false;
        this.maxHeight = Infinity;
        this.noMatchesFoundLabel = "No matches found...";
        this.backgroundTheme = "light";
        this.value = [];
        this.name = undefined;
        this.animated = true;
    }
    selectionSortedChanged() {
        if (!this.componentChildrenWillLoadComplete) {
            return;
        }
        if (this.optionElsSorted.length && !this.selectionSorted.length && !this.placeholder) {
            this.store.dispatch({
                type: SelectActionTypes.select,
                optionEl: this.optionElsSorted[0],
                strategy: "add"
            });
            this.store.dispatch({ type: SelectActionTypes.commitSelectionBatch });
        }
        this.selection = this.selectionSorted.map((optionEl) => optionEl.value);
        this.value = this.selection;
        if (this.isFilterable()) {
            this.resetFilterInputField();
        }
    }
    selectCallbackChanged() {
        this.setInvokeSelectCallback();
    }
    changeCallbackChanged() {
        this.setInvokeChangeCallback();
    }
    placeholderChanged() {
        this.resetFilter();
    }
    valueChanged() {
        this.updateHiddenFormInputEl();
        if (this.componentDidLoadComplete) {
            this.invokeChangeCallback(this.value);
        }
        if (this.isAutocomplete()) {
            const filter = this.value[0] || "";
            this.store.dispatch({
                type: SelectActionTypes.setFilter,
                filter
            });
            this.filterInputFieldElValue = filter;
            return;
        }
        if (this.componentDidLoadComplete) {
            this.invokeSelectCallback(this.value);
        }
        if (this.value === this.selection) {
            return;
        }
        const foundOptionEls = [];
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                const value = this.value[i];
                const foundOptionEl = this.optionElsSorted.find((optionEl) => optionEl.value === value);
                if (foundOptionEl) {
                    if (this.multiple || (!this.multiple && i === 0)) {
                        foundOptionEls.push(foundOptionEl);
                    }
                }
            }
        }
        this.store.dispatch({ type: SelectActionTypes.setSelectionBatch, optionEls: foundOptionEls });
        this.store.dispatch({ type: SelectActionTypes.commitSelectionBatch });
    }
    nameChanged() {
        this.updateHiddenFormInputEl();
    }
    filterFunctionChanged() {
        this.setFilterFunction();
    }
    onFocus() {
        if (!this.clicking) ;
        this.focussed = true;
    }
    onMouseDown() {
        this.clicking = true;
    }
    onMouseUp() {
        this.clicking = false;
    }
    onBlur() {
        if (!this.clicking) {
            this.close();
        }
        this.focussed = false;
    }
    onWindowClick(e) {
        if (!this.isSelectEl(e.target)) {
            this.close();
        }
    }
    onKeyDown(e) {
        if (!this.focussed) {
            return;
        }
        switch (e.which) {
            case 32:
                const shadowRoot = this.el.shadowRoot;
                if (!shadowRoot.activeElement || shadowRoot.activeElement !== this.filterInputFieldEl) {
                    e.preventDefault();
                    if (this.isOpenOrOpening() && !this.multiple && this.focussedEl) {
                        this.focussedEl.click();
                    }
                    else {
                        this.toggle();
                    }
                }
                break;
            case 13:
                e.preventDefault();
                if (this.focussedEl) {
                    this.focussedEl.click();
                }
                break;
            case 38:
                e.preventDefault();
                this.setFocussedEl("previous");
                if (!this.isAutocomplete()) {
                    this.open();
                }
                break;
            case 40:
                e.preventDefault();
                this.setFocussedEl("next");
                if (!this.isAutocomplete()) {
                    this.open();
                }
                break;
            case 27:
                this.close();
                break;
            default:
                const letter = this.getLetterByCharCode(e.which);
                if (letter) {
                    if (!this.isFilterable()) {
                        this.setFocussedElByFirstLetter(letter);
                    }
                }
        }
    }
    getSelection() {
        return this.selection;
    }
    toggle() {
        return new Promise((resolve) => {
            if (this.isAutocomplete()) {
                if (this.isValidAutocomplete(this.filterInputFieldElValue)) {
                    this.open().then(resolve);
                }
                else {
                    resolve();
                }
                return;
            }
            if (this.isOpenOrOpening()) {
                this.close().then(resolve);
            }
            else if (this.isClosedOrClosing()) {
                this.open().then(resolve);
            }
            else {
                resolve();
            }
        });
    }
    open() {
        return new Promise((resolve) => {
            if (!this.isClosedOrClosing()) {
                resolve();
                return;
            }
            if (this.blockScrollingWhenOpened) {
                bodyScrollLock.disableBodyScroll(this.listContainerEl, {
                    allowTouchMove: (el) => {
                        let currentEl = el;
                        while (currentEl && currentEl !== document.body) {
                            if (currentEl.classList.contains("list-container")) {
                                if (currentEl.scrollHeight > currentEl.clientHeight) {
                                    return true;
                                }
                            }
                            currentEl = currentEl.parentNode;
                        }
                        return false;
                    }
                });
            }
            this.placeholderWhenOpened = this.showPlaceholder();
            this.dimensionMetaData = this.getDimensionMetaData();
            this.store.dispatch({ type: SelectActionTypes.setDirection, direction: this.dimensionMetaData.direction });
            this.display = "opening";
            anime({
                targets: this.listContainerEl,
                scaleY: 1,
                opacity: 1,
                duration: this.animationDuration,
                easing: this.easing.inQuadOutQuint,
                complete: () => {
                    this.display = "open";
                    this.listContainerEl.style.transform = null;
                    resolve();
                }
            });
        });
    }
    close() {
        return new Promise((resolve) => {
            if (this.display !== "open") {
                resolve();
                return;
            }
            if (this.blockScrollingWhenOpened) {
                bodyScrollLock.enableBodyScroll(this.listContainerEl);
            }
            this.display = "closing";
            this.setFocussedEl(null);
            anime({
                targets: this.listContainerEl,
                scaleY: 0,
                opacity: .2,
                duration: this.animationDuration,
                easing: this.easing.inQuadOutQuint,
                complete: () => {
                    this.display = "closed";
                    this.placeholderWhenOpened = null;
                    if (this.isKeyboardBehavior("filter")) {
                        this.filterInputFieldEl.unsetFocus();
                    }
                    resolve();
                }
            });
        });
    }
    componentWillLoad() {
        this.updateHiddenFormInputEl();
        this.store = createAndInstallStore(this, selectReducer, this.getInitialState());
        this.unsubscribe = mapStateToProps(this, this.store, [
            "selectionBatch",
            "selectionSorted",
            "animationDuration",
            "optionElsSorted",
            "optgroupEls",
            "filter"
        ]);
        this.store.dispatch({ type: SelectActionTypes.setMultiple, multiple: this.multiple });
        this.store.dispatch({ type: SelectActionTypes.setSelect, select: this.select.bind(this) });
        this.store.dispatch({ type: SelectActionTypes.setAnimationDuration, animationDuration: this.animationDuration });
        this.setInvokeSelectCallback();
        this.setInvokeChangeCallback();
        this.setFilterFunction();
        this.maxDropdownHeight = this.maxHeight;
        this.resetFilterInputField();
    }
    componentDidLoad() {
        this.componentChildrenWillLoadComplete = true;
        this.commitChildrensValues();
        this.listContainerEl.style.opacity = ".2";
        this.listContainerEl.style.transform = "scaleY(0)";
        this.componentDidLoadComplete = true;
    }
    componentDidUpdate() {
        this.store.dispatch({ type: SelectActionTypes.setMultiple, multiple: this.multiple });
        this.commitChildrensValues();
    }
    componentDidUnload() {
        this.unsubscribe();
    }
    getInitialState() {
        return {
            selection: [],
            selectionBatch: [],
            selectionSorted: [],
            multiple: false,
            direction: "bottom",
            select: () => null,
            animationDuration: this.animated ? 200 : 0,
            optionEls: [],
            optionElsBatch: [],
            optionElsSorted: [],
            optgroupEls: [],
            optgroupElsBatch: [],
            filter: "",
            filterFunction: () => true
        };
    }
    resetFilter() {
        if (this.isFilterable()) {
            this.resetFilterInputField();
            this.clearFilter();
        }
    }
    setFilterFunction() {
        this.store.dispatch({
            type: SelectActionTypes.setFilterFunction,
            filterFunction: this.optionElMatchesFilter.bind(this)
        });
    }
    commitChildrensValues() {
        this.store.dispatch({ type: SelectActionTypes.commitOptionElsBatch });
        this.store.dispatch({ type: SelectActionTypes.commitOptGroupElsBatch });
        this.store.dispatch({ type: SelectActionTypes.commitSelectionBatch });
    }
    resetFilterInputField() {
        this.filterInputFieldElValue = this.getFormattedSelection();
    }
    clearFilter() {
        this.store.dispatch({ type: SelectActionTypes.setFilter, filter: "" });
    }
    getListContainerStyle() {
        if (!this.componentChildrenWillLoadComplete) {
            return {};
        }
        const elRect = this.el.getBoundingClientRect();
        const wrapperElRect = this.wrapperEl.getBoundingClientRect();
        let offset = this.dimensionMetaData.direction === "bottom"
            ? wrapperElRect.top - elRect.top + wrapperElRect.height
            : wrapperElRect.height;
        offset = offset - 1;
        return {
            top: this.dimensionMetaData.direction === "bottom" ? `${offset}px` : "auto",
            bottom: this.dimensionMetaData.direction === "top" ? `${offset}px` : "auto",
            transformOrigin: (this.dimensionMetaData.direction === "top") ? "0 100%" : "50% 0",
            maxHeight: this.dimensionMetaData.maxHeight
                ? `${this.dimensionMetaData.maxHeight}px`
                : "0"
        };
    }
    getDimensionMetaData() {
        if (!(this.wrapperEl && this.listEl)) {
            return {
                direction: "bottom",
                maxHeight: null
            };
        }
        const wrapperElRect = this.wrapperEl.getBoundingClientRect();
        let spaceTowardsTop = wrapperElRect.top - Select.minSpaceToWindow;
        let spaceTowardsBottom = innerHeight - wrapperElRect.bottom - Select.minSpaceToWindow;
        const listElHeight = this.listEl.clientHeight;
        if (this.maxDropdownHeight < Infinity) {
            spaceTowardsTop = spaceTowardsTop < this.maxDropdownHeight
                ? spaceTowardsTop
                : this.maxDropdownHeight;
            spaceTowardsBottom = spaceTowardsBottom < this.maxDropdownHeight
                ? spaceTowardsBottom
                : this.maxDropdownHeight;
        }
        if (spaceTowardsBottom >= listElHeight) {
            return {
                direction: "bottom",
                maxHeight: spaceTowardsBottom
            };
        }
        else if (spaceTowardsTop >= listElHeight) {
            return {
                direction: "top",
                maxHeight: spaceTowardsTop
            };
        }
        else if (spaceTowardsTop > spaceTowardsBottom) {
            return {
                direction: "top",
                maxHeight: spaceTowardsTop
            };
        }
        else {
            return {
                direction: "bottom",
                maxHeight: spaceTowardsBottom
            };
        }
    }
    defaultFilterFunction(optionEl, keyword) {
        const textContent = optionEl.textContent;
        if (!textContent) {
            return false;
        }
        return textContent.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    }
    optionElMatchesFilter(el, keyword) {
        let filterFunction = this.defaultFilterFunction;
        if (this.filterFunction) {
            filterFunction = parseFunction(this.filterFunction);
        }
        let match = filterFunction(el, keyword);
        if (this.isAutocomplete() && !keyword) {
            match = false;
        }
        if (this.isAutocomplete()) {
            const allOptionEls = this.el.querySelectorAll("sdx-select-option");
            let visibleOptionElsCount = 0;
            for (let i = 0; i < allOptionEls.length; i++) {
                const optionEl = allOptionEls[i];
                if (el !== optionEl && optionEl.style.display !== "none") {
                    visibleOptionElsCount++;
                }
            }
            if ((isDesktopOrLarger() && visibleOptionElsCount >= Select.maxAutocompleteOptionsDesktop)
                ||
                    (!isDesktopOrLarger() && visibleOptionElsCount >= Select.maxAutocompleteOptionsMobile)) {
                match = false;
            }
        }
        this.el.forceUpdate();
        return match;
    }
    isValidFilter(keyword) {
        return (keyword.length >= 2 &&
            keyword !== this.getFormattedSelection());
    }
    isValidAutocomplete(keyword) {
        return keyword.length >= 3;
    }
    setFocussedEl(which) {
        for (let i = 0; i < this.optionElsSorted.length; ++i) {
            const optionEl = this.optionElsSorted[i];
            optionEl.classList.remove("focus");
        }
        if (which === null) {
            delete this.focussedEl;
            return;
        }
        if (which === "previous" || which === "next") {
            const lastSelectedOptionEl = this.selectionSorted[this.selectionSorted.length - 1];
            let focussedEl = this.focussedEl || lastSelectedOptionEl;
            if (which === "previous") {
                let previousElement = getPreviousFromList(this.optionElsSorted, focussedEl);
                while (previousElement !== focussedEl && (previousElement.disabled || previousElement.style.display === "none")) {
                    previousElement = getPreviousFromList(this.optionElsSorted, previousElement);
                }
                this.focussedEl = previousElement;
            }
            else {
                let nextElement = getNextFromList(this.optionElsSorted, focussedEl);
                while (nextElement !== focussedEl && (nextElement.disabled || nextElement.style.display === "none")) {
                    nextElement = getNextFromList(this.optionElsSorted, nextElement);
                }
                this.focussedEl = nextElement;
            }
        }
        else {
            this.focussedEl = which;
        }
        this.focussedEl.classList.add("focus");
        this.scrollToOption(this.focussedEl);
    }
    scrollToOption(option) {
        const parent = this.listContainerEl;
        const optionRect = option.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const isFullyVisible = optionRect.top >= parentRect.top && optionRect.bottom <= parentRect.top + parent.clientHeight;
        if (!isFullyVisible) {
            parent.scrollTop = optionRect.top + parent.scrollTop - parentRect.top;
        }
    }
    getLetterByCharCode(code) {
        if (code < 48 || code > 105) {
            return "";
        }
        return String.fromCharCode(96 <= code && code <= 105 ? code - 48 : code).toLowerCase();
    }
    getOptionsByFirstLetter(letter) {
        const results = [];
        for (let i = 0; i < this.optionElsSorted.length; ++i) {
            const option = this.optionElsSorted[i];
            if (option.textContent && option.textContent.toLowerCase().charAt(0) === letter) {
                results.push(option);
            }
        }
        return results;
    }
    setFocussedElByFirstLetter(letter) {
        const optionsByFirstLetter = this.getOptionsByFirstLetter(letter);
        if (optionsByFirstLetter.length) {
            let startIndex = 0;
            if (this.focussedEl) {
                const focussedElIndex = optionsByFirstLetter.indexOf(this.focussedEl);
                if (focussedElIndex > -1) {
                    startIndex = focussedElIndex;
                }
            }
            let option = optionsByFirstLetter[startIndex];
            if (option.disabled || option === this.focussedEl) {
                for (let i = 0; i < optionsByFirstLetter.length; ++i) {
                    option = getNextFromList(optionsByFirstLetter, optionsByFirstLetter[startIndex]);
                    if (option.disabled) {
                        option = null;
                    }
                    else {
                        break;
                    }
                    if (startIndex < optionsByFirstLetter.length) {
                        ++startIndex;
                    }
                    else {
                        startIndex = 0;
                    }
                }
            }
            if (option) {
                this.setFocussedEl(option);
            }
        }
    }
    isSelectEl(el) {
        return !!closest(el, this.el);
    }
    showPlaceholder() {
        const showPlaceholder = !!this.selectionSorted.length && !!this.placeholder && !this.multiple;
        if (this.placeholderWhenOpened !== null) {
            return this.placeholderWhenOpened;
        }
        return showPlaceholder;
    }
    getFormattedSelection() {
        return this.selectionSorted.length
            ? this.selectionSorted.map((optionEl) => {
                const text = optionEl.textContent;
                return text ? text.trim() : "";
            }).join(", ")
            : "";
    }
    setInvokeSelectCallback() {
        this.invokeSelectCallback = parseFunction(this.selectCallback);
    }
    setInvokeChangeCallback() {
        this.invokeChangeCallback = parseFunction(this.changeCallback);
    }
    onHeaderClick(e) {
        const targetEl = e.target;
        const didClickOnSdxInputEl = !!closest(targetEl, this.filterInputFieldEl);
        if (this.isFilterable() && this.isOpenOrOpening() && didClickOnSdxInputEl && !this.hadFilterInputFieldElFocus) ;
        else {
            this.toggle();
        }
        this.hadFilterInputFieldElFocus = this.hasFilterInputFieldElFocus;
    }
    onFilterInputFieldFocus() {
        this.hasFilterInputFieldElFocus = true;
    }
    onFilterInputFieldBlur() {
        this.hasFilterInputFieldElFocus = false;
    }
    onFilterInputFieldChange(value) {
        if (this.isAutocomplete()) {
            this.value = [value];
        }
    }
    onFilterInputFieldInput(value) {
        this.store.dispatch({
            type: SelectActionTypes.setFilter,
            filter: this.isValidFilter(value) ? value : ""
        });
        if (this.isKeyboardBehavior("filter")) {
            if (this.isValidFilter(this.filter)) {
                this.open();
            }
        }
        else if (this.isKeyboardBehavior("autocomplete")) {
            if (this.isValidAutocomplete(value)) {
                this.open();
            }
            else {
                this.close();
            }
        }
    }
    select(option, strategy, doClose = false) {
        if (!this.multiple) {
            if (option.isSelected() || option.disabled) {
                if (doClose) {
                    this.close();
                }
                if (option.disabled) {
                    return;
                }
                this.resetFilter();
            }
        }
        if (this.isAutocomplete()) {
            if (strategy === "add") {
                this.filterInputFieldElValue = option.el.textContent;
            }
        }
        else {
            this.store.dispatch({
                type: SelectActionTypes.select,
                optionEl: option.placeholder === true ? null : option.el,
                strategy
            });
        }
        if (!this.multiple) {
            if (!this.isAutocomplete()) {
                this.resetFilterInputField();
            }
            setTimeout(() => {
                let close = Promise.resolve();
                if (doClose) {
                    close = this.close();
                }
                close.then(() => {
                    if (!this.isAutocomplete()) {
                        this.clearFilter();
                    }
                });
            }, this.animationDuration);
        }
    }
    updateHiddenFormInputEl() {
        if (this.value && this.name) {
            this.lightDOMHiddenFormInputEls.forEach((lightDOMHiddenFormInputEl) => {
                this.el.removeChild(lightDOMHiddenFormInputEl);
            });
            this.lightDOMHiddenFormInputEls = [];
            for (let i = 0; i < this.value.length; i++) {
                const value = this.value[i];
                const lightDOMHiddenFormInputEl = document.createElement("input");
                lightDOMHiddenFormInputEl.type = "hidden";
                lightDOMHiddenFormInputEl.name = this.name;
                lightDOMHiddenFormInputEl.value = value;
                this.lightDOMHiddenFormInputEls.push(lightDOMHiddenFormInputEl);
                this.el.appendChild(lightDOMHiddenFormInputEl);
            }
        }
    }
    isFilterable() {
        return this.isKeyboardBehavior("filter") || this.isKeyboardBehavior("autocomplete");
    }
    isKeyboardBehavior(keyboardBehavior) {
        const isMatch = keyboardBehavior === this.keyboardBehavior;
        if (keyboardBehavior === "filter" && (isMatch || this.filterable)) {
            return true;
        }
        return isMatch;
    }
    getMatchingOptionElsCount() {
        const optionEls = this.el.querySelectorAll("sdx-select-option");
        let count = 0;
        for (let i = 0; i < optionEls.length; i++) {
            if (optionEls[i].style.display !== "none") {
                count++;
            }
        }
        return count;
    }
    isAutocomplete() {
        return this.keyboardBehavior === "autocomplete";
    }
    isOpenOrOpening() {
        return this.display === "open" || this.display === "opening";
    }
    isClosedOrClosing() {
        return this.display === "closed" || this.display === "closing";
    }
    getComponentClassNames() {
        return {
            component: true,
            [this.backgroundTheme]: true,
            [this.display]: true,
            [this.dimensionMetaData.direction]: !this.isClosedOrClosing(),
            disabled: this.disabled,
            loading: this.loading,
            filterable: this.isFilterable(),
            autocomplete: this.isAutocomplete(),
            focus: this.focussed
        };
    }
    getInputStyle() {
        const openOrOpening = this.isOpenOrOpening();
        const directionToTop = this.dimensionMetaData.direction === "top";
        const directionToBottom = this.dimensionMetaData.direction === "bottom";
        return {
            paddingRight: this.isAutocomplete() ? "" : "48px",
            borderTopLeftRadius: openOrOpening && directionToTop ? "0" : "",
            borderTopRightRadius: openOrOpening && directionToTop ? "0" : "",
            borderBottomLeftRadius: openOrOpening && directionToBottom ? "0" : "",
            borderBottomRightRadius: openOrOpening && directionToBottom ? "0" : ""
        };
    }
    hostData() {
        return {
            "aria-expanded": (this.display === "open").toString()
        };
    }
    render() {
        return (h("div", { class: this.getComponentClassNames() },
            this.label &&
                h("label", { class: "label", onClick: () => this.toggle() }, this.label),
            h("div", { class: "wrapper", ref: (el) => this.wrapperEl = el },
                h("div", { class: "header-wrapper" },
                    h("div", { class: "header", onClick: (e) => this.onHeaderClick(e) },
                        h("div", { class: "selection" }, this.isFilterable()
                            ? (h("sdx-input", { value: this.filterInputFieldElValue, ref: (el) => this.filterInputFieldEl = el, changeCallback: (value) => this.onFilterInputFieldChange(value), inputCallback: (value) => this.onFilterInputFieldInput(value), focusCallback: () => this.onFilterInputFieldFocus(), blurCallback: () => this.onFilterInputFieldBlur(), autocomplete: false, placeholder: this.placeholder, selectTextOnFocus: this.isKeyboardBehavior("filter"), inputStyle: this.getInputStyle() }))
                            : (h("sdx-input", { value: this.getFormattedSelection() || this.placeholder, editable: false, inputStyle: Object.assign({}, this.getInputStyle(), { color: this.isOpenOrOpening() ? "#1781e3" : "" }) }))),
                        (!this.isAutocomplete() || this.loading) &&
                            h("div", { class: "thumb" }, this.loading
                                ? h("sdx-loading-spinner", null)
                                : h("div", { class: "icon" })))),
                h("div", { class: "list-container", ref: (el) => this.listContainerEl = el, style: this.getListContainerStyle(), tabIndex: -1 },
                    h("div", { class: "list", ref: (el) => this.listEl = el },
                        this.showPlaceholder() &&
                            h("sdx-select-option", { placeholder: true }, this.placeholder),
                        h("div", { class: "slot" },
                            h("slot", null)),
                        this.isValidFilter(this.filter) && this.getMatchingOptionElsCount() === 0 &&
                            h("div", { class: "no-matches-found" }, this.noMatchesFoundLabel))))));
    }
    static get is() { return "sdx-select"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "animated": {
            "type": Boolean,
            "attr": "animated"
        },
        "animationDuration": {
            "state": true
        },
        "backgroundTheme": {
            "type": String,
            "attr": "background-theme"
        },
        "changeCallback": {
            "type": String,
            "attr": "change-callback",
            "watchCallbacks": ["changeCallbackChanged"]
        },
        "close": {
            "method": true
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled"
        },
        "display": {
            "state": true
        },
        "el": {
            "elementRef": true
        },
        "filter": {
            "state": true
        },
        "filterable": {
            "type": Boolean,
            "attr": "filterable"
        },
        "filterFunction": {
            "type": String,
            "attr": "filter-function",
            "watchCallbacks": ["filterFunctionChanged"]
        },
        "filterInputFieldElValue": {
            "state": true
        },
        "focussed": {
            "state": true
        },
        "foundMatches": {
            "state": true
        },
        "getSelection": {
            "method": true
        },
        "keyboardBehavior": {
            "type": String,
            "attr": "keyboard-behavior"
        },
        "label": {
            "type": String,
            "attr": "label"
        },
        "loading": {
            "type": Boolean,
            "attr": "loading"
        },
        "maxHeight": {
            "type": Number,
            "attr": "max-height"
        },
        "multiple": {
            "type": Boolean,
            "attr": "multiple"
        },
        "name": {
            "type": String,
            "attr": "name",
            "watchCallbacks": ["nameChanged"]
        },
        "noMatchesFoundLabel": {
            "type": String,
            "attr": "no-matches-found-label"
        },
        "open": {
            "method": true
        },
        "optgroupEls": {
            "state": true
        },
        "optionElsSorted": {
            "state": true
        },
        "placeholder": {
            "type": String,
            "attr": "placeholder",
            "watchCallbacks": ["placeholderChanged"]
        },
        "selectCallback": {
            "type": String,
            "attr": "select-callback",
            "watchCallbacks": ["selectCallbackChanged"]
        },
        "selectionBatch": {
            "state": true
        },
        "selectionSorted": {
            "state": true,
            "watchCallbacks": ["selectionSortedChanged"]
        },
        "toggle": {
            "method": true
        },
        "value": {
            "type": "Any",
            "attr": "value",
            "mutable": true,
            "watchCallbacks": ["valueChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "focus",
            "method": "onFocus",
            "capture": true
        }, {
            "name": "mousedown",
            "method": "onMouseDown",
            "passive": true
        }, {
            "name": "mouseup",
            "method": "onMouseUp",
            "passive": true
        }, {
            "name": "blur",
            "method": "onBlur",
            "capture": true
        }, {
            "name": "window:click",
            "method": "onWindowClick"
        }, {
            "name": "window:touchend",
            "method": "onWindowClick",
            "passive": true
        }, {
            "name": "window:keydown",
            "method": "onKeyDown"
        }]; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}label{display:block;margin-bottom:6px;cursor:text;color:#666;font-size:14px}:host{outline:none}.component{position:relative}.component .wrapper .header-wrapper{overflow:hidden;background:#fff;color:#333;border-radius:5px}.component .wrapper .header-wrapper .header{position:relative}.component .wrapper .header-wrapper .header .selection,.component .wrapper .header-wrapper .header .thumb{-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1)}.component .wrapper .header-wrapper .header .thumb{width:34px;position:absolute;right:-1px;top:-1px;bottom:-1px;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center}.component .wrapper .header-wrapper .header .thumb>.icon{position:relative;width:100%;-webkit-transform:scale(.5);transform:scale(.5);-webkit-transform-origin:50% 50%;transform-origin:50% 50%}.component .wrapper .header-wrapper .header .thumb>.icon:after,.component .wrapper .header-wrapper .header .thumb>.icon:before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:3px;background:#1781e3;width:20px;height:3px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}.component .wrapper .header-wrapper .header .thumb>.icon:before{left:0}.component .wrapper .header-wrapper .header .thumb>.icon:after{left:15px}.component .wrapper .header-wrapper .header .thumb>.icon:before{-webkit-transform:rotate(35deg);transform:rotate(35deg)}.component .wrapper .header-wrapper .header .thumb>.icon:after{-webkit-transform:rotate(-35deg);transform:rotate(-35deg)}.component .wrapper .list-container{-webkit-overflow-scrolling:touch;overflow-y:auto;background:#fff;position:absolute;left:0;right:0;z-index:999999;-webkit-box-shadow:0 0 4px 0 rgba(51,51,51,.1),inset 0 0 0 1px #d6d6d6;box-shadow:0 0 4px 0 rgba(51,51,51,.1),inset 0 0 0 1px #d6d6d6;max-height:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;outline:none}.component .wrapper .list-container .list{overflow:hidden}.component .wrapper .list-container .list .no-matches-found{height:48px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;padding:0 16px;color:#bbb}.component.open .wrapper .header-wrapper,.component.opening .wrapper .header-wrapper{-webkit-box-shadow:0 0 4px 0 rgba(51,51,51,.1);box-shadow:0 0 4px 0 rgba(51,51,51,.1)}.component.open .wrapper .header-wrapper .header .thumb>.icon:before,.component.opening .wrapper .header-wrapper .header .thumb>.icon:before{-webkit-transform:rotate(-35deg);transform:rotate(-35deg)}.component.open .wrapper .header-wrapper .header .thumb>.icon:after,.component.opening .wrapper .header-wrapper .header .thumb>.icon:after{-webkit-transform:rotate(35deg);transform:rotate(35deg)}.component.open.top .wrapper .header-wrapper,.component.opening.top .wrapper .header-wrapper{border-top-left-radius:0;border-top-right-radius:0}.component.open.top .wrapper .list-container,.component.open.top .wrapper .list-container .list,.component.opening.top .wrapper .list-container,.component.opening.top .wrapper .list-container .list{border-radius:5px 5px 0 0}.component.open.bottom .wrapper .header-wrapper,.component.opening.bottom .wrapper .header-wrapper{border-bottom-left-radius:0;border-bottom-right-radius:0}.component.open.bottom .wrapper .list-container,.component.open.bottom .wrapper .list-container .list,.component.opening.bottom .wrapper .list-container,.component.opening.bottom .wrapper .list-container .list{border-radius:0 0 5px 5px}.component.closing.top .wrapper .list-container,.component.closing.top .wrapper .list-container .list{border-radius:5px 5px 0 0}.component.closing.bottom .wrapper .list-container,.component.closing.bottom .wrapper .list-container .list{border-radius:0 0 5px 5px}.component.disabled .label,.component.disabled .wrapper,.component.loading .label,.component.loading .wrapper{pointer-events:none}.component.disabled{cursor:not-allowed;opacity:.4}.component:not(.disabled):not(.loading) .header-wrapper .header{cursor:pointer}.component:not(.disabled):not(.loading):not(.autocomplete) .header-wrapper .header:hover .thumb{background:#1781e3;border-color:#1781e3}.component:not(.disabled):not(.loading):not(.autocomplete) .header-wrapper .header:hover .thumb>.icon{position:relative}.component:not(.disabled):not(.loading):not(.autocomplete) .header-wrapper .header:hover .thumb>.icon:after,.component:not(.disabled):not(.loading):not(.autocomplete) .header-wrapper .header:hover .thumb>.icon:before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:3px;background:#fff;width:20px;height:3px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}.component:not(.disabled):not(.loading):not(.autocomplete) .header-wrapper .header:hover .thumb>.icon:before{left:0}.component:not(.disabled):not(.loading):not(.autocomplete) .header-wrapper .header:hover .thumb>.icon:after{left:15px}.component.dark .label{color:#fff}.component.autocomplete:not(.loading) .wrapper .header-wrapper .header{padding-right:0}"; }
}
Select.maxAutocompleteOptionsMobile = 5;
Select.maxAutocompleteOptionsDesktop = 10;
Select.minSpaceToWindow = 24;

export { ItunesAutocomplete as SdxItunesAutocomplete, LoadingSpinner as SdxLoadingSpinner, Select as SdxSelect };
