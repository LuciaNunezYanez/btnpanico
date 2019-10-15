import { Router, Request, Response } from 'express';
const { verificaToken } = require('../server/middlewares/autenticacion');
import MySQL from '../mysql/mysql';

const router = Router();

// Obtener todos los comercios
router.get('/' , (req: Request, res: Response) =>{
    try {
        res.render('./index');
    } catch (error) {
        console.log(error);
    }
});

export default router;