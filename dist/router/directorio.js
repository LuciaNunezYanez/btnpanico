"use strict";
// Consumir procedimiento almacenadoo getDireccionID(ID)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
router.get('/:tipo', function (req, res) {
    var query = "CALL getDirectorio(" + mysql_1.default.instance.cnn.escape(req.params.tipo) + ");";
    mysql_1.default.ejecutarQuery(query, function (err, directorio) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                directorio: directorio[0]
            });
        }
    });
});
exports.default = router;
