

var admin = require("firebase-admin");

function enviarMsgUsuarioEspecifico(){
    var registrationToken = 'YOUR_REGISTRATION_TOKEN';

    var message = {
      data: {
        score: '850',
        time: '2:45'
      },
      token: registrationToken
    };

    
    /*admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });*/
}