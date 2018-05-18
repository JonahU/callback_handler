const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');
const Cognito = require('./cognito');

const app = express();
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

const port = process.env.PORT;
const groupA = process.env.GROUP_A;
const groupB = process.env.GROUP_B;

app.use(express.static('./public'));

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
    .then(([group, accessToken]) => {
        switch(group) {
            case groupA:
                res.redirect(302, url.format({
                    pathname: `/${groupA.toLowerCase()}`,
                    query: accessToken
                }));
                break;
            case groupB:
                res.redirect(302, url.format({
                    pathname: `/${groupB.toLowerCase()}`,
                    query: accessToken
                }));
                break; 
            default:
                throw new Error('Unknown group');
        }        
    })
    .catch(err => res.send(err.message))
});

app.get(`/${groupA.toLowerCase()}`, (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return `images/${groupA}.jpg`; },
            group: () => { return groupA; }
        }
    });
});

app.get(`/${groupB.toLowerCase()}`, (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return `images/${groupB}.jpg`; },
            group: () => { return groupB; }
        }
    });
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
