import { Router, Request, Response, request } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();


router.post('/', (req: Request, res: Response) => {
    var body: any = req.body;


    // DIRECCION 
	const calle: string = MySQL.instance.cnn.escape(body.calle);
    const numero: string = MySQL.instance.cnn.escape(body.numero || '');
    const numeroInt: string = MySQL.instance.cnn.escape(body.numero_int || '');
    const colonia: string = MySQL.instance.cnn.escape(body.colonia || '');
    const cp: number = body.cp || 0;
    const entre_calle_1: string = MySQL.instance.cnn.escape(body.entre_calle_1 || '');
    const entre_calle_2: string = MySQL.instance.cnn.escape(body.entre_calle_2 || '');
    const fachada: string = MySQL.instance.cnn.escape(body.fachada || '');
    const id_localidad: number = body.id_localidad; //
    const lat_dir: number = body.lat_dir || 0; // 
    const lgn_dir: number = body.lgn_dir || 0; // 


    // USUARIO APP 
    const nombres_usuarios_app: string = MySQL.instance.cnn.escape(body.nombres_usuarios_app); 
	const apell_pat: string = MySQL.instance.cnn.escape(body.apell_pat); 
    const apell_mat: string = MySQL.instance.cnn.escape(body.apell_mat); 
    const fecha_nacimiento_sucia: string = body.fecha_nacimiento || '0000/00/00';
	const sexo_app: string = MySQL.instance.cnn.escape(body.sexo_app); // 
	const padecimientos: string = MySQL.instance.cnn.escape(body.padecimientos || ''); 
	const tel_movil: string = MySQL.instance.cnn.escape(body.tel_movil); 
	const alergias: string = MySQL.instance.cnn.escape(body.alergias || ''); 
	const tipo_sangre: string = MySQL.instance.cnn.escape(body.tipo_sangre || ''); 
    const estatus_usuario: boolean = body.estatus_usuario || 1; // 1 POR DEFAULT COMO ACTIVO 
    const correo_usuario: string = MySQL.instance.cnn.escape(body.correo_usuario);
    const id_grupo: number = Number.parseInt(body.id_grupo) || 1; // 1 = Comercio 2 = Alerta de genero 3 = APADAC 
    const id_comercio: number = body.id_comercio || 1; // 1 = Comercio alerta de genero preregistrado | 2 = APADAC
    const contrasena: string = MySQL.instance.cnn.escape(body.contrasena);

    const id_asociacion: number = Number.parseInt(body.id_asociacion) || 0;
    const id_datos_medicos: number = Number.parseInt(body.id_datos_medicos) || 1;
    const id_foto_perfil: number = Number.parseInt(body.id_foto_perfil) || 0;

    //console.log('Body id grupo: ', body.id_grupo + ' Y ' + id_grupo);

    // SEPARAR LA FECHA DE NACIMIENTO DEL USUARIO (YYYY/mm/dd)
    var fecha_nacimiento_lista = '1900/01/01';
    if(fecha_nacimiento_sucia && ((fecha_nacimiento_sucia.substring(2, 3) === '-') || (fecha_nacimiento_sucia.substring(2, 3) === '/'))){
        var fecha_separada = fecha_nacimiento_sucia.split('/');
        fecha_nacimiento_lista = fecha_separada[2] + '/' + fecha_separada[1] + '/' + fecha_separada[0];
        fecha_nacimiento_lista = MySQL.instance.cnn.escape(fecha_nacimiento_lista);
    } else {
        fecha_nacimiento_lista = MySQL.instance.cnn.escape(fecha_nacimiento_lista);
    }

    const QUERY = `CALL addUsuarioAppIndependiente(
        ${calle},
        ${numero},
        ${numeroInt},
        ${colonia},
        ${cp},
        ${entre_calle_1},
        ${entre_calle_2},
        ${fachada},
        ${id_localidad},
        ${lat_dir},
        ${lgn_dir},
        

        ${nombres_usuarios_app},
        ${apell_pat},
        ${apell_mat},
        ${fecha_nacimiento_lista},
        ${sexo_app},
        ${padecimientos},
        ${tel_movil},
        ${alergias},
        ${tipo_sangre},
        ${estatus_usuario},
        ${correo_usuario},
        ${id_grupo},
        ${contrasena},

        ${id_asociacion},
        ${id_datos_medicos},
        ${id_foto_perfil},

        ${id_comercio}
        );`;
   

    MySQL.ejecutarQuery( QUERY, (err: any, result: any[][]) => {
        if(err) {
            return res.json({
                ok: false,
                error: err
            });
        } else {
            const js = {
                ok: !(result[0][0].resultado === 0 ), 
                resultado: result[0][0], 
                error: result[0][0].mensage
            }
            return res.json(js);
        }
    });

});






export default router;