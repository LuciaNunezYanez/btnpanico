"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var verificaTokenPertenece = require('../server/middlewares/autenticacion').verificaTokenPertenece;
var router = express_1.Router();
var fs = require('fs');
var path = require('path');
router.get('/:ruta', verificaTokenPertenece, function (req, res) {
    var ruta = req.params.ruta;
    console.log('Pasó por aquí');
    var pathImg = path.resolve(__dirname, "../../multimedia/imagenes/" + ruta);
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    }
    else {
        var pathImgNoResults = path.resolve(__dirname, '../../multimedia/no_results_found.png');
        res.sendFile(pathImgNoResults);
    }
});
exports.default = router;
