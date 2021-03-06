"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/', function (req, res) {
    var QUERY = 'CALL getmunicipios();';
    mysql_1.default.ejecutarQuery(QUERY, function (err, municipios) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                municipios: municipios[0]
            });
        }
    });
});
exports.default = router;
