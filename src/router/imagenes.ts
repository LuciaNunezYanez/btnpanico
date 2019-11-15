import { Router, Request, Response } from 'express';
const { verificaToken } = require('../server/middlewares/autenticacion');
const router = Router();
const fs = require('fs');
const path = require('path');


router.get('/:ruta', (req: any, res: any) => {

    let ruta = req.params.ruta;
    
    let pathImg = path.resolve(__dirname, `../../multimedia/imagenes/${ruta}`);
    res.sendFile(pathImg);
})



export default router;