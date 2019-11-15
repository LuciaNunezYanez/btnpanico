"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var router = express_1.Router();
var fs = require('fs');
var path = require('path');
router.get('/:ruta', function (req, res) {
    var ruta = req.params.ruta;
    var pathImg = path.resolve(__dirname, "../../multimedia/imagenes/" + ruta);
    res.sendFile(pathImg);
});
exports.default = router;
