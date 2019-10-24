import Server from './server/server';
import comercios from './router/comercio';
import reporte from './router/reporte';
import multimedia from './router/multimedia';
import notas from './router/nota';
import usuariosNit from './router/usuarios-nit';
import alertas from './router/alertas';
import login from './router/login';

import bodyParser from 'body-parser';
import cors from 'cors';

const server = Server.instance;

// BodyParser
server.app.use(bodyParser.urlencoded({ extended: true}));
server.app.use(bodyParser.json());

// CORS - Para permitir que se puedan llamar los servicios     
// server.app.use(cors ({origin: true, credentials: true})); // Se cambia por la siguiente configuración
server.app.use(cors ({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
server.app.use((err: any, req: any, res: any, next: any) => {
    if(err) {
      return res.status(500).send('Ocurrio un error de acceso');
    }
    // res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
  });

// Rutas de servicios 
server.app.use('/comercio', comercios);
server.app.use('/reporte', reporte);
server.app.use('/multimedia', multimedia);
server.app.use('/nota', notas);
server.app.use('/alerta', alertas);
server.app.use('/usuarionit', usuariosNit);
server.app.use('/login', login);


// MySQL get instance 
// MySQL.instance;

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
});

