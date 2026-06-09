'use strict';

const express = require('express');
const { createRequestHandler } = require('@react-router/express');

const app = express();
const port = process.env.PORT || 3000;

app.use('/assets', express.static('public/assets'));

app.all('/favicon.ico', (req, res) => {
  res.status(404).end();
});

app.all(
  [
    '/',
    '/auth',
    '/auth/callback',
    '/callback',
    '/storefront',
    '/customer-account/login',
    '/customer-account/callback',
    '/customer-account/logout',
    '/customer-account/session',
    '/sessiontoken',
    '/authenticated',
    '/adminlink',
    '/themeapp',
    '/functiondiscount',
    '/functionshipping',
    '/functionpayment',
    '/webpixel',
    '/postpurchase',
    '/checkoutui',
    '/ordermanage',
    '/bulkoperation',
    '/mocklogin',
    '/appproxy',
    '/fulfillment_order_notification',
    '/fetch_tracking_numbers.json',
    '/fetch_stock.json',
    '/webhookcommon',
    '/webhookgdpr',
    '/flowaction',
  ],
  createRequestHandler({
    build: () => import('./build/server/index.js'),
  })
);

app.use((_req, res) => {
  res.status(404).send('Not found');
});

const server = app.listen(port, () => {
  console.log(`Barebone app listening on ${port}`);
});

server.on('error', (error) => {
  console.error(`Barebone app failed to listen on ${port}: ${error.message}`);
  process.exitCode = 1;
});
