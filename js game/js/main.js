// Импорт модулей и данных
import { Pokemon } from './Pokemon.js';
import { pokemons } from './pokemons.js';

document.addEventListener('DOMContentLoaded', () => {
    const logsDiv = document.getElementById('logs');
    const startButton = document.getElementById('start-game');
    const switchPokemonButton = document.getElementById('switch-pokemon'); // Кнопка для смены покемона
    const victoryCountDisplay = document.getElementById('victory-count');
    let victoryCount = 0;
    let character, enemy;
    let attackCount = 0;
    const maxAttacks = 50;
    const maxLogs = 10;
    const logMessages = [];

    // Функция добавления логов
    const addLog = (message) => {
        logMessages.push(message);
        if (logMessages.length > maxLogs) {
            logMessages.shift();
        }
        logsDiv.innerHTML = '';
        logMessages.forEach(log => {
            const logElement = document.createElement('p');
            logElement.textContent = log;
            logsDiv.appendChild(logElement);
        });
    };

    // Функция начала игры
    const startGame = () => {
        startButton.style.display = 'none';
        switchPokemonButton.style.display = 'block'; // Показываем кнопку смены покемона
        document.querySelector('.control').style.display = 'block';

        const randomIndex1 = Math.floor(Math.random() * pokemons.length);
        let randomIndex2;
        do {
            randomIndex2 = Math.floor(Math.random() * pokemons.length);
        } while (randomIndex1 === randomIndex2);

        // Создание персонажа и врага с атаками
        character = new Pokemon(
            pokemons[randomIndex1].name,
            pokemons[randomIndex1].hp,
            'progressbar-character',
            'health-character',
            addLog,
            pokemons[randomIndex1].attacks // Передаем атаки
        );
        enemy = new Pokemon(
            pokemons[randomIndex2].name,
            pokemons[randomIndex2].hp,
            'progressbar-enemy',
            'health-enemy',
            addLog,
            pokemons[randomIndex2].attacks // Передаем атаки
        );

        // Обновление интерфейса
        document.querySelector('.character').style.display = 'block';
        document.querySelector('.enemy').style.display = 'block';
        document.getElementById('character-image').src = pokemons[randomIndex1].img;
        document.getElementById('enemy-image').src = pokemons[randomIndex2].img;
        document.getElementById('name-character').textContent = character.name;
        document.getElementById('name-enemy').textContent = enemy.name;
        character.updateHealthBar();
        enemy.updateHealthBar();

        // Обновление кнопок атаки
        updateAttackButtons(character);
    };

    // Обновление названий кнопок атак
    const updateAttackButtons = (pokemon) => {
        const normalAttackButton = document.getElementById('btn-kick');
        const strongAttackButton = document.getElementById('btn-kick-strong');

        // Проверка наличия атак
        if (pokemon.attacks && pokemon.attacks.length > 0) {
            normalAttackButton.disabled = false;
            normalAttackButton.textContent = `${pokemon.attacks[0].name} (Урон: ${pokemon.attacks[0].minDamage}-${pokemon.attacks[0].maxDamage})`;
            
            if (pokemon.attacks.length > 1) {
                strongAttackButton.disabled = false;
                strongAttackButton.textContent = `${pokemon.attacks[1].name} (Урон: ${pokemon.attacks[1].minDamage}-${pokemon.attacks[1].maxDamage})`;
            } else {
                strongAttackButton.disabled = true;
            }
        } else {
            normalAttackButton.disabled = true;
            strongAttackButton.disabled = true;
        }
    };

    // Функция обычного удара
    const onKick = () => {
        if (!character.attacks || character.attacks.length < 1) {
            addLog(`${character.name} не может атаковать!`);
            return;
        }

        if (attackCount >= maxAttacks) {
            addLog('Достигнуто максимальное количество ударов!');
            return;
        }
        attackCount++;

        const attack = character.attacks[0];
        const damage = Math.floor(Math.random() * (attack.maxDamage - attack.minDamage + 1)) + attack.minDamage;
        enemy.receiveDamage(damage, character.name);
        addLog(`${character.name} атакует ${enemy.name} с ${damage} урона!`);

        // Ответный удар врага
        enemyAttack();

        checkGameOver();
    };

    // Функция сильного удара
    const onKickStrong = () => {
        if (!character.attacks || character.attacks.length < 2) {
            addLog(`${character.name} не может провести сильную атаку!`);
            return;
        }

        if (attackCount >= maxAttacks) {
            addLog('Достигнуто максимальное количество ударов!');
            return;
        }
        attackCount++;

        const attack = character.attacks[1];
        const damage = Math.floor(Math.random() * (attack.maxDamage - attack.minDamage + 1)) + attack.minDamage;
        enemy.receiveDamage(damage, character.name);
        addLog(`${character.name} сильно атакует ${enemy.name} с ${damage} урона!`);

        // Ответный удар врага
        enemyAttack();

        checkGameOver();
    };

    // Ответный удар врага
    const enemyAttack = () => {
        const attack = enemy.attacks[0]; // Выбираем обычную атаку врага
        const damage = Math.floor(Math.random() * (attack.maxDamage - attack.minDamage + 1)) + attack.minDamage;
        character.receiveDamage(damage, enemy.name);
        addLog(`${enemy.name} атакует ${character.name} с ${damage} урона!`);
    };

    // Проверка окончания игры
    const checkGameOver = () => {
        if (character.health <= 0 && enemy.health <= 0) {
            addLog('Ничья! Все участники боя потеряли здоровье!');
            alert('Draw! Everyone lost!');
            resetGame();
        } else if (character.health <= 0) {
            addLog(`Игра закончена! ${character.name} проиграл!`);
            alert(`Game Over! ${character.name} has lost!`);
            resetGame();
        } else if (enemy.health <= 0) {
            addLog(`Поздравляем! ${character.name} победил ${enemy.name}!`);
            victoryCount++;
            victoryCountDisplay.textContent = victoryCount;
            alert(`Congratulations! ${character.name} has won!`);
            character.health += 20;
            character.updateHealthBar();
            startNewEnemy();
        }
    };

    // Начало боя с новым врагом
    const startNewEnemy = () => {
        let newEnemyIndex;
        do {
            newEnemyIndex = Math.floor(Math.random() * pokemons.length);
        } while (pokemons[newEnemyIndex].name === enemy.name);

        enemy = new Pokemon(
            pokemons[newEnemyIndex].name,
            pokemons[newEnemyIndex].hp,
            'progressbar-enemy',
            'health-enemy',
            addLog,
            pokemons[newEnemyIndex].attacks
        );
        document.getElementById('enemy-image').src = pokemons[newEnemyIndex].img;
        document.getElementById('name-enemy').textContent = enemy.name;
        enemy.updateHealthBar();

        updateAttackButtons(character);
    };

    // Функция для смены покемона
    const switchPokemon = () => {
        if (pokemons.length <= 1) return; // Если недостаточно покемонов для смены

        let newCharacterIndex;
        do {
            newCharacterIndex = Math.floor(Math.random() * pokemons.length);
        } while (pokemons[newCharacterIndex].name === character.name);

        // Создание нового покемона
        character = new Pokemon(
            pokemons[newCharacterIndex].name,
            pokemons[newCharacterIndex].hp,
            'progressbar-character',
            'health-character',
            addLog,
            pokemons[newCharacterIndex].attacks
        );

        // Обновление интерфейса
        document.getElementById('character-image').src = pokemons[newCharacterIndex].img;
        document.getElementById('name-character').textContent = character.name;
        character.updateHealthBar();
        updateAttackButtons(character);

        addLog(`Смена покемона на ${character.name}`);
    };

    startButton.addEventListener('click', startGame);
    switchPokemonButton.addEventListener('click', switchPokemon); // Обработчик для кнопки смены покемона
    document.getElementById('btn-kick').addEventListener('click', onKick);
    document.getElementById('btn-kick-strong').addEventListener('click', onKickStrong);

    // Сброс игры
    const resetGame = () => {
        location.reload();
    };
});



