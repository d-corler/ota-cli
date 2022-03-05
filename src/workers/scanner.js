/* eslint-disable unicorn/prefer-module */
const path = require('path')

require('ts-node').register()
require(path.resolve(__dirname, './scanner.ts'))
