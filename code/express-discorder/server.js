require("dotenv").config();
const express = require("express");
const axios = require("axios").default;

//Executem el servidor i client
const app = express();
const port = 40300;

//---------------------------------------
const {InfluxDB} = require('@influxdata/influxdb-client')

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
    })}
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

app.post("/github", (req, res) => {
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
});

//post LoRa-Postman
app.post("/postman", async (req, res) =>{
  console.log(req.body.uplink_message.decoded_payload);
  const username = "LoRa Draginos Node Temp";
  const data = req.body.uplink_message.decoded_payload.Temp;
  //const content = `:rocket:${username} fa ${dades}ºC a casa :rocket:`;
  //const avatarUrl = req.body.sender.avatar_url;
  let number = isNaN(data);
  if (!number){
    InfluxDBWrite(data);
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

//post LoRa-Chirp
app.post("/postmanChirp", async (req, res) =>{
  console.log(req.body.uplink_message.decoded_payload);
  const username = "LoRa Draginos Node Temp";
  const data = req.body.uplink_message.decoded_payload.Temp;
  //const content = `:rocket:${username} fa ${dades}ºC a casa :rocket:`;
  //const avatarUrl = req.body.sender.avatar_url;
  let number = isNaN(data);
  if (!number){
    axios
      .post(process.env.WEBHOOK_URL_4, {
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
        //res.status(200).send();
      })
      .catch((err) => console.error(res.status(500).send('Internal server error')));
      

  }
});

app.use((error, req, res, next) => {
  res.status(500)
  res.send({error: error})
  console.error(error.stack)
  next(error)
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
