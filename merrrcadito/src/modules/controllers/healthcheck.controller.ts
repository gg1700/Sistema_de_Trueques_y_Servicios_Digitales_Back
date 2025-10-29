import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function healthcheck(req: Request, res: Response) {
  try {
    await prisma.$queryRaw`
      SELECT 1
    `;
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error
    });
  }
}