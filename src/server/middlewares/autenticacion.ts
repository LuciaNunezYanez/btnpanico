import { Request, Response } from 'express';
const jwt = require('jsonwebtoken');

// ========================
// VERIFICACION DEL TOKEN 
// ========================
const verificaToken = (req: Request, res: Response, next: any) => {
    
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

module.exports = {
    verificaToken
}