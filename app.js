var login = require("facebook-chat-api");
var fs = require("fs");
var translate = require("google-translate-api");
var request = require("request");
var cheerio = require("cheerio");
var cmd = require("child_process").exec;
//var qr = require('qrnode');
var image_downloader = require('image-downloader');

var homeAutomation = require('./home-automation');
var evt = new homeAutomation();

var alvaro_id = 100001763093306;
var mariana_id = 100000882938903;

var water = 0;

var alarm_hour_mariana = 9;

var wake_flag = true;

var wtr = [7, 9, 11, 13, 15, 17, 19, 22];

var running = false;

var isAlvaro = false;
var isMariana = false;

var credentials = fs.readFileSync(__dirname + '/credentials/info.txt').toString().split(';');

console.log("Usuario: " + credentials[0]);
console.log("Pass: " + /*credentials[1]*/ "*************");
console.log("______________________________________________");

var commands = ['1)hola/hey', '2)temperatura', '3)traducir:lang:texto', '4)recordatorio-texto-hh:mm-#dia-mes', '5)camara' , '6)comandos', '7)Horario/Horario:dia' ,' 8/autodestruccion'];


var reminders = fs.readFileSync(__dirname+"/files/reminders.txt").toString().split(";");

for(var x in reminders)
{
	if (x == reminders.length-1) continue;
	reminders[x] = JSON.parse(reminders[x]);
}

reminders.splice(reminders.length-1, 1);


var langs = {
	'español': 'es',
	'ingles' : 'en',
	'frances': 'fr',
	'aleman' : 'de'
};

var food_dictionary = [];

var greeting = ['Hola ', 'Que onda, ', 'Hey ', 'Bienvenido ', 'Hola de nuevo, ', 'Te estaba esperando '];

var path_command_photo = 'C:\\\\Users\\\\\"Alvaro Moreno\"\\\\Desktop\\\\FB_BOT_NEW\\\\node_modules\\\\node-webcam\\\\src\\\\bindings\\\\CommandCam\\\\Commandcam.exe /filename C:\\\\Users\\\\\"Alvaro Moreno\"\\\\Desktop\\\\FB_BOT_NEW\\\\images\\\\pic1.jpg';


