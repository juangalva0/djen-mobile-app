import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de filtros salvos pelos usuários
export const savedFilters = mysqlTable("savedFilters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Dados do filtro (JSON com critérios de busca)
  filterData: json("filterData").notNull(),
  // Última data de sincronização
  lastSyncedAt: timestamp("lastSyncedAt"),
  // Último ID/timestamp de resultado para evitar duplicatas
  lastResultId: varchar("lastResultId", { length: 255 }),
  // Se notificações estão ativadas para este filtro
  notificationsEnabled: int("notificationsEnabled").default(1).notNull(),
  // Número de WhatsApp para notificações (pode ser diferente do perfil)
  whatsappNumber: varchar("whatsappNumber", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

// Tabela de histórico de sincronização (para auditoria e debug)
export const syncHistory = mysqlTable("syncHistory", {
  id: int("id").autoincrement().primaryKey(),
  filterId: int("filterId").notNull(),
  userId: int("userId").notNull(),
  // Número de novos resultados encontrados
  newResultsCount: int("newResultsCount").default(0).notNull(),
  // Se notificação foi enviada
  notificationSent: int("notificationSent").default(0).notNull(),
  // Status da sincronização (success, error, no_changes)
  status: mysqlEnum("status", ["success", "error", "no_changes"]).notNull(),
  // Mensagem de erro (se houver)
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncHistory = typeof syncHistory.$inferSelect;
export type InsertSyncHistory = typeof syncHistory.$inferInsert;
