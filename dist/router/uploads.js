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
app.post('/perfil', function (req, res) {
    var imagen = req.body.imagen;
    var date = new Date();
    var ruta;
    if (imagen === undefined || imagen.length < 10) {
        return res.json({
            ok: false,
            err: {
                message: 'No se seleccionó ninguna fotografía de perfíl'
            }
        });
    }
    var nombreArchivo = "fotoPerfil" + date.getTime() + ".jpeg";
    // Grabar archivo en la ruta del servidor 
    try {
        // Remplazar la cabecera de la imagenBase64
        var buffer = Buffer.from(imagen.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
        ruta = "multimedia/imagenes/" + nombreArchivo;
        if (process.env.RUTAUPLOADS) {
            fs.writeFileSync(process.env.RUTAUPLOADS + '/' + ruta, buffer);
        }
        else {
            fs.writeFileSync(ruta, buffer);
        }
    }
    catch (err) {
        console.log(err);
        return res.json({
            ok: false,
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }
    var QUERY = "CALL addMultimediaRtID(\n        " + mysql_1.default.instance.cnn.escape(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
        date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()) + ",\n        'imagen','imagenes/" + nombreArchivo + "', 0, 'foto perfil', @last_id)";
    mysql_1.default.ejecutarQuery(QUERY, function (err, idMultimedia) {
        if (err) {
            return res.json({
                ok: false,
                error: err,
                class: 'uploads'
            });
        }
        else {
            return res.json({
                ok: true,
                id_multimedia: idMultimedia[0][0],
                message: '¡Archivo subido correctamente!',
            });
        }
    });
});
app.post('/imagenes/:reporte', function (req, res) {
    var idReporte = req.params.reporte;
    var fechaHora = req.body.fecha;
    var imagen = req.body.imagen;
    var descripcion = req.body.descripcion;
    var nameArchivo = generarNombreArchivo(fechaHora, idReporte);
    var ruta;
    // console.log("La fecha de foto: " + fechaHora);
    if (idReporte === 0) {
        return res.json({
            ok: false,
            err: {
                message: 'Reporte invalido'
            }
        });
    }
    if (imagen === undefined) {
        return res.json({
            ok: false,
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }
    if (descripcion === undefined)
        descripcion = 'adjunto reporte';
    // Grabar archivo en la ruta del servidor 
    try {
        var buffer = Buffer.from(imagen, 'base64');
        ruta = "multimedia/imagenes/" + nameArchivo;
        if (process.env.RUTAUPLOADS) {
            fs.writeFileSync(process.env.RUTAUPLOADS + '/' + ruta, buffer);
        }
        else {
            fs.writeFileSync(ruta, buffer);
        }
    }
    catch (err) {
        console.log('ERROR AL ESCRIBIR ARCHIVO');
        console.log(err);
        return res.json({
            ok: false,
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }
    var id_multimedia;
    // Registra el archivo en la base de datos
    var QUERY = "CALL addMultimediaRtID(" + mysql_1.default.instance.cnn.escape(fechaHora) + ",'imagen','imagenes/" + nameArchivo + "'," + idReporte + ", " + mysql_1.default.instance.cnn.escape(descripcion) + " , @last_id)";
    mysql_1.default.ejecutarQuery(QUERY, function (err, idMultimedia) {
        if (err) {
            return res.json({
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
    var descripcion = req.body.descripcion;
    var ruta;
    // console.log("Recibi la informacion de audio: " + audio);
    // console.log("La fecha de audio: " + fechaHora);
    if (fechaHora === undefined) {
        var fecha = new Date();
        fechaHora = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds();
    }
    var nameArchivo = generarNombreAudio(fechaHora, idReporte, parte, "mp3");
    if (idReporte === 0) {
        return res.json({
            ok: false,
            err: {
                message: 'Reporte invalido'
            }
        });
    }
    if (audio === undefined) {
        return res.json({
            ok: false,
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }
    if (descripcion === undefined)
        descripcion = 'adjunto reporte';
    // Grabar archivo en la ruta del servidor 
    try {
        ruta = "multimedia/audios/" + nameArchivo;
        var buffer = Buffer.from(audio.replace('data:audio/ogg; codecs=opus;base64,', ''), 'base64');
        if (process.env.RUTAUPLOADS) {
            fs.writeFileSync(process.env.RUTAUPLOADS + '/' + ruta, buffer);
        }
        else {
            fs.writeFileSync(ruta, buffer);
        }
    }
    catch (err) {
        console.log(err);
        return res.json({
            ok: false,
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }
    // Registra el archivo en la base de datos
    var QUERY = "CALL addMultimediaRtID(" + mysql_1.default.instance.cnn.escape(fechaHora) + ",'audio','audios/" + nameArchivo + "'," + idReporte + ", " + mysql_1.default.instance.cnn.escape(descripcion) + ", @last_id)";
    var id_multimedia;
    mysql_1.default.ejecutarQuery(QUERY, function (err, idMultimedia) {
        if (err) {
            return res.json({
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
app.post('/video/:reporte', function (req, res) {
    var id_reporte = req.params.reporte;
    var fecha = mysql_1.default.instance.cnn.escape(getFecha());
    var video = req.files.video;
    if (video === undefined) {
        return res.status(202).json({
            ok: false,
            message: 'Video no recibido'
        });
    }
    // Grabar archivo en la ruta del servidor 
    try {
        // Listas de promesas para ejecutar
        var promises = [];
        var videos = [];
        var querys_1 = [];
        if (video.name) {
            var rutaVideo = "multimedia/videos/" + id_reporte + "-" + video.name;
            if (process.env.RUTAUPLOADS) {
                rutaVideo = process.env.RUTAUPLOADS + '/' + rutaVideo;
            }
            promises.push(video.mv(rutaVideo));
            var query = "CALL addMultimediaRtID(" + fecha + ", 'video', 'videos/" + id_reporte + "-" + video.name + "', " + id_reporte + ", 'adjunto reporte', @last_id);";
            querys_1.push(mysql_1.default.ejecutarQueryPr(query));
        }
        else {
            for (var i = 0; i < video.length; i++) {
                var rutaVideo = "multimedia/videos/" + id_reporte + "-" + video[i].name;
                if (process.env.RUTAUPLOADS) {
                    rutaVideo = process.env.RUTAUPLOADS + '/' + rutaVideo;
                }
                // Guardar ruta y crear array de promesas
                // rutas.push();
                promises.push(video[i].mv(rutaVideo));
                var query = "CALL addMultimediaRtID(" + fecha + ", 'video', 'videos/" + id_reporte + "-" + video[i].name + "', " + id_reporte + ", 'adjunto reporte', @last_id);";
                querys_1.push(mysql_1.default.ejecutarQueryPr(query));
            }
        }
        Promise.all(promises).then(function () {
            Promise.all(querys_1).then(function (resultado) {
                // console.log('Resultado éxitoso al agregar base de datos y mover archivos');
                res.status(200).json({ ok: true });
            }).catch(function (error) {
                console.log('#3 Error al grabar en base de datos');
                console.log(error);
                return res.status(202).json({ ok: false, error: error });
            });
        }).catch(function (err) {
            console.log('#2 Algo salio mal al mover los archiovos');
            return res.status(202).json({ ok: false, err: err });
        });
        // Emitir a lo usuarios el/los nuevos videos
        var QUERY = "CALL getMultimedRep(" + id_reporte + ");";
        mysql_1.default.ejecutarQuery(QUERY, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                // Aplicar filtro para solo obtener videos
                console.log(result);
                socketServer.emitirNuevoVideo(id_reporte, {
                    message: 'Te traigo un video',
                    videos: result[0]
                });
            }
        });
        //     id_multimedia, 
        //     fechahora_captura: fechaHora,
        //     tipo_archivo: 'imagen',
        //     ruta: ruta.replace('multimedia/',''), 
        //     id_reporte_mult: idReporte
    }
    catch (err) {
        console.log(err);
        return res.status(202).json({
            ok: false,
            message: '#1 Ocurrió un error al grabar archivo'
        });
    }
});
function getFecha() {
    var date = new Date();
    return date.getFullYear() + '/' +
        (date.getMonth() + 1) + '/' +
        date.getDate() + ' ' +
        date.getHours() + ':' +
        date.getMinutes() + ':' +
        date.getSeconds();
}
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
    if (fechaHora === undefined) {
        // Recibirla: 2019-10-28 15:24:55
        var fecha_1 = new Date();
        fechaHora = fecha_1.getFullYear() + '-' + (fecha_1.getMonth() + 1) + '-' + fecha_1.getDate() + ' ' + fecha_1.getHours() + ':' + fecha_1.getMinutes() + ':' + fecha_1.getSeconds();
    }
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
