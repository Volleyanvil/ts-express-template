// This module defines Express server creation and configuration
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';

import { AuthRouter } from '@routes/auth.route';
import { MainRouter } from '@routes/main.route';
import { UserRouter } from '@routes/user.route';
import { Auth } from '@config/auth.config';


const createServer = (): express.Application => {
    const app = express();

    app.use(express.urlencoded({ extended:true }));
    app.use(cookieParser());
    app.use(cors());
    app.use(Auth.init());
    Auth.plug();
    app.use(express.json());

    // Disable X-Powered-By HTTP response header
    app.disable('x-powered-by');

    app.use('', new MainRouter().router);
    app.use('/user', new UserRouter().router);
    app.use('/auth', new AuthRouter().router);

    return app;
};

export { createServer };