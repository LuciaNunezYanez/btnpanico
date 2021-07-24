import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();


router.get('/:id', (req: Request, res: Response) => {
    const id: number = Number.parseInt(req.params.id);
    if(id === null || id === undefined || id <= 0){
        return res.json({
            ok: false, 
            message: 'ID médico inválido'
        });
    }

    const QUERY = `CALL getDatoMedico(${id});`
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
        if(err){
            return res.json({
                ok: false, 
                message: err['sqlMessage']
            });
        } else {
            if(!resp[0][0]){
                return res.json({
                    ok: false, 
                    message: 'El ID médico no existe'
                });
            }
            res.json({
                ok: true, 
                datos_medicos: resp[0][0]
            });
        }
    });


});

router.post('/', (req: Request, res: Response) => {
    const habla = MySQL.instance.cnn.escape(req.body.habla || '2');
    const escucha = MySQL.instance.cnn.escape(req.body.escucha || '2');
    const lee = MySQL.instance.cnn.escape(req.body.lee || '2');
    const escribe = MySQL.instance.cnn.escape(req.body.escribe || '2');
    const habla_LSM = MySQL.instance.cnn.escape(req.body.habla_LSM || '2');

    const toma_medicamentos = MySQL.instance.cnn.escape(req.body.toma_medicamentos || '');
    const peso = MySQL.instance.cnn.escape(req.body.peso || '');
    const estatura = MySQL.instance.cnn.escape(req.body.estatura || '');
    const senas_particulares = MySQL.instance.cnn.escape(req.body.senas_particulares || '');

    const QUERY = `CALL addDatosMedicos(${habla}, ${escucha}, ${lee}, ${escribe}, ${habla_LSM}, ${toma_medicamentos}, ${peso}, ${estatura}, ${senas_particulares});`
    
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
        if(err){
            return res.json({
                ok: false, 
                message: err['sqlMessage']
            });
        } else {
            res.json({
                ok: true, 
                id_dato_medico: resp[0][0]['id'], 
                res: resp[0][0]['res']
            });
        }
    });

})

export default router;