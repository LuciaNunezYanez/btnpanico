import { Router, Request, Response } from 'express';
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