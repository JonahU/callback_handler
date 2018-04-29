const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const https = require('https');
const Cognito = require('./cognito');

const app = express();
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static('./images'));

const port = process.env.PORT;

const imageA = fs.readFileSync('./images/image-A.jpg');
const imageB = fs.readFileSync('./images/image-B.jpg');


app.get('/', (req, res) => {
    res.status(200).render('home', {
        helpers: {
            url: () => { return Cognito.getUrl(); }
        }
    });
})

app.get('/callback', (req, res) => {
    Cognito.getAuthCode(req.query)
    .then(code => Cognito.fetchToken(code))
    .then(token => Cognito.verifyToken(token))
    .then(token => Cognito.getGroup(token))
    .then((group) => {
        switch(group) {
            case 'A':
                res.redirect(302, '/GROUP_A');
                break;
            case 'B':
                res.redirect(302, '/GROUP_B');
                break;
            default:
                throw new Error('Unknown group');
        }        
    })
    .catch(err => res.send(err.message))
});

app.get('/GROUP_A', (req, res) => {
    res.contentType('image/jpeg');
    res.end(imageA);
});

app.get('/GROUP_B', (req, res) => {
    res.contentType('image/jpeg');
    res.end(imageB);
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
