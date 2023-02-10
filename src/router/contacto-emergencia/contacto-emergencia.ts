import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();

router.get('/:id', (req: Request, res: Response) => {
    const id_usuario: number = Number.parseInt(req.params.id);


    if (id_usuario === undefined || id_usuario === 0) {
        return res.json({
            ok: false,
            message: 'ID inválido'
        });
    }

    const QUERY = `CALL getContactEmergAPP(${id_usuario});`

    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        } else {
            return res.json({
                ok: true,
                contactos: resp[0]
            });
        }
    });

})

router.post('/:id', (req: Request, res: Response) => {
    const id_usuario = MySQL.instance.cnn.escape(req.params.id);
    const contactos = req.body;

    for (let index = 0; index < contactos.length; index++) {
        const nombre = MySQL.instance.cnn.escape(contactos[index].nombre_contacto_emerg);
        const telefono = MySQL.instance.cnn.escape(contactos[index].telefono_contacto_emerg);
        const parentezco = MySQL.instance.cnn.escape(contactos[index].parentezco_contacto_emerg || '');

        const QUERY = `CALL addContactoEmergencia(${nombre}, ${telefono}, ${parentezco}, ${id_usuario});`

        MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: err['sqlMessage']
                });
            }
        });
    }
    return res.json({
        ok: true
    });

})

export default router;