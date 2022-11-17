(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.snap = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      function _defineProperty(obj, key, value) {
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    2: [function (require, module, exports) {
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          "default": obj
        };
      }
      module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    3: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.onRpcRequest = void 0;
      var _methods = require("./utils/methods");
      const onRpcRequest = async ({
        request
      }) => {
        const state = await (0, _methods.getTodos)();
        switch (request.method) {
          case "hello":
            return wallet.request({
              method: "snap_confirm",
              params: [{
                prompt: `Hello, World!`
              }]
            });
          case "get_pokemon":
            const pokemon = await (0, _methods.getPokemon)();
            return wallet.request({
              method: "snap_confirm",
              params: [{
                prompt: `Pokemon, ${pokemon.name}`,
                textAreaContent: "It's abilities are: " + pokemon.abilities
              }]
            });
          case "save_todo":
            const {
              id,
              todo
            } = request.params;
            const newState = {
              id,
              todo
            };
            await (0, _methods.saveTodos)(newState, state);
            return "OK";
          case "get_todos":
            const showTodos = await wallet.request({
              method: "snap_confirm",
              params: [{
                prompt: "Confirm todo request?",
                description: "Do you want to replace local todos with remote ones?"
              }]
            });
            if (!showTodos) {
              return undefined;
            }
            return state;
          case "clear_todos":
            await (0, _methods.clearTodos)();
            return "OK";
          default:
            throw new Error("Method not found.");
        }
      };
      exports.onRpcRequest = onRpcRequest;
    }, {
      "./utils/methods": 5
    }],
    4: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.POKEMONS = void 0;
      const POKEMONS = ["bulbasaur", "ivysaur", "venusaur", "charmander", "charmeleon", "charizard", "squirtle", "wartortle", "blastoise", "mewtwo", "mew"];
      exports.POKEMONS = POKEMONS;
    }, {}],
    5: [function (require, module, exports) {
      "use strict";

      var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.clearTodos = clearTodos;
      exports.getPokemon = getPokemon;
      exports.getTodos = getTodos;
      exports.saveTodos = saveTodos;
      var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
      var _consts = require("./consts");
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          enumerableOnly && (symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          })), keys.push.apply(keys, symbols);
        }
        return keys;
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {};
          i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
            (0, _defineProperty2.default)(target, key, source[key]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
        return target;
      }
      async function getTodos() {
        const state = await wallet.request({
          method: "snap_manageState",
          params: ["get"]
        });
        if (!state || !state.todos) {
          return {};
        }
        return state.todos;
      }
      async function saveTodos(newState, oldState) {
        await wallet.request({
          method: "snap_manageState",
          params: ["update", {
            todos: _objectSpread(_objectSpread({}, oldState), {}, {
              [newState.id]: newState.todo
            })
          }]
        });
      }
      async function getPokemon() {
        const randomPokemonName = _consts.POKEMONS[Math.floor(Math.random() * _consts.POKEMONS.length - 1)].toLowerCase();
        const url = "https://pokeapi.co/api/v2/pokemon/" + randomPokemonName;
        const pokemon_data = await (await fetch(url)).json();
        const abs = pokemon_data.abilities.map(ability => ability.ability.name).join(" ");
        return {
          name: pokemon_data.name,
          abilities: abs
        };
      }
      async function clearTodos() {
        const response = await wallet.request({
          method: "snap_confirm",
          params: [{
            prompt: `Delete remote todos?`,
            textAreaContent: "This action will delete all remotely stored todos."
          }]
        });
        if (!response) {
          return;
        }
        await wallet.request({
          method: "snap_manageState",
          params: ["clear"]
        });
      }
    }, {
      "./consts": 4,
      "@babel/runtime/helpers/defineProperty": 1,
      "@babel/runtime/helpers/interopRequireDefault": 2
    }]
  }, {}, [3])(3);
});