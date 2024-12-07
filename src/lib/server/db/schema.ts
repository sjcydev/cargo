import {
  mysqlTable,
  varchar,
  datetime,
  int,
  timestamp,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

import { relations } from "drizzle-orm";
import type { InferResultType } from "./extras";

export const sucursales = mysqlTable("sucursales", {
  sucursalId: int("sucursalId").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  precio: float("precio").default(2.75),
});

export const users = mysqlTable("users", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  nombre: varchar("nombre", { length: 100 }),
  apellido: varchar("apellido", { length: 100 }),
  username: varchar("username", {
    length: 100,
  }).unique(),
  passwordHash: varchar("passwordHash", {
    length: 255,
  }).notNull(),
  passwordUpdated: boolean("passwordUpdated").default(false),
  correo: varchar("correo", { length: 255 }).notNull(),
  rol: varchar("rol", {
    length: 10,
    enum: ["ADMIN", "SECRETARIA", "EMPLEADO"],
  })
    .default("EMPLEADO")
    .notNull(),
  sucursalId: int("sucursalId").references(() => sucursales.sucursalId),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const session = mysqlTable("session", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 255,
  })
    .notNull()
    .references(() => users.id),
  expiresAt: datetime("expires_at").notNull(),
});

export const usuarios = mysqlTable("usuarios", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  apellido: varchar("apellido", { length: 100 }).notNull(),
  cedula: varchar("cedula", { length: 20 }).notNull(),
  telefono: varchar("telefono", { length: 25 }).notNull(),
  casillero: int("casillero").unique(),
  sucursalId: int("sucursalId")
    .references(() => sucursales.sucursalId)
    .notNull(),
  nacimiento: timestamp("nacimiento").defaultNow(),
  correo: varchar("correo", { length: 255 }).notNull(),
  sexo: varchar("sexo", {
    enum: ["Masculino", "Femenino", "Otros"],
    length: 9,
  }).default("Otros"),
  precio: float("precio").default(2.75),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const facturas = mysqlTable("facturas", {
  facturaId: int("facturaId").autoincrement().primaryKey(),
  casillero: int("casillero"),
  fecha: varchar("fecha", { length: 50 }),
  pagado: boolean("pagado").default(false),
  clienteId: int("clienteId").references(() => usuarios.id),
  total: float("total").default(0),
  metodoDePago: varchar("metodoDePago", {
    length: 15,
    enum: ["transferencia", "efectivo", "yappy", "tarjeta", "nulo"],
  }).default("nulo"),
  createdAt: timestamp("createdAt").defaultNow(),
  pagadoAt: timestamp("pagadoAt"),
  sucursalId: int("sucursalId")
    .references(() => sucursales.sucursalId)
    .notNull(),
  retirados: boolean("retirados").default(false),
});

export const reportes = mysqlTable("reportes", {
  reporteId: int("reporteId").autoincrement().primaryKey(),
  fechaInicial: datetime("fechaInicial"),
  fechaFinal: datetime("fechaFinal"),
  facturas: int("facturas"),
  total: float("total"),
  sucursalId: int("sucursalId")
    .references(() => sucursales.sucursalId)
    .notNull(),
  metodoDePago: json("metodoDePago"),
});

export const trackings = mysqlTable("trackings", {
  trackingId: int("trackingId").autoincrement().primaryKey(),
  facturaId: int("facturaId").references(() => facturas.facturaId),
  numeroTracking: varchar("numeroTracking", { length: 255 }),
  peso: int("peso"),
  base: float("base"),
  precio: float("precio"),
  retirado: boolean("retirado").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  sucursal: one(sucursales, {
    fields: [users.sucursalId],
    references: [sucursales.sucursalId],
  }),
}));

export const usuariosRelations = relations(usuarios, ({ many, one }) => ({
  facturas: many(facturas),
  sucursal: one(sucursales, {
    fields: [usuarios.sucursalId],
    references: [sucursales.sucursalId],
  }),
}));

export const facturasRelations = relations(facturas, ({ one, many }) => ({
  cliente: one(usuarios, {
    fields: [facturas.casillero],
    references: [usuarios.casillero],
  }),
  trackings: many(trackings),
  sucursal: one(sucursales, {
    fields: [facturas.sucursalId],
    references: [sucursales.sucursalId],
  }),
}));

export const trackingsRelations = relations(trackings, ({ one }) => ({
  factura: one(facturas, {
    fields: [trackings.facturaId],
    references: [facturas.facturaId],
  }),
}));

export const sucursalesRelations = relations(sucursales, ({ many }) => ({
  usuarios: many(usuarios),
  user: many(users),
}));

export type Sucursales = typeof sucursales.$inferSelect;
export type Usuarios = typeof usuarios.$inferSelect;
export type NewUsuarios = typeof usuarios.$inferInsert;
export type Facturas = typeof facturas.$inferSelect;
export type NewFacturas = typeof facturas.$inferInsert;
export type Trackings = typeof trackings.$inferSelect;
export type NewTrackings = typeof trackings.$inferInsert;
export type Reportes = typeof reportes.$inferSelect;
export type NewReportes = typeof reportes.$inferInsert;

export type UsuariosWithSucursal = InferResultType<
  "usuarios",
  { sucursal: true }
>;

export type Session = typeof session.$inferSelect;
export type User = typeof users.$inferSelect;
