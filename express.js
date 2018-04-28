const express = require('express');
const fs = require('fs');
const https = require('https');
const Cognito = require('./cognito');

const app = express();
const port = process.env.PORT;

const dogPhoto = fs.readFileSync('./images/dog.jpg');
const catPhoto = fs.readFileSync('./images/cat.jpg');

// For load balancer
app.get('/', (req, res) => {
    res.status(200).send('OK');
})

app.get('/callback', (req, res) => {
    Cognito.getAuthCode(req.query)
    .then(code => Cognito.fetchToken(code))
    .then(token => Cognito.verifyToken(token))
    .then(token => Cognito.getGroup(token))
    .then((group) => {
        switch(group) {
            case 'Cat':
                res.redirect(302, '/cat');
                break;
            case 'Dog':
                res.redirect(302, '/dog');
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
        https.createServer(sslOptions, app)
        .listen(port, () => console.log(`App listening on port ${port}!`));
    } else {
        app.listen(port, () => console.log(`App listening on port ${port}!`));
    }
}

module.exports = { listen };