login({email: credentials[0], password: credentials[1]}, function callback (err, api) {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});

    evt.on('location_evt', function (data){
    	if (data)
    	{
    		api.sendMessage('Bienvenido a casa, Alvaro!', alvaro_id);
    	}
    	else
    	{
    		api.sendMessage('Regresa pronto, Alvaro!', alvaro_id);
    	}
    });

    evt.start();

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
	            	var options = {
					    url: img_url,
					    dest: __dirname+"/images/imagesFB/img1.jpg",
					    done: function(err, filename, image) {
					        if (err) {
					            throw err;
					        }
					        console.log('File saved to', filename);
					    },
					};
					image_downloader(options);


	            }
	            else if (event.attachments[0].type == 'file' && (event.attachments[0].name.toString().includes('.mp4') || event.attachments[0].name.toString().includes('audioclip')) )
	            {
	            	console.log("Audio!");
	            }
	            else if (event.attachments[0].type == 'file' && (event.attachments[0].name.toString().includes('.txt') || event.attachments[0].name.toString().includes('.docx') || event.attachments[0].name.toString().includes('.pdf') ) )
	            {
	            	console.log("Archivo de texto!!");
	            }
	            else
	            {
	            	console.log("Tipo de archivo: " + JSON.stringify(event.attachments[0]));
	            }

            }
            else if(input === '/autodestruccion') {
              console.log('ID: ' + event.threadID);
              if (isAlvaro)
              {
              	api.sendMessage("Protocolo de autodestruccion activado!", event.threadID);
              	return stopListening();
              }
              api.sendMessage("No tiene acceso a este comando!", event.threadID);
            }
						else if (input.includes('añadir alimento'))
						{
							var food = input.split(':');
							var calories = food[1];
							food = food[0];
							var obj = {food: food, calories: calories};
							food_dictionary.push(obj);
						}
            else if (input === 'camara')
            {
            	var str = "";
            	api.getUserInfo(event.threadID, function (err, res) {
            		if(err)
            		{
            			console.log("Error obteniendo perfil!");
            		}
            		else
            		{
	            		for (var i in res)
	            		{
	            			if(res.hasOwnProperty(i)) str = res[i].name.toString().toLowerCase();
	            		}

	            		console.log("Nombre: " + str);
		            	if ((str == "alvaro salvador m" && event.threadID == alvaro_id) || (str == "mariana vazquez" && event.threadID == mariana_id))
		            	{
		            		cmd(path_command_photo, function (err, stdout, stderr) {
		            			if (err)
		            			{
		            				console.log("Error en cmd: " + err);
		            			}
		            			else
		            			{
		            				var msg = {
								      body: "Imagen: ",
								      attachment: fs.createReadStream(__dirname + '/images/pic1.jpg')
								    }

								    api.sendMessage(msg, event.threadID);
		            			}
		            		});
		            	}
		            	else
		            	{
		            		api.sendMessage("No tiene acceso a este comando!", event.threadID);
		            	}
		            }
		        });

            }
            else if (input === 'temperatura')
            {
            	var url = "https://www.wunderground.com/mx/mexicali/zmw:00000.1.76005";

		        request(url, function (err,response,html) {
		            if (err)
		            {
		              console.log("Hay un error leyendo temperatura del sitio!!!");
		              throw err;
		            }

		            var $ = cheerio.load(html);
		            var temperature = $("[data-variable='temperature'] .wx-value").html();
		            var text = "Estamos a " + temperature + " grados Celsius.";
		            console.log(text);
		            api.sendMessage(text, event.threadID);
		        });
            }
            else if (input === 'hey' || input === 'hola')
            {
            	api.getUserInfo(event.threadID, function (err, res) {
            		if (err) console.log(err);

            		var name = "";

            		for (var i in res)
            		{
            			if(res.hasOwnProperty(i)) name = res[i].name.toString();
            		}

            		var text = greeting[Math.floor(Math.random() * greeting.length)] + name;
            		api.sendMessage(text, event.threadID);
            	});
            }
            else if (input.includes('traducir'))
            {
            	//traducir:idioma:texto
            	var pattern = "^traducir:\\s?[a-záéíóú]{4,10}:\\s?[a-z0-9áéíóú ]{1,50}$";

            	if(input.match(pattern))
            	{
            		var text = input.split(':');
	            	var lang = text[1].toString().trim();
	            	var text = text[2];

	            	lang = lang.replace('á', 'a');
					lang = lang.replace('é', 'e');
					lang = lang.replace('í', 'i');
					lang = lang.replace('ó', 'o');
					lang = lang.replace('ú', 'u');

	            	var language = langs[lang] || 'en';

	            	translate(text, {from: 'auto', to: language}).then(res => {
			          console.log("Entrando a api google translator!");
			          console.log("Texto traducido: " + res.text);
			          text = "Texto traducido al " + lang + " : " + res.text;
			          api.sendMessage(text, event.threadID);
			        }).catch(err => {
			          console.error(err);
			        });
            	}
            	else
            	{
            		console.log("Comando mal escrito!!!");
            		api.sendMessage("Comando mal escrito!", event.threadID);
            	}
            }
            else if (input.includes('recordatorio'))
            {
            	// recordatorio-titulo-hh:mm-dia-mes
            	var pattern = "^recordatorio-\\s?[a-z0-9áéíóú ]{1,32}-\\s?[0-2][0-9]:[0-5][0-9]-\\s?[0-3][0-9]-\\s?[a-z]{4,10}$";

            	if(input.match(pattern))
            	{
            		var text = input.split('-');
	            	var reminder = new Object();
	            	reminder.title = text[1].toString().trim();
	            	reminder.hour = text[2].split(':')[0].toString().trim();
	            	reminder.minute = text[2].split(':')[1];
	            	reminder.ID = event.threadID;
	            	reminder.day = text[3].toString().trim();
	            	reminder.month = text[4].toString().trim();
	            	reminders.push(reminder);
	            	api.sendMessage('Recordatorio agendado!', event.threadID);

	            	var str = "";

	            	fs.writeFile(__dirname+"/files/reminders.txt", str, function (err) {
	            		if (err)
	            		{
	            			console.log("Error al escrbir texto en archivo!!!\n" + err);
	            		}
	            		else
	            		{
	            			console.log("Escritura de reminders en archivo exitosa!");
	            		}
	            	});

	            	for(var x in reminders)
	            	{
	            		str += JSON.stringify(reminders[x]) + ";";
	            	}

	            	fs.writeFile(__dirname+"/files/reminders.txt", str, function (err) {
	            		if (err)
	            		{
	            			console.log("Error al escrbir texto en archivo!!!\n" + err);
	            		}
	            		else
	            		{
	            			console.log("Escritura de reminders en archivo exitosa!");
	            		}
	            	});
            	}
            	else
            	{
            		console.log("Comando mal escrito!!!");
            		api.sendMessage("Comando mal escrito!", event.threadID);
            	}
            }
            else if (input === 'comandos')
            {
            	var text = "";
            	for (var x in commands)
            	{
            		text += commands[x] + "\n";
            	}

            	api.sendMessage(text, event.threadID);
            }
            else if (input.includes('horario'))
            {
            	var pattern1 = "^horario:\\s?[a-záé]{5,9}$";
            	var dias = ['lunes', 'martes', 'miercoles', 'jueves', 'jueves', 'viernes'];
               	//horario || horario:dia
            	if (input.match(pattern1))
            	{
            		var validate = false;
            		var dia = input.split(':')[1];
					dia = dia.replace('é', 'e').trim();
            		for(var x in dias)
            		{
            			if(dia == dias[x])
            			{
            				validate = true;
            				break;
            			}
            		}

            		if(validate)
            		{
            			var str = "";
            			var path = __dirname + "/files/horarios";

		            	api.getUserInfo(event.threadID, function (err, res) {
		            		if(err)
		            		{
		            			console.log("Error obteniendo perfil!");
		            		}
		            		else
		            		{
			            		for (var i in res)
			            		{
			            			if(res.hasOwnProperty(i)) str = res[i].name.toString().toLowerCase();
			            		}

			            		console.log("Nombre: " + str);

				            	if (str == "alvaro salvador m")
				            	{
				            		path += "/alvaro/" + dia.trim() + ".txt";

				            	}
				            	else if (str == "mariana vazquez")
				            	{
				            		path += "/mariana/" + dia.trim() + ".txt";
				            	}
				            	else
				            	{
				            		api.sendMessage("No tienes acceso a este comando!", event.threadID);
				            	}

				            	var texto_horario = fs.readFileSync(path).toString().split(";");

				            	var t = "\n\n";

				            	for(var i in texto_horario)
				            	{
				            		var temp = texto_horario[i].split("-");
				            		t += temp[0] + "\nEmpieza: " + temp[1] + ":00" + "\nTermina: " + temp[2] + ":00" + "\n";
				            		if(i != texto_horario.length-1) t += "________________________\n";
				            	}

				            	api.sendMessage("Horario de: " + dia + t, event.threadID);
				            }
				        });
            		}
            		else
            		{
            			api.sendMessage("El dia mencionado no esta especificado en el horario!", event.threadID);
            		}
            	}
            	else if (input === "horario")
            	{
            		var str = "";
        			var path = __dirname + "/files/horarios";
        			var date = new Date();
        			var hora = date.getHours();

	            	api.getUserInfo(event.threadID, function (err, res) {

	            		if(err)
	            		{
	            			console.log("Error obteniendo perfil!");
	            		}
	            		else
	            		{
		            		for (var i in res)
		            		{
		            			if(res.hasOwnProperty(i)) str = res[i].name.toString().toLowerCase();
		            		}

		            		console.log("Nombre: " + str);

			            	if (str == "alvaro salvador m")
			            	{
			            		if(date.getDay() > 0 && date.getDay() < 6)
			            		{
			            			path += "/alvaro/"+dias[date.getDay()-1] + ".txt";
			            			var hr = fs.readFileSync(path).toString().split(";");
			            			var temp = "";

			            			for(var x in hr)
			            			{
			            				//materia-inicio-fin
			            				var t1 = hr[x].split("-");
			            				if(hora < t1[1])
			            				{
			            					temp += t1[0] + "\nEmpieza: " + t1[1] + ":00" + "\nTermina: " + t1[2] + ":00" + "\n\n";
			            				}
			            			}

			            			if(temp.length > 1)
			            			{
			            				api.sendMessage(temp, event.threadID);
			            			}
			            			else
			            			{
			            				api.sendMessage("Ya no te quedan clases por hoy!", event.threadID);
			            			}
			            		}
			            		else
			            		{
			            			api.sendMessage("Hoy no hay clases!", event.threadID);
			            		}
			            	}
			            	else if (str == "mariana vazquez")
			            	{
			            		if(date.getDay() > 0 && date.getDay() < 6)
			            		{
			            			path += "/mariana/"+dias[date.getDay()-1] + ".txt";
			            			var hr = fs.readFileSync(path).toString().split(";");
			            			var temp = "";

			            			for(var x in hr)
			            			{
			            				//materia-inicio-fin
			            				var t1 = hr[x].split("-");
			            				if(hora < t1[1])
			            				{
			            					temp += t1[0] + "\nEmpieza: " + t1[1] + ":00" + "\nTermina: " + t1[2] + ":00" + "\n\n";
			            				}
			            			}

			            			if(temp.length > 1)
			            			{
			            				api.sendMessage(temp, event.threadID);
			            			}
			            			else
			            			{
			            				api.sendMessage("Ya no te quedan clases por hoy!", event.threadID);
			            			}
			            		}
			            		else
			            		{
			            			api.sendMessage("Hoy no hay clases!", event.threadID);
			            		}
			            	}
			            	else
			            	{
			            		api.sendMessage("No tienes acceso a este comando!", event.threadID);
			            	}
			            }
			        });
            	}
            	else
            	{
            		api.sendMessage("Comando mal escrito!", event.threadID);
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
    });


	function loop()
	{
		var d = new Date();
		var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
		var days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

		for (var x in reminders)
		{
			if(reminders[x].day == d.getDate() && reminders[x].month == months[d.getMonth()])
			{
				if (reminders[x].hour == d.getHours() && reminders[x].minute == d.getMinutes())
				{
					api.sendMessage("Recordatorio:\n" + reminders[x].title, reminders[x].ID);
					reminders.splice(x, 1);

					var str = "";

					fs.writeFile(__dirname+"/files/reminders.txt", str, function (err) {
	            		if (err)
	            		{
	            			console.log("Error al escrbir texto en archivo!!!\n" + err);
	            		}
	            		else
	            		{
	            			console.log("Escritura de reminders en archivo exitosa!");
	            		}
	            	});

	            	for(var x in reminders)
	            	{
	            		str += JSON.stringify(reminders[x]) + ";";
	            	}

	            	fs.writeFile(__dirname+"/files/reminders.txt", str, function (err) {
	            		if (err)
	            		{
	            			console.log("Error al escrbir texto en archivo!!!\n" + err);
	            		}
	            		else
	            		{
	            			console.log("Escritura de reminders en archivo exitosa!");
	            		}
	            	});
				}
			}
		}


		if(d.getHours() == alarm_hour_mariana && wake_flag)
		{
			wake_flag = false;
			api.sendMessage('Ya despierta Mariana!!!!', mariana_id);
			api.sendMessage('Ya son las 5 am !!!', mariana_id);
			api.sendMessage('Hoy es: ' + days[d.getDay()] + ' ' + d.getDate() + ' de ' + months[d.getMonth()], mariana_id);
		}
		else if (d.getHours() > alarm_hour_mariana || d.getHours() < alarm_hour_mariana)
		{
			wake_flag = true;
		}

		if (water >= wtr.length)
		{
			water = 0;
		}
		else
		{
			console.log('checando para agua! a las ' + wtr[water] + ' hrs\nY son las: ' + d.getHours() + " hrs");
			if (d.getHours() == wtr[water])
			{
				api.sendMessage('Recuerda que debes tomar agua!!!', mariana_id);
				water++;
			}
		}
	}

	setInterval(loop, 20000);

});
