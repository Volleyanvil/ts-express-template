import { Router } from 'express';
import { MainController } from '@controllers/main.controller';

export class MainRouter {
    constructor() {
        this.router.route('/').get(this.controller.getMainPage);
        this.router.route('/health').get(this.controller.getHealth);
    }
    router = Router();
    private controller = new MainController();
}

export const mainRouter = Router();
const mainController = new MainController();

mainRouter.route('/').get(mainController.getMainPage);

mainRouter.route('/health').get(mainController.getHealth);
