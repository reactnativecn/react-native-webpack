/**
 * Created by tdzl2003 on 10/3/16.
 */
"use strict";

var getIterator = require("babel-runtime/core-js/get-iterator");

module.exports = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      AssignmentExpression(path) {
        if (path.node.operator === '=') {
          const left = path.node.left;
          if (left.type === 'MemberExpression') {
            const object = left.object;
            const property = left.property;
            if (object.type === 'Identifier' && object.name === "require") {
              //Assign to require.xxx
              path.remove(); //Remove
            }
          }
        }
      },
    },
  };
};

