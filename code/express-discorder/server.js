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

//Pàgina principal
app.get("/", (req, res) => res.send(`
  <html>
    <head><title>Success!</title></head>
    <body>
      <h1>You did it!</h1>
      <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Cool kid doing thumbs up" />
    </body>
  </html>
`));

//Post missatges rebuts de la API LoRa
app.post("/sensor", async (req, res) =>{

  //Mirem si és sensor Cotxe o actuador LED
  if (req.body.uplink_message.hasOwnProperty('decoded_payload')){
    let sensor = req.body.uplink_message.decoded_payload.Type_Sens;
    if (sensor == 1){
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
      console.log('Sensor cotxe rebut');
      });

      //Actualitzem la DB Gestio_Cotxe
      const sql2 = 'UPDATE Gestio_Cotxe SET Parking_Status = ' + mysql.escape(cotxeObj.Parking_status) + ' WHERE DevEUI_cotxe =' + mysql.escape(cotxeObj.DevEUI);
      //Guardem a la DB Gestio_Cotxe
      connection.query(sql2, error =>{
      if (error) throw error;
      console.log('Sensor cotxe actualitzat');
      });

    }
    else if (sensor == 2){
      
        let ledEUI =req.body.end_device_ids.device_id;
        const ledObj = { Estat_led: req.body.uplink_message.decoded_payload.LED }
        //console.log(ledObj);
        //Preparem dades del sensor cotxe
        const sql = 'UPDATE Gestio_Cotxe SET Estat_led =' + mysql.escape(ledObj.Estat_led) + ' WHERE DevEUI_led =' + mysql.escape(ledEUI);
        
        //Guardem a la DB Gestio_Cotxe
        connection.query(sql, error =>{
        if (error) throw error;
        //console.log('Actuador led actualitzat');
        });
    }
  }

  res.status(200).send();
})

//Post Creació Postman dels sensors
app.post("/registre", async (req, res) =>{

  //Mirem si ja existeix
  let cotxe = req.body.EUICotxe;
  let c_cotxe = 'A';

  let led = req.body.EUILED;
  let c_led = 'A';

  //Al no ser async espera a recopilar l'informació i llavors decideix
  function Logica(c_cotxe, c_led){
    if (c_cotxe != cotxe & c_led != led) {
      //Preparem dades dela DB gestió cotxe
      const sql2 = `INSERT INTO Gestio_Cotxe SET ?`;
      const cotxeObj = { 
        DevEUI_cotxe: req.body.EUICotxe,
        Parking_status: 0,
        Downlinks_sent: 0,
        DevEUI_led:req.body.EUILED,
        Estat_led:0, 
      }
      //Guardem a la DB Sensor_Cotxe
      connection.query(sql2, cotxeObj, error =>{
      if (error) throw error;
      console.log('REGISTRAT!');
      });
    }
    else if ( c_cotxe == cotxe & c_led == led ) {
      console.log('Sensor del cotxe i led registrats!');
    }
    else if ( c_cotxe == cotxe & c_led != led ) {
      console.log('Sensor cotxe ja registrat!');
    }
    else if ( c_cotxe != cotxe & c_led == led ) {
      console.log('Actuador LED ja registrat!');
    }
    else {
      console.log('Error desconegut');
    }
  }

  //Preguntem a la base de dades si ja existeix algun camp
  const sql = 'SELECT * FROM Gestio_Cotxe WHERE DevEUI_cotxe = ' + mysql.escape(cotxe) + 'OR DevEUI_led  = ' + mysql.escape(led);
  connection.query(sql, (error, result) =>{
    if (error) throw error;
    if (result.length > 0){
    c_cotxe = result[0].DevEUI_cotxe;
    c_led = result[0].DevEUI_led;
    }
    Logica(c_cotxe,c_led);
  });

  res.status(200).send();
})


//Prova downlink lora
// NNSXS.5SFWX4EHPY67ECSZHX26BVPRIPDVN7ZZIZV77KA.DPW4CBGI3TU2GF3BOY2DY7OOWPKBCDFXLHTUONZFOLYNZE25AYZA
// 1 = AQ== ------ 0 = AA==
app.get("/downlink", async (req, res) =>{
  let hola = [1];
  axios({
    headers: {'Authorization': 'Bearer NNSXS.5SFWX4EHPY67ECSZHX26BVPRIPDVN7ZZIZV77KA.DPW4CBGI3TU2GF3BOY2DY7OOWPKBCDFXLHTUONZFOLYNZE25AYZA',
    'Content-Type': 'application/json',
    'User-Agent': 'proves-cotxe/v3'},
    method: 'post',
    url: 'https://eu1.cloud.thethings.network/api/v3/as/applications/proves-cotxe/webhooks/api-webhook-udg/devices/' + 'eui-70b3d57ed004da1c' + '/down/push',
    data: {"downlinks": [{
      "frm_payload":"AA==",
      "f_port": 15,
      "priority":"NORMAL"
    }]
    }
  });
  res.status(200).send();
})

//----------Repetició--------


// Aquesta funció mira la taula on hi han registrats tots el Sensors i envia l'ordre per aquells necessaris d'activar el LED
const BuffRev = setInterval(RevDevEUI, 10000);//Cada 10 segons

//Funció que revisa i  crea la llista que envia els downlinks
function RevDevEUI(){
  let indxbuff = 0;
  let arrsensor = [];
  const sql = 'SELECT * FROM Gestio_Cotxe';
  connection.query(sql, (error, result) =>{
    if (error) throw error;
    if (result.length > 0){
      indxbuff = result.length;
      arrsensor = result;
      //console.log(arrsensor[0]);
      //console.log(indxbuff);
      //console.log(arrsensor);
    }
    BufferSeleccio(indxbuff, arrsensor);
  });
};

function BufferSeleccio(index, llista){
  for (let i = 0; i < index; i++) {
    //console.log(llista[i]);
    //if (llista[i].Parking_Status == 1 & llista[i].Estat_led == 0){};
  }
};

//Funció integrada a RevDevEUI que envia els downlinks
RevDevEUI();

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
