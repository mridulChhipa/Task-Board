import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticateToken } from "../middlewares/guards/auth.guard";

export const notificationRouter = Router();
notificationRouter.use(authenticateToken);

notificationRouter.post("/create", (req, res, next) => {
  notificationController.createNotification(req, res, next);
});

notificationRouter.get("/:nid", (req, res, next) => {
  notificationController.fetchNotification(req, res, next);
});

notificationRouter.delete("/:nid", (req, res, next) => {
  notificationController.deleteNotification(req, res, next);
});

notificationRouter.patch("/:nid", (req, res, next) => {
  notificationController.readNotification(req, res, next);
});