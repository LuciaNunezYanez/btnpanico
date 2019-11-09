"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var fileUpload = require('express-fileupload');
var mysql_1 = __importDefault(require("../mysql/mysql"));
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var app = express();
// Opciones predeterminadas
app.use(fileUpload({ useTempFiles: true }));
app.post('/:reporte/:tipo', function (req, res) {
    var fechaHora = mysql_1.default.instance.cnn.escape(req.body.fecha);
    var tipoArchivo = req.params.tipo;
    var idReporte = req.params.reporte;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }
    // Recupera el archivo cargado.
    var archivo = req.files.archivo;
    // Tipos permitidos
    var tiposValidos = ['imagenes', 'audios'];
    if (tiposValidos.indexOf(tipoArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipo de archivo invalido'
            }
        });
    }
    // Extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];
    // Validar extensión permitida
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extensión invalida'
            }
        });
    }
    // Cambiar el nombre del archivo 
    // REPORTE - DIA MES AÑO HORA MINUTO(N) SEGUNDO 
    var dmy = "D" + new Date().getDate() + "M" + (new Date().getMonth() + 1) + "Y" + new Date().getFullYear();
    var hms = "H" + new Date().getHours() + "N" + new Date().getMinutes() + "S" + new Date().getSeconds();
    var nombreArchivo = idReporte + "-" + dmy + hms + "." + extension;
    var ruta = "multimedia/" + tipoArchivo + "/" + nombreArchivo;
    // Coloca el archivo en la carpeta del servidor
    archivo.mv(ruta, function (err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err: err
            });
    });
    var QUERY = "CALL addMultimediaRtID(" + fechaHora + "," + mysql_1.default.instance.cnn.escape(extension) + "," + mysql_1.default.instance.cnn.escape(ruta) + "," + idReporte + ",@last_id)";
    mysql_1.default.ejecutarQuery(QUERY, function (err, idMultimedia) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                message: '¡Archivo subido correctamente!',
                idMultimedia: idMultimedia[0][0]
            });
        }
    });
});
exports.default = app;
