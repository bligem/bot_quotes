require('dotenv').config();
const mongo = require('mongodb');
const request = require('request');
var MongoClient = require('mongodb').MongoClient;

const { Client, Intents, MessageEmbed } = require('discord.js');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

const TOKEN = process.env.TOKEN;
const url = process.env.MONGODB_URL;

var api = "http://animechan.vercel.app/api/quotes";  //10 quotes
const option = { upsert: true };
var data;
function get_data(){
request.get({
    url: api,
    json: true,
  }, (err, res, dane) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
      //console.log(dane[0].anime);
      //console.log(data);
      data = dane;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mydb");
        async function pass(z){
        const bierz = await dbo.collection("api").updateOne({anime: data[z].anime}, {$set: data[z]}, {upsert : true} ,async function(err, res) {
          if (err) throw err;
          console.log(data[z].anime + " | document added / updated");
          if (z == 9){
            const cls = await db.close();
          }
        });
      }
      for (var i = 0; i < 10; i++){
        pass(i);
      }
     });


}});
}
get_data();
setInterval(get_data, 40000);

client.once('ready', () => {
	console.log('Ready!');
});


client.on('messageCreate', message => {
	if (message.content.startsWith("uwu ")){
    if (message.content.substring(4) === "witaj"){
      message.reply("Witaj!");
    }

  }

  if (message.content.startsWith("uwu ")){
    if (message.content.substring(4) === "quote"){
      var doc;
      MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          const dbo = db.db("mydb");
          dbo.collection("api").find().toArray(function(err, result) {
            if (err) throw err;
            doc = result.length;
            function rng(min, max) {
              min = Math.ceil(min);
              max = Math.floor(max);
              return Math.floor(Math.random() * (max - min)) + min;
            }
            console.log(doc);

            const exampleEmbed = {
          color: 0x0099ff,
          title: 'Anime:',
          author: {
            name: 'Random Anime Quote',
            icon_url: 'https://i.imgur.com/0dqdq3m.jpeg',
          },
          description: result[rng(0, doc-1)].anime,
          fields: [
            {
              name: 'Character',
              value: result[rng(0, doc-1)].character,
            },
            {
              name: 'Quote',
              value: result[rng(0, doc-1)].quote,
            },
          ],
        };

            message.reply({ embeds: [exampleEmbed] });
            db.close();
          });
       });
    }
  }
});

client.login(TOKEN);
