"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var router = express_1.Router();
exports.default = router;
