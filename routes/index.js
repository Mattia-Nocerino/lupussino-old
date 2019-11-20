var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/db', function(req, res, next) {
  const { Client } = require('pg');

  const client = new Client({
    connectionString: 'postgresql://postgres:Alanf0rd@localhost:5432/postgres'
  });
  
  client.connect();

  client.query("SELECT to_char(current_timestamp, 'HH12:MI:SS') as now")
  .then(r => {
    console.log(r.rows[0].now);
    res.render('test', {title: r.rows[0].now, message: 'ciao'})
  })
  .catch(e => console.error(e.stack))
  
  // client.query('SELECT NOW()', (err, res) => {
  //   if (err) throw err;
  //   for (let row of res.rows) {
  //     console.log(JSON.stringify(row));
  //   }
  //   client.end();
  // });
});

module.exports = router;
