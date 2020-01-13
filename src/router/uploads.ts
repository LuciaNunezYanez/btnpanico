const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

import MySQL from '../mysql/mysql';
import Server from '../server/server';

const socketServer = Server.instance;
const app = express();

// Opciones predeterminadas
app.use( fileUpload({ useTempFiles: true }) );

// Esta configurado unicamente para que reciba archivos 
// codificados en Base64 
// NO recibe archivos sin codificar 


app.post('/imagenes/:reporte', function(req: any, res: any) {
    const idReporte: number = req.params.reporte;
    const fechaHora: string = req.body.fecha;
    const imagen: string = req.body.imagen;
    const nameArchivo = generarNombreArchivo(fechaHora, idReporte);
    
    let ruta;
    console.log("La fecha de foto: " + fechaHora);

    if (idReporte === 0) {
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'Reporte invalido'
            }
        });
    }

    if ( imagen === undefined) {
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }

    // Grabar archivo en la ruta del servidor 
    try{
        let buffer = Buffer.from(imagen, 'base64');
        ruta = `multimedia/imagenes/${nameArchivo}`;
        fs.writeFileSync(ruta, buffer);
    } catch(err){
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }    

    var id_multimedia;
    // Registra el archivo en la base de datos
    const QUERY = `CALL addMultimediaRtID(${MySQL.instance.cnn.escape(fechaHora)},'imagen','imagenes/${nameArchivo}',${idReporte},@last_id)`;
    MySQL.ejecutarQuery( QUERY, (err: any, idMultimedia: Object[][]) => {
      if(err) {
          return res.status(400).json({
              ok: false, 
              error: err,
              class: 'uploads'
          });
      } else {
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
        id_multimedia, 
        fechahora_captura: fechaHora,
        tipo_archivo: 'imagen',
        ruta: ruta.replace('multimedia/',''), 
        id_reporte_mult: idReporte
    });
  
});

// POST PARA AUDIO
app.post('/audio/:reporte', function(req: any, res: any) {
    const idReporte: number = req.params.reporte;
    const fechaHora: string = req.body.fecha;
    const audio: string = req.body.audio;
    const parte: number = req.body.parte;
    let ruta;

    // console.log("Recibi la informacion de audio: " + audio);
    console.log("La fecha de audio: " + fechaHora);
    // console.log("Recibi la informacion de reporte: " + imagen.length);

    const nameArchivo = generarNombreAudio(fechaHora, idReporte, parte, "mp3")

    if (idReporte === 0) {
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'Reporte invalido'
            }
        });
    }

    if ( audio === undefined) {
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'No se seleccionó ningún archivo'
            }
        });
    }

    // Grabar archivo en la ruta del servidor 
    try{
        ruta = `multimedia/audios/${nameArchivo}`;
        let buffer = Buffer.from(audio.replace('data:audio/ogg; codecs=opus;base64,', ''), 'base64')
        fs.writeFileSync(ruta, buffer);
    } catch(err){
        return res.status(400).json({
            ok: false, 
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }    
    
    
    // Registra el archivo en la base de datos
    const QUERY = `CALL addMultimediaRtID(${MySQL.instance.cnn.escape(fechaHora)},'audio','audios/${nameArchivo}',${idReporte},@last_id)`;

    let id_multimedia;
    MySQL.ejecutarQuery( QUERY, (err: any, idMultimedia: Object[][]) => {
      if(err) {
          return res.status(400).json({
              ok: false, 
              error: err,
              class: 'uploads'
          });
      } else {
          id_multimedia = idMultimedia[0][0];
          return res.json({
              ok: true, 
              message: '¡Archivo subido correctamente!',
            //   idMultimedia: idMultimedia[0][0]
          });
      }
  });

    const data = {
        id_multimedia, 
        fechahora_captura: fechaHora,
        tipo_archivo: 'audio',
        ruta: ruta.replace('multimedia/',''), 
        id_reporte_mult: idReporte
    }
   // Emitir a lo usuarios nueva imagen recibida 
   socketServer.emitirNuevoAudio(idReporte, data);
});

function generarNombreArchivo(fechaHora:string, idReporte:number){
    // Obtener fecha y hora
    let date = fechaHora.split(' ');
    let fecha = date[0];
    let fechaSeparada = fecha.split('-');
    let hora = date[ date.length -1 ];
    let horaSeparada = hora.split(':');

    // Configurar nombre del archivo
    let DMY =`D${ fechaSeparada[2] }M${ fechaSeparada[1] }Y${ fechaSeparada[0] }`;
    let HNS =`D${ horaSeparada[0] }M${ horaSeparada[1] }Y${ horaSeparada[2] }`;
    const nameArchivo = `${ idReporte }-${ DMY }${ HNS }.JPEG`
    return nameArchivo;
}

function generarNombreAudio(fechaHora:string, idReporte:number, parte:number, extension:string){
    // Obtener fecha y hora
    let date = fechaHora.split(' ');
    let fecha = date[0];
    let fechaSeparada = fecha.split('-');
    let hora = date[ date.length -1 ];
    let horaSeparada = hora.split(':');

    // Configurar nombre del archivo
    let DMY =`D${ fechaSeparada[2] }M${ fechaSeparada[1] }Y${ fechaSeparada[0] }`;
    let HNS =`D${ horaSeparada[0] }M${ horaSeparada[1] }Y${ horaSeparada[2] }`;
    const nameArchivo = `${ idReporte }-${ DMY }${ HNS }_${parte}.${extension}`
    return nameArchivo;
}

export default app;  