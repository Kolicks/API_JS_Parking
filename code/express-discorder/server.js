require("dotenv").config();
const express = require("express");//Servidor HTTP
const axios = require("axios").default;//Client HTTP

//Executem el servidor i client
const app = express();
const port = 40300;

//const bodyParser = require('body-parser');

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

//Post LoRa
app.post("/sensor", async (req, res) =>{
  console.log(req.body.uplink_message.decoded_payload);
  console.log(req.body.uplink_message.received_at);
  console.log(req.body.end_device_ids.device_id);
  console.log('////////////////////////////////////////////////');

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

connection.query(sql, cotxeObj, error =>{
  if (error) throw error;
  console.log('creat');
  res.send('sensor rebut');


});

  //const username = "LoRa Draginos";
  //const LED = req.body.uplink_message.decoded_payload.LED;
  //const Data = req.body.uplink_message.decoded_payload.data;
  //const content = `:rocket:${username} fa ${dades}ºC a casa :rocket:`;
  //const avatarUrl = req.body.sender.avatar_url;
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
