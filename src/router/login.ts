import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
import { json } from 'body-parser';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = Router();

// Log in
router.post('/', (req: Request, res: Response) => {

    // console.log('LOGIN1');
    // console.log(req.body);
    const usuario = MySQL.instance.cnn.escape(req.body.usuario);
    const passNoEnctrip = req.body.contrasena;
    // const query = `CALL getUsuarioCCID(${usuario})`;
    const query = `CALL getLoginMon(${usuario});`;

    if (usuario === undefined || passNoEnctrip === undefined) {
        return res.json({
            ok: false,
            resp: 'Ingrese los datos completos por favor.'
        });
    }

    MySQL.ejecutarQuery(query, (err: any, data: any[][]) => {
        try {
            if (err) {
                return res.json({
                    ok: false,
                    resp: err
                })
            } else {
                if (!data[0][0]?.id_usuarios_cc) {
                    return res.json({
                        ok: false,
                        resp: 'Datos no encontrados'
                    });
                }

                let {
                    id_usuarios_cc,
                    usuario,
                    nombres_usuarios_cc,
                    apellido_paterno,
                    apellido_materno,
                    tipo_usuario,
                    dependencia,
                    sexo_cc,
                    id_estacion_pertenece,
                    estatus_usuario,
                    id_asociacion_cc,
                    sala_usuario_cc,
                    p_admin, 
                    p_normal,
                    p_tr } = data[0][0];

                // console.log('ESTACION PERTENECE', id_estacion_pertenece);
                // VALIDAR USUARIO ACTIVO 
                if (estatus_usuario === 0) {
                    return res.json({
                        ok: false,
                        resp: 'Usuario inactivo'
                    });
                }
                const usuario_log = {
                    id_usuario: id_usuarios_cc,
                    usuario: usuario,
                    nombres: nombres_usuarios_cc,
                    apellPat: apellido_paterno,
                    apellMat: apellido_materno,
                    tipo: tipo_usuario,
                    depend: dependencia,
                    sexo: sexo_cc,
                    estatus: estatus_usuario,
                    id_estacion_pertenece,
                    id_asociacion_cc,
                    p_admin, 
                    p_normal,
                    p_tr
                };

                const expiresIn: number = 60 * 60 * 12;
                //GENERAR TOKEN
                let token = jwt.sign({
                    usuario: usuario_log
                }, process.env.SEED || 'este-es-el-seed-de-desarrollo',
                    { expiresIn }); // 24 hrs de expiración 

                // console.log(expiresIn);
                // VALIDAR INICIO DE SESIÓN 
                const passEncript = data[0][0].contrasena;

                if (bcrypt.compareSync(passNoEnctrip, passEncript)) {
                    // console.log('SI COINCIDEN');
                    return res.json({
                        ok: true,
                        resp: 'Contraseña correcta',
                        id_usuario: id_usuarios_cc,
                        usuario,
                        estacion: id_estacion_pertenece,
                        id_asociacion: id_asociacion_cc,
                        expiresIn: expiresIn,
                        sala: sala_usuario_cc,
                        p_admin, 
                        p_normal,
                        p_tr,
                        token
                    });
                } else {
                    // console.log('NO COINCIDEN');
                    return res.json({
                        ok: false,
                        resp: 'Contraseña incorrecta'
                    });
                }
            }
        } catch (e) {
            return res.json({
                ok: false,
                resp: e
            });
        }
    });



});

