const nodemailer = require("nodemailer");
import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const bcrypt = require('bcrypt');

const router = Router();

router.post('/', (req: Request, res: Response) => {

    const correo = req.body.correo;
    if(!correo || !req.body.correo){
        return res.json({
            ok: false, 
            resp: 'Ingrese correo válido'
        });
    }

    /* Generar codigo de activación y guardarlo en la base de datos */
    const c = Math.random().toString(36).substring(5).toUpperCase();
    const date = new Date;
    const fecha =   
        date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' ' + 
        date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        
    const QUERY = `CALL addCodigoRecuperacion(
        ${MySQL.instance.cnn.escape( correo) }, 
        ${MySQL.instance.cnn.escape( c )}, 
        ${MySQL.instance.cnn.escape( fecha) })`;

    MySQL.ejecutarQuery(QUERY, (err: any, respuestaDB: any[][]) => {
        if(err) {
            return res.json({
                ok: false, 
                resp: 'No se pudo agregar su correo electrónico',
                err
            });
        } else {
            main(correo, respuestaDB[0][0].CODIGO).then( resp => {
                return res.json({
                    ok: true, 
                    resp: 'Código de recuperación enviado con éxito',
                    });
                }
            ).catch( err => {
                return res.json({
                    ok: false, 
                    resp: 'Ocurrió un error al enviar código de activación' + err
                    });
                }  
            );
        }
    });
    
    
});

router.post('/validar/', (req: Request, res: Response) => {
    const correo = req.body.correo;
    const codigo = req.body.codigo;

    if(!correo || !codigo){
        return res.json({
            ok: false, 
            resp: 'Código y/o correo electrónico inválido.'
        });
    }

    const QUERY = `SELECT idcodigo_recup 
        FROM codigos_recup 
        WHERE correo_recup = ${MySQL.instance.cnn.escape(correo)} AND codigo_recup = ${MySQL.instance.cnn.escape(codigo)} 
        LIMIT 1;`;
    MySQL.ejecutarQuery(QUERY, (err: any, respuesta: any[]) => {
        if(err){
            return res.json({
                ok: false, 
                resp: 'Ocurrió un error al buscar código'
            });
        } else {
            if(respuesta[0].idcodigo_recup){
                return res.json({
                    ok: true, 
                    resp: 'Acceso concedido',
                    id: respuesta[0]?.idcodigo_recup
                });
            } else {
                return res.json({
                    ok: false, 
                    resp: 'El código y/o correo electrónico no coinciden'
                });
            }
        }
    });
});

router.put('/cc', (req: Request, res: Response) => {
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;

    if(!correo || !contrasena){
        return res.json({
            ok: false, 
            resp: 'Correo y/o contraseña inválida.'
        });
    }

    const QUERY = `CALL updateContrasenaApp(${MySQL.instance.cnn.escape(correo)}, ${MySQL.instance.cnn.escape(contrasena)})`;
    
    MySQL.ejecutarQuery(QUERY, (err: any, respuesta: any[][]) => {
        if(err){
            return res.json({
                ok: false, 
                resp: 'Ocurrió un error al actualizar contrasena'
            });
        } else {
            if(respuesta[0][0].id){
                return res.json({
                    ok: true, 
                    resp: respuesta[0][0]?.resp,
                    id: respuesta[0][0].id
                });
            } else {
                return res.json({
                    ok: false, 
                    resp: 'El correo electrónico no se encuentra en nuestros registros.'
                });
            }
        }
    }); 
});

async function main( correo: string, codigo: string) {
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'lucia.nunez0828@gmail.com',
      pass: 'Lucia2020?', 
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Alerta Durango" <${correo}>`, // sender address
    to: `${correo}`, // list of receivers
    subject: "Recuperación de contraseña", // Subject line
    text: `Ingresa el siguiente código en la aplicación: ${codigo}`
  });
}

export default router;