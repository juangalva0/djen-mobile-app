import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, savedFilters, syncHistory, SavedFilter, InsertSavedFilter, SyncHistory, InsertSyncHistory } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funcoes para gerenciar filtros salvos

export async function getSavedFilter(filterId: number): Promise<SavedFilter | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get filter: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(savedFilters)
    .where(eq(savedFilters.id, filterId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSavedFilters(): Promise<SavedFilter[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get filters: database not available");
    return [];
  }

  return await db.select().from(savedFilters);
}

export async function getUserFilters(userId: number): Promise<SavedFilter[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user filters: database not available");
    return [];
  }

  return await db.select().from(savedFilters).where(eq(savedFilters.userId, userId));
}

export async function createSavedFilter(data: InsertSavedFilter): Promise<SavedFilter | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create filter: database not available");
    return undefined;
  }

  try {
    await db.insert(savedFilters).values(data);
    const result = await db
      .select()
      .from(savedFilters)
      .where(eq(savedFilters.userId, data.userId))
      .orderBy((t) => t.id)
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create filter:", error);
    throw error;
  }
}

export async function updateSavedFilter(
  filterId: number,
  data: Partial<InsertSavedFilter>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update filter: database not available");
    return;
  }

  try {
    await db.update(savedFilters).set(data).where(eq(savedFilters.id, filterId));
  } catch (error) {
    console.error("[Database] Failed to update filter:", error);
    throw error;
  }
}

export async function deleteSavedFilter(filterId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete filter: database not available");
    return;
  }

  try {
    await db.delete(savedFilters).where(eq(savedFilters.id, filterId));
  } catch (error) {
    console.error("[Database] Failed to delete filter:", error);
    throw error;
  }
}

export async function recordSyncHistory(data: InsertSyncHistory): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record sync history: database not available");
    return;
  }

  try {
    await db.insert(syncHistory).values(data);
  } catch (error) {
    console.error("[Database] Failed to record sync history:", error);
    throw error;
  }
}

export async function getSyncHistory(filterId: number, limit: number = 10): Promise<SyncHistory[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sync history: database not available");
    return [];
  }

  return await db
    .select()
    .from(syncHistory)
    .where(eq(syncHistory.filterId, filterId))
    .limit(limit);
}

export async function getFilterResults(filterId: number): Promise<any[]> {
  return [];
}

export async function saveFilterResults(filterId: number, results: any[]): Promise<void> {
  // Placeholder para salvar resultados
}
