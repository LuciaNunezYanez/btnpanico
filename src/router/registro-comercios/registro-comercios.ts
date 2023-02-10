import { Router, Request, Response, request } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();


router.post('/', (req: Request, res: Response) => {

    var body: any = req.body;

    // console.log('REGISTRAR COMERCIO COMPLETO <------------');
    // console.log(body);
    // return;


    // DIRECCION 
	const calle: string = MySQL.instance.cnn.escape(body.calle);
    const numero: string = MySQL.instance.cnn.escape(body.numero);
    const colonia: string = MySQL.instance.cnn.escape(body.colonia);
    const cp: number = body.cp;
    const entre_calle_1: string = MySQL.instance.cnn.escape(body.entre_calle_1 || '');
    const entre_calle_2: string = MySQL.instance.cnn.escape(body.entre_calle_2 || '');
    const fachada: string = MySQL.instance.cnn.escape(body.fachada);
    const id_localidad: number = body.id_localidad; //
    const lat_dir: number = body.lat_dir; // 
    const lgn_dir: number = body.lgn_dir; // 

    // SI FALTAN DATOS DEL COMERCIO RETORNAR QUE FALTAN

    // COMERCIO 
    const num_empleados: number = body.num_empleados || 0;
    const nombre_comercio: string = MySQL.instance.cnn.escape(body.nombre_comercio);
    const giro: string = MySQL.instance.cnn.escape(body.giro);
    const telefono_fijo: string = MySQL.instance.cnn.escape(body.telefono_fijo || '');
    const folio_comercio: number = body.folio_comercio;
    const razon_social: string = MySQL.instance.cnn.escape(body.razon_social);
    const id_grupo: number = body.id_grupo || 1;

    // USUARIO APP 
    const nombres_usuarios_app: string = MySQL.instance.cnn.escape(body.nombres_usuarios_app); 
	const apell_pat: string = MySQL.instance.cnn.escape(body.apell_pat); 
    const apell_mat: string = MySQL.instance.cnn.escape(body.apell_mat); 
    const fecha_nacimiento =  MySQL.instance.cnn.escape(body.fecha_nacimiento);
	const sexo_app: string = MySQL.instance.cnn.escape(body.sexo_app); // 
	const padecimientos: string = MySQL.instance.cnn.escape(body.padecimientos || ''); 
	const tel_movil: string = MySQL.instance.cnn.escape(body.tel_movil); 
	const alergias: string = MySQL.instance.cnn.escape(body.alergias || ''); 
	const tipo_sangre: string = MySQL.instance.cnn.escape(body.tipo_sangre || ''); 
    const estatus_usuario: boolean = body.estatus_usuario || 1; // 1 POR DEFAULT COMO ACTIVO 


    // DATOS DEL USUARIO DEL NIT 
    const id_usuario_nit: number = body.id_usuario_nit;
    const fecha_creacion: string = body.fecha_creacion;


    // SEPARAR LA FECHA DE CREACION (0000/00/00)
    const fecha_creacion_separada = fecha_creacion.split('/');
    var fecha_creacion_lista = fecha_creacion_separada[2] + '/' + fecha_creacion_separada[1] + '/' + fecha_creacion_separada[0];
    fecha_creacion_lista = MySQL.instance.cnn.escape(fecha_creacion_lista);

    // SEPARAR LA FECHA DE NACIMIENTO DEL USUARIO (0000/00/00)
    // const fecha_separada = fecha_nacimiento_sucia.split('/');
    // var fecha_nacimiento_lista = fecha_separada[2] + '/' + fecha_separada[1] + '/' + fecha_separada[0];
    // fecha_nacimiento_lista = MySQL.instance.cnn.escape(fecha_nacimiento_lista);

    const QUERY = `CALL addComercioCompleto(
        ${calle},
        ${numero},
        ${colonia},
        ${cp},
        ${entre_calle_1},
        ${entre_calle_2},
        ${fachada},
        ${id_localidad},
        ${lat_dir},
        ${lgn_dir},
        
        ${num_empleados},
        ${nombre_comercio},
        ${giro},
        ${telefono_fijo},
        ${folio_comercio},
        ${razon_social},
        ${id_grupo},

        ${nombres_usuarios_app},
        ${apell_pat},
        ${apell_mat},
        ${fecha_nacimiento},
        ${sexo_app},
        ${padecimientos},
        ${tel_movil},
        ${alergias},
        ${tipo_sangre},
        ${estatus_usuario},

        ${folio_comercio}, 
        ${fecha_creacion_lista},    
        0, 
        ${id_usuario_nit},

        @id_direccion,
        @id_comercio,
        @id_usuarios_app,
        @id_cod_activ);`;
        
    MySQL.ejecutarQuery( QUERY, (err: any, result: any[]) => {
        if(err) {
            return res.json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true, 
                id_direccion: result[0][0].id_direccion,
                id_comercio: result[1][0].id_comercio,
                id_usuarios_app: result[2][0].id_usuarios_app,
                id_cod_activ: result[3][0].id_cod_activ
                // data: result
            });
        }
    });

});






export default router;