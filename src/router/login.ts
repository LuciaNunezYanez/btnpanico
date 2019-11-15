import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = Router();

// Log in
router.post('/', (req: Request, res: Response) => {

    
    const usuario = MySQL.instance.cnn.escape(req.body.usuario);
    const passNoEnctrip = req.body.contrasena;
    const query = `CALL getUsuarioCCID(${usuario})`;
    

    MySQL.ejecutarQuery(query, (err: any, data: any[][]) => {
        try{ 
            if( err ){
                return res.status(500).json({
                    ok: false, 
                    resp: err
                })
            } else {
                let { 
                    id_usuarios_cc,
                    nombres_usuarios_cc , 
                    apellido_paterno, 
                    apellido_materno, 
                    tipo_usuario, 
                    dependencia, 
                    sexo_cc, 
                    estatus_usuario } = data[0][0];
                    
                // VALIDAR USUARIO ACTIVO 
                if(estatus_usuario === 0 ){
                    return res.json({
                        ok: false, 
                        resp: 'Usuario inactivo'
                    });
                }
                const usuario = {
                    id_usuario: id_usuarios_cc,
                    nombres: nombres_usuarios_cc , 
                    epellPat: apellido_paterno, 
                    apellMat: apellido_materno, 
                    tipo: tipo_usuario, 
                    depend: dependencia, 
                    sexo: sexo_cc, 
                    estatus: estatus_usuario};

                //GENERAR TOKEN
                let token = jwt.sign({
                    usuario: usuario
                }, process.env.SEED || 'este-es-el-seed-de-desarrollo', 
                { expiresIn: 60 * 60 * 24 });
                
                // VALIDAR INICIO DE SESIÓN 
                const passEncript = data[0][0].contrasena;
                if(bcrypt.compareSync(passNoEnctrip, passEncript)){
                    return res.json({
                        ok: true, 
                        resp: 'Contraseña exitosa', 
                        //usuario: { usuario },
                        token
                    });
                }else{
                    return res.json({
                        ok: false,
                        resp: 'Contraseña incorrecta'
                    });
                } 
            }
        } catch (e){
            return res.status(400).json({
                ok: false, 
                resp: e.message
            });
        } 
    });



});

    

export default router;