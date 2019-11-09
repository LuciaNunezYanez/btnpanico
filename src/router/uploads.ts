const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
import MySQL from '../mysql/mysql';
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
        let ruta = `multimedia/imagenes/${nameArchivo}`;
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
    const QUERY = `CALL addMultimediaRtID(${MySQL.instance.cnn.escape(fechaHora)},'imagen','imagenes/${nameArchivo}',${idReporte},@last_id)`;
    MySQL.ejecutarQuery( QUERY, (err: any, idMultimedia: Object[][]) => {
      if(err) {
          return res.status(400).json({
              ok: false, 
              error: err,
              class: 'uploads'
          });
      } else {
          return res.json({
              ok: true, 
              message: '¡Archivo subido correctamente!',
              idMultimedia: idMultimedia[0][0]
          });
      }
  });
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

export default app;  