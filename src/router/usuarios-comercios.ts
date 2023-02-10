import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
import { verify } from 'crypto';
const bcrypt = require('bcrypt');
const router = Router();
let salt = bcrypt.genSaltSync(10);

// Obtener usuario por usuario
router.get('/:id',  ( req: Request, res: Response ) =>{
    const idusuario = MySQL.instance.cnn.escape(req.params.id);
    const query = `CALL getUsuarioAppID(${idusuario})`;
    MySQL.ejecutarQuery(query, (err: any, usuario: any[][]) => {
        if( err ){
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
router.get('/completo/:id',  ( req: Request, res: Response ) =>{
    const idusuario = MySQL.instance.cnn.escape(req.params.id);
    const query = `CALL getTodoUsuarioAppID(${idusuario})`;

    MySQL.ejecutarQuery(query, (err: any, usuario: any[][]) => {
        if( err ){
            return res.json({
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

router.post('/:id', (req: Request, res: Response) => {
    const idUsuario = req.params.id;
    if(!idUsuario){
        return res.json({
            ok: false,
            resp: 'Datos de usuario incompletos'
        });
    }

    const { nombre, paterno, materno, nacimiento, sexo, padecimientos, telefono, alergias, sangre, pass } = req.body;
    if(!nombre || !paterno || !sexo || !telefono || !pass)
        return res.json({
            ok: false,
            resp: 'Datos personales incompletos'
        });

    var fecha = '0000/00/00';
    if(nacimiento){
        var fecha_separada = nacimiento.split('/');
        fecha = fecha_separada[2] + '/' + fecha_separada[1] + '/' + fecha_separada[0];
    }
    
    const QUERY = `CALL updateUsuarioApp(
        ${MySQL.instance.cnn.escape(nombre)},
        ${MySQL.instance.cnn.escape(paterno)},
        ${MySQL.instance.cnn.escape(materno)},
        ${MySQL.instance.cnn.escape(fecha)},
        ${MySQL.instance.cnn.escape(sexo)},
        ${MySQL.instance.cnn.escape(padecimientos)},
        ${MySQL.instance.cnn.escape(telefono)},
        ${MySQL.instance.cnn.escape(alergias)},
        ${MySQL.instance.cnn.escape(sangre)},
        ${MySQL.instance.cnn.escape(pass)},
        ${Number.parseInt(idUsuario)}
        );`

        console.log(QUERY);
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][])=>{
        if(err){
            return res.json({
                ok: false,
                resp: err
            });
        } else {
            var i: Boolean = resp[0][0].res === 1 ? true : false;
            return res.json({
                ok:  i,
                resp: resp[0][0].resp
            });
        }
    });
})


export default router;