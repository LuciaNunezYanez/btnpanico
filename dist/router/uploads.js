"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var mysql_1 = __importDefault(require("../mysql/mysql"));
var server_1 = __importDefault(require("../server/server"));
var socketServer = server_1.default.instance;
var app = express();
// Opciones predeterminadas
app.use(fileUpload({ useTempFiles: true }));
// Esta configurado unicamente para que reciba archivos 
// codificados en Base64 
// NO recibe archivos sin codificar 
app.post('/imagenes/:reporte', function (req, res) {
    var idReporte = req.params.reporte;
    var fechaHora = req.body.fecha;
    var imagen = req.body.imagen;
    var nameArchivo = generarNombreArchivo(fechaHora, idReporte);
    var ruta;
    console.log("La fecha de foto: " + fechaHora);
    if (idReporte === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Reporte invalido'
            }
        });
    }
    if (imagen === undefined) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }
    // Grabar archivo en la ruta del servidor 
    try {
        var buffer = Buffer.from(imagen, 'base64');
        ruta = "multimedia/imagenes/" + nameArchivo;
        fs.writeFileSync(ruta, buffer);
    }
    catch (err) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }
    var id_multimedia;
    // Registra el archivo en la base de datos
    var QUERY = "CALL addMultimediaRtID(" + mysql_1.default.instance.cnn.escape(fechaHora) + ",'imagen','imagenes/" + nameArchivo + "'," + idReporte + ",@last_id)";
    mysql_1.default.ejecutarQuery(QUERY, function (err, idMultimedia) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err,
                class: 'uploads'
            });
        }
        else {
            id_multimedia = idMultimedia[0][0];
            return res.json({
                ok: true,
                message: '¡Archivo subido correctamente!',
            });
        }
    });
    // const ruta_mult = ;
    // Emitir a lo usuarios nueva imagen recibida 
    socketServer.emitirNuevaImagen(idReporte, {
        id_multimedia: id_multimedia,
        fechahora_captura: fechaHora,
        tipo_archivo: 'imagen',
        ruta: ruta.replace('multimedia/', ''),
        id_reporte_mult: idReporte
    });
});
// POST PARA AUDIO
app.post('/audio/:reporte', function (req, res) {
    var idReporte = req.params.reporte;
    var fechaHora = req.body.fecha;
    var audio = req.body.audio;
    var parte = req.body.parte;
    var ruta;
    // console.log("Recibi la informacion de audio: " + audio);
    console.log("La fecha de audio: " + fechaHora);
    // console.log("Recibi la informacion de reporte: " + imagen.length);
    var nameArchivo = generarNombreAudio(fechaHora, idReporte, parte, "mp3");
    if (idReporte === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Reporte invalido'
            }
        });
    }
    if (audio === undefined) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }
    // Grabar archivo en la ruta del servidor 
    try {
        ruta = "multimedia/audios/" + nameArchivo;
        var buffer = Buffer.from(audio.replace('data:audio/ogg; codecs=opus;base64,', ''), 'base64');
        fs.writeFileSync(ruta, buffer);
    }
    catch (err) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }
    // Registra el archivo en la base de datos
    var QUERY = "CALL addMultimediaRtID(" + mysql_1.default.instance.cnn.escape(fechaHora) + ",'audio','audios/" + nameArchivo + "'," + idReporte + ",@last_id)";
    var id_multimedia;
    mysql_1.default.ejecutarQuery(QUERY, function (err, idMultimedia) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err,
                class: 'uploads'
            });
        }
        else {
            id_multimedia = idMultimedia[0][0];
            return res.json({
                ok: true,
                message: '¡Archivo subido correctamente!',
            });
        }
    });
    var data = {
        id_multimedia: id_multimedia,
        fechahora_captura: fechaHora,
        tipo_archivo: 'audio',
        ruta: ruta.replace('multimedia/', ''),
        id_reporte_mult: idReporte
    };
    // Emitir a lo usuarios nueva imagen recibida 
    socketServer.emitirNuevoAudio(idReporte, data);
});
function generarNombreArchivo(fechaHora, idReporte) {
    // Obtener fecha y hora
    var date = fechaHora.split(' ');
    var fecha = date[0];
    var fechaSeparada = fecha.split('-');
    var hora = date[date.length - 1];
    var horaSeparada = hora.split(':');
    // Configurar nombre del archivo
    var DMY = "D" + fechaSeparada[2] + "M" + fechaSeparada[1] + "Y" + fechaSeparada[0];
    var HNS = "D" + horaSeparada[0] + "M" + horaSeparada[1] + "Y" + horaSeparada[2];
    var nameArchivo = idReporte + "-" + DMY + HNS + ".JPEG";
    return nameArchivo;
}
function generarNombreAudio(fechaHora, idReporte, parte, extension) {
    // Obtener fecha y hora
    var date = fechaHora.split(' ');
    var fecha = date[0];
    var fechaSeparada = fecha.split('-');
    var hora = date[date.length - 1];
    var horaSeparada = hora.split(':');
    // Configurar nombre del archivo
    var DMY = "D" + fechaSeparada[2] + "M" + fechaSeparada[1] + "Y" + fechaSeparada[0];
    var HNS = "D" + horaSeparada[0] + "M" + horaSeparada[1] + "Y" + horaSeparada[2];
    var nameArchivo = idReporte + "-" + DMY + HNS + "_" + parte + "." + extension;
    return nameArchivo;
}
exports.default = app;
