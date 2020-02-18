import { Request, Response } from 'express';
import { verify } from 'crypto';
import MySQL from '../../mysql/mysql';
const jwt = require('jsonwebtoken');

// ========================
// VERIFICACION DEL TOKEN 
// ========================
const verificaToken = (req: any, res: Response, next: any) => {
    let token = req.get('token');

    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, (err: any, decoded: any)=> {
        if(err){
            return res.status(401).json({
                ok: false, 
                err
            });
        } 
        // INFORMACIÓN DECODIFICADA DEL USUARIO
        req.usuario = decoded.usuario;
        next();
    });
};




// ========================
// VERIFICAR TOKEN IMAGEN
// Compara el id_usuario_pertenece
// VS el id_usuario
// ========================
const verificaTokenPertenece = (req: any, res: Response, next: any) => {
    let token = req.query.token;
    let id_usuario_pertenece = Number.parseInt(req.query.id_usuario_pertenece);
    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

    // NITDurango (Variable Heroku)

    jwt.verify(token, SEED, (err: any, decoded: any) => {
          if(err){
            return res.status(401).json({
                ok: false, 
                err: {
                    message: 'Token no válido'
                }
            });
        } 
        // INFORMACIÓN DECODIFICADA DEL USUARIO
        let usuario = req.usuario = decoded.usuario;
        if(usuario.id_usuario !== id_usuario_pertenece){
            // console.log('Usuario token');
            // console.log(usuario.id_usuario);
            // console.log('usuario por ruta');
            // console.log(id_usuario_pertenece);

            return res.status(401).json({
                ok: false, 
                err: {
                    message: 'Permiso denegado'
                }
            });
        } else {
            next();
        }
    });
};

function decodificarToken(token: string) {
    var usuario;
    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, (err: any, decoded: any) => {
        if(err){
            // Token no valido 
            usuario = {
                ok: false
            }
        } else {
            // INFORMACIÓN DECODIFICADA DEL USUARIO
            usuario = {
                ok: true, 
                usuario: decoded.usuario
            }
        }
    });
    console.log(usuario);
    return usuario;
}


// ========================
// VERIFICAR ADMIN ROLE 
// 0 = Usuario normal
// 1 = Usuario administrador
// ========================
const verificaAdmin_role = (req: any, res: Response, next: any) => {
    let usuario = req.usuario;
    if(usuario.tipo === 1){
        next();
    } else{
        return res.json({
            ok:false, 
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

module.exports = {
    verificaToken, 
    verificaAdmin_role,
    verificaTokenPertenece, 
    decodificarToken
}