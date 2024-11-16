import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Heart, Swords, GemIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CELL_TYPES = {
  NORMAL: 'normal',
  DANGER: 'danger',
  TREASURE: 'treasure'
};

const MONSTER_TYPES = {
  UNICORN: { name: '独角兽', minAtk: 30, maxAtk: 50, minHp: 150, maxHp: 250 },
  GECKO: { name: '壁虎小强', minAtk: 20, maxAtk: 35, minHp: 100, maxHp: 180 },
  SQUIRREL: { name: '小松鼠', minAtk: 5, maxAtk: 10, minHp: 20, maxHp: 50 }
};

const TREASURE_TYPES = {
  POWER_POTION: { name: '草泥马力量药剂', effect: '攻击力+5' },
  HP_POTION: { name: '草泥马HP药剂', effect: 'HP+130' },
  MOVEMENT_POTION: { name: '凌波微步汤', effect: '随机前进2-6格' }
};

const DeadlyDiceRPG = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [boardLength, setBoardLength] = useState(0);
  const [position, setPosition] = useState(0);
  const [currentDice, setCurrentDice] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [diceRolls, setDiceRolls] = useState(0);
  const [player, setPlayer] = useState({
    hp: 200,
    attack: 30,
    monstersKilled: 0,
    treasuresFound: 0
  });
  const [gameLog, setGameLog] = useState([]);

  // 初始化游戏
  const initializeGame = () => {
    const length = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
    setBoardLength(length);
    setPosition(0);
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setDiceRolls(0);
    setPlayer({
      hp: 200,
      attack: 30,
      monstersKilled: 0,
      treasuresFound: 0
    });
    setGameLog([`游戏开始！路程总长度：${length}格`]);
  };

  // 获取随机格子类型
  const getRandomCellType = () => {
    const rand = Math.random();
    if (rand < 0.2) return CELL_TYPES.DANGER;
    if (rand < 0.35) return CELL_TYPES.TREASURE;
    return CELL_TYPES.NORMAL;
  };

  // 获取随机怪物
  const getRandomMonster = () => {
    const rand = Math.random();
    if (rand < 0.2) return MONSTER_TYPES.UNICORN;
    if (rand < 0.5) return MONSTER_TYPES.GECKO;
    return MONSTER_TYPES.SQUIRREL;
  };

  // 获取随机宝物
  const getRandomTreasure = () => {
    const rand = Math.random();
    if (rand < 0.3) return TREASURE_TYPES.POWER_POTION;
    if (rand < 0.6) return TREASURE_TYPES.HP_POTION;
    return TREASURE_TYPES.MOVEMENT_POTION;
  };

  // 战斗系统
  const battle = (monster) => {
    const monsterHp = Math.floor(Math.random() * (monster.maxHp - monster.minHp + 1)) + monster.minHp;
    const monsterAtk = Math.floor(Math.random() * (monster.maxAtk - monster.minAtk + 1)) + monster.minAtk;
    let currentPlayerHp = player.hp;
    let currentMonsterHp = monsterHp;
    let battleLog = [`遭遇${monster.name}！(攻击力:${monsterAtk}, HP:${monsterHp})`];

    while (currentPlayerHp > 0 && currentMonsterHp > 0) {
      // 玩家攻击
      const playerDamage = Math.floor(player.attack * (0.9 + Math.random() * 0.2));
      currentMonsterHp -= playerDamage;
      battleLog.push(`你造成${playerDamage}点伤害！`);

      // 怪物攻击
      if (currentMonsterHp > 0) {
        const monsterDamage = Math.floor(monsterAtk * (0.9 + Math.random() * 0.2));
        currentPlayerHp -= monsterDamage;
        battleLog.push(`${monster.name}造成${monsterDamage}点伤害！`);
      }
    }

    if (currentPlayerHp > 0) {
      setPlayer(prev => ({
        ...prev,
        hp: currentPlayerHp,
        monstersKilled: prev.monstersKilled + 1
      }));
      battleLog.push('战斗胜利！');
    } else {
      setGameOver(true);
      battleLog.push('你被击败了...');
    }

    setGameLog(prev => [...prev, ...battleLog]);
    return currentPlayerHp > 0;
  };

  // 处理宝物效果
  const handleTreasure = (treasure) => {
    const log = [`发现${treasure.name}！${treasure.effect}`];
    setPlayer(prev => {
      const updated = { ...prev, treasuresFound: prev.treasuresFound + 1 };
      if (treasure === TREASURE_TYPES.POWER_POTION) {
        updated.attack += 5;
        log.push(`攻击力提升到${updated.attack}`);
      } else if (treasure === TREASURE_TYPES.HP_POTION) {
        updated.hp += 130;
        log.push(`HP恢复到${updated.hp}`);
      } else {
        const extraSteps = Math.floor(Math.random() * 5) + 2;
        setPosition(prev => Math.min(prev + extraSteps, boardLength));
        log.push(`额外前进${extraSteps}格！`);
      }
      return updated;
    });
    setGameLog(prev => [...prev, ...log]);
  };

  // 掷骰子
  const rollDice = () => {
    if (gameOver || isRolling) return;
    
    setIsRolling(true);
    setDiceRolls(prev => prev + 1);
    
    const rollInterval = setInterval(() => {
      setCurrentDice(Math.floor(Math.random() * 6) + 1);
    }, 50);

    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
      
      const steps = Math.floor(Math.random() * 6) + 1;
      setCurrentDice(steps);
      
      const newPosition = Math.min(position + steps, boardLength);
      setPosition(newPosition);
      setGameLog(prev => [...prev, `掷出${steps}点，前进到第${newPosition}格`]);

      if (newPosition === boardLength) {
        setVictory(true);
        setGameOver(true);
        return;
      }

      const cellType = getRandomCellType();
      if (cellType === CELL_TYPES.DANGER) {
        const monster = getRandomMonster();
        if (!battle(monster)) return;
      } else if (cellType === CELL_TYPES.TREASURE) {
        const treasure = getRandomTreasure();
        handleTreasure(treasure);
      }
    }, 1000);
  };

  const diceIcons = {
    1: <Dice1 size={48} />,
    2: <Dice2 size={48} />,
    3: <Dice3 size={48} />,
    4: <Dice4 size={48} />,
    5: <Dice5 size={48} />,
    6: <Dice6 size={48} />
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">夺命骰子RPG</h1>
      
      {!gameStarted ? (
        <button
          onClick={initializeGame}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          开始游戏
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-2">角色状态</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <Heart className="text-red-500 mr-2" />
                  <span>HP: {player.hp}</span>
                </div>
                <div className="flex items-center">
                  <Swords className="text-blue-500 mr-2" />
                  <span>攻击力: {player.attack}</span>
                </div>
                <div className="flex items-center">
                  <span>击杀数: {player.monstersKilled}</span>
                </div>
                <div className="flex items-center">
                  <GemIcon className="text-yellow-500 mr-2" />
                  <span>宝物: {player.treasuresFound}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-2">游戏进度</h2>
              <div className="flex flex-col">
                <div className="mb-2">
                  进度: {position}/{boardLength} ({Math.floor(position/boardLength*100)}%)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{width: `${Math.floor(position/boardLength*100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className={`p-4 bg-white rounded-lg shadow ${isRolling ? 'animate-bounce' : ''}`}>
              {diceIcons[currentDice]}
            </div>
          </div>

          {gameOver ? (
            <div className="text-center mb-6">
              {victory ? (
                <Alert className="mb-4 bg-green-100">
                  <AlertTitle>胜利！</AlertTitle>
                  <AlertDescription>
                    路程: {boardLength}格<br/>
                    击杀怪物: {player.monstersKilled}<br/>
                    获得宝物: {player.treasuresFound}<br/>
                    掷骰次数: {diceRolls}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-4 bg-red-100">
                  <AlertTitle>游戏结束</AlertTitle>
                  <AlertDescription>
                    你在第{position}格被击败了...
                  </AlertDescription>
                </Alert>
              )}
              <button
                onClick={initializeGame}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                重新开始
              </button>
            </div>
          ) : (
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isRolling ? '骰子滚动中...' : '掷骰子'}
            </button>
          )}

          <div className="w-full mt-6 bg-white rounded-lg shadow p-4 max-h-60 overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">游戏日志</h2>
            <div className="space-y-1">
              {gameLog.map((log, index) => (
                <div key={index} className="text-sm">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeadlyDiceRPG;