import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

const notificationRouter = Router();

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