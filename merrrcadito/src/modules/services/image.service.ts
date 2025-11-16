import sharp from 'sharp';

export class ImageService {
  /**
   * Procesa y optimiza una imagen
   * @param buffer - Buffer de la imagen original
   * @param options - Opciones de procesamiento
   * @returns Buffer de la imagen procesada
   */
  static async processImage(
    buffer: Buffer,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    }
  ): Promise<Buffer> {
    try {
      let image = sharp(buffer);

      // Redimensionar si se especifica
      if (options?.width || options?.height) {
        image = image.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convertir formato si se especifica
      switch (options?.format) {
        case 'jpeg':
          image = image.jpeg({ quality: options?.quality || 80 });
          break;
        case 'png':
          image = image.png({ quality: options?.quality || 80 });
          break;
        case 'webp':
          image = image.webp({ quality: options?.quality || 80 });
          break;
        default:
          image = image.jpeg({ quality: options?.quality || 80 });
      }

      return await image.toBuffer();
    } catch (error) {
      throw new Error(`Error procesando imagen: ${error}`);
    }
  }

  /**
   * Valida que el buffer sea una imagen válida
   * @param buffer - Buffer a validar
   * @returns true si es válido, false si no
   */
  static async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return !!(metadata.width && metadata.height);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Obtiene metadata de la imagen
   * @param buffer - Buffer de la imagen
   * @returns Metadata de la imagen
   */
  static async getImageMetadata(buffer: Buffer) {
    try {
      return await sharp(buffer).metadata();
    } catch (error) {
      throw new Error(`Error obteniendo metadata: ${error}`);
    }
  }
}