import * as SQLite from 'expo-sqlite';

import type { BattleResult, HistoryRow } from '@/types';

let database: SQLite.SQLiteDatabase | undefined;

function getDatabase() {
  if (!database) {
    const db = SQLite.openDatabaseSync('battles.db');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS battles (
        id TEXT PRIMARY KEY,
        player TEXT NOT NULL,
        opponent TEXT NOT NULL,
        winner TEXT NOT NULL,
        turns INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `);
    database = db;
  }
  return database;
}

export async function getHistory(): Promise<HistoryRow[]> {
  return getDatabase().getAllAsync<HistoryRow>('SELECT * FROM battles ORDER BY created_at DESC');
}

export async function saveBattle(result: BattleResult): Promise<void> {
  await getDatabase().runAsync(
    'INSERT OR IGNORE INTO battles (id, player, opponent, winner, turns) VALUES (?, ?, ?, ?, ?)',
    [result.id, result.player, result.opponent, result.winner, result.turns],
  );
}
