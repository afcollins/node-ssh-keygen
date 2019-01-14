//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const os = require('os');

function ls(callback) {
  exec('ls', callback);
}

// added in node 10
// //app.post('/crypto-key', function (req, res) {
// //  crypto.generateKeyPair('rsa', function(error, publicKey, privateKey) {
// //    console.log('publicKey:', publicKey);
// //    console.log('privateKey:', privateKey);
// //    res.end(200);
// //  });
// //});

app.get('/', function (req, res) {
  ls(function(error, stdout, stderr) {
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    res.render('index.html', { publicKey: null, privateKey: null} );
  });

});

app.post('/ssh-key/:app', function (req, res) {
  fs.mkdtemp(path.join(os.tmpdir(), req.params.app + '-'), (err, folder) => {

    console.log('requested app:', req.params.app);
    console.log('generated folder:', folder);
    exec('ssh-keygen -N "" -C ' + req.params.app + ' -f ' + folder + '/id_rsa',
      function(error, stdout, stderr) {
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        publicKeyData = fs.readFileSync(path.join(folder,'id_rsa.pub'));;
        privateKeyData = fs.readFileSync(path.join(folder,'id_rsa'));
        res.render('index.html', { publicKey: publicKeyData, privateKey: privateKeyData});
    });
  });

});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

ls(function(error, stdout, stderr) {
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  });

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
