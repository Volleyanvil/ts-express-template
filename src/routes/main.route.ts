import { Router } from 'express';
import { MainController } from '@controllers/main.controller';
import passport from 'passport';

export class MainRouter {
    constructor() {
        this.router.route('/').get(this.controller.getMainPage);
        this.router.route('/health').get(this.controller.getHealth);
        this.router.route('/auth-check').get(passport.authenticate('jwt', {session: false}), (req, res) => {
            res.status(200).json(req.user);
        });
    }
    router = Router();
    private controller = new MainController();
}