router.post('/app/', (req: Request, res: Response) => {
    // console.log('LOGIN2');
    const correo: string = req.body.c;
    const contrasena: string = req.body.ct;
    if (!correo || !contrasena) {
        return res.json({
            ok: false,
            resp: 'Datos incompletos'
        });
    }


    const QUERY = `SELECT id_usuarios_app FROM usuarios_app WHERE 
        correo_usuario_app = ${MySQL.instance.cnn.escape(correo)} 
        AND contrasena_app = ${MySQL.instance.cnn.escape(contrasena)}
        AND estatus_usuario = 1 LIMIT 1;`


    MySQL.ejecutarQuery(QUERY, (err: any, respuesta: any[]) => {
        if (err) {
            return res.json({
                ok: false,
                resp: err
            });
        } else {
            if (respuesta[0]?.id_usuarios_app)
                return res.json({
                    ok: true,
                    resp: 'Éxito al iniciar sesión',
                    id: respuesta[0]?.id_usuarios_app
                });
            else
                return res.json({
                    ok: false,
                    resp: 'Correo y/o contraseña incorrecta.'
                });
        }
    });
});

router.post('/mult/app/', (req: Request, res: Response) => {
    // console.log('LOGIN3');

    const usuario = MySQL.instance.cnn.escape(req.body.usuario);
    const contrasenaPlana = req.body.contrasena;
    const query = `CALL getLogin(${usuario})`;

    if (usuario === undefined || contrasenaPlana === undefined) {
        return res.json({
            ok: false,
            resp: 'Ingrese datos completos por favor.'
        });
    }

    MySQL.ejecutarQueryPr(query).then((data: any) => {
        try {
            let usuarioDB = data[0][0];
            console.log('111');
            if(usuarioDB === undefined){
                return res.json({
                    ok: false,
                    mensaje: 'Usuario no encontrado'
                });
            }

            if (usuarioDB.id_usuarios_app) {         // Usuario app no encripta la contraseña 
                if (contrasenaPlana != usuarioDB.contrasena_app) {
                    // Existe pero no pasa
            console.log('222');
                    usuarioDB.access = false;
                    return res.json({
                        ok: true,
                        usuario: {
                            tipo: 'na',
                            mensaje: 'Contraseña incorrecta',
                            exist: 1,
                            access: false
                        }
                    });
                } else {
                    console.log('333');

                    // Todo bien 
                    // Es usuario de la app
                    // Encriptar token
                    const token = generarToken({
                        tipo: usuarioDB.tipo,
                        id_comercio: usuarioDB.id_comercio,
                        id_direccion: usuarioDB.id_direccion,
                        id_usuarios_app: usuarioDB.id_usuarios_app,
                        id_asociacion_pertenece: usuarioDB.id_asociacion_pertenece
                    });

                    usuarioDB.access = true;
                    return res.json({
                        ok: true,
                        usuario: usuarioDB, 
                        token: token
                    });

                }
            } else if (usuarioDB.id_usuarios_cc) {  // Usuario cc si la encripa
                if (!bcrypt.compareSync(contrasenaPlana, usuarioDB.contrasena)) {
                    console.log('444');
                    // Existe pero no pasa
                    usuarioDB.access = false;
                    return res.json({
                        ok: true,
                        usuario: {
                            tipo: 'na',
                            mensaje: 'Contraseña incorrecta',
                            exist: 1,
                            access: false
                        }
                    });
                } else {

                    console.log('555');
                    // Todo bien
                    // Es usuario cc
                    // Encriptar token
                    const token = generarToken({
                        tipo: usuarioDB.tipo,
                        id_comercio: 0,
                        id_direccion: 0,
                        id_usuarios_cc: usuarioDB.id_usuarios_cc,
                        id_asociacion_cc: usuarioDB.id_asociacion_cc
                    });

                    usuarioDB.access = true;
                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });
                }
            } else {
                
            console.log('666');
                usuarioDB.access = false;
                return res.json({
                    ok: true,
                    usuario: usuarioDB
                });
            }
        } catch (err) {
            
            console.log('777');
            return res.json({
                ok: false,
                resp: err
            });
        }
    }).catch((err) => {
        console.log('888');
        return res.json({
            ok: false,
            resp: err
        });
    });
});


function generarToken(data: Object): String{
    let token = jwt.sign({
        usuario: data
    }, process.env.SEED || 'este-es-el-seed-de-desarrollo');
    return token;
}

export default router;