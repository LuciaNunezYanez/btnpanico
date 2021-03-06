"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
router.get('/comercios', function (req, res) {
    var query = " SELECT * FROM comercio; ";
    mysql_1.default.ejecutarQuery(query, function (err, comercios) {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                comercios: comercios
            });
        }
    });
});
router.get('/comercio/:id', function (req, res) {
    var id = req.params.id;
    // Escapar ID 
    var escapedId = mysql_1.default.instance.cnn.escape(id);
    var query = "\n       CALL getComercioID(" + escapedId + ")\n    ";
    mysql_1.default.ejecutarQuery(query, function (err, comercio) {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                comercio: comercio[0]
            });
        }
    });
});
exports.default = router;
