const express = require('express');
const fs = require('fs');
const https = require('https');
const Cognito = require('./cognito');

const app = express();
const port = process.env.PORT;

const dogPhoto = fs.readFileSync('./images/dog.jpg');
const catPhoto = fs.readFileSync('./images/cat.jpg');

app.get('/', (req, res) => {
    Cognito.getAuthCode(req.query)
    .then(code => Cognito.fetchToken(code))
    .then(token => Cognito.verifyToken(token))
    .then(token => Cognito.getGroup(token))
    .then((group) => {
        switch(group) {
            case 'Cat':
                res.redirect('/cat');
                break;
            case 'Dog':
                res.redirect('/dog');
                break;
            default:
                throw new Error('Unknown group');
        }        
    })
    .catch(err => res.send(err.message))
});

app.get('/cat', (req, res) => {
    res.contentType('image/jpeg');
    res.end(catPhoto);
});

app.get('/dog', (req, res) => {
    res.contentType('image/jpeg');
    res.end(dogPhoto);
});

const listen = (sslOptions) => {
    if (sslOptions) {
        https.createServer(sslOptions, app);
    }
    app.listen(port, () => console.log(`App listening on port ${port}!`));
}

module.exports = { listen };