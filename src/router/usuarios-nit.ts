import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const bcrypt = require('bcrypt');
const router = Router();

let salt = bcrypt.genSaltSync(10);

// Obtener usuario por usuario
router.get('/:id', ( req: Request, res: Response ) =>{

    const idusuario = MySQL.instance.cnn.escape(req.params.id);

    const query = `CALL getUsuarioCCID(${idusuario})`;

    MySQL.ejecutarQuery(query, (err: any, data: any[][]) => {
        if( err ){
            return res.status(400).json({
                ok: false, 
                resp: err
            })
        } else {
            return res.json({
                ok: true, 
                resp: data[0][0]
            })

        }
    });

});

// Agregar usuarios NIT
router.post('/',(req: Request, res: Response) => {
     
    // Encriptar contraseña FORMA 1 
    let contrasena: string = ( req.body.contrasena);
    // Quizá quitando el escape
    let contrEncript = bcrypt.hashSync(contrasena, salt);
    contrEncript = MySQL.instance.cnn.escape(contrEncript);

    let nombre: string = MySQL.instance.cnn.escape(req.body.nombre);
    let apePat: string = MySQL.instance.cnn.escape(req.body.apePat);
    let apeMat: string = MySQL.instance.cnn.escape(req.body.apeMat) || '';
    let usuario: string = MySQL.instance.cnn.escape(req.body.usuario);
    let tipoUsuario: number = req.body.tipo;
    let depend: string = MySQL.instance.cnn.escape(req.body.depend);
    let sexo: string = MySQL.instance.cnn.escape(req.body.sexo);
    let estatus: boolean = req.body.estatus || 1;


    const QUERY = `CALL addUsuarioCC(
        ${nombre},
        ${apePat},
        ${apeMat},
        ${usuario},
        ${contrEncript},
        ${tipoUsuario},
        ${depend},
        ${sexo},
        ${estatus});`;

    MySQL.ejecutarQuery(QUERY, (err: any, data: any) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err: err
            });
        } else {
            return res.json({
                ok: true,
                usuario: req.body.usuario
            });
        }

    })

});


// Editar usuario NIT 
router.put('/:id', (req: Request, res: Response) => {
    let usuario = MySQL.instance.cnn.escape(req.params.id);
    let body = req.body;    

    let nombre: string = MySQL.instance.cnn.escape(body.nombre);
    let apePat: string = MySQL.instance.cnn.escape(body.apePat);
    let apeMat: string = MySQL.instance.cnn.escape(body.apeMat) || '';
    let tipoUsuario: number = body.tipo;
    let depend: string = MySQL.instance.cnn.escape(body.depend);
    let sexo: string = MySQL.instance.cnn.escape(body.sexo);
    let estatus: boolean = body.estatus || 1;

  
    // Encriptar la nueva contraseña
    let contrasena: string = body.contrasena;
    const contrEncript = MySQL.instance.cnn.escape(bcrypt.hashSync(contrasena, salt));
    
    const QUERY = `CALL editUsuarioCCID(
        ${nombre},
        ${apePat},
        ${apeMat},
        ${contrEncript},
        ${tipoUsuario},
        ${depend},
        ${sexo},
        ${estatus},
        ${usuario});`;

    MySQL.ejecutarQuery(QUERY, (err: any, data: any [][]) => {
        if(err){
            return res.status(400).json({
                ok: false, 
                err
            });
        } else {
            return res.json({
                ok: true, 
                data: data[0][0]
            });
        }
    })
});


export default router;