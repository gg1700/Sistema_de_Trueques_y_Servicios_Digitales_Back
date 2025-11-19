import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getOrganizationLogo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result: any = await prisma.$queryRaw`
        SELECT logo_org 
        FROM organizacion 
        WHERE cod_org = ${parseInt(id)}
    `;
    const organization = result[0];
    if (!organization || !organization.logo_org) {
      return res.status(404).json({
        success: false,
        message: 'Logo no encontrado',
      });
    }
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(organization.logo_org);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error
    });
  }
}