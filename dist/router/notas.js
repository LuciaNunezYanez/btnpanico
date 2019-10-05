"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
router.post('/:id', function (req, res) {
    //Datos de ejemplo 
    //Datos de ejemplo 
    //Datos de ejemplo 
    var nombre = req.body.nombre;
    var edad = req.body.edad || 0;
    var id = req.params.id;
    res.json({
        ok: true,
        nombre: nombre,
        edad: edad,
        id: id
    });
});
exports.default = router;
