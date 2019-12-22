'use strict';

const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
//Work to move these outside the function handlers
const passport = require('passport');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
//
const dbConnection = require('./db/dbConfig')
const dbControl = require('./db/dbControl')
const s3Control = require('./s3Control.js')

/******************************************************************************
 * Express Middleware
 ******************************************************************************/
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/******************************************************************************
 * Azure Authentication
 ******************************************************************************/
app.use(passport.initialize());

const options = {
    identityMetadata: process.env.OIDC_ID_META,
    clientID: process.env.OIDC_CLIENT_ID,
    validateIssuer: true,
    passReqToCallback: false,
    issuer: process.env.OIDC_ISS,
    audience: process.env.OIDC_AUD,
    allowMultiAudiencesInToken: false,
    loggingLevel:'info',
    clockSkew: 300, //WTF????
    //ignoreExpiration: true,
    loggingNoPII: true,
  };
  
  const bearerStrategy = new OIDCBearerStrategy(options,
    function(token, done) {
        let owner;
        if (!token.oid) {
          done(new Error('oid is not found in token'));
        } else {
            owner = token.oid;
            done(null, token);
        }
    }
  );

  passport.use(bearerStrategy);

/******************************************************************************
* Functions
*****************************************************************************/
app.post('/docs',
    passport.authenticate('oauth-bearer', { session: false }),
    async (req, res) => {
        try {
            await dbConnection();
            let results = await dbControl.masterSearch(req.body);
                if (!results.docs.length) {
                    res.status(400).json(
                        { success: false, error: 'No Documents Found :(' }
                    )
                }
                res.status(200).json({
                    success: true, 
                    totalDocs: results.totalDocs, 
                    totalPages: results.totalPages,
                    page: results.page,
                    hasPrevPage: results.hasPrevPage,
                    hasNextPage: results.hasNextPage,
                    prevPage: results.prevPage,
                    nextPage: results.nextPage,
                    data: results.docs 
                })
        } catch (error) {
            console.log(error);
            res.status(400).json(
                { success: false, error: error.toString() }
            )
        }
    }
)

app.post('/doc',
    passport.authenticate('oauth-bearer', { session: false }),
    async (req, res) => {
        try {
            await dbConnection();
            let result = await dbControl.getDocByID(req.body);
            if (result) {
                return res.status(200).json({ success: true, data: result })
            }
            return res.status(400).json({ success: false, error: 'Document not found :(' })
        } catch (error) {
            console.log(error);
            res.status(400).json(
                { success: false, error: error.toString() }
            )
        }
    }
)

app.get('/download/:binpath/:filename',
        passport.authenticate('oauth-bearer', { session: false }),
        s3Control.s3Download)

app.get('/image/:id',
        passport.authenticate('oauth-bearer', { session: false }),
        s3Control.s3ImageDL)

app.get('/echo',
        //passport.authenticate('oauth-bearer', { session: false }),
        (req, res) => {
            res.status(200).json(
                { result: "echo" }
            )
        });


/******************************************************************************
 * Fire it up
 ******************************************************************************/
module.exports.handler = serverless(app);
