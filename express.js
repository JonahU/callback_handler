const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');
const Cognito = require('./cognito');
const config = require('./config');

const app = express();
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

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
    .then(([group, accessToken, overrideRedirect]) => {
        switch(group) {
            case config.groupA():
                if (overrideRedirect) {
                    res.set({
                        jwt: accessToken.token.id_token,
                        refresh: accessToken.token.refresh_token
                    });
                    res.redirect(302, overrideRedirect);
                } else {
                    res.redirect(302, url.format({
                        pathname: `/${config.pathA()}`,
                        query: accessToken.decodedToken
                    }));
                }
                break;
            case config.groupB():
                res.redirect(302, url.format({
                    pathname: `/${config.pathB()}`,
                    query: accessToken.decodedToken
                }));
                break; 
            default:
                throw new Error('Unknown group');
        }        
    })
    .catch(err => res.send(err.message))
});

app.get(`/${config.pathA()}`, (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return `images/${config.groupA()}.jpg`; },
            group: () => { return config.groupA(); }
        }
    });
});

app.get(`/${config.pathB()}`, (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return `images/${config.groupB()}.jpg`; },
            group: () => { return config.groupB(); }
        }
    });
});

const listen = (sslOptions) => {
    if (sslOptions) {
        https.createServer(sslOptions, app)
        .listen(config.port(), () => console.log(`App listening on port ${config.port()}!`));
    } else {
        app.listen(config.port(), () => console.log(`App listening on port ${config.port()}!`));
    }
}

module.exports = { listen };
