import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
import { verify } from 'crypto';
const { verificaToken, verificaAdmin_role } = require('../server/middlewares/authenticacion');
const bcrypt = require('bcrypt');
const router = Router();
let salt = bcrypt.genSaltSync(10);

// Obtener usuario por usuario
router.get('/:id', [verificaToken, verificaAdmin_role], (req: Request, res: Response) => {
    const idusuario = MySQL.instance.cnn.escape(req.params.id);
    const query = `CALL getUsuarioCCID(${idusuario})`;

    MySQL.ejecutarQuery(query, (err: any, usuario: any[][]) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            })
        } else {
            return res.json({
                ok: true,
                resp: usuario[0][0]
            })

        }
    });

});

router.get('/asociac/:asoc', (req: Request, res: Response) => {
    const query = `CALL getUsuariosAsocUnidad(${req.params.asoc})`;

    MySQL.ejecutarQueryPr(query).then((usuarios: any) => {
        return res.json({
            ok: true,
            usuarios: usuarios[0]
        })
    }
    ).catch((err) => {
        return res.json({
            ok: false,
            resp: err
        })
    });
});


router.get('/usuarios/:sala/:estacion/:dpto', (req: Request, res: Response) => {
    const sala = MySQL.instance.cnn.escape(req.params.sala);
    const estacion = req.params.estacion;
    const dpto = MySQL.instance.cnn.escape(req.params.dpto);
    const query = `CALL getUsuariosCC(${sala},${estacion},${dpto})`;

    MySQL.ejecutarQuery(query, (err: any, usuarios: any[]) => {
        if (err) {
            return res.json({
                ok: false,
                resp: err
            })
        } else {
            return res.json({
                ok: true,
                usuarios: usuarios[0]
            })

        }
    });

});

// Agregar usuarios NIT
// [verificaToken, verificaAdmin_role], 
router.post('/', (req: Request, res: Response) => {

    console.log(req.body);
    // Encriptar contraseña FORMA 1 
    let contrasena: string = (req.body.contrasena);
    // Quizá quitando el escape
    let contrEncript = bcrypt.hashSync(contrasena, salt);
    contrEncript = MySQL.instance.cnn.escape(contrEncript);

    let nombre: string = MySQL.instance.cnn.escape(req.body.nombres);
    let apePat: string = MySQL.instance.cnn.escape(req.body.apellPat);
    let apeMat: string = MySQL.instance.cnn.escape(req.body.apellMat) || '';
    let usuario: string = MySQL.instance.cnn.escape(req.body.usuario);
    let tipoUsuario: number = req.body.tipo;
    let depend: string = MySQL.instance.cnn.escape(req.body.depend);
    let sexo: string = MySQL.instance.cnn.escape(req.body.sexo);
    let estatus: boolean = req.body.estatus || 1;

    const sala = MySQL.instance.cnn.escape(req.body.sala || 'C5DURANGO');
    const estacion = req.body.estacion || 2020023;
    const asociacion = req.body.asociacion || 0;
    const dpto = MySQL.instance.cnn.escape(req.body.dpto || '');

    let p_normal = 0, p_tr = 0, p_admin = 0, p_app_emerg = 0;

    switch (req.body.privilegio) {
        case 'p_normal':
            p_normal = 1;
            p_tr = 0;
            p_admin = 0;
            p_app_emerg = 0;

            break;
        case 'p_tr':
            p_normal = 0;
            p_tr = 1;
            p_admin = 0;
            p_app_emerg = 0;

            break;
        case 'p_normal_admin':
            p_normal = 1;
            p_tr = 0;
            p_admin = 1;
            p_app_emerg = 0;

            break;
        case 'p_tr_admin':
            p_normal = 0;
            p_tr = 1;
            p_admin = 1;
            p_app_emerg = 0;

            break;
        case 'p_app_emerg':
            p_normal = 0;
            p_tr = 0;
            p_admin = 0;
            p_app_emerg = 1;

            break;

        default:
            p_normal = 0;
            p_tr = 0;
            p_admin = 0;
            p_app_emerg = 0;
            break;
    }

    let QUERY;

    // Si existe la unidad se agrega a la tabla, de lo contrario es un usuario normal
    if (req.body.id_unidad) {
        QUERY = `CALL addUsuarioCCUnidad(
            ${nombre},
            ${apePat},
            ${apeMat},
            ${usuario},
            ${contrEncript},
            ${tipoUsuario},
            ${depend},
            ${sexo},
            ${estatus}, 
            ${sala}, 
            ${estacion}, 
            ${asociacion},
            ${dpto},
            ${req.body.id_unidad},
            ${p_normal}, 
            ${p_tr}, 
            ${p_admin}, 
            ${p_app_emerg});`;
    } else {
        QUERY = `CALL addUsuarioCC(
            ${nombre},
            ${apePat},
            ${apeMat},
            ${usuario},
            ${contrEncript},
            ${tipoUsuario},
            ${depend},
            ${sexo},
            ${estatus}, 
            ${sala}, 
            ${estacion}, 
            ${asociacion},
            ${dpto}, 
            ${p_normal}, 
            ${p_tr}, 
            ${p_admin}, 
            ${p_app_emerg});`;
    }

    MySQL.ejecutarQuery(QUERY, (err: any, data: any) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        } else {
            return res.json({
                ok: true,
                resp: req.body.id
            });
        }
    })

});


// Editar usuario NIT 
router.put('/:id', [verificaToken, verificaAdmin_role], (req: Request, res: Response) => {
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

    MySQL.ejecutarQuery(QUERY, (err: any, usuario: any[][]) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        } else {
            return res.json({
                ok: true,
                resp: usuario[0][0]
            });
        }
    })
});



export default router;