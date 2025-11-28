import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as OrganizationService from '../services/organization.service';

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

export async function registerOrganization(req: Request, res: Response) {
  try {
    const {
      nom_com_org,
      nom_leg_org,
      tipo_org,
      rubro_org,
      cif,
      correo_org,
      telf_org,
      dir_org,
      sitio_web
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "El logo de la organización es obligatorio."
      });
    }

    if (!nom_com_org || !nom_leg_org || !cif || !correo_org || !rubro_org) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios para el registro."
      });
    }

    const orgData = {
      nom_com_org,
      nom_leg_org,
      tipo_org,
      rubro_org,
      cif,
      correo_org,
      telf_org,
      dir_org,
      sitio_web
    };

    const result = await OrganizationService.register_organization(orgData, req.file.buffer);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);

  } catch (error) {
    console.error("Error en registerOrganization:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al registrar la organización",
      error: (error as Error).message
    });
  }
}

export async function getOrganizationData(req: Request, res: Response) {
  try {
    const { nom_leg_org, cif } = req.query;

    if (
      !nom_leg_org ||
      !cif ||
      typeof nom_leg_org !== "string" ||
      typeof cif !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Parámetros inválidos. Se requieren nom_leg_org y cif en la query.",
      });
    }

    const organizationData = await OrganizationService.get_organization_data(
      nom_leg_org,
      cif
    );

    const isEmpty =
      !organizationData ||
      (Array.isArray(organizationData) && organizationData.length === 0);

    if (isEmpty) {
      return res.status(404).json({
        success: false,
        message: "Organización no encontrada.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: organizationData,
    });
  } catch (error) {
    console.error("Error en getOrganizationData:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener datos de la organización",
      error: (error as Error).message,
    });
  }
}