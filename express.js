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
            case 'A':
                res.redirect(302, url.format({
                    pathname: '/GROUP_A',
                    query: accessToken
                }));
                break;
            case 'B':
                res.redirect(302, url.format({
                    pathname: '/GROUP_B',
                    query: accessToken
                }));
                break; 
            default:
                throw new Error('Unknown group');
        }        
    })
    .catch(err => res.send(err.message))
});

app.get('/GROUP_A', (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return 'images/image-A.jpg'; },
            group: () => { return 'A'; }
        }
    });
});

app.get('/GROUP_B', (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return 'images/image-B.jpg'; },
            group: () => { return 'B'; }
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
