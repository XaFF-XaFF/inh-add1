import type { BattleData, BattleState, BattleStep, Move, Pokemon, TypeRelations } from '../types';

export function getEffectiveness(defenderTypes: string[], relations: TypeRelations): number {
  return defenderTypes.reduce((multiplier, type) => {
    if (relations.noDamage.includes(type)) return 0;
    if (relations.doubleDamage.includes(type)) return multiplier * 2;
    if (relations.halfDamage.includes(type)) return multiplier * 0.5;
    return multiplier;
  }, 1);
}

export function calculateDamage(
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  effectiveness: number,
  random = Math.random,
): number {
  if (effectiveness === 0) return 0;
  const special = move.damageClass === 'special';
  const attack = special ? attacker.specialAttack : attacker.attack;
  const defense = special ? defender.specialDefense : defender.defense;
  const level = 50;
  const base = Math.floor(Math.floor((Math.floor(2 * level / 5) + 2) * (move.power ?? 0) * attack / defense) / 50) + 2;
  const roll = (85 + Math.floor(random() * 16)) / 100;
  const stab = move.name !== 'struggle' && attacker.types.includes(move.type) ? 1.5 : 1;
  const rolled = Math.floor(base * roll);
  const withStab = Math.ceil(rolled * stab - 0.5);
  return Math.max(1, Math.floor(withStab * effectiveness));
}

export function createBattle(data: BattleData): BattleState {
  return {
    playerHp: data.player.pokemon.hp,
    opponentHp: data.opponent.pokemon.hp,
    turns: 0,
    log: ['Choose a move to begin.'],
    winner: null,
    steps: [],
  };
}

export function playTurn(
  state: BattleState,
  data: BattleData,
  chosenMove: Move,
  random = Math.random,
): BattleState {
  if (state.winner) return state;
  const player = data.player.pokemon;
  const opponent = data.opponent.pokemon;
  const opponentMove = data.opponent.moves[Math.floor(random() * data.opponent.moves.length)];
  const playerFirst = player.speed === opponent.speed ? random() < 0.5 : player.speed > opponent.speed;
  let playerHp = state.playerHp;
  let opponentHp = state.opponentHp;
  const messages = [`Turn ${state.turns + 1}`];
  const steps: BattleStep[] = [];

  function attack(isPlayer: boolean) {
    const attacker = isPlayer ? player : opponent;
    const defender = isPlayer ? opponent : player;
    const selected = isPlayer ? chosenMove : opponentMove;
    const move = selected.power && selected.power > 0 ? selected : data.struggle;
    const label = isPlayer ? 'Your' : 'Opponent';
    const firstMessage = messages.length;
    let lostHp = 0;
    let recoil = 0;
    if (move !== selected) messages.push(`${selected.name} has no power. Using Struggle.`);
    if (move.name !== 'struggle' && move.accuracy !== null && random() * 100 >= move.accuracy) {
      messages.push(`${label} ${attacker.name} used ${move.name}: miss.`);
    } else {
      const effectiveness = move.name === 'struggle' ? 1 : getEffectiveness(defender.types, data.relations[move.type]);
      const damage = calculateDamage(attacker, defender, move, effectiveness, random);
      lostHp = Math.min(damage, isPlayer ? opponentHp : playerHp);
      if (isPlayer) opponentHp -= lostHp;
      else playerHp -= lostHp;
      messages.push(`${label} ${attacker.name} used ${move.name}: hit for ${lostHp} HP.`);
      if (effectiveness === 0) messages.push('No effect.');
      else if (effectiveness > 1) messages.push('Super effective!');
      else if (effectiveness < 1) messages.push('Not very effective.');
      if (move.name === 'struggle') {
        recoil = Math.min(isPlayer ? playerHp : opponentHp, Math.max(1, Math.round(attacker.hp / 4)));
        if (isPlayer) playerHp -= recoil;
        else opponentHp -= recoil;
        messages.push(`${label} ${attacker.name} took ${recoil} HP recoil.`);
      }
    }
    steps.push({
      attacker: isPlayer ? 'player' : 'opponent', move: move.name,
      playerHp, opponentHp, damage: lostHp, recoil,
      messages: messages.slice(firstMessage),
    });
  }

  attack(playerFirst);
  if (playerHp > 0 && opponentHp > 0) attack(!playerFirst);
  let winner: BattleState['winner'] = null;
  if (playerHp === 0 && opponentHp === 0) winner = 'draw';
  else if (opponentHp === 0) winner = 'player';
  else if (playerHp === 0) winner = 'opponent';
  if (winner) {
    messages.push(winner === 'draw' ? 'Both Pokemon fainted. Draw.' : `${winner === 'player' ? 'Your' : 'Opponent'} Pokemon wins!`);
  }
  return { playerHp, opponentHp, turns: state.turns + 1, log: [...messages, ...state.log], winner, steps };
}
