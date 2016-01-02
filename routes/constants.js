/**
 * The node-module to hold the constants for the server
 */


function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value:        value,
        enumerable:   true,
        writable:     false,
        configurable: false
    });
}

var debugging = false;


define(exports, "ACL_PASSWORD", "pJxGdmkhTLLRvTaM");