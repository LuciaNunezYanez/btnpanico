import { Router, Request, Response } from 'express';
const { verificaTokenPertenece } = require('../server/middlewares/autenticacion');
const router = Router();
const fs = require('fs');
const path = require('path');


router.get('/:ruta', verificaTokenPertenece, (req: any, res: any) => {

    let ruta = req.params.ruta;
    
    let pathImg = path.resolve(__dirname, `../../multimedia/imagenes/${ruta}`);
    
    if(fs.existsSync(pathImg)){
        res.sendFile(pathImg);
    } else {
        let pathImgNoResults = path.resolve(__dirname, '../../multimedia/no_results_found.png');
        res.sendFile(pathImgNoResults);
    } 
});



export default router;