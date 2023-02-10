import { Router, Request, Response } from "express";
import MySQL from "../../mysql/mysql";
const router = Router();

router.get('/all', (req: Request, res: Response) => {
    const query = `CALL getCorporaciones();`;

    MySQL.ejecutarQueryPr(query).then( (respuesta: any)=>{
        return res.json({
            ok: true, 
            corporaciones: respuesta[0]
        });
    }
    ).catch( (err)=> {
        return res.status(404).json({
            ok:false, 
            error: err
        });
    });

})


export default router;