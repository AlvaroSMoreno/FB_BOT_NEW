var login = require('facebook-chat-api');
var fs = require('fs');

var path = __dirname + '/files/fileSystem';
var credentials = fs.readFileSync(__dirname + '/credentials/crd.txt').toString().split('|');
var arch_counter = fs.readdirSync(path);

console.log('email: ' + credentials[0] + '\npass: ' + credentials[1]);

login({email: credentials[0], password: credentials[1]}, function callback (err, api) {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});

    var stopListening = api.listen(function(err, event) {
        if(err) return console.error(err);

        switch(event.type) {
          case "message":
          var input;
          try
          {
          	input = event.body.toString().toLowerCase();
          }
          catch (err)
          {
          	console.log("Hay un archivo adjunto!!");
          	input = 'atts';
          }


          	api.getUserInfo(event.threadID, function (err, ret){
          		if (err) return err;
          		for(var prop in ret)
          		{
          			if (ret.hasOwnProperty(prop) && ret[prop].name.toString().toLowerCase() === 'alvaro salvador m')
          			{
          				isAlvaro = true;
          				isMariana = false;
          				console.log("Hola Alvaro!!!\nID: " + event.threadID);
          			}
          			else if (ret.hasOwnProperty(prop) && ret[prop].name.toString().toLowerCase() === 'mariana vazquez')
          			{
          				isMariana = true;
          				isAlvaro = false;
          				console.log("Hola Mariana!!!\nID: " + event.threadID);
          			}
          			else
          			{
          				isMariana = false;
          				isAlvaro = false;
          				console.log("Hola Desconocido!!!");
          			}
          		}
          	});

          	if (input === 'atts')
            {

            	if (event.attachments[0].type == 'photo')
            	{
            		var img_url = event.attachments[0].previewUrl;
	            	console.log('Entre!!!');
	            	console.log("Attachment: " + img_url);
	            }
	            else if (event.attachments[0].type == 'file' && (event.attachments[0].name.toString().includes('.txt') || event.attachments[0].name.toString().includes('.docx') || event.attachments[0].name.toString().includes('.pdf') ) )
	            {
                if (arch_counter < 20)
                {
                  console.log("Archivo de texto!!\nGuardado por redundancia los primeros 20 archivos!!!");
                  arch_counter++;
                }
	            	else
                {
	            	    console.log("Archivo de texto!!!");
                    var file_list = fs.readdirSync(path);

                    for (var i in file_list)
                    {
                      fs.unlinkSync(path + '/' + file_list[i]);
                    }

                    console.log('Archivos borrados!!!');
                    arch_counter = 0;
	            	}
	            }
	            else
	            {
	            	console.log("Tipo de archivo: " + JSON.stringify(event.attachments[0]));
	            }

            }
            else
            {
            	api.sendMessage('Ingresar comando valido!', event.threadID);
            }

            api.markAsRead(event.threadID, function(err) {
              if(err) console.log(err);
            });
            isAlvaro = false;
            isMariana = false;
            break;
          case "event":
            console.log(event);
            break;
        }
      })
    });
