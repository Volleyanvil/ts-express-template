// This module defines Express server creation and configuration
import express from 'express';
import cors from 'cors';

import { MainRouter } from '@routes/main.route';
import { UserRouter } from '@routes/user.route';

const createServer = (): express.Application => {
    const app = express();

    app.use(express.urlencoded({ extended:true }));
    app.use(cors());
    app.use(express.json());

    // Disable X-Powered-By HTTP response header
    app.disable('x-powered-by');

    app.use('', new MainRouter().router);
    app.use('/user', new UserRouter().router);

    return app;
};

export { createServer };