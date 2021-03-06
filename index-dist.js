'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = reactElementToJSXString;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _collapseWhiteSpace = require('collapse-white-space');

var _collapseWhiteSpace2 = _interopRequireDefault(_collapseWhiteSpace);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _stringifyObject = require('stringify-object');

var _stringifyObject2 = _interopRequireDefault(_stringifyObject);

var _sortobject = require('sortobject');

var _sortobject2 = _interopRequireDefault(_sortobject);

var _traverse = require('traverse');

var _traverse2 = _interopRequireDefault(_traverse);

var _lodashArrayFill = require('lodash/array/fill');

var _lodashArrayFill2 = _interopRequireDefault(_lodashArrayFill);

function reactElementToJSXString(ReactElement) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var getDisplayName = options.displayName || getDefaultDisplayName;
  var checkElement = options.isElement || _reactAddonsTestUtils.isElement;

  return toJSXString({ ReactElement: ReactElement });

  function toJSXString(_ref) {
    var _ref$ReactElement = _ref.ReactElement;
    var Element = _ref$ReactElement === undefined ? null : _ref$ReactElement;
    var _ref$lvl = _ref.lvl;
    var lvl = _ref$lvl === undefined ? 0 : _ref$lvl;
    var _ref$inline = _ref.inline;
    var inline = _ref$inline === undefined ? false : _ref$inline;

    if (typeof Element === 'string' || typeof Element === 'number') {
      return Element;
    } else if (!checkElement(Element)) {
      throw new Error('react-element-to-jsx-string: Expected a ReactElement, ' + 'got `' + typeof Element + '`');
    }

    var tagName = getDisplayName(Element);

    var out = '<' + tagName;
    var props = formatProps(Element.props);
    var attributes = [];
    var children = _react2['default'].Children.toArray(Element.props.children).filter(onlyMeaningfulChildren);

    if (Element.ref !== null) {
      attributes.push(getJSXAttribute('ref', Element.ref));
    }

    if (Element.key !== null &&
    // React automatically add key=".X" when there are some children
    !/^\./.test(Element.key)) {
      attributes.push(getJSXAttribute('key', Element.key));
    }

    attributes = attributes.concat(props);

    attributes.forEach(function (attribute) {
      if (attributes.length === 1 || inline) {
        out += ' ';
      } else {
        out += '\n' + spacer(lvl + 1);
      }

      out += attribute.name + '=' + attribute.value;
    });

    if (attributes.length > 1 && !inline) {
      out += '\n' + spacer(lvl);
    }

    if (children.length > 0) {
      out += '>';
      lvl++;
      if (!inline) {
        out += '\n';
        out += spacer(lvl);
      }

      if (typeof children === 'string') {
        out += children;
      } else {
        out += children.reduce(mergePlainStringChildren, []).map(recurse({ lvl: lvl, inline: inline })).join('\n' + spacer(lvl));
      }
      if (!inline) {
        out += '\n';
        out += spacer(lvl - 1);
      }
      out += '</' + tagName + '>';
    } else {
      if (attributes.length <= 1) {
        out += ' ';
      }

      out += '/>';
    }

    return out;
  }

  function formatProps(props) {
    return Object.keys(props).filter(noChildren).sort().map(function (propName) {
      return getJSXAttribute(propName, props[propName]);
    });
  }

  function getJSXAttribute(name, value) {
    return {
      name: name,
      value: formatJSXAttribute(value).replace(/'?<__reactElementToJSXString__Wrapper__>/g, '').replace(/<\/__reactElementToJSXString__Wrapper__>'?/g, '')
    };
  }

  function formatJSXAttribute(propValue) {
    if (typeof propValue === 'string') {
      return '"' + propValue + '"';
    }

    return '{' + formatValue(propValue) + '}';
  }

  function formatValue(value) {
    if (typeof value === 'function') {
      return function noRefCheck() {};
    } else if (checkElement(value)) {
      // we use this delimiter hack in cases where the react element is a property
      // of an object from a root prop
      // i.e.
      //   reactElementToJSXString(<div a={{b: <div />}} />
      //   // <div a={{b: <div />}} />
      // we then remove the whole wrapping
      // otherwise, the element would be surrounded by quotes: <div a={{b: '<div />'}} />
      return '<__reactElementToJSXString__Wrapper__>' + toJSXString({ ReactElement: value, inline: true }) + '</__reactElementToJSXString__Wrapper__>';
    } else if ((0, _isPlainObject2['default'])(value) || Array.isArray(value)) {
      return '<__reactElementToJSXString__Wrapper__>' + stringifyObject(value) + '</__reactElementToJSXString__Wrapper__>';
    }

    return value;
  }

  function recurse(_ref2) {
    var lvl = _ref2.lvl;
    var inline = _ref2.inline;

    return function (Element) {
      return toJSXString({ ReactElement: Element, lvl: lvl, inline: inline });
    };
  }

  function stringifyObject(obj) {
    if (Object.keys(obj).length > 0 || obj.length > 0) {
      obj = (0, _traverse2['default'])(obj).map(function (value) {
        if (checkElement(value) || this.isLeaf) {
          this.update(formatValue(value));
        }
      });

      obj = (0, _sortobject2['default'])(obj);
    }

    return (0, _collapseWhiteSpace2['default'])((0, _stringifyObject2['default'])(obj)).replace(/{ /g, '{').replace(/ }/g, '}').replace(/\[ /g, '[').replace(/ \]/g, ']');
  }
}

function getDefaultDisplayName(ReactElement) {
  return ReactElement.type.name || // function name
  ReactElement.type.displayName || (typeof ReactElement.type === 'function' ? // function without a name, you should provide one
  'No Display Name' : ReactElement.type);
}

function mergePlainStringChildren(prev, cur) {
  var lastItem = prev[prev.length - 1];

  if (typeof cur === 'number') {
    cur = '' + cur;
  }

  if (typeof lastItem === 'string' && typeof cur === 'string') {
    prev[prev.length - 1] += cur;
  } else {
    prev.push(cur);
  }

  return prev;
}

function spacer(times) {
  return (0, _lodashArrayFill2['default'])(new Array(times), '  ').join('');
}

function noChildren(propName) {
  return propName !== 'children';
}

function onlyMeaningfulChildren(children) {
  return children !== true && children !== false && children !== null && children !== '';
}
module.exports = exports['default'];
