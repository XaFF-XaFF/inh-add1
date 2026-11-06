export type PokemonName = { id: number; name: string };

export type Pokemon = PokemonName & {
  image: string | null;
  types: string[];
  moves: string[];
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type Move = {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  type: string;
  damageClass: string;
};

export type TypeRelations = {
  noDamage: string[];
  halfDamage: string[];
  doubleDamage: string[];
};

export type Fighter = { pokemon: Pokemon; moves: Move[] };

export type BattleSide = 'player' | 'opponent';

export type BattleStep = {
  attacker: BattleSide;
  move: string;
  playerHp: number;
  opponentHp: number;
  damage: number;
  recoil: number;
  messages: string[];
};

export type BattleAction = { step: BattleStep; phase: 'attack' | 'damage' | 'faint' };

export type BattleData = {
  player: Fighter;
  opponent: Fighter;
  struggle: Move;
  relations: Record<string, TypeRelations>;
};

export type BattleState = {
  playerHp: number;
  opponentHp: number;
  turns: number;
  log: string[];
  winner: 'player' | 'opponent' | 'draw' | null;
  steps: BattleStep[];
};

export type BattleResult = {
  id: string;
  player: string;
  opponent: string;
  winner: string;
  turns: number;
};

export type HistoryRow = BattleResult & { created_at: string };
