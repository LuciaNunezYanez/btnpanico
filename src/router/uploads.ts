const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

import MySQL from '../mysql/mysql';
import Server from '../server/server';
import { Response, Request } from 'express';
import { json } from 'body-parser';

const socketServer = Server.instance;
const app = express();

// Opciones predeterminadas
app.use( fileUpload({ useTempFiles: true }) );

// Esta configurado unicamente para que reciba archivos 
// codificados en Base64 
// NO recibe archivos sin codificar 

app.post('/perfil', (req: any, res: Response) => {
    const imagen: string = req.body.imagen;
    const date = new Date();
    let ruta;

    if ( imagen === undefined || imagen.length < 10) {
        return res.json({
            ok: false, 
            err: {
                message: 'No se seleccionó ninguna fotografía de perfíl'
            }
        });
    }
    let nombreArchivo = `fotoPerfil${ date.getTime() }.jpeg`;

    // Grabar archivo en la ruta del servidor 
    try{
        // Remplazar la cabecera de la imagenBase64
        let buffer = Buffer.from(imagen.replace(/^data:image\/(png|gif|jpeg);base64,/,''),'base64');
        ruta = `multimedia/imagenes/${nombreArchivo}`;
        if(process.env.RUTAUPLOADS){
            fs.writeFileSync(process.env.RUTAUPLOADS + '/' + ruta, buffer);
        } else {
            fs.writeFileSync(ruta, buffer);
        }
    } catch(err){
        console.log(err);
        return res.json({
            ok: false, 
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }       


    const QUERY = `CALL addMultimediaRtID(
        ${MySQL.instance.cnn.escape(date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + 
            date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds())},
        'imagen','imagenes/${nombreArchivo}', 0, 'foto perfil', @last_id)`;
    MySQL.ejecutarQuery( QUERY, (err: any, idMultimedia: Object[][]) => {
        if(err) {
            return res.json({
                ok: false, 
                error: err,
                class: 'uploads'
            });
        } else {
            return res.json({
                ok: true, 
                id_multimedia: idMultimedia[0][0],
                message: '¡Archivo subido correctamente!',
            });
        }
    });
    
});

app.post('/imagenes/:reporte', function(req: any, res: any) {
    const idReporte: number = req.params.reporte;
    const fechaHora: string = req.body.fecha;
    const imagen: string = req.body.imagen;
    let descripcion: string = req.body.descripcion;
    const nameArchivo = generarNombreArchivo(fechaHora, idReporte);
    
    let ruta;
    // console.log("La fecha de foto: " + fechaHora);

    if (idReporte === 0) {
        return res.json({
            ok: false, 
            err: {
                message: 'Reporte invalido'
            }
        });
    }

    if ( imagen === undefined) {
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
    try{
        let buffer = Buffer.from(imagen, 'base64');
        ruta = `multimedia/imagenes/${nameArchivo}`;
        if(process.env.RUTAUPLOADS){
            fs.writeFileSync(process.env.RUTAUPLOADS + '/' + ruta, buffer);
        } else {
            fs.writeFileSync(ruta, buffer);
        }
    } catch(err){
        
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
    const QUERY = `CALL addMultimediaRtID(${MySQL.instance.cnn.escape(fechaHora)},'imagen','imagenes/${nameArchivo}',${idReporte}, ${MySQL.instance.cnn.escape(descripcion)} , @last_id)`;
    MySQL.ejecutarQuery( QUERY, (err: any, idMultimedia: Object[][]) => {
      if(err) {
          return res.json({
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
    let fechaHora: string = req.body.fecha;
    const audio: string = req.body.audio;
    const parte: number = req.body.parte;
    let descripcion: string = req.body.descripcion;
    let ruta;

    // console.log("Recibi la informacion de audio: " + audio);
    // console.log("La fecha de audio: " + fechaHora);
    if(fechaHora === undefined){
        const fecha = new Date();
        fechaHora = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds();
    }
    const nameArchivo = generarNombreAudio(fechaHora, idReporte, parte, "mp3")

    if (idReporte === 0) {
        return res.json({
            ok: false, 
            err: {
                message: 'Reporte invalido'
            }
        });
    }

    if ( audio === undefined) {
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
    try{
        ruta = `multimedia/audios/${nameArchivo}`;
        let buffer = Buffer.from(audio.replace('data:audio/ogg; codecs=opus;base64,', ''), 'base64')
        
        if(process.env.RUTAUPLOADS){
            fs.writeFileSync(process.env.RUTAUPLOADS + '/' + ruta, buffer);
        } else {
            fs.writeFileSync(ruta, buffer);
        }
        
    } catch(err){
        console.log(err);
        return res.json({
            ok: false, 
            err: {
                message: 'Ocurrió un error al grabar archivo'
            }
        });
    }    
    
    
    // Registra el archivo en la base de datos
    const QUERY = `CALL addMultimediaRtID(${MySQL.instance.cnn.escape(fechaHora)},'audio','audios/${nameArchivo}',${idReporte}, ${MySQL.instance.cnn.escape(descripcion)}, @last_id)`;
    let id_multimedia;
    MySQL.ejecutarQuery( QUERY, (err: any, idMultimedia: Object[][]) => {
      if(err) {
          return res.json({
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

app.post('/video/:reporte', function(req: any, res: Response) {

    const id_reporte: number = req.params.reporte;
    const fecha: string = MySQL.instance.cnn.escape(getFecha());
    const video: any = req.files.video;

    if(video === undefined){
        return res.status(202).json({
            ok: false, 
            message: 'Video no recibido'
        });
    }
    
    // Grabar archivo en la ruta del servidor 
    try{
        // Listas de promesas para ejecutar
        let promises: any[] = [];
        let videos: Object[] = [];
        let querys: any[] = [];

        if(video.name){
            let rutaVideo = `multimedia/videos/${id_reporte}-${video.name}`;
            if(process.env.RUTAUPLOADS){
                rutaVideo = process.env.RUTAUPLOADS + '/' + rutaVideo;
            }
            promises.push(video.mv(rutaVideo));
            let query = `CALL addMultimediaRtID(${fecha}, 'video', 'videos/${id_reporte}-${video.name}', ${id_reporte}, 'adjunto reporte', @last_id);`;
            querys.push(MySQL.ejecutarQueryPr(query));
        } else {
            for(let i=0; i<video.length; i++){
                let rutaVideo = `multimedia/videos/${id_reporte}-${video[i].name}`;
                if(process.env.RUTAUPLOADS){
                    rutaVideo = process.env.RUTAUPLOADS + '/' + rutaVideo;
                }
                // Guardar ruta y crear array de promesas
                // rutas.push();
                promises.push(video[i].mv(rutaVideo));
                let query = `CALL addMultimediaRtID(${fecha}, 'video', 'videos/${id_reporte}-${video[i].name}', ${id_reporte}, 'adjunto reporte', @last_id);`;
                querys.push(MySQL.ejecutarQueryPr(query));
            }
        }

        
        Promise.all(promises).then( () => {
            Promise.all(querys).then( (resultado) => {
                // console.log('Resultado éxitoso al agregar base de datos y mover archivos');
                res.status(200).json({ok: true});
            }).catch( (error) => {
                console.log('#3 Error al grabar en base de datos');
                console.log(error);
                return res.status(202).json({ok: false, error});
            });
        }).catch( (err) => {
            console.log('#2 Algo salio mal al mover los archiovos');
            return res.status(202).json({ok: false, err});
        });

        // Emitir a lo usuarios el/los nuevos videos
        const QUERY = `CALL getMultimedRep(${id_reporte});`;
        MySQL.ejecutarQuery(QUERY, (err: any, result: any[]) => {
            if(err){
                console.log(err);
            } else {
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

    } catch(err){
        console.log(err);
        return res.status(202).json({
            ok: false, 
            message: '#1 Ocurrió un error al grabar archivo'
        });
    }
});


function getFecha(): string{
    const date = new Date();
    return date.getFullYear() + '/' + 
        (date.getMonth() + 1) + '/' + 
        date.getDate() + ' ' +
        
        date.getHours() + ':' + 
        date.getMinutes() + ':' + 
        date.getSeconds();
}



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
    if(fechaHora === undefined){
        // Recibirla: 2019-10-28 15:24:55
        const fecha = new Date();
        fechaHora = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds();
    } 
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