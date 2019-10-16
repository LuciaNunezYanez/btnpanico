import { Request, Response } from 'express';
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
    verificaAdmin_role
}