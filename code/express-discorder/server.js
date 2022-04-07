require("dotenv").config();
const express = require("express");//Servidor HTTP
const axios = require("axios").default;//Client HTTP

//Executem el servidor i client
const app = express();
const port = 40300;

const bodyParser = require('body-parser');

//Base de dades MySQL
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'mydb'
});
 
connection.connect(error => {
  if (error) throw error;
  console.log('Database server running!!!');
});


app.use(express.json());

app.get("/", (req, res) => res.send(`
  <html>
    <head><title>Success!</title></head>
    <body>
      <h1>You did it!</h1>
      <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Cool kid doing thumbs up" />
    </body>
  </html>
`));
//Hola
/*app.post("/github", (req, res) => {
  const username = req.body.sender.login;
  const repoName = req.body.repository.name;
  const content = `:taco: :taco:${username} just starred ${repoName} :taco: :rocket:`;
  const avatarUrl = req.body.sender.avatar_url;

  axios
    .post(process.env.DISCORD_WEBHOOK_URL, {
      content: content,
      embeds: [
        {
          image: {
            url: avatarUrl,
          },
        },
      ],
    })
    .then((discordResponse) => {
      console.log("Success!");
      res.status(204).send();
    })
    .catch((err) => console.error(`Error sending to Discord: ${err}`));
});*/

//post LoRa-Postman
app.post("/postman", async (req, res) =>{
  console.log(req.body.uplink_message.decoded_payload);
  const username = "LoRa Draginos Node Temp";
  const data = req.body.uplink_message.decoded_payload.Temp;
  //const content = `:rocket:${username} fa ${dades}ºC a casa :rocket:`;
  //const avatarUrl = req.body.sender.avatar_url;
  let number = isNaN(data);
  if (!number){
    //InfluxDBWrite(data);
    axios
      .post(process.env.WEBHOOK_URL_3, {
        content: data,

        /*embeds: [
          {
            image: {
              url: avatarUrl,
            },
          },
        ],*/
      })
      .then((NodeRedResponse) => {
        console.log("Success!");
        res.status(200).send();
      })
      .catch((err) => console.error(res.status(500).send('Internal server error')));
      

  }
});

//Post missatges rebuts de la API LoRa
app.post("/sensor", async (req, res) =>{
  /*console.log(req.body.uplink_message.decoded_payload);
  console.log(req.body.uplink_message.received_at);
  console.log(req.body.end_device_ids.device_id);
  console.log('////////////////////////////////////////////////');*/
  //Mirem si és sensor Cotxe o actuador LED

  //Preparem dades del sensor cotxe
  const sql = 'INSERT INTO Sensor_Cotxe SET ?';
  const cotxeObj = { 
    Data: req.body.uplink_message.received_at,
    DevEUI: req.body.end_device_ids.device_id,
    Parking_status: req.body.uplink_message.decoded_payload.Parking_status,
    Battery_Voltage: req.body.uplink_message.decoded_payload.Battery_Voltage,
    Direction: req.body.uplink_message.decoded_payload.Direction,
    Frame_type: req.body.uplink_message.decoded_payload.Frame_type,
    Sens_type: req.body.uplink_message.decoded_payload.Sens_type,
    Temp: req.body.uplink_message.decoded_payload.Temp,
    X_Axis: req.body.uplink_message.decoded_payload.X_Axis,
    Y_Axis: req.body.uplink_message.decoded_payload.Y_Axis,
    Z_Axis: req.body.uplink_message.decoded_payload.Z_Axis,
  }
  //Guardem a la DB Sensor_Cotxe
  connection.query(sql, cotxeObj, error =>{
  if (error) throw error;
  console.log('Sensor cotxe guardat');
  });

  //const username = "LoRa Draginos";
  //const LED = req.body.uplink_message.decoded_payload.LED;
  //const Data = req.body.uplink_message.decoded_payload.data;
  //const content = `:rocket:${username} fa ${dades}ºC a casa :rocket:`;
  //const avatarUrl = req.body.sender.avatar_url;
  res.status(200).send();
})

//Post Creació Postman dels sensors
app.post("/registre", async (req, res) =>{
  //console.log(req.body.end_device_ids.Cotxe);
  //console.log(req.body.end_device_ids.LED);
  //Mirem si ja existeix
  const cotxe = req.body.EUICotxe;
  var c_cotxe = '1';
  const led = req.body.EUILED;
  var c_led = '1';
  var resultat = 0;
  const sql = 'SELECT * FROM Gestio_Cotxe WHERE DevEUI_cotxe = ' + mysql.escape(cotxe) + 'OR' + mysql.escape(led);
  connection.query(sql, (error, result) =>{
    if (error) throw error;
    if (result.lenght > 0) {
      resultat = 1;
      c_cotxe = RowDataPacket.DevEUI_cotxe;
      c_led = RowDataPacket.DevEUI_led;
      console.log(c_cotxe);
      console.log(c_led);
    } else {
      resultat = 0;
    }
    
    console.log(c_cotxe);
    console.log(c_led);
    console.log(result);
    res.send(result);
    });

  /*if (resultat == 0) {
    //Preparem dades dela DB gestió cotxe
    const sql2 = `INSERT INTO Gestio_Cotxe SET ?`;
    const cotxeObj = { 
      DevEUI_cotxe: req.body.end_device_ids.Cotxe,
      Parking_status: 0,
      Downlinks_sent: 0,
      DevEUI_led:req.body.end_device_ids.LED,
      Estat_led:0,
      
    }
    //Guardem a la DB Sensor_Cotxe
    connection.query(sql, cotxeObj, error =>{
    if (error) throw error;
    console.log('REGISTRAT!');
    });
  }*/
  if (c_led == led & c_cotxe == cotxe) {
    console.log('Sensor del cotxe i led registrats!');
  }else if (c_cotxe == cotxe & c_led != led) {
    console.log('Sensor cotxe ja registrat!');
  }else if (c_led == led & c_cotxe != cotxe) {
    console.log('Actuador LED ja registrat!');
  }


  res.status(200).send();
})


//----------Repetició--------
// Aquesta funció mira la taula on hi han registrats tots el Sensors i envia l'ordre per aquells necessaris d'activar el LED
/*function RevDevEUI(){
  // do whatever you like here

  setTimeout(RevDevEUI, 30000);//Cada 30 segons
}

RevDevEUI();*/

//---------------------------



app.use((error, req, res, next) => {
  res.status(500)
  res.send({error: error})
  console.error(error.stack)
  next(error)
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
