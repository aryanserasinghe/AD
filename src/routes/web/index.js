const express = require('express');
const authRoutes = require('./auth.route');
const config = require('../../config/config');

const router = express.Router();

const routes = [
  {
    path: '/auth',
    route: authRoutes,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
