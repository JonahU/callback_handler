const express = require('express');
const exphbs = require('express-handlebars');
const https = require('https');
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
            url: () => { return config.hostedAuthPage(); }
        }
    });
});

app.get('/callback', (req, res) => {
    Cognito.getAuthCode(req.query)
        .then(code => Cognito.fetchToken(code))
        .then(token => Cognito.verifyToken(token))
        .then(token => Cognito.getGroup(token))
        .then(([group, accessToken, overrideRedirect]) => {
            switch(group) {
                case config.group('A'):
                    handleRedirect(res, accessToken, group, overrideRedirect);
                    break;
                case config.group('B'):
                    handleRedirect(res, accessToken, group, overrideRedirect);
                    break; 
                default:
                    throw new Error('Unknown group');
            }        
        })
        .catch(err => res.send(err.message))
});

app.get(`/${config.path('A')}`, (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return `images/${config.group('A')}.jpg`; },
            group: () => { return config.group('A'); }
        }
    });
});

app.get(`/${config.path('B')}`, (req, res) => {
    res.render('page', {
        helpers: {
            access_token: () => { return JSON.stringify(req.query); },
            image: () => { return `images/${config.group('B')}.jpg`; },
            group: () => { return config.group('B'); }
        }
    });
});

const externalRedirect = (res, accessToken, url, tokenName) => {
    const jwt = tokenName || 'jwt';
    res.set({
        [jwt]: accessToken.token.id_token,
        refresh: accessToken.token.refresh_token
    });
    res.redirect(302, url);
}

const internalRedirect = (res, accessToken, group) => {
    res.redirect(302, url.format({
        pathname: `/${config.pathForGroup(group)}`,
        query: accessToken.decodedToken
    }));
}

const handleRedirect = (res, accessToken, group, overrideRedirect) => {
    switch (overrideRedirect) {
        case config.redirect('A'):
            externalRedirect(res, accessToken, overrideRedirect)
            break;
        case config.redirect('B'):
            externalRedirect(res, accessToken, overrideRedirect, config.tokenNameOverride('B'))
            break;
        default:
            internalRedirect(res, accessToken, group)
    }
}

const listen = (sslOptions) => {
    if (sslOptions) {
        https.createServer(sslOptions, app)
        .listen(config.port(), () => console.log(`App listening on port ${config.port()}!`));
    } else {
        app.listen(config.port(), () => console.log(`App listening on port ${config.port()}!`));
    }
}

module.exports = { listen };
