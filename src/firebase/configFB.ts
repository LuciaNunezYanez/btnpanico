

var admin = require("firebase-admin");

export default class FB {

  static enviarNotifEspecificaFB(titulo: string, descripcion: string, token: string, data: Object): Promise<Object>{
      return new Promise((resolve, reject)=> {
        try {
          var payload = {
            notification: {
                title: titulo,
                body: descripcion,
                // image: 'https://www.puntoporpunto.com/web/wp-content/uploads/2021/02/LSM.jpg'
            }, 
            data: data
          }
        
          var options = {
              priority: 'high',
              timeToLive: 60 * 60 * 24,
          };

          admin.messaging().sendToDevice(token, payload, options)
          .then( (resp: any) => {
            resolve({
              ok: true, 
              mensaje: 'Notificación enviada con éxito.', 
              resp, 
              data
            });        
          })
          .catch((err: any) => {
            reject({
              ok: false, 
              mensaje: 'Ocurrió un error al enviar la notificación.', 
              err, 
              data
            });
    
          });
      } catch(error){
        reject({
          ok: false, 
          mensaje: 'Ocurrió un error al enviar la notificación..', 
          err: error,
          data
        });
      }
      });
  }
}