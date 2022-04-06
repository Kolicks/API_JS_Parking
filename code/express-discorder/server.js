require("dotenv").config();
const express = require("express");//Servidor HTTP
const axios = require("axios").default;//Client HTTP

//Executem el servidor i client
const app = express();
const port = 40300;

//Base de dades MySQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
});
 
connection.connect();

//---------------------------------------
/*const {InfluxDB} = require('@influxdata/influxdb-client')

// You can generate an API token from the "API Tokens Tab" in the UI
const token = 'cEG37QZb92xNMRjP9GremXtUN9UZglLXPWrnNiI7EV33aGcwJ4gTivxUE3P1xuCVdQ--sgY9E8BSImmq92vwDg=='
const org = 'UdG'
const bucket = 'Temp'

function InfluxDBWrite(data){
const client = new InfluxDB({url: 'http://localhost:8086', token: token})
const {Point} = require('@influxdata/influxdb-client')
const writeApi = client.getWriteApi(org, bucket)

//Escrivim al Influx
//writeApi.useDefaultTags({host: 'host1'})
const point = new Point('Temperatura').floatField('Temp', data)
writeApi.writePoint(point)
writeApi
    .close()
    .then(() => {
        console.log('FINISHED')
    })
    .catch(e => {
        console.error(e)
        console.log('Finished ERROR')
    })}*/
//--------------------------------------------

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
app.post("/LoRa", async (req, res) =>{
  console.log(req.body.uplink_message.decoded_payload);
  const username = "LoRa Draginos";
  const LED = req.body.uplink_message.decoded_payload.LED;
  const Data = req.body.uplink_message.decoded_payload.data;
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
