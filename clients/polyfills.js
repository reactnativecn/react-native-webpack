/**
 * Created by tdzl2003 on 10/4/16.
 */

require('react-native/packager/react-packager/src/Resolver/polyfills/error-guard.js');

(function(global){
  global.global = global;
  global.window = global;
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);

global.AssetRegistry = require('react-native/Libraries/Image/AssetRegistry');
