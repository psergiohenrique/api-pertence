import { Router } from "express";
import SessionController from "./app/controllers/SessionController";
import auth from "./app/middlewares/auth";
import token from "./app/middlewares/token";

const routes = new Router();

routes.use(token);

routes.post("/user/login", (req, res, next) =>
  SessionController.userLogin(req, res, next).catch(next)
);
routes.post("/user/signup", (req, res, next) =>
  SessionController.userSignup(req, res, next).catch(next)
);
routes.post("/user/resetPasswordRequest", (req, res, next) =>
  SessionController.resetPasswordRequest(req, res, next).catch(next)
);
routes.post("/user/resetPassword", (req, res, next) =>
  SessionController.resetPassword(req, res, next).catch(next)
);

routes.use(auth);

routes.put("/user", (req, res, next) =>
  SessionController.updateUser(req, res, next).catch(next)
);

export default routes;
