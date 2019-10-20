import mysql = require('mysql');

export default class MySQL {
    // Evita tener varias conexiones abiertas
    private static _instance: MySQL;
    cnn: mysql.Connection;
    conectado: boolean = false;
        
    constructor(){
        console.log('Clase inicializada de MYSQL');
        // Configuración de la conexion de la DB LOCAL 
        // this.cnn = mysql.createConnection({
        //     host: 'localhost',
        //     user: 'root',
        //     password: 'M7750la?',
        //     database: 'db_btn_panico'
        // });
        
        // Configuración de la conexion de la DB REMOTA 
        this.cnn = mysql.createConnection({
            host: 'us-cdbr-iron-east-05.cleardb.net',
            user: 'b2426e4e5d830f',
            password: '60ccf3c4',
            database: 'heroku_063696d7f49647b'
        });

        this.conectarDB();
    }

    // Evita que se creen varias instancias de la clase 
    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    static ejecutarQuery(query: string, callback: Function) {
        this.instance.cnn.query(query, (err, results: Object[], fields ) => {
            if(err){
                console.log('==== Error en Query');
                return callback( err );
            }
            if(results.length === 0 ){
                callback('El registro solicitado no existe');
            } else {
                callback(null, results);
            }
        });   
    }


    private conectarDB() {
        this.cnn.connect((err: mysql.MysqlError) => {
            if(err) {
                console.log(err.message);
                return;
            }
            this.conectado = true;
            console.log('Base de datos conectada con éxito');
        });
    }
}