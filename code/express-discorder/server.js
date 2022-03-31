require("dotenv").config();
const express = require("express");
const axios = require("axios").default;

const app = express();
const port = 40300;

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

//post Lora
app.post("/casauplink", (req, res) =>{
  console.log(req.body.uplink_message.decoded_payload);
  const username = "LoRa Draginos Node Temp";
  const dades = req.body.uplink_message.decoded_payload.Temp;
  const content = `:rocket:${username} fa ${dades}ºC a casa :rocket:`;
  //const avatarUrl = req.body.sender.avatar_url;

  axios
    .post(process.env.DISCORD_WEBHOOK_URL_2, {
      content: content,
      /*embeds: [
        {
          image: {
            url: avatarUrl,
          },
        },
      ],*/
    })
    .then((discordResponse) => {
      console.log("Success!");
      res.status(204).send();
    })
    .catch((err) => console.error(`Error sending to Discord: ${err}`));
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
