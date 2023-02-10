"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/all', function (req, res) {
    var query = "CALL getCorporaciones();";
    mysql_1.default.ejecutarQueryPr(query).then(function (respuesta) {
        return res.json({
            ok: true,
            corporaciones: respuesta[0]
        });
    }).catch(function (err) {
        return res.status(404).json({
            ok: false,
            error: err
        });
    });
});
exports.default = router;
