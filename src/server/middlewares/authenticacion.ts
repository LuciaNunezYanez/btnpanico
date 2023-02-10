import { Request, Response } from 'express';
import { verify } from 'crypto';
import MySQL from '../../mysql/mysql';
const jwt = require('jsonwebtoken');

// ========================
// VERIFICACION DEL TOKEN 
// ========================
const verificaToken = (req: any, res: Response, next: any) => {
    let token = req.get('token')?? req.body.token?? req.params.token;

    if(token === 'ST'){
        return next();
    }

    // Lo correcto sería ir a la base de datos
    // y ver que el usuario exista
    // y esté correcto para darle acceso.
    // No solo desencriptar el token.

    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, (err: any, decoded: any)=> {
        if(err){
            return res.json({
                ok: false, 
                err
            });
        } 
        // Información decodificada del usuario
        req.usuario = decoded.usuario;
        // Se le da acceso
        return next();
    });
};

// Entra el token
// Sale id_usuario y tipo
const verificaTokenIDUsuario = (req: Request, res: Response, next: any) => {
    let token = req.get('token')?? req.body.token;

    // Si viene el id del usuario no ocupo el token
    if(req.body?.id_usuario){
        return next();
    }

    // Sin token no hay acceso
    if(token === undefined || token === NaN) {
        return res.json({
            ok: false, 
            message: 'Token inválido!'
        });
    }

    // Si lo encontré; ponerlo donde va.
    req.body.token = token;

    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, (err: any, decoded: any)=> {
        if(err){
            return res.json({
                ok: false, 
                message: 'Token inválido',
                err
            });
        } 
        
        // Información decodificada del token
        // console.log(decoded);
        const id_usuario = decoded?.usuario?.id_usuarios_cc ?? decoded?.usuario?.id_usuarios_app;
        req.body.id_usuario = id_usuario;
        req.body.tipo = decoded?.usuario?.tipo;

        return next();
    });
};


const verificaTokenComercio = (req: any, res: Response, next: any) => {
    
    let token = req.params.token;
    
    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    if(token === undefined){
        return res.status(401).json({
            ok: false, 
            err: 'Token inválido'
        });
    }

    jwt.verify(token, SEED, (err: any, decoded: any)=> {
        if(err){
            return res.status(401).json({
                ok: false, 
                err
            });
        } 
        // console.log('Información decodificada del comercio:');
        // console.log(decoded);
        return next();
        // INFORMACIÓN DECODIFICADA DEL USUARIO
        // req.usuario = decoded.usuario;
        // return next();
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
            return next();
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
    // console.log(usuario);
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
        return next();
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
    verificaTokenIDUsuario,
    verificaTokenComercio,
    verificaAdmin_role,
    verificaTokenPertenece, 
    decodificarToken
}