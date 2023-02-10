import mysql = require('mysql');

export default class MySQL {
    // Evita tener varias conexiones abiertas
    private static _instance: MySQL;
    // cnn: mysql.Connection;
    cnn: mysql.Pool;
    conectado: boolean = false;
        
    constructor(){
        console.log('Clase inicializada de MYSQL');
        // Configuración de la conexion de la DB LOCAL 
        // this.cnn = mysql.createConnection({
        //     host: 'localhost',
        //     user: process.env.USERDB || 'usuario_final',
        //     password: process.env.PASSWORDB || 'usuario_final',
        //     database: process.env.NAMEDATABASE || 'db_btn_panico_lmp_prueba'
        // });

        // Configuración de la conexion de la DB SERVIDOR 
        // this.cnn = mysql.createConnection({
        //     host: '10.11.118.91',
        //     user: process.env.USERDB || 'root',
        //     password: process.env.PASSWORDB || 'M7750la?',
        //     database: process.env.NAMEDATABASE || 'db_btn_panico_prb'
        // }); 
        this.cnn = mysql.createPool({
            connectionLimit: 100,
            host: '10.11.118.91',
            user: process.env.USERDB || 'root',
            password: process.env.PASSWORDB || 'M7750la?',
            database: process.env.NAMEDATABASE || 'db_btn_panico_fnl',
            debug: false,
            waitForConnections: true
        });

        this.hasError();

        
        // IP opción 2 
        // host: '10.11.127.70',
        
        /*var pool = mysql.createPool({
            
            host: '10.11.118.91',
            user: process.env.USERDB || 'root',
            password: process.env.PASSWORDB || 'M7750la?',
            database: process.env.NAMEDATABASE || 'db_btn_panico'
        });
        */
        // Configuración de la conexion de la DB REMOTA EN HEROKU
        // this.cnn = mysql.createConnection({
        //     host: 'us-cdbr-iron-east-05.cleardb.net',
        //     user: 'b2426e4e5d830f',
        //     password: '60ccf3c4',
        //     database: 'heroku_063696d7f49647b'
        // });

        // this.conectarDB();
        
        // Prueba 02/03/2020
        // En caso de que ocurra un error, volver a realizar la conexión
        // this.cnn.on('error', this.conectarDB);
    }

    // Evita que se creen varias instancias de la clase 
    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    static ejecutarQueryPr(query: string){
        return new Promise( (resolve, reject) => {
            this.instance.cnn.query( query, (err: any , results: Object[], fields: any ) => {
                if(err){
                    console.log('======== Error al ejecutar query (promesa) ========');
                    // console.log(query);
                    // console.log(err);
                    // console.log('=========================================');
                    return reject(err)
                }
                if(results?.length === 0 ){
                    resolve('El registro solicitado no existe');
                } else {
                    resolve(results);
                }
            });

        });
    }

    static ejecutarQuery(query: string, callback: Function) {
        
        this.instance.cnn.query(query, (err: any , results: Object[], fields: any ) => {
            if(err){
                console.log('======== Error en Query ========');
                console.log(query);
                console.log(err);
                console.log('================================');
                return callback( err );
            }
            if(results.length === 0 ){
                callback(null, 'El registro solicitado no existe');
            } else {
                callback(null, results);
            }
        });
    }

    private hasError(){
        this.cnn.on('error', (error: mysql.MysqlError)=>{
            console.log('OCURRIO UN ERROR');
            console.log(error.message);
            console.log('.............');
            console.log(error);
        });

        this.cnn.on('connection', (con:any)=>{
            console.log('MySQL conectado... ');
        });
    }

    // private conectarDB() {
    //     this.cnn.connect((err: mysql.MysqlError) => {
    //         if(err) {
    //             console.log('Ocurrio un error:', err.message);
    //             // setTimeout(this.conectarDB); Quitado el 22/09
    //             return;
    //         }
    //         this.conectado = true;
    //         console.log('Base de datos conectada con éxito');
    //     });
    // }
}