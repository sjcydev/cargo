/**
 * Usuarios Service
 * Centralizes all database operations related to usuarios (clients)
 * Ensures consistent sucursalId filtering and query patterns
 */

import { db } from "$lib/server/db";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { eq, and, desc, lt, or, like, sql } from "drizzle-orm";
import type { UsuariosWithSucursal } from "$lib/server/db/schema";

export class UsuariosService {
  /**
   * Find usuario by casillero (numeric)
   * @param casillero - The numeric casillero identifier
   * @param sucursalId - Optional branch filter
   */
  async findByCasillero(
    casillero: number,
    sucursalId?: number
  ): Promise<UsuariosWithSucursal | undefined> {
    const conditions = [
      eq(usuarios.casillero, casillero),
      eq(usuarios.archivado, false),
    ];

    if (sucursalId) {
      conditions.push(eq(usuarios.sucursalId, sucursalId));
    }

    const result = await db.query.usuarios.findFirst({
      where: and(...conditions),
      with: {
        sucursal: true,
      },
    });

    return result;
  }

  /**
   * Find usuario by codificacion (alphanumeric - for corporate clients)
   * @param codificacion - The corporate client code
   * @param sucursalId - Optional branch filter
   */
  async findByCodificacion(
    codificacion: string,
    sucursalId?: number
  ): Promise<UsuariosWithSucursal | undefined> {
    const conditions = [
      eq(usuarios.codificacion, codificacion.toUpperCase()),
      eq(usuarios.archivado, false),
    ];

    if (sucursalId) {
      conditions.push(eq(usuarios.sucursalId, sucursalId));
    }

    const result = await db.query.usuarios.findFirst({
      where: and(...conditions),
      with: {
        sucursal: true,
      },
    });

    return result;
  }

  /**
   * Find usuario by ID
   * @param id - The usuario ID
   */
  async findById(id: number): Promise<UsuariosWithSucursal | undefined> {
    return await db.query.usuarios.findFirst({
      where: and(eq(usuarios.id, id), eq(usuarios.archivado, false)),
      with: {
        sucursal: true,
      },
    });
  }

  /**
   * Get paginated list of usuarios
   * @param options - Pagination and filter options
   */
  async list(options: {
    limit?: number;
    cursor?: number;
    sucursalId?: number;
    searchTerm?: string;
  }) {
    const { limit = 100, cursor, sucursalId, searchTerm } = options;

    const conditions = [eq(usuarios.archivado, false)];

    if (cursor) {
      conditions.push(lt(usuarios.casillero, cursor));
    }

    if (sucursalId) {
      conditions.push(eq(usuarios.sucursalId, sucursalId));
    }

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      conditions.push(
        or(
          like(usuarios.nombre, searchPattern),
          like(usuarios.apellido, searchPattern),
          like(usuarios.cedula, searchPattern),
          sql`CAST(${usuarios.casillero} AS CHAR) LIKE ${searchPattern}`
        )!
      );
    }

    const results = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        correo: usuarios.correo,
        casillero: usuarios.casillero,
        cedula: usuarios.cedula,
        telefono: usuarios.telefono,
        nacimiento: usuarios.nacimiento,
        sexo: usuarios.sexo,
        tipo: usuarios.tipo,
        precio: usuarios.precio,
        codificacion: usuarios.codificacion,
        sucursal: sucursales.sucursal,
        sucursalId: sucursales.sucursalId,
      })
      .from(usuarios)
      .where(and(...conditions))
      .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
      .orderBy(desc(usuarios.casillero))
      .limit(limit);

    return results;
  }

  /**
   * Create a new usuario
   */
  async create(data: {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    correo: string;
    casillero: number;
    sucursalId: number;
    nacimiento: Date;
    sexo?: "Masculino" | "Femenino" | "Otros";
    precio?: number;
    tipo: "REGULAR" | "ESPECIAL" | "CORPORATIVO";
    codificacion?: string | null;
  }) {
    const [result] = await db.insert(usuarios).values(data);
    return result.insertId;
  }

  /**
   * Update an existing usuario
   */
  async update(
    id: number,
    data: {
      nombre?: string;
      apellido?: string;
      cedula?: string;
      telefono?: string;
      correo?: string;
      casillero?: number;
      sucursalId?: number;
      sexo?: "Masculino" | "Femenino" | "Otros";
      precio?: number;
      tipo?: "REGULAR" | "ESPECIAL" | "CORPORATIVO";
      codificacion?: string | null;
    }
  ) {
    await db.update(usuarios).set(data).where(eq(usuarios.id, id));
  }

  /**
   * Archive a usuario (soft delete)
   */
  async archive(id: number) {
    await db
      .update(usuarios)
      .set({
        archivado: true,
        archivadoAt: new Date(),
      })
      .where(eq(usuarios.id, id));
  }

  /**
   * Check if casillero is already taken
   */
  async isCasilleroTaken(casillero: number, excludeId?: number): Promise<boolean> {
    const conditions = [eq(usuarios.casillero, casillero)];

    if (excludeId) {
      conditions.push(sql`${usuarios.id} != ${excludeId}`);
    }

    const result = await db.query.usuarios.findFirst({
      where: and(...conditions),
    });

    return !!result;
  }

  /**
   * Check if codificacion is already taken
   */
  async isCodificacionTaken(
    codificacion: string,
    excludeId?: number
  ): Promise<boolean> {
    const conditions = [eq(usuarios.codificacion, codificacion.toUpperCase())];

    if (excludeId) {
      conditions.push(sql`${usuarios.id} != ${excludeId}`);
    }

    const result = await db.query.usuarios.findFirst({
      where: and(...conditions),
    });

    return !!result;
  }
}

// Export singleton instance
export const usuariosService = new UsuariosService();
