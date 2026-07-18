import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";



const app = initializeApp(firebaseConfig);
const db = getDatabase(app); 
const myhp = document.getElementById("myhp");
const tekihp = document.getElementById("tekihp");
const player1Mp = document.getElementById("player1-mp");
const player2Mp = document.getElementById("player2-mp");

//HP記憶
let tekicurrenthp = Number(tekihp.textContent);
let mycurrenthp = Number(myhp.textContent);
let tekicurrentmp = 20;
let mycurrentmp = 20;


// function setTurn(isMyTurn) {
//     const myButtons = document.querySelectorAll("#my-hand button");
//     const tekiButtons = document.querySelectorAll("#teki-hand button");

//     myButtons.forEach(btn => btn.disabled = !isMyTurn);
//     tekiButtons.forEach(btn => btn.disabled = !isMyTurn);
// }

function endGame() {
    const myButtons = document.querySelectorAll("#my-hand button, #my-magic-hand button");
    const tekiButtons = document.querySelectorAll("#teki-hand button, #teki-magic-hand button");

    myButtons.forEach(btn => btn.disabled = true);
    tekiButtons.forEach(btn => btn.disabled = true);
}

setTurn(true);

//防御力
let mydefense = 0;
let tekidefense = 0;

const CARDS = {
    //攻撃系
    pencil: { name:"シャーペン", type:"attack", value: 10, description:"相手に攻撃力10を与えることができる。", imgSrc: "images/attack/pen.png"},
    hacking: { name:"ハッキング", type:"attack", element:"control", value: 0, description:"相手を3ターンランダムに行動させることができる。", imgSrc: "images/attack/kontorora.png"},
    mojibake: { name:"文字化けファイル", type:"attack", value: 0, description:"相手の手札からカードを一枚消すことができる。", imgSrc: "images/attack/mojibake.png"},
    kusaifuku: { name:"臭い服", type:"attack", value: 5, description:"部屋干しのにおいが臭すぎて気絶。5ダメージあたることができる。", imgSrc: "images/attack/kusaifuku.png"},
    gojyuukyuu: { name:"59点のテスト", type:"attack", value: 6, description:"60点から合格です。", imgSrc: "images/attack/59ten.png"},
    kanningu: { name:"カンニング", type:"attack", value: 12, hitRate: 0.3, description:"30%の確率で12ダメージを与えることができる。", imgSrc: "images/attack/kanningu.png"},
    

    //属性攻撃系
    seisankari: { name:"青酸カリ", type:"attack", element:"material", value: 8, description:"1ダメージでも受けると即死する。", imgSrc: "images/attack/seisankari.png"},
    ensan: { name:"塩酸", type:"attack", element:"material", value: 3, description:"1ダメージでも受けると即死する。", imgSrc: "images/attack/ensan.png"},
    yousetu: { name:"溶接", type:"attack", element:"machine", value: 3, description:"機械属性。普通の守備では防ぐことができない。", imgSrc: "images/attack/yousetsu.png"},
    handa: { name:"はんだごて", type:"attack", element:"machine", value: 2, description:"機械属性。普通の守備では防ぐことができない。", imgSrc: "images/attack/handagote.png"},


    //回復系
    kakomon: { name:"過去問", type:"heal", value: 5, description:"5HP回復することができる。", imgSrc: "images/heal/test.png"},
    kyuukou: { name:"カフェイン", type:"heal", value: 10, description:"10HP回復することができる", imgSrc: "images/heal/kyuukou.png"},
    ramen: { name:"カップラーメン", type:"heal", value: 3, description:"3HP回復することができる", imgSrc: "images/heal/ramen.png"},
    megusuri: { name:"目薬", type:"mpheal", value: 5, description:"5MP回復することができる。", imgSrc: "images/heal/megusuri.png"},
    ramune: { name:"ラムネ", type:"mpheal", value: 10, description:"10MP回復することができる。", imgSrc: "images/heal/ramune.png"},
    //防御
    enadori: { name:"エナジードリンク", type:"magic", value: 2, mpCost: 7, description:"7MPを消費して攻撃力を2倍にする", imgSrc: "images/heal/enadori.png"},
    harapeko: { name:"抵抗器", type:"defense", value: 0, reductionRate: 0.6, description:"受ける攻撃を60%減らす", imgSrc: "images/defense/teikou.png"},
    hakui: { name:"白衣", type:"defense", element:"material", value: 5, materialDefenseValue: 10, description:"物質属性の攻撃には守10、それ以外には守5", imgSrc: "images/defense/hakui.png"},
    roppou: { name:"六法全書", type:"defense", element:"management", value: 0, attributeNeutralizer: true, description:"攻撃の属性効果を消し、普通の守備で防げるようにする", imgSrc: "images/defense/roppou.png"},
    anzenmegane: { name:"安全メガネ", type:"defense", value: 4, description:"攻撃を防ぐことができる", imgSrc: "images/defense/anzenmegane.png"},
    helmet: { name:"ヘルメット", type:"defense", value: 5, description:"攻撃を防ぐことができる", imgSrc: "images/defense/helmet.png"},
    mobairubatteri: { name:"モバイルバッテリー", type:"defense", value: 6, description:"攻撃を防ぐことができる", imgSrc: "images/defense/mobairubatteri.png"},
    //確率系
    nuton: { name:"ニュートンのゆりかご", type:"defense", value: 0, reflectAttack: true, description:"攻撃を確定で跳ね返すことができる", imgSrc: "images/kakuritu/nuton.png"},
    choubo: { name:"帳簿", type:"special", element:"management", value: 0, drawCards: 2, expandHand: 2, description:"最大手札枠を1増やすことができる", imgSrc: "images/attack/tyobo.png"},
    timecard: { name:"タイムカード", type:"special", element:"management", value: 0, extraTurn: true, description:"普通のカードと併せて使うと、自分のターンをもう一度行える", imgSrc: "images/special/timecard.png"},
    relay: { name:"電磁リレー", type:"special", element:"electric", value: 0, repeatAttack: 1, description:"攻撃カードと併せて使うと、2連続攻撃を行える", imgSrc: "images/attack/relay.png"},
}



const cardKeys = Object.keys(CARDS);
const MAX_HAND_CARDS = 8;
const MAX_EXPANDED_HAND_CARDS = 20;
const INITIAL_MP = 20;
const MAGIC_CARD_KEY = "enadori";
const TIME_CARD_KEY = "timecard";
const RELAY_CARD_KEY = "relay";
const FIXED_CARD_DRAW_RATES = {
    enadori: 1 / 65,
    hacking: 1 / 50,
    mojibake: 1 / 40,
    nuton: 1 / 30
};
const CARD_DRAW_WEIGHTS = {
    heal: 0.4,
    mpheal: 0.35,
    defense: 1.0,
    attack: 1.1,
    special: 0.35
};

const ATTRIBUTE_ICON_VERSION = "20260717-attribute-icons";

const ATTRIBUTE_META = {
    machine: {
        icon: `images/zokusei/m.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "機械属性",
        nameClass: "machine-attribute-name",
        valueClass: "machine-card-value"
    },
    fire: {
        icon: `images/zokusei/m.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "機械属性",
        nameClass: "machine-attribute-name",
        valueClass: "machine-card-value"
    },
    material: {
        icon: `images/zokusei/c.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "物質属性",
        nameClass: "material-attribute-name",
        valueClass: "material-card-value"
    },
    management: {
        icon: `images/zokusei/b.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "経営属性",
        nameClass: "management-attribute-name",
        valueClass: "management-card-value"
    },
    electric: {
        icon: `images/zokusei/e.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "電気属性",
        nameClass: "electric-attribute-name",
        valueClass: "electric-card-value"
    },
    control: {
        icon: `images/zokusei/s.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "制御属性",
        nameClass: "control-attribute-name",
        valueClass: "control-card-value"
    }
};

function getAttributeMeta(element) {
    return ATTRIBUTE_META[element] || null;
}

function getAttackTotalAttributeClass(card) {
    if (card?.element === "material") return " material-attack-total";
    if (card?.element === "machine" || card?.element === "fire") return " machine-attack-total";
    return "";
}

function drawRandomCard() {
    const fixedRoll = Math.random();
    let fixedThreshold = 0;
    for (const [cardKey, rate] of Object.entries(FIXED_CARD_DRAW_RATES)) {
        fixedThreshold += rate;
        if (fixedRoll < fixedThreshold) return cardKey;
    }

    const weightedCards = cardKeys
        .filter(cardKey => !(cardKey in FIXED_CARD_DRAW_RATES))
        .map(cardKey => {
        const card = CARDS[cardKey];
        return {
            cardKey,
            weight: CARD_DRAW_WEIGHTS[cardKey] ?? CARD_DRAW_WEIGHTS[card?.type] ?? 1
        };
    });
    const totalWeight = weightedCards.reduce((sum, entry) => sum + entry.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const entry of weightedCards) {
        randomWeight -= entry.weight;
        if (randomWeight <= 0) return entry.cardKey;
    }
    return weightedCards[weightedCards.length - 1].cardKey;
}

function drawCardForNormalHand() {
    return drawRandomCard();
}

function ensureInitialAttackCard(hand) {
    const hasNormalAttack = hand.some(cardKey => {
        const card = CARDS[cardKey];
        return cardKey !== "enadori" && card?.type === "attack" && card.value > 0;
    });
    if (hasNormalAttack) return hand;

    const normalAttackKeys = cardKeys.filter(cardKey => {
        const card = CARDS[cardKey];
        return cardKey !== "enadori" && card?.type === "attack" && card.value > 0;
    });
    if (normalAttackKeys.length > 0 && hand.length > 0) {
        const replaceIndex = hand.findIndex(cardKey => !(cardKey in FIXED_CARD_DRAW_RATES));
        hand[replaceIndex >= 0 ? replaceIndex : 0] = normalAttackKeys[Math.floor(Math.random() * normalAttackKeys.length)];
    }
    return hand;
}

let myHand = [];
let tekiHand = [];
let myMagicHand = [];
let tekiMagicHand = [];

// for (let i=0;i<6;i++) {
//     myHand.push(drawRandomCard());
//     tekiHand.push(drawRandomCard());
// }

let selectedCardIndex = null;
let selectedBoostCardIndexes = [];
let selectedHandMagicCardIndexes = [];
let displayedAttackerRole = null;
let heldAttackDisplayAfterResult = null;
let attackDisplayAfterResultTimer = null;
let pendingAttackGlobal = 0;
let lastTimerStateKey = null;
let currentAttackCardGlobal = null;
let defenseCardsGlobal = {
    player1: [],
    player2: []
};
let selectedDefenseCards = {
    player1: [],
    player2: []
};
let pendingDrawsGlobal = {
    player1: 0,
    player2: 0
};
let handLimitGlobal = {
    player1: MAX_HAND_CARDS,
    player2: MAX_HAND_CARDS
};
let selectedAttackTargetRole = "player2";
let damageResultGlobal = null;
let lastRenderedDamageResultId = null;
let activeHandDestroyEffect = null;
let lastRenderedHandEffectId = null;
let lastRenderedSelectedCardId = null;
let controlEffectGlobal = null;
let controlledActionInProgress = false;
let lastControlledActionKey = null;
const CONTROLLED_ROUND_DELAY_MS = 1950;
const CARD_DRAW_SOUND_SRC = "se/card.mp3";
const TURN_SOUND_SRC = "se/turn.mp3";
const KO_SOUND_SRC = "se/ko.mp3";
const SELECT_SOUND_SRC = "se/select.mp3";
const PUNCH_SOUND_SRC = "se/punch.wav";
const REFLECT_SOUND_SRC = "se/hansya.wav";
const RESULT_DISPLAY_MS = 1800;
const KNOCKOUT_DISPLAY_MS = 1200;
const RESULT_SHOW_DELAY_MS = 120;
const VICTORY_AFTER_KNOCKOUT_MS = 1200;
const VICTORY_SCREEN_DELAY_MS = RESULT_SHOW_DELAY_MS + RESULT_DISPLAY_MS + VICTORY_AFTER_KNOCKOUT_MS;
const CARD_ACTION_DISPLAY_MS = 2100;
const CONTROLLED_CARD_ACTION_DISPLAY_MS = 3600;
const DEFENSE_REVEAL_INTERVAL_MS = 400;
const HAND_DESTROY_UNKNOWN_MS = 800;
const HAND_DESTROY_REVEAL_MS = 1600;
const HAND_DESTROY_SHATTER_MS = 950;
const HAND_DESTROY_AFTER_SHATTER_MS = 1700;
const ATTACK_DISPLAY_AFTER_RESULT_DELAY_MS = 300;
const CARD_DRAW_SOUND_GAP_MS = 200;
const HAND_CARD_FEED_IN_GAP_MS = 200;
const INITIAL_CARD_OPEN_MS = 180;
const INITIAL_HAND_SORT_DELAY_MS = 180;
const HAND_SORT_ANIMATION_MS = 450;
const TURN_NOTICE_MS = 1400;
const CONTROL_RANDOM_PREVIEW_MS = 1000;
let shouldAnimateHandFeedIn = false;
let shouldAnimateHandSortAfterFeedIn = false;
let initialHandRevealUntil = 0;
let freshHandIndexesGlobal = {
    player1: new Set(),
    player2: new Set()
};

const SPECIAL_ITEM_CARD_KEYS = new Set(["hacking", "mojibake", "choubo", TIME_CARD_KEY, RELAY_CARD_KEY]);

const player1Div = document.querySelector(".player1");
const player2Div = document.querySelector(".player2");
const battleSelectDiv = document.querySelector(".select");
const status1Div = document.querySelector(".status1");
const status2Div = document.querySelector(".status2");
const attackArrowDiv = document.getElementById("attack-arrow");
const gameScreenDiv = document.getElementById("game-screen");
const victoryScreen = document.getElementById("victory-screen");
const victoryTitle = document.getElementById("victory-title");
const victoryMessage = document.getElementById("victory-message");
const roundLabel = document.getElementById("round-label");
const bottomPlayerName = document.getElementById("bottom-player-name");
const cardBookBottomPlayerName = document.getElementById("card-book-bottom-player-name");
const volumeMeters = [...document.querySelectorAll(".volume-meter")];
const volumeSteps = [...document.querySelectorAll(".volume-step")];
const nameSetupDiv = document.getElementById("name-setup");
const nameSetupLabel = document.getElementById("name-setup-label");
const playerNameInput = document.getElementById("player-name-input");
const setupScreen = document.getElementById("setup-screen");
const player1NameTitle = document.getElementById("player1-name-title");
const player2NameTitle = document.getElementById("player2-name-title");
const player1StatusName = document.getElementById("player1-status-name");
const player2StatusName = document.getElementById("player2-status-name");
const gameOyaDiv = document.querySelector(".gameoya");
const trainingButton = document.querySelector(".training-button");
const bookButton = document.querySelector(".book-button");
const cardBookPopup = document.getElementById("card-book-popup");
const cardBookContainer = document.getElementById("card-book-container");
const cardBookFeatured = document.getElementById("card-book-featured");
const cardBookCloseButton = document.getElementById("card-book-close");
const cardBookFilterButtons = [...document.querySelectorAll(".card-book-filter")];
const creditOpenButton = document.getElementById("credit-open");
const creditPopup = document.getElementById("credit-popup");
const creditCloseButton = document.getElementById("credit-close");
const tutorialOverlay = document.getElementById("tutorial-overlay");
const tutorialSpotlight = document.getElementById("tutorial-spotlight");
const tutorialPanel = document.getElementById("tutorial-panel");
const tutorialStepLabel = document.getElementById("tutorial-step-label");
const tutorialTitle = document.getElementById("tutorial-title");
const tutorialMessage = document.getElementById("tutorial-message");
const tutorialOkButton = document.getElementById("tutorial-ok");
const tutorialSkipButton = document.getElementById("tutorial-skip");
const tutorialTimebarFill = document.getElementById("tutorial-timebar-fill");

const DEFAULT_PLAYER_NAMES = {
    player1: "player1",
    player2: "player2"
};
const PLAYER_NAME_MAX_LENGTH = 8;
let playerNames = { ...DEFAULT_PLAYER_NAMES };
let currentRoundGlobal = 1;
let currentTurnGlobal = "player1";
let hasObservedGameState = false;
let lastKoSoundKey = null;
let lastTurnNoticeKey = null;
let resultDisplayTimer = null;
let scheduledVictoryTimer = null;
let scheduledVictoryKey = null;
let lastReflectedSlideId = null;
let masterVolume = Number(localStorage.getItem("notfield_volume") ?? 75) / 100;
const ATTACK_TUTORIAL_KEY = "notfield_attack_tutorial_completed_v2";
const BOOST_TUTORIAL_KEY = "notfield_boost_tutorial_completed_v2";
const DEFENSE_TUTORIAL_KEY = "notfield_defense_tutorial_completed_v2";
const RANDOM_TUTORIAL_KEY = "notfield_random_tutorial_completed_v1";
const SELF_ATTACK_TUTORIAL_KEY = "notfield_control_self_attack_tutorial_completed_v1";
const HACKING_PENDING_LABEL = "ハッキングされている";
const TUTORIAL_AUTO_CLOSE_MS = 7000;
const TUTORIAL_STORAGE_KEYS = [
    ATTACK_TUTORIAL_KEY,
    BOOST_TUTORIAL_KEY,
    DEFENSE_TUTORIAL_KEY,
    RANDOM_TUTORIAL_KEY,
    SELF_ATTACK_TUTORIAL_KEY
];
let isTutorialActive = false;
let tutorialMode = null;
let tutorialAttackFlowActive = false;
let tutorialBoostWasShown = false;
let tutorialStartTimer = null;
let tutorialAutoCloseTimer = null;
let tutorialScheduledMode = null;
let matchStartCountdownActive = false;
let matchStartCountdownTimers = [];
let lastMatchCountdownKey = null;

function isTutorialComplete(storageKey) {
    try {
        if (!myPlayerRole) return false;
        return localStorage.getItem(`${storageKey}:${myPlayerRole}`) === "1";
    } catch (_error) {
        return false;
    }
}

function markTutorialComplete(storageKey) {
    try {
        if (!myPlayerRole) return;
        localStorage.setItem(`${storageKey}:${myPlayerRole}`, "1");
    } catch (_error) {}
}

function resetTutorialProgress() {
    try {
        TUTORIAL_STORAGE_KEYS.forEach(storageKey => {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}:player1`);
            localStorage.removeItem(`${storageKey}:player2`);
        });
    } catch (_error) {}
}

function getTutorialHand() {
    return myPlayerRole ? getHandByRole(myPlayerRole) : [];
}

function getTutorialHandElement() {
    return document.getElementById(myPlayerRole === "player1" ? "my-hand" : "teki-hand");
}

function getTutorialMagicHandElement() {
    return document.getElementById(myPlayerRole === "player1" ? "my-magic-hand" : "teki-magic-hand");
}

function getTutorialPlayerElement() {
    return myPlayerRole === "player1" ? player1Div : player2Div;
}

function getPlayerElementByRole(role) {
    return role === "player1" ? player1Div : player2Div;
}

function getLastDefenseCardDisplay(playerElement) {
    const displays = playerElement?.querySelectorAll(".defense-card-display");
    return displays && displays.length > 0 ? displays[displays.length - 1] : null;
}

function getAvailableBoostSelection() {
    const selectedCardKey = getSelectedCardKey();
    if (!canApplyAttackBoost(selectedCardKey, CARDS[selectedCardKey])) return null;
    const selectedCount = selectedBoostCardIndexes.length + selectedHandMagicCardIndexes.length;
    const nextCost = (selectedCount + 1) * (CARDS[MAGIC_CARD_KEY]?.mpCost || 0);
    if (mycurrentmp < nextCost) return null;
    const magicIndex = getMagicHandByRole(myPlayerRole)
        .findIndex((cardKey, index) => cardKey === MAGIC_CARD_KEY && !selectedBoostCardIndexes.includes(index));
    if (magicIndex >= 0) return { source: "magic", index: magicIndex };

    const handIndex = getHandByRole(myPlayerRole)
        .findIndex((cardKey, index) => cardKey === MAGIC_CARD_KEY && !selectedHandMagicCardIndexes.includes(index));
    return handIndex >= 0 ? { source: "hand", index: handIndex } : null;
}

function isControlledSelfAttackPending() {
    return pendingAttackGlobal > 0
        && currentAttackCardGlobal?.controlled === true
        && currentAttackCardGlobal.player === myPlayerRole
        && currentAttackCardGlobal.target === myPlayerRole;
}

function getControlledSelfAttackRole() {
    if (pendingAttackGlobal <= 0 || currentAttackCardGlobal?.controlled !== true) return null;
    return currentAttackCardGlobal.player === currentAttackCardGlobal.target
        ? currentAttackCardGlobal.target
        : null;
}

function getTutorialContent() {
    const handElement = getTutorialHandElement();
    let playerElement = getTutorialPlayerElement();
    if (tutorialMode === "random-control" && controlEffectGlobal?.target) {
        playerElement = getPlayerElementByRole(controlEffectGlobal.target);
    } else if (tutorialMode === "control-self-attack") {
        playerElement = getPlayerElementByRole(getControlledSelfAttackRole() || myPlayerRole);
    }
    if (tutorialMode === "attack-select") {
        const firstAttackIndex = getTutorialHand().findIndex(cardKey => {
            const card = CARDS[cardKey];
            return card?.type === "attack" && Number(card.value) > 0;
        });
        const firstAttackCard = handElement?.querySelector(`[data-hand-index="${firstAttackIndex}"]`);
        return {
            label: "攻撃ガイド",
            title: "攻撃カードを選ぼう",
            message: "最初は「攻」と書かれたカードを1枚押して、相手を攻撃してみましょう。",
            target: firstAttackCard || handElement?.querySelector(".hand-card") || handElement
        };
    }
    if (tutorialMode === "boost-select") {
        const boostSelection = getAvailableBoostSelection();
        const magicHandElement = getTutorialMagicHandElement();
        const boostTarget = boostSelection?.source === "magic"
            ? magicHandElement?.querySelector(`[data-magic-index="${boostSelection.index}"]`)
            : handElement?.querySelector(`[data-hand-index="${boostSelection?.index}"]`);
        return {
            label: "×2ガイド",
            title: "攻撃力を2倍にしよう",
            message: "魔法カードがあります。7MPを消費して、今選んだ攻撃の攻撃力を2倍にできます。",
            target: boostTarget || magicHandElement || handElement
        };
    }
    if (tutorialMode === "attack-confirm") {
        return {
            label: "攻撃ガイド",
            title: "攻撃を確定しよう",
            message: "名前の下に出たカード情報を押すと攻撃します。矢印が相手に向いていることも確認できます。",
            target: playerElement?.querySelector(".selected-card-info") || playerElement
        };
    }
    if (tutorialMode === "defense-select") {
        const usableDefenseIndex = getTutorialHand().findIndex(cardKey =>
            canDefenseCardBlockAttack(CARDS[cardKey], currentAttackCardGlobal, myPlayerRole)
        );
        const hasDefense = usableDefenseIndex >= 0;
        const firstDefenseCard = handElement?.querySelector(`[data-hand-index="${usableDefenseIndex}"]`);
        return {
            label: "守備ガイド",
            title: hasDefense ? "守備カードを選ぼう" : "攻撃を受けよう",
            message: hasDefense
                ? "「守」と書かれたカードは何枚でも選べます。使いたい守備カードを押してください。"
                : "今回は守備カードがありません。名前の下にある「許す」を押すとダメージが確定します。",
            target: hasDefense
                ? (firstDefenseCard || handElement)
                : (playerElement?.querySelector(".defense-confirm-display") || playerElement),
            focusPlayer: hasDefense ? null : playerElement
        };
    }
    if (tutorialMode === "random-control") {
        return {
            label: "ハッキングガイド",
            title: "ハッキングで操作されています",
            message: "これから手札がランダムに選ばれます。攻撃・守備・回復のどれが出るか、対象も含めて自動で決まります。",
            target: playerElement?.querySelector("h3") || playerElement
        };
    }
    if (tutorialMode === "control-self-attack") {
        return {
            label: "ハッキング攻撃ガイド",
            title: "自分に攻撃が向きました",
            message: "ハッキングのランダム効果で、自分自身が攻撃対象になりました。守備カードを選ぶか、そのまま攻撃を受けてください。",
            target: playerElement?.querySelector(".attack-total-display, .attack-card-display") || playerElement
        };
    }
    const selectedDefenseCount = (selectedDefenseCards[myPlayerRole] || []).length;
    const selectedDefenseList = playerElement?.querySelector(".defense-card-list");
    return {
        label: "守備ガイド",
        title: "守備を確定しよう",
        message: selectedDefenseCount > 0
            ? "さらに守備カードを追加することもできます。準備ができたら「守」を押してください。"
            : "守備を使わない場合は「許す」を押すと、受けるダメージが確定します。",
        target: selectedDefenseCount > 0
            ? (selectedDefenseList || getLastDefenseCardDisplay(playerElement) || playerElement)
            : (playerElement?.querySelector(".defense-confirm-display") || playerElement),
        targets: null,
        focusPlayer: selectedDefenseCount > 0 ? null : playerElement
    };
}

function isUsableTutorialRect(rect) {
    return rect && rect.width >= 8 && rect.height >= 8;
}

function getFallbackTutorialElements(target) {
    if (!(target instanceof Element)) return [];
    return [
        ...target.querySelectorAll(
            ".tutorial-defense-bright, .defense-selected, .hand-card:not(:disabled), .hand-card, .selected-card-info, .defense-confirm-display, .attack-total-display, .attack-card-display"
        )
    ];
}

function getTutorialTargetRects(content, target) {
    const explicitTargets = Array.isArray(content.targets) ? content.targets.filter(Boolean) : [];
    let elements = explicitTargets.length > 0 ? explicitTargets : [target].filter(Boolean);
    let rects = elements
        .map(element => element.getBoundingClientRect?.())
        .filter(isUsableTutorialRect);

    if (rects.length === 0) {
        const fallbackElements = elements.flatMap(getFallbackTutorialElements);
        rects = fallbackElements
            .map(element => element.getBoundingClientRect())
            .filter(isUsableTutorialRect);
    }

    return rects;
}

function positionTutorial() {
    if (!isTutorialActive || !gameScreenDiv || !tutorialSpotlight || !tutorialPanel) return;

    const content = getTutorialContent();
    const target = content.target || gameScreenDiv;
    const screenRect = gameScreenDiv.getBoundingClientRect();
    const targetRects = getTutorialTargetRects(content, target);
    if (targetRects.length === 0) {
        tutorialSpotlight.style.display = "none";
        tutorialPanel.style.left = `${Math.max(10, (screenRect.width - (tutorialPanel.offsetWidth || 320)) / 2)}px`;
        tutorialPanel.style.top = `${Math.max(10, (screenRect.height - (tutorialPanel.offsetHeight || 180)) / 2)}px`;
        return;
    }
    tutorialSpotlight.style.display = "";
    const targetRect = targetRects.reduce((bounds, rect) => ({
        left: Math.min(bounds.left, rect.left),
        top: Math.min(bounds.top, rect.top),
        right: Math.max(bounds.right, rect.right),
        bottom: Math.max(bounds.bottom, rect.bottom),
        width: Math.max(bounds.right, rect.right) - Math.min(bounds.left, rect.left),
        height: Math.max(bounds.bottom, rect.bottom) - Math.min(bounds.top, rect.top)
    }));
    const padding = 6;
    const left = Math.max(4, targetRect.left - screenRect.left - padding);
    const top = Math.max(4, targetRect.top - screenRect.top - padding);
    const width = Math.min(screenRect.width - left - 4, targetRect.width + padding * 2);
    const height = Math.min(screenRect.height - top - 4, Math.max(32, targetRect.height + padding * 2));

    tutorialSpotlight.style.left = `${left}px`;
    tutorialSpotlight.style.top = `${top}px`;
    tutorialSpotlight.style.width = `${Math.max(32, width)}px`;
    tutorialSpotlight.style.height = `${height}px`;

    const panelWidth = tutorialPanel.offsetWidth || 320;
    const panelHeight = tutorialPanel.offsetHeight || 180;
    let panelLeft = Math.max(10, Math.min(screenRect.width - panelWidth - 10, left + (width - panelWidth) / 2));
    const roomBelow = screenRect.height - (top + height);
    let panelTop;
    if (tutorialMode === "defense-confirm") {
        const sideGap = 14;
        const roomLeft = left - 10;
        const roomRight = screenRect.width - (left + width) - 10;
        if (roomLeft >= panelWidth + sideGap) {
            panelLeft = left - panelWidth - sideGap;
            panelTop = Math.max(10, Math.min(top, screenRect.height - panelHeight - 10));
        } else if (roomRight >= panelWidth + sideGap) {
            panelLeft = left + width + sideGap;
            panelTop = Math.max(10, Math.min(top, screenRect.height - panelHeight - 10));
        } else {
            panelTop = Math.max(10, top - panelHeight - 20);
        }
    } else {
        panelTop = roomBelow < panelHeight + 18
            ? Math.max(10, top - panelHeight - 14)
            : top + height + 14;
    }

    tutorialPanel.style.left = `${panelLeft}px`;
    tutorialPanel.style.top = `${panelTop}px`;
}

function scheduleTutorialPositionUpdate() {
    if (!isTutorialActive) return;
    requestAnimationFrame(() => {
        requestAnimationFrame(positionTutorial);
    });
}

function clearTutorialPlayerFocus() {
    [player1Div, player2Div].forEach(div => div?.classList.remove("tutorial-player-focus"));
}

function renderTutorialStep() {
    const content = getTutorialContent();
    clearTutorialPlayerFocus();
    content.focusPlayer?.classList.add("tutorial-player-focus");
    tutorialStepLabel.textContent = content.label;
    tutorialTitle.textContent = content.title;
    tutorialMessage.textContent = content.message;
    tutorialSkipButton.textContent = "すべてスキップ";
    tutorialSkipButton.classList.remove("is-confirm");
    tutorialOverlay?.classList.toggle("defense-group-mode", tutorialMode === "defense-select");
    tutorialOverlay?.classList.toggle("defense-confirm-mode", tutorialMode === "defense-confirm");
    startTutorialAutoCloseTimer();
    requestAnimationFrame(positionTutorial);
}

function clearTutorialAutoCloseTimer() {
    clearTimeout(tutorialAutoCloseTimer);
    tutorialAutoCloseTimer = null;
    tutorialTimebarFill?.classList.remove("is-running");
}

function startTutorialAutoCloseTimer() {
    clearTutorialAutoCloseTimer();
    if (!isTutorialActive) return;

    if (tutorialTimebarFill) {
        tutorialTimebarFill.style.setProperty("--tutorial-duration", `${TUTORIAL_AUTO_CLOSE_MS}ms`);
        void tutorialTimebarFill.offsetWidth;
        tutorialTimebarFill.classList.add("is-running");
    }

    tutorialAutoCloseTimer = setTimeout(() => {
        tutorialAutoCloseTimer = null;
        closeTutorial(true);
    }, TUTORIAL_AUTO_CLOSE_MS);
}

function closeTutorial(completed = false) {
    clearTimeout(tutorialStartTimer);
    tutorialStartTimer = null;
    clearTutorialAutoCloseTimer();
    if (!isTutorialActive && !tutorialOverlay?.classList.contains("is-open")) return;

    const wasRandomTutorial = tutorialMode === "random-control";
    const wasSelfAttackTutorial = tutorialMode === "control-self-attack";
    isTutorialActive = false;
    tutorialOverlay?.classList.remove("is-open");
    tutorialOverlay?.classList.remove("defense-group-mode");
    tutorialOverlay?.classList.remove("defense-confirm-mode");
    clearTutorialPlayerFocus();
    tutorialOverlay?.setAttribute("aria-hidden", "true");
    tutorialPanel?.setAttribute("aria-hidden", "true");
    if (completed) {
        if (tutorialAttackFlowActive) markTutorialComplete(ATTACK_TUTORIAL_KEY);
        if (tutorialBoostWasShown) markTutorialComplete(BOOST_TUTORIAL_KEY);
        if (tutorialMode?.startsWith("defense")) markTutorialComplete(DEFENSE_TUTORIAL_KEY);
        if (wasRandomTutorial) markTutorialComplete(RANDOM_TUTORIAL_KEY);
        if (wasSelfAttackTutorial) markTutorialComplete(SELF_ATTACK_TUTORIAL_KEY);
    }

    tutorialMode = null;
    tutorialAttackFlowActive = false;
    tutorialBoostWasShown = false;
    tutorialScheduledMode = null;
    lastTimerStateKey = null;
    resetTimerWhenTurnStateChanges(currentTurnGlobal, pendingAttackGlobal);
    queueMicrotask(renderHands);
    const shouldResumeControlledAction = controlEffectGlobal?.target === myPlayerRole
        && isMyTurnGlobal
        && pendingAttackGlobal === 0;
    if (shouldResumeControlledAction) queueMicrotask(maybeRunControlledRound);
}

function startTutorial(mode = tutorialScheduledMode) {
    tutorialStartTimer = null;
    tutorialScheduledMode = null;
    if (cardBookPopup?.classList.contains("is-open")) return;
    const isAttackGuide = mode === "attack-select";
    const isDefenseGuide = mode === "defense-select";
    const isRandomGuide = mode === "random-control";
    const isSelfAttackGuide = mode === "control-self-attack";
    const correctTurn = (
        (isMyTurnGlobal && isAttackGuide && pendingAttackGlobal === 0)
        || (isMyTurnGlobal && isDefenseGuide && pendingAttackGlobal > 0)
        || (isRandomGuide
            && pendingAttackGlobal === 0
            && !!controlEffectGlobal?.target
            && currentTurnGlobal === controlEffectGlobal.target)
        || (isSelfAttackGuide && getControlledSelfAttackRole() === myPlayerRole)
    );
    if (!gameStartedGlobal || !myPlayerRole || isTutorialActive || !correctTurn) return;

    isTutorialActive = true;
    tutorialMode = isDefenseGuide && (selectedDefenseCards[myPlayerRole] || []).length > 0
        ? "defense-confirm"
        : mode;
    tutorialAttackFlowActive = isAttackGuide;
    tutorialBoostWasShown = false;
    stopTimer();
    hideTurnNotice();
    tutorialOverlay?.classList.add("is-open");
    tutorialOverlay?.setAttribute("aria-hidden", "false");
    tutorialPanel?.setAttribute("aria-hidden", "false");
    renderTutorialStep();
    queueMicrotask(renderHands);
}

function maybeStartTutorial() {
    if (
        matchStartCountdownActive ||
        isTutorialActive ||
        tutorialStartTimer ||
        cardBookPopup?.classList.contains("is-open") ||
        !gameStartedGlobal ||
        !myPlayerRole ||
        !isMyTurnGlobal
    ) return;
    const controlledSelfAttack = isControlledSelfAttackPending();
    if (controlEffectGlobal?.target === myPlayerRole && !controlledSelfAttack) return;

    let nextMode = null;
    if (controlledSelfAttack && !isTutorialComplete(SELF_ATTACK_TUTORIAL_KEY)) {
        nextMode = "control-self-attack";
    } else if (pendingAttackGlobal > 0 && !isTutorialComplete(DEFENSE_TUTORIAL_KEY)) {
        nextMode = "defense-select";
    } else if (pendingAttackGlobal === 0 && !isTutorialComplete(ATTACK_TUTORIAL_KEY)) {
        const hasAttack = getTutorialHand().some(cardKey => {
            const card = CARDS[cardKey];
            return cardKey !== "enadori" && card?.type === "attack" && card.value > 0;
        });
        if (hasAttack) nextMode = "attack-select";
    }
    if (!nextMode) return;

    tutorialScheduledMode = nextMode;
    const initialRevealWait = Math.max(0, initialHandRevealUntil - Date.now());
    tutorialStartTimer = setTimeout(() => startTutorial(nextMode), Math.max(400, initialRevealWait + 100));
}

function maybeStartObservedControllerTutorial(selectedCard) {
    if (matchStartCountdownActive || isTutorialActive || !gameStartedGlobal || !myPlayerRole) return;

    if (getControlledSelfAttackRole() === myPlayerRole && !isTutorialComplete(SELF_ATTACK_TUTORIAL_KEY)) {
        startTutorial("control-self-attack");
        return;
    }

    if (selectedCard?.randomPending
        && controlEffectGlobal?.target
        && !isTutorialComplete(RANDOM_TUTORIAL_KEY)) {
        startTutorial("random-control");
    }
}

function setTutorialMode(mode) {
    tutorialMode = mode;
    renderTutorialStep();
    queueMicrotask(renderHands);
}

function shouldTutorialDisableCard(cardKey, card, handIndex = null) {
    if (!isTutorialActive) return false;
    if (tutorialMode === "attack-select") {
        return card.type !== "attack" || card.value <= 0;
    }
    if (tutorialMode === "boost-select") {
        return cardKey !== MAGIC_CARD_KEY || selectedHandMagicCardIndexes.includes(Number(handIndex));
    }
    if (tutorialMode === "attack-confirm") return true;
    return false;
}

function handleTutorialCardSelection(cardKey, card) {
    if (tutorialMode === "attack-select" && card.type === "attack") {
        if (getAvailableBoostSelection()) {
            tutorialBoostWasShown = true;
            setTutorialMode("boost-select");
        } else {
            setTutorialMode("attack-confirm");
        }
        return;
    }

    if (tutorialMode === "boost-select" && cardKey === "enadori") {
        tutorialBoostWasShown = true;
        setTutorialMode(getAvailableBoostSelection() ? "boost-select" : "attack-confirm");
        return;
    }

    if (!isTutorialActive && card.type === "attack") {
        const needsAttackGuide = !isTutorialComplete(ATTACK_TUTORIAL_KEY);
        const canShowBoostGuide = !isTutorialComplete(BOOST_TUTORIAL_KEY) && !!getAvailableBoostSelection();
        if (!needsAttackGuide && !canShowBoostGuide) return;

        clearTimeout(tutorialStartTimer);
        tutorialStartTimer = null;
        tutorialScheduledMode = null;
        isTutorialActive = true;
        tutorialMode = canShowBoostGuide ? "boost-select" : "attack-confirm";
        tutorialAttackFlowActive = needsAttackGuide;
        tutorialBoostWasShown = canShowBoostGuide;
        stopTimer();
        tutorialOverlay?.classList.add("is-open");
        tutorialOverlay?.setAttribute("aria-hidden", "false");
        renderTutorialStep();
        queueMicrotask(renderHands);
    }
}

function updateRoundDisplay(round = currentRoundGlobal) {
    if (!roundLabel) return;
    roundLabel.textContent = `ラウンド:${round || 1}`;
}

function canPlayGameSound() {
    return !!myPlayerRole
        && gameStartedGlobal
        && gameOyaDiv?.style.display !== "none"
        && gameScreenDiv?.style.display !== "none";
}

function playSound(src, delayMs = 0, volume = 0.75) {
    setTimeout(() => {
        if (!canPlayGameSound()) return;
        const audio = new Audio(src);
        audio.volume = Math.max(0, Math.min(1, volume * masterVolume));
        audio.play().catch(() => {});
    }, delayMs);
}

function playCardDrawSound(delayMs = 0) {
    playSound(CARD_DRAW_SOUND_SRC, delayMs, 0.75);
}

function hideTurnNotice() {
    const notice = document.getElementById("turn-notice");
    if (!notice) return;
    clearTimeout(showTurnNotice.hideTimer);
    notice.classList.remove("is-visible", "is-waiting", "is-countdown");
}

function showTurnNotice(message = "あなたの番です", persist = false) {
    if (!gameScreenDiv || gameScreenDiv.style.display === "none") return;

    let notice = document.getElementById("turn-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "turn-notice";
        notice.className = "turn-notice";
        gameScreenDiv.appendChild(notice);
    }
    notice.textContent = message;
    notice.dataset.message = message;

    notice.classList.remove("is-visible", "is-countdown");
    notice.classList.toggle("is-waiting", persist);
    notice.getBoundingClientRect();
    notice.classList.add("is-visible");

    clearTimeout(showTurnNotice.hideTimer);
    if (!persist) {
        showTurnNotice.hideTimer = setTimeout(() => {
            notice.classList.remove("is-visible", "is-waiting");
        }, TURN_NOTICE_MS);
    }
}

function showMatchStartCountdown(count) {
    if (!gameScreenDiv) return;
    let notice = document.getElementById("turn-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "turn-notice";
        gameScreenDiv.appendChild(notice);
    }
    clearTimeout(showTurnNotice.hideTimer);
    notice.className = "turn-notice is-countdown is-visible";
    notice.innerHTML = `
        <div class="match-countdown-message">試合はあと3秒後に始まります</div>
        <div class="match-countdown-number">${count}</div>
    `;
}

function cancelMatchStartCountdown(resetKey = false) {
    matchStartCountdownTimers.forEach(timer => clearTimeout(timer));
    matchStartCountdownTimers = [];
    matchStartCountdownActive = false;
    if (resetKey) lastMatchCountdownKey = null;
}

function startMatchStartCountdown(data) {
    if (data.turn === "end") return;
    const countdownKey = String(data.reset_trigger || `${data.round || 1}-match`);
    if (matchStartCountdownActive || lastMatchCountdownKey === countdownKey) return;

    lastMatchCountdownKey = countdownKey;
    matchStartCountdownActive = true;
    stopTimer();
    renderWaitingHandPlaceholders();
    showMatchStartCountdown(3);

    matchStartCountdownTimers = [
        setTimeout(() => showMatchStartCountdown(2), 1000),
        setTimeout(() => showMatchStartCountdown(1), 2000),
        setTimeout(() => {
            matchStartCountdownTimers = [];
            matchStartCountdownActive = false;
            hideTurnNotice();
            shouldAnimateHandFeedIn = true;
            shouldAnimateHandSortAfterFeedIn = true;
            lastTimerStateKey = null;
            renderHands();
            resetTimerWhenTurnStateChanges(currentTurnGlobal, pendingAttackGlobal);
            const isMyTurnNotice = currentTurnGlobal === myPlayerRole;
            lastTurnNoticeKey = `${lastResetTrigger || "game"}:${currentRoundGlobal}:${currentTurnGlobal}:${pendingAttackGlobal}`;
            showTurnNotice(isMyTurnNotice
                ? (pendingAttackGlobal > 0 ? "守備の番です" : "あなたの番です")
                : "相手の番です"
            );
            maybeStartTutorial();
            maybeRunControlledRound();
        }, 3000)
    ];
}

function playCardDrawSoundSequence(count) {
    for (let i = 0; i < count; i++) {
        playCardDrawSound(i * CARD_DRAW_SOUND_GAP_MS);
    }
}
let pendingNameRole = null;

const CARD_ACTION_DISPLAY_SELECTOR = [
    ".selected-card-info",
    ".selected-card-info-remote",
    ".attack-card-display",
    ".attack-total-display",
    ".defense-card-list",
    ".defense-card-display"
].join(", ");

function getPlayerDisplayDivs() {
    return [player1Div, player2Div].filter(Boolean);
}

function clearSelectedCardState() {
    selectedCardIndex = null;
    selectedBoostCardIndexes = [];
    selectedHandMagicCardIndexes = [];
}

function clearDisplayElements(selector, divs = getPlayerDisplayDivs()) {
    divs.forEach(div => {
        div.querySelectorAll(selector).forEach(el => el.remove());
    });
}

function clearCardActionDisplays() {
    clearDisplayElements(CARD_ACTION_DISPLAY_SELECTOR);
    battleSelectDiv?.classList.remove("self-attack-mode", "heal-mode", "heal-player1", "heal-player2");
}

function getWinnerFromHp(player1Hp, player2Hp) {
    if (player1Hp <= 0 && player2Hp <= 0) return "draw";
    if (player1Hp <= 0) return "player2";
    if (player2Hp <= 0) return "player1";
    return null;
}

function showVictoryScreen(winnerRole) {
    if (!victoryScreen || !victoryTitle || !victoryMessage) return;

    clearTimeout(scheduledVictoryTimer);
    scheduledVictoryTimer = null;
    stopTimer();
    endGame();
    clearCardActionDisplays();
    [player1Div, player2Div].forEach(div => {
        div?.classList.remove("player-result-active");
        div?.querySelectorAll(".damage-result-display").forEach(el => el.remove());
    });

    if (!winnerRole) {
        victoryTitle.textContent = "試合終了";
        victoryMessage.textContent = "";
        victoryScreen.style.display = "flex";
        return;
    }

    const isDraw = winnerRole === "draw";
    victoryTitle.textContent = isDraw ? "引き分け" : "勝利";

    if (isDraw) {
        victoryMessage.textContent = "DRAW";
    } else {
        victoryMessage.textContent = getPlayerDisplayName(winnerRole);
    }

    victoryScreen.style.display = "flex";
}

function scheduleVictoryScreen(winnerRole, key = "", delayMs = VICTORY_SCREEN_DELAY_MS) {
    const nextKey = `${key}:${winnerRole || "none"}`;
    if (scheduledVictoryKey === nextKey && victoryScreen?.style.display === "flex") return;
    if (scheduledVictoryKey === nextKey && scheduledVictoryTimer) return;
    clearTimeout(scheduledVictoryTimer);
    scheduledVictoryKey = nextKey;
    scheduledVictoryTimer = setTimeout(() => {
        scheduledVictoryTimer = null;
        showVictoryScreen(winnerRole);
    }, delayMs);
}

function hideVictoryScreen() {
    clearTimeout(scheduledVictoryTimer);
    scheduledVictoryTimer = null;
    scheduledVictoryKey = null;
    if (victoryScreen) victoryScreen.style.display = "none";
}

function updateControlledPlayerDisplay() {
    player1Div?.classList.toggle("controlled-player", controlEffectGlobal?.target === "player1");
    player2Div?.classList.toggle("controlled-player", controlEffectGlobal?.target === "player2");
    status1Div?.classList.toggle("controlled-player", controlEffectGlobal?.target === "player1");
    status2Div?.classList.toggle("controlled-player", controlEffectGlobal?.target === "player2");
}

function getPlayerDisplayName(role) {
    return playerNames[role] || DEFAULT_PLAYER_NAMES[role] || role;
}

function normalizePlayerName(name, role) {
    const trimmedName = (name || "").trim();
    const limitedName = Array.from(trimmedName).slice(0, PLAYER_NAME_MAX_LENGTH).join("");
    return limitedName || DEFAULT_PLAYER_NAMES[role];
}

function fitTextToSingleLine(element, maxFontSize, minFontSize) {
    if (!element) return;
    element.style.fontSize = `${maxFontSize}px`;

    while (element.scrollWidth > element.clientWidth && maxFontSize > minFontSize) {
        maxFontSize -= 1;
        element.style.fontSize = `${maxFontSize}px`;
    }
}

function fitPlayerNameDisplay() {
    requestAnimationFrame(() => {
        const isMobile = window.matchMedia("(max-width: 1004px)").matches;
        fitTextToSingleLine(player1NameTitle, isMobile ? 16 : 21, isMobile ? 10 : 12);
        fitTextToSingleLine(player2NameTitle, isMobile ? 16 : 21, isMobile ? 10 : 12);
        fitTextToSingleLine(player1StatusName, isMobile ? 23 : 26, isMobile ? 10 : 14);
        fitTextToSingleLine(player2StatusName, isMobile ? 23 : 26, isMobile ? 10 : 14);
    });
}

function updatePlayerNameDisplay() {
    const p1Name = getPlayerDisplayName("player1");
    const p2Name = getPlayerDisplayName("player2");

    if (player1NameTitle) player1NameTitle.textContent = p1Name;
    if (player2NameTitle) player2NameTitle.textContent = p2Name;
    if (player1StatusName) player1StatusName.textContent = p1Name;
    if (player2StatusName) player2StatusName.textContent = p2Name;
    if (bottomPlayerName) bottomPlayerName.textContent = getPlayerDisplayName(myPlayerRole || "player1");
    if (cardBookBottomPlayerName) cardBookBottomPlayerName.textContent = getPlayerDisplayName(myPlayerRole || "player1");
    fitPlayerNameDisplay();
}

function updateSelfAttackNameDisplay(attackerRole, targetRole, isSelfAttack) {
    if (!player1NameTitle || !player2NameTitle) return;
    if (isSelfAttack && (attackerRole === "player1" || attackerRole === "player2")) {
        const attackerName = getPlayerDisplayName(attackerRole);
        player1NameTitle.textContent = attackerName;
        player2NameTitle.textContent = attackerName;
    } else {
        player1NameTitle.textContent = getPlayerDisplayName("player1");
        player2NameTitle.textContent = getPlayerDisplayName("player2");
    }
    fitPlayerNameDisplay();
}

function getDisplayedPlayerOrder() {
    if (battleSelectDiv?.classList.contains("attacker-player2")) {
        return ["player2", "player1"];
    }
    return ["player1", "player2"];
}

function getAttackArrowText(attackerRole, targetRole, isSelfAttack) {
    if (isSelfAttack) return "→";
    const order = getDisplayedPlayerOrder();
    const attackerIndex = order.indexOf(attackerRole);
    const targetIndex = order.indexOf(targetRole);
    if (attackerIndex === -1 || targetIndex === -1) return "→";
    return attackerIndex < targetIndex ? "→" : "←";
}

function resetPlayerNames() {
    playerNames = { ...DEFAULT_PLAYER_NAMES };
    updatePlayerNameDisplay();
}

function showNameSetup(role) {
    pendingNameRole = role;
    document.querySelector(".buttons").style.display = "none";
    document.querySelector(".buttons2").style.display = "none";
    document.querySelector(".buttons3").style.display = "none";
    if (nameSetupLabel) nameSetupLabel.textContent = `${DEFAULT_PLAYER_NAMES[role]} の名前を入力してください`;
    if (playerNameInput) {
        playerNameInput.value = "";
        playerNameInput.placeholder = DEFAULT_PLAYER_NAMES[role];
    }
    if (nameSetupDiv) nameSetupDiv.style.display = "block";
    setTimeout(() => playerNameInput?.focus(), 0);
}

function hideNameSetup() {
    pendingNameRole = null;
    document.querySelector(".buttons").style.display = "flex";
    document.querySelector(".buttons2").style.display = "flex";
    document.querySelector(".buttons3").style.display = "flex";
    if (nameSetupDiv) nameSetupDiv.style.display = "none";
    if (playerNameInput) playerNameInput.value = "";
}

setupScreen?.addEventListener("click", event => {
    if (!pendingNameRole || nameSetupDiv?.contains(event.target)) return;
    if (event.target instanceof Element && event.target.closest(".selectbutton1, .selectbutton2")) return;
    hideNameSetup();
});

function destroyRandomHandCard(targetRole) {
    const targetHand = targetRole === "player1" ? myHand : tekiHand;
    if (!targetHand || targetHand.length === 0) return null;

    const index = Math.floor(Math.random() * targetHand.length);
    const cardKey = targetHand[index];
    const card = CARDS[cardKey];
    targetHand.splice(index, 1);

    return {
        id: Date.now(),
        type: "destroy_hand",
        target: targetRole,
        index,
        cardKey,
        name: card?.name || "",
        cardType: card?.type || "",
        element: card?.element || null,
        value: card?.value || 0,
        reductionRate: card?.reductionRate || 0,
        description: card?.description || "",
        imgSrc: card?.imgSrc || ""
    };
}

function receiveHandEffect(effect) {
    if (!effect || effect.type !== "destroy_hand") {
        activeHandDestroyEffect = null;
        return;
    }
    if (effect.id === lastRenderedHandEffectId) return;

    const totalDisplayMs = HAND_DESTROY_UNKNOWN_MS
        + HAND_DESTROY_REVEAL_MS
        + HAND_DESTROY_SHATTER_MS
        + HAND_DESTROY_AFTER_SHATTER_MS;

    activeHandDestroyEffect = { ...effect, phase: "unknown" };
    lastRenderedHandEffectId = effect.id;
    renderDestroyedHandCardDisplay(activeHandDestroyEffect);
    renderHands();

    setTimeout(() => {
        if (activeHandDestroyEffect?.id === effect.id) {
            activeHandDestroyEffect = { ...effect, phase: "reveal" };
            renderDestroyedHandCardDisplay(activeHandDestroyEffect);
            renderHands();
        }
    }, HAND_DESTROY_UNKNOWN_MS);

    setTimeout(() => {
        if (activeHandDestroyEffect?.id === effect.id) {
            activeHandDestroyEffect = { ...effect, phase: "shatter" };
            renderDestroyedHandCardDisplay(activeHandDestroyEffect);
            renderHands();
        }
    }, HAND_DESTROY_UNKNOWN_MS + HAND_DESTROY_REVEAL_MS);

    setTimeout(() => {
        if (activeHandDestroyEffect?.id === effect.id) {
            activeHandDestroyEffect = null;
            renderHands();
        }
    }, totalDisplayMs);

    setTimeout(() => {
        if (lastRenderedHandEffectId === effect.id) {
            update(gameRoomRef, { hand_effect: null });
        }
    }, totalDisplayMs + 300);
}

function renderDestroyedHandCardDisplay(effect) {
    if (!effect || effect.type !== "destroy_hand") return;

    [player1Div, player2Div].forEach(div => {
        div?.querySelectorAll(".destroyed-card-display").forEach(el => el.remove());
    });

    const targetDiv = effect.target === "player1" ? player1Div : player2Div;
    if (!targetDiv) return;

    const phase = effect.phase || "shatter";
    const card = {
        name: effect.name || "",
        imgSrc: effect.imgSrc || "",
        description: effect.description || "",
        type: effect.cardType || "",
        element: effect.element || null,
        value: effect.value || 0,
        reductionRate: effect.reductionRate || 0
    };
    const label = card.type === "attack"
        ? `攻 ${card.value}`
        : card.type === "heal"
            ? `回 ${card.value}`
                : card.type === "defense"
                ? getDefenseCardLabel(card)
                : "";

    const dispDiv = document.createElement("div");
    dispDiv.className = `destroyed-card-display destroy-phase-${phase}${phase === "shatter" ? " shatter-info-display" : ""}`;
    dispDiv.innerHTML = phase === "unknown"
        ? renderUnknownDestroyedCardInfoBlock()
        : renderCardInfoBlock(card, label);
    targetDiv.appendChild(dispDiv);

    setTimeout(() => {
        if (lastRenderedHandEffectId === effect.id && phase === "shatter") {
            dispDiv.remove();
        }
    }, HAND_DESTROY_SHATTER_MS + HAND_DESTROY_AFTER_SHATTER_MS);
}

function renderUnknownDestroyedCardInfoBlock() {
    return `
        <div class="card-info-panel destroyed-unknown-card-info">
            <div class="card-info-image destroyed-unknown-image" aria-hidden="true">?</div>
            <div class="card-info-body">
                <div class="card-info-name"><span class="card-info-name-text">？？？</span></div>
                <div class="card-info-effect">解析中...</div>
            </div>
        </div>
    `;
}

function getHandByRole(role) {
    return role === "player1" ? myHand : tekiHand;
}

function getMagicHandByRole(role) {
    return role === "player1" ? myMagicHand : tekiMagicHand;
}

function normalizeHand(hand) {
    return Array.isArray(hand)
        ? hand.filter(cardKey => CARDS[cardKey]).slice(0, MAX_EXPANDED_HAND_CARDS)
        : [];
}

function normalizeMagicHand(hand) {
    return Array.isArray(hand) ? hand.filter(cardKey => cardKey === MAGIC_CARD_KEY) : [];
}

function getHandOpenSlots(role) {
    const hand = getHandByRole(role);
    return Math.max(0, getHandLimitByRole(role) - (Array.isArray(hand) ? hand.length : 0));
}

function getHandLimitByRole(role) {
    return Math.max(
        MAX_HAND_CARDS,
        Math.min(MAX_EXPANDED_HAND_CARDS, Number(handLimitGlobal[role]) || MAX_HAND_CARDS)
    );
}

function setHandLimitByRole(role, limit) {
    if (role !== "player1" && role !== "player2") return;
    handLimitGlobal[role] = Math.max(
        MAX_HAND_CARDS,
        Math.min(MAX_EXPANDED_HAND_CARDS, Number(limit) || MAX_HAND_CARDS)
    );
}

function expandHandLimitForRole(role, amount) {
    setHandLimitByRole(role, getHandLimitByRole(role) + (Number(amount) || 0));
}

function getPendingDrawCapacity(role) {
    const currentPending = pendingDrawsGlobal[role] || 0;
    return Math.max(0, getHandOpenSlots(role) - currentPending);
}

function getRoleHp(role) {
    return role === myPlayerRole ? mycurrenthp : tekicurrenthp;
}

function getRoleMp(role) {
    return role === myPlayerRole ? mycurrentmp : tekicurrentmp;
}

function setRoleMp(role, mp) {
    if (role === myPlayerRole) {
        mycurrentmp = mp;
    } else {
        tekicurrentmp = mp;
    }
}

function setRoleHp(role, hp) {
    if (role === myPlayerRole) {
        mycurrenthp = hp;
    } else {
        tekicurrenthp = hp;
    }
}

function getRoleDefense(role) {
    return role === myPlayerRole ? mydefense : tekidefense;
}

function setRoleDefense(role, defense) {
    if (role === myPlayerRole) {
        mydefense = defense;
    } else {
        tekidefense = defense;
    }
}

function reserveDrawForRole(role, count = 1) {
    if (!role || count <= 0) return;
    const reserveCount = Math.min(count, getPendingDrawCapacity(role));
    pendingDrawsGlobal[role] = (pendingDrawsGlobal[role] || 0) + reserveCount;
}

function getRandomPlayerRole() {
    return Math.random() < 0.5 ? "player1" : "player2";
}

function getControlRemaining() {
    return controlEffectGlobal?.remaining ?? controlEffectGlobal?.actions ?? 0;
}

function makeControlResultFallback(actorRole) {
    return {
        id: Date.now(),
        player: actorRole,
        damage: 0,
        message: "操作"
    };
}

function getCardActionLabel(card) {
    if (!card) return "";
    if (card === CARDS.enadori) return BOOST_LABEL;
    if (card.type === "attack") return `攻 ${card.value}`;
    if (card.type === "heal") return `回 ${card.value}`;
    if (card.type === "mpheal") return `MP ${card.value}`;
    if (card.type === "defense") return getDefenseCardLabel(card);
    return "";
}

function makeUsedCardInfo(player, card) {
    if (!card) return null;
    return {
        id: Date.now(),
        player,
        type: card.type,
        name: card.name,
        label: getCardActionLabel(card),
        element: card.element || null,
        description: card.description,
        imgSrc: card.imgSrc,
        keep: true
    };
}

function keepUsedCardForTurn(cardInfo, turnRole) {
    if (cardInfo) cardInfo.showOnTurn = turnRole;
    return cardInfo;
}

function makeRandomPendingSelectedCard(player) {
    return {
        id: Date.now(),
        player,
        label: HACKING_PENDING_LABEL,
        randomPending: true,
        keep: true,
        showOnTurn: player
    };
}

function canUseCardByControlledRandom(cardKey, card) {
    if (!card || cardKey === MAGIC_CARD_KEY || cardKey === "hacking") return false;
    return card.type === "attack" || card.type === "heal" || card.type === "mpheal" || card.type === "defense";
}

function getControlledActionCandidates(role) {
    return getHandByRole(role)
        .map((cardKey, handIndex) => ({ cardKey, handIndex, card: CARDS[cardKey] }))
        .filter(({ cardKey, card }) => canUseCardByControlledRandom(cardKey, card));
}

function getNextTurnRoleAfterAction(nextTurnRole) {
    return getRoleHp("player1") <= 0 || getRoleHp("player2") <= 0 ? "end" : nextTurnRole;
}

function makeMissResult(targetRole) {
    return {
        id: Date.now(),
        player: targetRole,
        damage: 0,
        message: "外れ"
    };
}

function makeHandDestroyResult(targetRole) {
    return {
        id: Date.now(),
        player: targetRole,
        damage: 0,
        message: "破壊"
    };
}

function makeSafeResult(targetRole) {
    return {
        id: Date.now(),
        player: targetRole,
        damage: 0,
        message: "無事"
    };
}

function makeControlledAttackInfo(actorRole, targetRole, card, nextTurnRole) {
    const attackCardInfo = {
        name: card.name,
        imgSrc: card.imgSrc,
        value: card.value,
        element: card.element || null,
        description: card.description,
        player: actorRole,
        target: targetRole,
        hit: true,
        controlled: true,
        afterTurn: nextTurnRole
    };
    if (card.hitRate !== undefined) attackCardInfo.hitRate = card.hitRate;
    return attackCardInfo;
}

function applyControlledHeal(card, targetRole) {
    const beforeHp = getRoleHp(targetRole);
    const healedHp = Math.min(99, beforeHp + card.value);
    setRoleHp(targetRole, healedHp);
    return {
        id: Date.now(),
        player: targetRole,
        type: "heal",
        amount: healedHp - beforeHp
    };
}

function applyControlledMpHeal(card, targetRole) {
    const beforeMp = getRoleMp(targetRole);
    const recoveredMp = Math.min(99, beforeMp + card.value);
    setRoleMp(targetRole, recoveredMp);
    return {
        id: Date.now(),
        player: targetRole,
        type: "mpheal",
        amount: recoveredMp - beforeMp
    };
}

function executeControlledRandomAction() {
    if (!controlEffectGlobal || controlEffectGlobal.target !== myPlayerRole || !isMyTurnGlobal || pendingAttackGlobal > 0) {
        controlledActionInProgress = false;
        lastControlledActionKey = null;
        return;
    }

    const actorRole = myPlayerRole;
    const nextTurn = getOpponentRole(actorRole);
    const remaining = getControlRemaining();
    const nextRemaining = Math.max(0, remaining - 1);
    const nextControlEffect = nextRemaining > 0
        ? { ...controlEffectGlobal, remaining: nextRemaining }
        : null;
    let actionResult = makeControlResultFallback(actorRole);
    let handEffect = null;
    let usedCardInfo = null;

    clearCardActionDisplays();
    clearSelectedCardState();
    update(gameRoomRef, {
        selected_card: makeRandomPendingSelectedCard(actorRole)
    });

    setTimeout(() => {
        try {
            if (!controlEffectGlobal
                || controlEffectGlobal.target !== actorRole
                || !isMyTurnGlobal
                || pendingAttackGlobal > 0) {
                controlledActionInProgress = false;
                lastControlledActionKey = null;
                queueMicrotask(maybeRunControlledRound);
                return;
            }

            const actorHand = getHandByRole(actorRole);
            const actionCandidates = getControlledActionCandidates(actorRole);

            if (actionCandidates.length === 0) {
                controlledActionInProgress = false;
                const nextTurnRole = getNextTurnRoleAfterAction(nextTurn);
                sendGameState(nextTurnRole, 0, null, "", actionResult, null, nextControlEffect, null);
                return;
            }

            const randomCandidate = actionCandidates[Math.floor(Math.random() * actionCandidates.length)];
            const randomCardKey = randomCandidate.cardKey;
            const randomCard = randomCandidate.card;
            actorHand.splice(randomCandidate.handIndex, 1);
            reserveDrawForRole(actorRole, 1);
            usedCardInfo = makeUsedCardInfo(actorRole, randomCard);
            if (usedCardInfo) usedCardInfo.controlled = true;

            if (randomCard.type === "attack") {
                const targetRole = getRandomPlayerRole();
                if (usedCardInfo) usedCardInfo.target = targetRole;
                const hit = randomCard.hitRate === undefined || Math.random() < randomCard.hitRate;

                if (!hit) {
                    actionResult = makeMissResult(targetRole);
                } else if (randomCardKey === "mojibake") {
                    handEffect = destroyRandomHandCard(targetRole);
                    actionResult = makeHandDestroyResult(targetRole);
                } else {
                    const attackCardInfo = makeControlledAttackInfo(actorRole, targetRole, randomCard, nextTurn);
                    controlledActionInProgress = false;
                    sendGameState(targetRole, randomCard.value, attackCardInfo, "", null, null, nextControlEffect, null);
                    return;
                }
            } else if (randomCard.type === "heal") {
                const targetRole = getRandomPlayerRole();
                if (usedCardInfo) usedCardInfo.target = targetRole;
                actionResult = applyControlledHeal(randomCard, targetRole);
            } else if (randomCard.type === "mpheal") {
                const targetRole = getRandomPlayerRole();
                if (usedCardInfo) usedCardInfo.target = targetRole;
                actionResult = applyControlledMpHeal(randomCard, targetRole);
            } else if (randomCard.type === "defense") {
                if (usedCardInfo) usedCardInfo.target = actorRole;
                setRoleDefense(actorRole, 0);
                actionResult = makeSafeResult(actorRole);
            }

            controlledActionInProgress = false;
            const nextTurnRole = getNextTurnRoleAfterAction(nextTurn);
            sendGameState(nextTurnRole, 0, null, "", actionResult, handEffect, nextControlEffect, keepUsedCardForTurn(usedCardInfo, nextTurnRole));
        } catch (error) {
            console.error("controlled random card selection failed", error);
            controlledActionInProgress = false;
            lastControlledActionKey = null;
            const nextTurnRole = getNextTurnRoleAfterAction(nextTurn);
            sendGameState(nextTurnRole, 0, null, "", makeControlResultFallback(actorRole), null, nextControlEffect, null);
        }
    }, CONTROL_RANDOM_PREVIEW_MS);
}

function maybeRunControlledRound() {
    if (!gameStartedGlobal || matchStartCountdownActive) return;
    const remaining = getControlRemaining();
    const actionKey = controlEffectGlobal ? `${controlEffectGlobal.id}:${remaining}` : null;

    if (
        controlledActionInProgress ||
        !controlEffectGlobal ||
        controlEffectGlobal.target !== myPlayerRole ||
        !isMyTurnGlobal ||
        pendingAttackGlobal > 0 ||
        remaining <= 0 ||
        lastControlledActionKey === actionKey
    ) {
        return;
    }

    if (isTutorialActive) return;

    if (!isTutorialComplete(RANDOM_TUTORIAL_KEY)) {
        update(gameRoomRef, {
            selected_card: makeRandomPendingSelectedCard(myPlayerRole)
        });
        startTutorial("random-control");
        if (isTutorialActive && tutorialMode === "random-control") return;
    }

    lastControlledActionKey = actionKey;
    controlledActionInProgress = true;
    setTimeout(() => {
        try {
            executeControlledRandomAction();
        } catch (error) {
            console.error("controlled random action failed", error);
            controlledActionInProgress = false;
            lastControlledActionKey = null;
            resetTimerWhenTurnStateChanges(currentTurnGlobal, pendingAttackGlobal);
        }
    }, CONTROLLED_ROUND_DELAY_MS);
}

function hasAttributeNeutralizer(role) {
    return (selectedDefenseCards[role] || []).some(card => card.attributeNeutralizer);
}

function isAttackAttributeNeutralized(role, attackCard = currentAttackCardGlobal) {
    return Boolean(attackCard?.element && hasAttributeNeutralizer(role));
}

function getEffectiveAttackElement(role, attackCard = currentAttackCardGlobal) {
    if (role && isAttackAttributeNeutralized(role, attackCard)) return null;
    return attackCard?.element || null;
}

function getEffectiveDefenseValue(card, attackCard = currentAttackCardGlobal, role = null) {
    if (!card) return 0;
    const attackElement = getEffectiveAttackElement(role, attackCard);
    if (attackElement === "material" && Number(card.materialDefenseValue) > 0) {
        return Number(card.materialDefenseValue);
    }
    return Number(card.value) || 0;
}

function syncSelectedDefenseState(role) {
    const cards = selectedDefenseCards[role] || [];
    defenseCardsGlobal[role] = cards.map(({ cardKey, name, type, imgSrc, value, materialDefenseValue, reductionRate, reflectAttack, attributeNeutralizer, blocksElement, blocksElements, description }) => ({
        cardKey: cardKey || "",
        name: name || "",
        type: type || "defense",
        imgSrc: imgSrc || "",
        value: Number(value) || 0,
        materialDefenseValue: Number(materialDefenseValue) || 0,
        reductionRate: Number(reductionRate) || 0,
        reflectAttack: Boolean(reflectAttack),
        attributeNeutralizer: Boolean(attributeNeutralizer),
        blocksElement: blocksElement || null,
        blocksElements: Array.isArray(blocksElements) ? blocksElements : [],
        description: description || ""
    }));

    if (role === myPlayerRole) {
        mydefense = cards.reduce((sum, card) => sum + getEffectiveDefenseValue(card, currentAttackCardGlobal, role), 0);
    }
}

function getDefenseCardLabel(card) {
    if (!card) return "";
    if (card.reflectAttack) return "反射";
    if (card.attributeNeutralizer) return "属性無効";
    if (card.reductionRate) return `${Math.round(card.reductionRate * 100)}%減`;
    return `守 ${card.value}`;
}

function canDefenseCardBlockAttack(card, attackCard = currentAttackCardGlobal, role = null) {
    if (!card || card.type !== "defense") return false;
    const attackElement = getEffectiveAttackElement(role, attackCard);
    if (card.attributeNeutralizer) return Boolean(attackCard?.element);
    if (card.reflectAttack) return true;
    if (!attackElement || attackElement === "material") return true;
    const supportedElements = Array.isArray(card.blocksElements)
        ? card.blocksElements
        : (card.blocksElement ? [card.blocksElement] : []);
    return supportedElements.includes(attackElement);
}

function canSelectDefenseCard(role, card, handIndex) {
    const selected = selectedDefenseCards[role] || [];
    if (selected.some(item => item.handIndex === handIndex)) return true;
    if (selected.some(item => item.reflectAttack)) return false;
    if (card?.reflectAttack && selected.length > 0) return false;
    return true;
}

function normalizeSelectedDefenseCards(role) {
    const selected = selectedDefenseCards[role] || [];
    selectedDefenseCards[role] = selected;
    const normalized = selected.filter(card =>
        canDefenseCardBlockAttack(card, currentAttackCardGlobal, role)
    );
    selectedDefenseCards[role] = normalized;
    return normalized;
}

function getDefenseCardBattleLabel(card, attackValue = pendingAttackGlobal, role = myPlayerRole) {
    if (!card?.reductionRate || attackValue <= 0) {
        if (card?.reflectAttack) return "反射";
        if (card?.attributeNeutralizer) return "属性無効";
        const effectiveValue = getEffectiveDefenseValue(card, currentAttackCardGlobal, role);
        return effectiveValue > 0 ? `守 ${effectiveValue}` : getDefenseCardLabel(card);
    }
    const remainingDamage = Math.ceil(attackValue * (1 - card.reductionRate));
    const effectiveDefense = Math.max(0, attackValue - remainingDamage);
    return `${Math.round(card.reductionRate * 100)}%減（守 ${effectiveDefense}）`;
}

function makeDefenseRevealCards(role, attackValue = pendingAttackGlobal) {
    return (selectedDefenseCards[role] || []).map(card => ({
        cardKey: card.cardKey || "",
        name: card.name || "",
        type: card.type || "defense",
        imgSrc: card.imgSrc || "",
        value: Number(card.value) || 0,
        materialDefenseValue: Number(card.materialDefenseValue) || 0,
        reductionRate: Number(card.reductionRate) || 0,
        reflectAttack: Boolean(card.reflectAttack),
        attributeNeutralizer: Boolean(card.attributeNeutralizer),
        blocksElement: card.blocksElement || null,
        blocksElements: Array.isArray(card.blocksElements) ? card.blocksElements : [],
        description: card.description || "",
        battleLabel: getDefenseCardBattleLabel(card, attackValue, role)
    }));
}

function getDefenseSummary(role) {
    const cards = (selectedDefenseCards[role] || []).filter(card =>
        canDefenseCardBlockAttack(card, currentAttackCardGlobal, role)
    );
    const remainingMultiplier = cards.reduce(
        (multiplier, card) => multiplier * (1 - (card.reductionRate || 0)),
        1
    );
    const reductionPercent = Math.round((1 - remainingMultiplier) * 100);
    const flatDefense = cards.reduce((sum, card) => sum + getEffectiveDefenseValue(card, currentAttackCardGlobal, role), 0);
    return { remainingMultiplier, reductionPercent, flatDefense };
}

function calculateDamageAfterDefense(attackValue, role) {
    const { remainingMultiplier, flatDefense } = getDefenseSummary(role);
    const reducedAttack = Math.ceil(Math.max(0, attackValue) * remainingMultiplier);
    return Math.max(0, reducedAttack - flatDefense);
}

function isMaterialAttack(attackCard = currentAttackCardGlobal) {
    return attackCard?.element === "material" && !attackCard?.attributeNeutralized;
}

function applyDamageToHp(currentHp, damage, attackCard = currentAttackCardGlobal) {
    if (isMaterialAttack(attackCard) && damage > 0) return 0;
    return Math.max(0, currentHp - damage);
}

function makeDamageResult(role, damage, attackCard = currentAttackCardGlobal, hpBeforeDamage = null) {
    const isInstantDeath = isMaterialAttack(attackCard) && damage > 0;
    const displayDamage = isInstantDeath && Number(hpBeforeDamage) > 0
        ? Number(hpBeforeDamage)
        : damage;
    const result = {
        id: Date.now(),
        player: role,
        damage: displayDamage,
        attackPlayer: attackCard?.player || null,
        attackTarget: attackCard?.target || role
    };
    if (isInstantDeath) {
        result.instantDeath = true;
        result.rawDamage = damage;
    }
    return result;
}

function markKnockoutResult(result) {
    if (!result) return result;
    result.message = "撃沈";
    result.knockout = true;
    return result;
}

function getDefenseConfirmLabel(role) {
    const { remainingMultiplier, reductionPercent, flatDefense } = getDefenseSummary(role);
    const hasReflection = (selectedDefenseCards[role] || []).some(card => card.reflectAttack);
    if (hasReflection) return "反射";
    if (hasAttributeNeutralizer(role) && flatDefense <= 0 && reductionPercent <= 0) return "属性無効";
    if (reductionPercent > 0) {
        const reducedDamage = Math.ceil(pendingAttackGlobal * remainingMultiplier);
        const percentageDefense = Math.max(0, pendingAttackGlobal - reducedDamage);
        return `守 ${percentageDefense + flatDefense}（${reductionPercent}%減）`;
    }
    return flatDefense > 0 ? `守 ${flatDefense}` : "許す";
}

function consumeSelectedDefenseCards(role) {
    const cards = [...(selectedDefenseCards[role] || [])].sort((a, b) => b.handIndex - a.handIndex);
    const hand = getHandByRole(role);

    cards.forEach(card => {
        if (hand[card.handIndex] === card.cardKey) {
            hand.splice(card.handIndex, 1);
            return;
        }

        const fallbackIndex = hand.indexOf(card.cardKey);
        if (fallbackIndex !== -1) {
            hand.splice(fallbackIndex, 1);
        }
    });

    selectedDefenseCards[role] = [];
    defenseCardsGlobal[role] = [];
    return cards.length;
}

function tryReflectPendingAttack(role) {
    const selectedCards = selectedDefenseCards[role] || [];
    if (pendingAttackGlobal <= 0 || !selectedCards.some(card => card.reflectAttack)) return false;

    const incomingAttack = currentAttackCardGlobal || {};
    const reflectedTarget = incomingAttack.player || getOpponentRole(role);
    const reflectedValue = pendingAttackGlobal;
    const usedDefenseCount = consumeSelectedDefenseCards(role);
    reserveDrawForRole(role, usedDefenseCount);
    setRoleDefense(role, 0);

    const reflectedAttackCard = {
        ...incomingAttack,
        name: incomingAttack.name || "反射攻撃",
        value: reflectedValue,
        description: `${incomingAttack.description || "攻撃"}（ニュートンのゆりかごで反射）`,
        player: role,
        target: reflectedTarget,
        reflected: true,
        reflectionFrom: reflectedTarget,
        reflectionId: Date.now(),
        reflectionDepth: (incomingAttack.reflectionDepth || 0) + 1,
        relayRepeat: 0,
        afterTurn: role
    };
    const reflectionResult = {
        id: Date.now(),
        player: role,
        type: "reflect",
        damage: 0,
        message: "反射"
    };

    pendingAttackGlobal = 0;
    currentAttackCardGlobal = null;
    clearSelectedDefenseCards();
    clearCardActionDisplays();
    clearSelectedCardState();
    isMyTurnGlobal = false;
    renderHands();
    sendGameState(reflectedTarget, reflectedValue, reflectedAttackCard, "", reflectionResult);
    return true;
}

function clearSelectedDefenseCards() {
    selectedDefenseCards = {
        player1: [],
        player2: []
    };
}

function getOpponentRole(role) {
    return role === "player1" ? "player2" : "player1";
}

function getSelectedCard() {
    if (selectedCardIndex === null || !myPlayerRole) return null;
    const hand = (myPlayerRole === "player1") ? myHand : tekiHand;
    return CARDS[hand[selectedCardIndex]];
}

function getSelectedCardKey() {
    if (selectedCardIndex === null || !myPlayerRole) return null;
    return getHandByRole(myPlayerRole)[selectedCardIndex] || null;
}

function canApplyAttackBoost(cardKey, card = CARDS[cardKey]) {
    if (!card || card.type !== "attack" || card.value <= 0) return false;
    if (card.hitRate !== undefined) return false;
    if (card.element === "material") return false;
    return cardKey !== "hacking" && cardKey !== "mojibake";
}

function isNormalActionCard(cardKey, card = CARDS[cardKey]) {
    return !!card && cardKey !== MAGIC_CARD_KEY && cardKey !== TIME_CARD_KEY && cardKey !== RELAY_CARD_KEY
        && cardKey !== "hacking" && cardKey !== "mojibake"
        && (card.type === "attack" || card.type === "heal" || card.type === "mpheal" || card.type === "defense");
}

function canApplyExtraTurn(cardKey, card = CARDS[cardKey]) {
    return isNormalActionCard(cardKey, card);
}

function canApplyRepeatAttack(cardKey, card = CARDS[cardKey]) {
    return !!card && card.type === "attack" && card.value > 0 && cardKey !== "hacking" && cardKey !== "mojibake";
}

function canSelectHandComboCard(comboCardKey, selectedCardKey, selectedCard = CARDS[selectedCardKey]) {
    if (comboCardKey === MAGIC_CARD_KEY) return canApplyAttackBoost(selectedCardKey, selectedCard);
    if (comboCardKey === TIME_CARD_KEY) return canApplyExtraTurn(selectedCardKey, selectedCard);
    if (comboCardKey === RELAY_CARD_KEY) return canApplyRepeatAttack(selectedCardKey, selectedCard);
    return false;
}

function getComboCardLabel(cardKey, card = CARDS[cardKey]) {
    if (cardKey === MAGIC_CARD_KEY) return BOOST_LABEL;
    if (cardKey === TIME_CARD_KEY) return "再行動";
    if (cardKey === RELAY_CARD_KEY) return "2連続";
    return getDisplayCardLabel(card);
}

function getCurrentPlayerHand() {
    return getHandByRole(myPlayerRole);
}

const BOOST_CARD_KEY = MAGIC_CARD_KEY;
const BOOST_LABEL = "&times;2";

function getDisplayCardLabel(card) {
    if (!card) return "";
    if (card === CARDS.enadori) return `${BOOST_LABEL} / ${card.mpCost}MP`;
    if (card === CARDS.timecard) return "再行動";
    if (card === CARDS.relay) return "2連続";
    if (card.type === "attack") return `攻 ${card.value}`;
    if (card.type === "heal") return `回 ${card.value}`;
    if (card.type === "mpheal") return `MP ${card.value}`;
    if (card.type === "defense") return getDefenseCardLabel(card);
    if (card.type === "special" && card.drawCards) return `+${card.drawCards}枚`;
    return "";
}

function getSelectedBoostEntries() {
    return getSelectedComboEntries().filter(entry => entry.cardKey === BOOST_CARD_KEY);
}

function getSelectedComboEntries() {
    const magicHand = getMagicHandByRole(myPlayerRole);
    const hand = getHandByRole(myPlayerRole);
    const unlockedEntries = selectedBoostCardIndexes.map(handIndex => ({
        source: "magic",
        handIndex,
        cardKey: magicHand[handIndex],
        card: CARDS[magicHand[handIndex]]
    }));
    const handEntries = selectedHandMagicCardIndexes.map(handIndex => ({
        source: "hand",
        handIndex,
        cardKey: hand[handIndex],
        card: CARDS[hand[handIndex]]
    }));
    return [...unlockedEntries, ...handEntries]
        .filter(entry => entry.card);
}

function makeBoostCardInfo(entry) {
    return {
        name: entry.card.name,
        label: getComboCardLabel(entry.cardKey, entry.card),
        description: entry.card.description,
        imgSrc: entry.card.imgSrc
    };
}

function renderCardInfoBlock(card, label, size = 40, showDescription = false) {
    const attributeMeta = getAttributeMeta(card?.element);
    const isChouboCard = card?.imgSrc?.includes("tyobo.png");
    const isRoppouCard = card?.imgSrc?.includes("roppou.png");
    const attributeIcon = attributeMeta
        ? `<img class="card-attribute-icon" src="${attributeMeta.icon}" alt="${attributeMeta.alt}">`
        : "";
    const attributeNameClass = attributeMeta ? ` ${attributeMeta.nameClass}` : "";
    return `
        <div class="card-info-panel${showDescription ? " has-description" : ""}${isChouboCard ? " choubo-card-info" : ""}${isRoppouCard ? " roppou-card-info" : ""}">
            <div class="card-info-image">
                <img src="${card.imgSrc}" alt="${card.name}">
            </div>
            <div class="card-info-body">
                <div class="card-info-name${attributeNameClass}"><span class="card-info-name-text">${card.name}</span>${attributeIcon}</div>
                <div class="card-info-effect">${label || ""}</div>
                ${showDescription ? `<div class="card-info-description">${card.description || "説明なし"}</div>` : ""}
            </div>
        </div>
    `;
}

let activeHandHoverButton = null;

function getHandHoverPreviewElement() {
    let preview = document.getElementById("hand-hover-preview");
    if (!preview) {
        preview = document.createElement("div");
        preview.id = "hand-hover-preview";
        preview.className = "hand-hover-preview";
        (gameScreenDiv || document.body).appendChild(preview);
    }
    return preview;
}

function positionHandHoverPreview(sourceEl, previewEl) {
    const host = gameScreenDiv || document.body;
    const hostRect = host.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();
    const previewWidth = previewEl.offsetWidth || 300;
    const previewHeight = previewEl.offsetHeight || 90;
    const minEdge = 6;

    const left = Math.max(minEdge, hostRect.width - previewWidth - minEdge);

    let top = sourceRect.top - hostRect.top - Math.max(0, (previewHeight - sourceRect.height) / 2);
    top = Math.max(minEdge, Math.min(top, hostRect.height - previewHeight - minEdge));

    previewEl.style.left = `${left}px`;
    previewEl.style.top = `${top}px`;
}

function showHandHoverPreview(sourceEl, card) {
    if (!sourceEl || !card || window.matchMedia("(hover: none)").matches) return;
    activeHandHoverButton = sourceEl;
    const preview = getHandHoverPreviewElement();
    preview.innerHTML = renderCardInfoBlock(card, getDisplayCardLabel(card), 40, true);
    preview.classList.add("is-visible");
    positionHandHoverPreview(sourceEl, preview);
}

function hideHandHoverPreview(sourceEl = null) {
    if (sourceEl && activeHandHoverButton !== sourceEl) return;
    activeHandHoverButton = null;
    const preview = document.getElementById("hand-hover-preview");
    if (preview) preview.classList.remove("is-visible");
}

function renderSelectedCardInfo() {
    renderSelectedCardInfoV2();
}

function renderSelectedCardInfoV2() {
    if (selectedCardIndex === null || !myPlayerRole) return;

    const hand = getCurrentPlayerHand();
    const cardKey = hand[selectedCardIndex];
    const card = CARDS[cardKey];
    if (!card) return;

    const comboEntries = getSelectedComboEntries();
    const boostEntries = getSelectedBoostEntries();
    const targetDiv = (myPlayerRole === "player1") ? player1Div : player2Div;
    if (!targetDiv) return;
    targetDiv.querySelectorAll(".attack-total-display").forEach(el => el.remove());

    let infoDiv = targetDiv.querySelector(".selected-card-info");
    if (!infoDiv) {
        infoDiv = document.createElement("div");
        infoDiv.className = "selected-card-info";
        targetDiv.appendChild(infoDiv);
    }
    const label = getDisplayCardLabel(card);
    const isSelfAttack = card.type === "attack" && selectedAttackTargetRole === myPlayerRole;
    infoDiv.classList.remove("self-attack-card-display");
    infoDiv.innerHTML = `
        <div>
            ${renderCardInfoBlock(card, label, 40, true)}
            ${comboEntries.map(entry => renderCardInfoBlock(entry.card, getComboCardLabel(entry.cardKey, entry.card), 34, true)).join("")}
        </div>
    `;

    if (card.type === "attack" && cardKey !== BOOST_CARD_KEY && card.value > 0) {
        const totalDiv = document.createElement("div");
        totalDiv.className = `attack-total-display${getAttackTotalAttributeClass(card)}`;
        totalDiv.textContent = `攻 ${card.value * (2 ** boostEntries.length)}`;
        targetDiv.appendChild(totalDiv);
    }

    update(gameRoomRef, {
        selected_card: {
            player: myPlayerRole,
            type: card.type,
            name: card.name,
            label,
            element: card.element || null,
            description: card.description,
            imgSrc: card.imgSrc,
            target: selectedAttackTargetRole,
            boosts: comboEntries.map(makeBoostCardInfo)
        }
    });
}

function setAttackTarget(role) {
    if (!gameStartedGlobal) return;
    if (pendingAttackGlobal > 0) return;
    const selectedCard = getSelectedCard();
    const actionType = selectedCard?.type || "";
    const isAttackCard = actionType === "attack";
    if (selectedCard?.type === "attack") {
        role = getOpponentRole(myPlayerRole);
    } else if (["heal", "mpheal", "defense", "special"].includes(selectedCard?.type)) {
        role = myPlayerRole;
    }
    selectedAttackTargetRole = role;
    updateAttackTargetDisplay(myPlayerRole, selectedAttackTargetRole, isAttackCard, { actionType });
}

function updateAttackTargetDisplay(attackerRole = myPlayerRole, targetRole = selectedAttackTargetRole, isAttackTarget = true, options = {}) {
    const isSupportAction = ["heal", "mpheal", "defense", "special"].includes(options.actionType);
    const isSelfAttack = !isSupportAction && !!isAttackTarget && !!attackerRole && !!targetRole && attackerRole === targetRole;
    status1Div?.classList.toggle("attack-target-selected", !isSelfAttack && isAttackTarget && targetRole === "player1");
    status2Div?.classList.toggle("attack-target-selected", !isSelfAttack && isAttackTarget && targetRole === "player2");
    status1Div?.classList.remove("self-attack-target");
    status2Div?.classList.remove("self-attack-target");
    player1Div?.classList.remove("self-attack-player", "self-attack-mirror-player");
    player2Div?.classList.remove("self-attack-player", "self-attack-mirror-player");
    battleSelectDiv?.classList.toggle("self-attack-mode", isSelfAttack);
    battleSelectDiv?.classList.toggle("heal-mode", isSupportAction);
    battleSelectDiv?.classList.toggle("heal-player1", isSupportAction && attackerRole === "player1");
    battleSelectDiv?.classList.toggle("heal-player2", isSupportAction && attackerRole === "player2");
    if (isSupportAction) {
        const opponentDiv = getPlayerElementByRole(getOpponentRole(attackerRole));
        if (opponentDiv) clearDisplayElements(CARD_ACTION_DISPLAY_SELECTOR, [opponentDiv]);
    }
    if (!options.preserveOrder) {
        updateAttackerDisplayOrder(attackerRole);
    }
    updateSelfAttackNameDisplay(attackerRole, targetRole, isSelfAttack);
    scheduleTutorialPositionUpdate();

    if (!attackArrowDiv || !attackerRole || !targetRole) return;
    attackArrowDiv.classList.remove("arrow-up", "arrow-down", "arrow-self");
    attackArrowDiv.removeAttribute("aria-label");

    if (isSelfAttack) {
        attackArrowDiv.textContent = getAttackArrowText(attackerRole, targetRole, isSelfAttack);
        attackArrowDiv.classList.add("arrow-self");
        attackArrowDiv.setAttribute("aria-label", "自分に攻撃");
    } else if (isSupportAction) {
        attackArrowDiv.textContent = "←";
        attackArrowDiv.classList.add("arrow-up");
        attackArrowDiv.setAttribute("aria-label", `${getPlayerDisplayName(attackerRole)}に使用`);
    } else {
        const arrowText = getAttackArrowText(attackerRole, targetRole, isSelfAttack);
        attackArrowDiv.textContent = arrowText;
        attackArrowDiv.classList.add(arrowText === "←" ? "arrow-up" : "arrow-down");
        attackArrowDiv.setAttribute("aria-label", `${getPlayerDisplayName(attackerRole)}から${getPlayerDisplayName(targetRole)}へ攻撃`);
    }
}

function updateAttackerDisplayOrder(attackerRole) {
    if (!battleSelectDiv || (attackerRole !== "player1" && attackerRole !== "player2")) return;
    if (attackerRole === displayedAttackerRole) return;

    displayedAttackerRole = attackerRole;
    battleSelectDiv.classList.remove("switching-attacker-order");
    battleSelectDiv.classList.toggle("attacker-player2", attackerRole === "player2");
}

function updateObservedAttackTargetDisplay(attackerRole, targetRole, holdForResult = false, isAttackTarget = true, options = {}) {
    if (!attackerRole || !targetRole) return;

    if (holdForResult) {
        clearTimeout(attackDisplayAfterResultTimer);
        attackDisplayAfterResultTimer = null;
        heldAttackDisplayAfterResult = { attackerRole, targetRole, isAttackTarget, options };
        return;
    }

    if (heldAttackDisplayAfterResult) {
        heldAttackDisplayAfterResult = { attackerRole, targetRole, isAttackTarget, options };
        clearTimeout(attackDisplayAfterResultTimer);
        attackDisplayAfterResultTimer = setTimeout(() => {
            const nextDisplay = heldAttackDisplayAfterResult;
            heldAttackDisplayAfterResult = null;
            attackDisplayAfterResultTimer = null;
            if (nextDisplay) {
                updateAttackTargetDisplay(nextDisplay.attackerRole, nextDisplay.targetRole, nextDisplay.isAttackTarget, nextDisplay.options);
            }
        }, ATTACK_DISPLAY_AFTER_RESULT_DELAY_MS);
        return;
    }

    updateAttackTargetDisplay(attackerRole, targetRole, isAttackTarget, options);
}

function applyReflectedAttackSlide(displayElement, attackInfo, targetDiv) {
    if (!displayElement || !targetDiv || !attackInfo?.reflected) return;
    const slideId = attackInfo.reflectionId || `${attackInfo.player}-${attackInfo.target}-${attackInfo.reflectionDepth || 0}`;
    if (slideId === lastReflectedSlideId) return;

    const sourceDiv = getPlayerElementByRole(attackInfo.reflectionFrom || attackInfo.target);
    if (!sourceDiv) return;

    const fromRect = sourceDiv.getBoundingClientRect();
    const toRect = targetDiv.getBoundingClientRect();
    const fromCenterX = fromRect.left + fromRect.width / 2;
    const fromCenterY = fromRect.top + Math.min(140, fromRect.height / 3);
    const toCenterX = toRect.left + toRect.width / 2;
    const toCenterY = toRect.top + Math.min(140, toRect.height / 3);

    displayElement.style.setProperty("--reflect-slide-x", `${fromCenterX - toCenterX}px`);
    displayElement.style.setProperty("--reflect-slide-y", `${fromCenterY - toCenterY}px`);
    displayElement.classList.add("reflected-attack-card-display");
    lastReflectedSlideId = slideId;
}

function handlePlayerAreaClick() {
    if (!gameStartedGlobal) return;
    if (!isMyTurnGlobal) return;
    if (selectedCardIndex === null && pendingAttackGlobal <= 0) return;
    if (isTutorialActive && tutorialMode === "boost-select") return;
    if (isTutorialActive && (tutorialMode === "attack-confirm" || tutorialMode?.startsWith("defense"))) {
        closeTutorial(true);
    }
    executeCard();
}

if (player1Div) player1Div.onclick = handlePlayerAreaClick;
if (player2Div) player2Div.onclick = handlePlayerAreaClick;
status1Div?.addEventListener("click", () => setAttackTarget("player1"));
status2Div?.addEventListener("click", () => setAttackTarget("player2"));


window.selectCard = function(handIndex) {
    if (!gameStartedGlobal) return;
    if (!isMyTurnGlobal) return; // 自分のターン以外は選択できない

    const cardKey = (myPlayerRole === "player1") ? myHand[handIndex] : tekiHand[handIndex];
    const card = CARDS[cardKey];
    const comboEntriesForAction = getSelectedComboEntries();
    const usesTimeCardForAction = comboEntriesForAction.some(entry => entry.cardKey === TIME_CARD_KEY);
    if (!card || shouldTutorialDisableCard(cardKey, card, handIndex)) return;

    if (cardKey === MAGIC_CARD_KEY || cardKey === TIME_CARD_KEY || cardKey === RELAY_CARD_KEY) {
        selectHandMagicCard(handIndex);
        return;
    }

    if (pendingAttackGlobal > 0) {
        if (!canDefenseCardBlockAttack(card, currentAttackCardGlobal, myPlayerRole)) return;
        playSound(SELECT_SOUND_SRC, 0, 0.75);
        useDefenseCardDuringAttack(handIndex, card);
        return;
    }

    playSound(SELECT_SOUND_SRC, 0, 0.75);
    selectedCardIndex = handIndex;
    selectedBoostCardIndexes = [];
    selectedHandMagicCardIndexes = [];
    if (card.type === "attack") {
        setAttackTarget(getOpponentRole(myPlayerRole));
    } else if (card.type === "heal" || card.type === "mpheal") {
        setAttackTarget(myPlayerRole);
    } else {
        setAttackTarget(getOpponentRole(myPlayerRole));
    }
    renderSelectedCardInfoV2();
    renderHands();
    handleTutorialCardSelection(cardKey, card);
    return;

    // 自分の役割に応じて情報を出す対象（player1クラスかplayer2クラスか）を決める
    const targetDiv = (myPlayerRole === "player1") ? player1Div : player2Div;
    
    // エリア内に情報を表示するための専用のdivを無ければ作る
    let infoDiv = targetDiv.querySelector(".selected-card-info");
    if (!infoDiv) {
        infoDiv = document.createElement("div");
        infoDiv.className = "selected-card-info";
        targetDiv.appendChild(infoDiv);
    }

    // 攻・回・守のマーク用
    let label = "";
    if (card.type === "attack") label = `攻 ${card.value}`;
    if (card.type === "heal") label = `回 ${card.value}`;
    if (card.type === "defense") label = `守 ${card.value}`;

    // クラスの範囲内に選択したカードの情報と「確定の案内」を流し込む
    infoDiv.innerHTML = `
    <div style="border: 2px solid #666; padding: 5px; margin-top: 10px; background: rgba(255,255,255,0.8); border-radius: 5px; text-align: center;">
        <img src="${card.imgSrc}" alt="${card.name}" style="width: 40px; height: 40px; vertical-align: middle;">
        <span style="font-weight: bold; margin-left: 5px;">${card.name} (${label})</span>
        <div style="font-size: 11px; color: #555; margin-top: 4px;">${card.description}</div>
        <div style="font-size: 11px; color: #555; margin-top: 2px;">画面をクリックして行動を確定</div>
    </div>
    `;

    // Firebase に選択カード情報を送信
    update(gameRoomRef, {
        selected_card: {
            player: myPlayerRole,
            type: card.type,
            name: card.name,
            label: label,
            description: card.description,
            imgSrc: card.imgSrc
        }
    });
}

function selectHandMagicCard(handIndex) {
    if (pendingAttackGlobal > 0) return;
    const hand = getCurrentPlayerHand();
    const cardKey = hand[handIndex];
    const card = CARDS[hand[handIndex]];
    const selectedCard = getSelectedCard();
    const selectedCardKey = getSelectedCardKey();
    if (!card || !canSelectHandComboCard(cardKey, selectedCardKey, selectedCard)) return;

    const isSelected = selectedHandMagicCardIndexes.includes(handIndex);
    if (cardKey === MAGIC_CARD_KEY) {
        const selectedEnadoriCount = getSelectedBoostEntries().length;
        const nextSelectedCount = isSelected ? selectedEnadoriCount - 1 : selectedEnadoriCount + 1;
        if (!isSelected && mycurrentmp < nextSelectedCount * card.mpCost) return;
    }

    playSound(SELECT_SOUND_SRC, 0, 0.75);
    if (isSelected) {
        selectedHandMagicCardIndexes = selectedHandMagicCardIndexes.filter(index => index !== handIndex);
    } else {
        selectedHandMagicCardIndexes.push(handIndex);
    }
    renderSelectedCardInfoV2();
    renderHands();
    handleTutorialCardSelection(cardKey, card);
}

window.selectMagicCard = function(magicIndex) {
    if (!gameStartedGlobal || !isMyTurnGlobal || pendingAttackGlobal > 0) return;
    const magicHand = getMagicHandByRole(myPlayerRole);
    const cardKey = magicHand[magicIndex];
    const card = CARDS[cardKey];
    const selectedCard = getSelectedCard();
    const selectedCardKey = getSelectedCardKey();
    if (!card || cardKey !== MAGIC_CARD_KEY || !canApplyAttackBoost(selectedCardKey, selectedCard)) return;

    const isSelected = selectedBoostCardIndexes.includes(magicIndex);
    const selectedCount = selectedBoostCardIndexes.length + selectedHandMagicCardIndexes.length;
    const nextSelectedCount = isSelected ? selectedCount - 1 : selectedCount + 1;
    if (!isSelected && mycurrentmp < nextSelectedCount * card.mpCost) return;

    playSound(SELECT_SOUND_SRC, 0, 0.75);
    if (isSelected) {
        selectedBoostCardIndexes = selectedBoostCardIndexes.filter(index => index !== magicIndex);
    } else {
        selectedBoostCardIndexes.push(magicIndex);
    }
    renderSelectedCardInfoV2();
    renderHands();
    handleTutorialCardSelection(cardKey, card);
}

function useDefenseCardDuringAttack(handIndex, card) {
    const cardKey = getHandByRole(myPlayerRole)[handIndex];
    const selected = selectedDefenseCards[myPlayerRole] || [];
    const selectedIndex = selected.findIndex(item => item.handIndex === handIndex);

    if (selectedIndex >= 0) {
        selected.splice(selectedIndex, 1);
    } else {
        if (!canSelectDefenseCard(myPlayerRole, card, handIndex)) return;
        selected.push({
            handIndex,
            cardKey,
            name: card.name,
            type: card.type,
            imgSrc: card.imgSrc,
            value: card.value,
            materialDefenseValue: card.materialDefenseValue,
            reductionRate: card.reductionRate,
            reflectAttack: card.reflectAttack,
            attributeNeutralizer: card.attributeNeutralizer,
            blocksElement: card.blocksElement,
            blocksElements: card.blocksElements,
            description: card.description
        });
    }

    selectedDefenseCards[myPlayerRole] = selected;
    normalizeSelectedDefenseCards(myPlayerRole);
    syncSelectedDefenseState(myPlayerRole);
    clearSelectedCardState();
    renderHands();
    renderDefenseCardDisplay(myPlayerRole, myPlayerRole === "player1" ? player1Div : player2Div);
    if (isTutorialActive && tutorialMode === "defense-select") {
        setTutorialMode("defense-confirm");
    } else if (isTutorialActive && tutorialMode === "defense-confirm") {
        renderTutorialStep();
    }
    sendGameState(myPlayerRole, pendingAttackGlobal, currentAttackCardGlobal);
}

function getOppositeActionDiv(targetDiv) {
    if (targetDiv === player1Div) return player2Div;
    if (targetDiv === player2Div) return player1Div;
    return targetDiv;
}

function getDefenseDisplayTargetDiv(player, targetDiv) {
    const isSelfAttackDefense = currentAttackCardGlobal
        && currentAttackCardGlobal.player === player
        && currentAttackCardGlobal.target === player;
    return isSelfAttackDefense ? getOppositeActionDiv(targetDiv) : targetDiv;
}

function renderDefenseCardDisplay(player, targetDiv) {
    const displayTargetDiv = getDefenseDisplayTargetDiv(player, targetDiv);
    [targetDiv, displayTargetDiv].forEach(div => {
        div?.querySelectorAll(
            `.defense-card-list[data-defense-player="${player}"], ` +
            `.defense-card-display[data-defense-player="${player}"], ` +
            ".defense-card-list:not([data-defense-player]), " +
            ".defense-card-display:not([data-defense-player])"
        ).forEach(el => el.remove());
    });

    const cards = defenseCardsGlobal[player] || [];
    if (!displayTargetDiv || cards.length === 0) return;

    const listDiv = document.createElement("div");
    listDiv.className = "defense-card-list";
    listDiv.dataset.defensePlayer = player;
    cards.forEach(card => {
        const dispDiv = document.createElement("div");
        dispDiv.className = "defense-card-display";
        dispDiv.dataset.defensePlayer = player;
        dispDiv.innerHTML = renderCardInfoBlock(card, getDefenseCardBattleLabel(card), 40, true);
        listDiv.appendChild(dispDiv);
    });
    displayTargetDiv.appendChild(listDiv);
}

function renderRevealedDefenseSequence(targetDiv, cards = []) {
    if (!targetDiv || !Array.isArray(cards) || cards.length === 0) return 0;

    targetDiv
        .querySelectorAll(".revealed-defense-sequence, .revealed-defense-card")
        .forEach(el => el.remove());

    const listDiv = document.createElement("div");
    listDiv.className = "defense-card-list revealed-defense-sequence";
    targetDiv.appendChild(listDiv);

    cards.forEach((card, index) => {
        setTimeout(() => {
            if (!listDiv.isConnected) return;
            const dispDiv = document.createElement("div");
            dispDiv.className = "defense-card-display revealed-defense-card";
            dispDiv.innerHTML = renderCardInfoBlock(card, card.battleLabel || getDefenseCardBattleLabel(card), 40, true);
            listDiv.appendChild(dispDiv);
        }, index * DEFENSE_REVEAL_INTERVAL_MS);
    });

    return cards.length * DEFENSE_REVEAL_INTERVAL_MS;
}

function renderRevealedDefenseSequence(targetDiv, cards = []) {
    if (!targetDiv || !Array.isArray(cards) || cards.length === 0) return 0;

    targetDiv
        .querySelectorAll(".revealed-defense-sequence, .revealed-defense-card")
        .forEach(el => el.remove());

    const listDiv = document.createElement("div");
    listDiv.className = "defense-card-list revealed-defense-sequence";
    targetDiv.appendChild(listDiv);

    cards.forEach((card, index) => {
        setTimeout(() => {
            if (!listDiv.isConnected) return;
            const dispDiv = document.createElement("div");
            dispDiv.className = "defense-card-display revealed-defense-card";
            dispDiv.innerHTML = renderCardInfoBlock(card, card.battleLabel || getDefenseCardBattleLabel(card), 40, true);
            listDiv.appendChild(dispDiv);
        }, index * DEFENSE_REVEAL_INTERVAL_MS);
    });

    return cards.length * DEFENSE_REVEAL_INTERVAL_MS;
}

function renderDamageResultDisplay(result) {
    if (!result || !result.player) return;
    if (result.id && result.id === lastRenderedDamageResultId) return;

    [player1Div, player2Div, gameScreenDiv].forEach(div => {
        div?.querySelectorAll(".damage-result-display").forEach(el => el.remove());
    });

    const targetDiv = (result.player === "player1") ? player1Div : player2Div;
    if (!targetDiv) return;

    const dispDiv = document.createElement("div");
    dispDiv.className = "damage-result-display";
    const isHeal = result.type === "heal";
    const isMpHeal = result.type === "mpheal";
    const isSafe = !isHeal && !isMpHeal && result.damage <= 0;
    const text = isHeal ? `+${result.amount}HP` : (isMpHeal ? `+${result.amount}MP` : (isSafe ? "無事" : `${result.damage}ダメージ`));
    const color = isHeal || isMpHeal ? "#008f6f" : (isSafe ? "#008f6f" : "#d03030");
    const bg = isHeal || isMpHeal || isSafe ? "rgba(225,255,240,0.95)" : "rgba(255,230,230,0.95)";
    dispDiv.innerHTML = `
        <div style="border: 2px solid ${color}; padding: 6px; margin-top: 10px; background: ${bg}; border-radius: 5px; text-align: center;">
            <span style="font-size: 16px; font-weight: bold; color: ${color};">${text}</span>
        </div>
    `;
    placeDamageResultDisplay(targetDiv, dispDiv);
    const renderedResultId = result.id || Date.now();
    lastRenderedDamageResultId = renderedResultId;
    setTimeout(() => {
        dispDiv.remove();
        if (damageResultGlobal?.id === renderedResultId) {
            update(gameRoomRef, { damage_result: null });
        }
    }, RESULT_DISPLAY_MS);
}

function placeDamageResultDisplay(targetDiv, dispDiv) {
    if (!targetDiv || !dispDiv) return;

    targetDiv.appendChild(dispDiv);
}

function renderResultPanelDisplay(result) {
    if (!result || !result.player) {
        clearTimeout(resultDisplayTimer);
        resultDisplayTimer = null;
        [player1Div, player2Div, gameScreenDiv].forEach(div => {
            div?.classList.remove("player-result-active");
            div?.querySelectorAll(".damage-result-display").forEach(el => el.remove());
        });
        return;
    }
    if (result.id && result.id === lastRenderedDamageResultId) return;

    clearTimeout(resultDisplayTimer);
    [player1Div, player2Div, gameScreenDiv].forEach(div => {
        div?.classList.remove("player-result-active");
        div?.querySelectorAll(".damage-result-display").forEach(el => el.remove());
    });

    const renderedResultId = result.id || Date.now();
    lastRenderedDamageResultId = renderedResultId;
    const baseTargetDivForSequence = (result.player === "player1") ? player1Div : player2Div;
    const targetDivForSequence = result.attackPlayer === result.player && result.attackTarget === result.player
        ? getOppositeActionDiv(baseTargetDivForSequence)
        : baseTargetDivForSequence;
    const defenseRevealDelay = renderRevealedDefenseSequence(targetDivForSequence, result.usedDefenseCards);
    resultDisplayTimer = setTimeout(() => {
        resultDisplayTimer = null;
        const targetDiv = (result.player === "player1") ? player1Div : player2Div;
        if (!targetDiv) return;

        const isHeal = result.type === "heal";
        const isMpHeal = result.type === "mpheal";
        const isSafe = !isHeal && !isMpHeal && result.damage <= 0;
        const isReflection = result.type === "reflect" || result.message === "反射";
        const isKnockout = result.knockout || result.message === "撃沈";
        if (isReflection) {
            playSound(REFLECT_SOUND_SRC, 0, 0.85);
            setTimeout(() => {
                if (damageResultGlobal?.id === renderedResultId) {
                    update(gameRoomRef, { damage_result: null });
                }
            }, Math.max(RESULT_DISPLAY_MS, 650));
            return;
        }

        targetDiv.classList.add("player-result-active");

        const messageText = result.message && result.message !== "即死" && !isKnockout ? result.message : "";
        const valueText = messageText || (isHeal || isMpHeal ? `+${result.amount}` : (isSafe ? "無事" : result.damage));
        const labelText = messageText ? "" : (isHeal ? "HP回復" : (isMpHeal ? "MP回復" : (isSafe ? "" : "ダメージ")));
        const typeClass = isHeal || isMpHeal
            ? "heal-result"
            : (isReflection || isSafe ? "safe-result" : (result.instantDeath ? "instant-death-result" : "damage-result"));

        const dispDiv = document.createElement("div");
        dispDiv.className = "damage-result-display";
        dispDiv.innerHTML = `
            <div class="result-panel ${typeClass}">
                <div class="result-value">${valueText}</div>
                ${labelText ? `<div class="result-label">${labelText}</div>` : ""}
            </div>
        `;
        placeDamageResultDisplay(targetDiv, dispDiv);
        if (!isHeal && !isMpHeal && Number(result.damage) > 0) {
            playSound(PUNCH_SOUND_SRC, 0, 0.85);
        }
        setTimeout(() => {
            if (isKnockout) {
                dispDiv.innerHTML = `
                    <div class="result-panel knockout-result knockout-rise-result">
                        <div class="result-value">撃沈</div>
                    </div>
                `;
                setTimeout(() => {
                    dispDiv.remove();
                    targetDiv.classList.remove("player-result-active");
                    if (damageResultGlobal?.id === renderedResultId) {
                        update(gameRoomRef, { damage_result: null });
                    }
                }, KNOCKOUT_DISPLAY_MS);
            } else {
                dispDiv.remove();
                targetDiv.classList.remove("player-result-active");
                if (damageResultGlobal?.id === renderedResultId) {
                    update(gameRoomRef, { damage_result: null });
                }
            }
        }, RESULT_DISPLAY_MS);
    }, RESULT_SHOW_DELAY_MS + defenseRevealDelay);
}

function reserveDrawForCurrentPlayer(count = 1) {
    if (!myPlayerRole) return;
    reserveDrawForRole(myPlayerRole, count);
}

function refillPendingDrawsForRole(role) {
    const drawCount = pendingDrawsGlobal[role] || 0;
    if (drawCount <= 0) return;
    const actualDrawCount = Math.min(drawCount, getHandOpenSlots(role));
    for (let i = 0; i < actualDrawCount; i++) {
        if (role === "player1") {
            myHand.push(drawCardForNormalHand());
            if (myPlayerRole === "player1") freshHandIndexesGlobal.player1.add(myHand.length - 1);
        } else {
            tekiHand.push(drawCardForNormalHand());
            if (myPlayerRole === "player2") freshHandIndexesGlobal.player2.add(tekiHand.length - 1);
        }
    }

    if (role === myPlayerRole && actualDrawCount > 0) {
        playCardDrawSoundSequence(actualDrawCount);
    }

    pendingDrawsGlobal[role] = 0;
}

function refillPendingDrawsAtActionEnd() {
    refillPendingDrawsForRole("player1");
    refillPendingDrawsForRole("player2");
}

function markFreshCardsFromHandGrowth(role, oldLength, newLength) {
    if (shouldAnimateHandFeedIn || role !== myPlayerRole || newLength <= oldLength) return;
    playCardDrawSoundSequence(newLength - oldLength);
    for (let i = oldLength; i < newLength; i++) {
        freshHandIndexesGlobal[role].add(i);
    }
}



window.executeCard = function() {
    if (!gameStartedGlobal) return;
    if (!isMyTurnGlobal) return;

    if (pendingAttackGlobal > 0) {
        if (tryReflectPendingAttack(myPlayerRole)) return;
        const attributeNeutralized = isAttackAttributeNeutralized(myPlayerRole, currentAttackCardGlobal);
        const resolvedAttackCard = currentAttackCardGlobal
            ? { ...currentAttackCardGlobal, attributeNeutralized }
            : null;
        const revealedDefenseCards = makeDefenseRevealCards(myPlayerRole, pendingAttackGlobal);
        const finalDamage = calculateDamageAfterDefense(pendingAttackGlobal, myPlayerRole);
        let logMsg = "";
        const usedDefenseCount = consumeSelectedDefenseCards(myPlayerRole);
        const hpBeforeDamage = mycurrenthp;

        // HPを減らし、溜まっていた防御力をリセット
        mycurrenthp = applyDamageToHp(mycurrenthp, finalDamage, resolvedAttackCard);
        mydefense = 0; 
        reserveDrawForCurrentPlayer(usedDefenseCount);
        const damageResult = makeDamageResult(myPlayerRole, finalDamage, resolvedAttackCard, hpBeforeDamage);
        damageResult.usedDefenseCards = revealedDefenseCards;
        const nextTurnAfterDefense = currentAttackCardGlobal?.afterTurn || myPlayerRole;
        pendingAttackGlobal = 0;
        currentAttackCardGlobal = null;
        clearSelectedDefenseCards();
        clearCardActionDisplays();

        // 案内表示の削除とリセット
        // const targetDiv = (myPlayerRole === "player1") ? player1Div : player2Div;
        // const info = targetDiv.querySelector(".selected-card-info");
        // if (info) info.remove();

        renderHands();
        clearSelectedCardState();

        // 勝敗判定
        if (mycurrenthp <= 0) {
            markKnockoutResult(damageResult);
            sendGameState("end", 0, null, logMsg, damageResult);
        } else if ((resolvedAttackCard?.relayRepeat || 0) > 0) {
            const repeatedAttackCard = {
                ...resolvedAttackCard,
                relayRepeat: Math.max(0, (resolvedAttackCard.relayRepeat || 0) - 1),
                repeatId: Date.now()
            };
            sendGameState(myPlayerRole, repeatedAttackCard.value || 0, repeatedAttackCard, logMsg, damageResult);
        } else {
            sendGameState(nextTurnAfterDefense, 0, null, logMsg, damageResult);
        }
        return;
    }

    if (selectedCardIndex === null) return;

    const handIndex = selectedCardIndex;
    const cardKey = (myPlayerRole === "player1") ? myHand[handIndex] : tekiHand[handIndex];
    const card = CARDS[cardKey];
    const comboEntriesForAction = getSelectedComboEntries();
    const usesTimeCardForAction = comboEntriesForAction.some(entry => entry.cardKey === TIME_CARD_KEY);

    // addLog(`ユーザー:${card.name}`);
    isMyTurnGlobal = false;
    let actionResult = null;

    if (card.type === "attack") {
        // 攻撃のときは手札だけ消費して、相手にターンを回しつつ、攻撃力をFirebaseにストックする
        const currentHand = getCurrentPlayerHand();
        const currentMagicHand = getMagicHandByRole(myPlayerRole);
        const comboEntries = getSelectedComboEntries();
        const boostEntries = canApplyAttackBoost(cardKey, card) ? getSelectedBoostEntries() : [];
        const attackMultiplier = 2 ** boostEntries.length;
        const boostCard = boostEntries[0]?.card || null;
        const usesTimeCard = comboEntries.some(entry => entry.cardKey === TIME_CARD_KEY);
        const usesRelay = comboEntries.some(entry => entry.cardKey === RELAY_CARD_KEY);
        const boostedValue = card.value * attackMultiplier;
        const totalMpCost = boostEntries.reduce((sum, entry) => sum + (entry.card.mpCost || 0), 0);
        if (mycurrentmp < totalMpCost) {
            isMyTurnGlobal = true;
            selectedBoostCardIndexes = [];
            selectedHandMagicCardIndexes = [];
            renderSelectedCardInfoV2();
            renderHands();
            return;
        }
        mycurrentmp -= totalMpCost;
        const newlyUnlockedMagic = boostEntries.filter(entry => entry.source === "hand");
        const consumedComboHandIndexes = comboEntries
            .filter(entry => entry.source === "hand" && entry.cardKey !== MAGIC_CARD_KEY)
            .map(entry => entry.handIndex);
        const consumedHandIndexes = [...new Set([handIndex, ...newlyUnlockedMagic.map(entry => entry.handIndex), ...consumedComboHandIndexes])]
            .sort((a, b) => b - a);
        consumedHandIndexes.forEach(index => currentHand.splice(index, 1));
        newlyUnlockedMagic.forEach(() => currentMagicHand.push(MAGIC_CARD_KEY));
        reserveDrawForCurrentPlayer(consumedHandIndexes.length);

        clearCardActionDisplays();
        renderHands();
        clearSelectedCardState();

        // 攻撃カードは常に相手へ向ける
        const nextTurn = getOpponentRole(myPlayerRole);
        const afterTurn = usesTimeCard ? myPlayerRole : nextTurn;
        selectedAttackTargetRole = nextTurn;
        updateAttackTargetDisplay(myPlayerRole, selectedAttackTargetRole);
        defenseCardsGlobal = {
            player1: [],
            player2: []
        };
        if (cardKey === "hacking") {
            const actionResult = {
                id: Date.now(),
                player: nextTurn,
                damage: 0,
                message: "操作"
            };
            const controlEffect = {
                id: Date.now(),
                target: nextTurn,
                remaining: 3
            };
            const usedCardInfo = makeUsedCardInfo(myPlayerRole, card);
            if (usedCardInfo) usedCardInfo.target = nextTurn;
            keepUsedCardForTurn(usedCardInfo, nextTurn);
            sendGameState(nextTurn, 0, null, "", actionResult, null, controlEffect, usedCardInfo);
            return;
        }
        const hit = card.hitRate === undefined || Math.random() < card.hitRate;
        const attackCardInfo = {
            name: card.name,
            imgSrc: card.imgSrc,
            value: hit ? boostedValue : 0,
            baseValue: card.value,
            multiplier: attackMultiplier,
            element: card.element || null,
            description: card.description,
            player: myPlayerRole,
            target: nextTurn,
            hit,
            afterTurn,
            relayRepeat: usesRelay ? 1 : 0,
            boostName: boostCard?.name || null,
            boostLabel: boostCard ? BOOST_LABEL : null,
            boostDescription: boostCard?.description || null,
            boostImgSrc: boostCard?.imgSrc || null,
            boosts: comboEntries.map(makeBoostCardInfo)
        };
        if (card.hitRate !== undefined) {
            attackCardInfo.hitRate = card.hitRate;
        }
        const handEffect = (cardKey === "mojibake" && hit) ? destroyRandomHandCard(nextTurn) : null;

        if (!hit) {
            const missResult = {
                id: Date.now(),
                player: nextTurn,
                damage: 0,
                message: "外れ"
            };
            sendGameState(usesTimeCard ? myPlayerRole : nextTurn, 0, null, "", missResult);
        } else {
            sendGameState(nextTurn, boostedValue, attackCardInfo, "", null, handEffect);
        }
        return;

    } else if (card.type === "heal") {
        const healTargetRole = myPlayerRole;
        const healingSelf = healTargetRole === myPlayerRole;
        const beforeHp = healingSelf ? mycurrenthp : tekicurrenthp;
        const healedHp = Math.min(99, beforeHp + card.value);
        if (healingSelf) {
            mycurrenthp = healedHp;
        } else {
            tekicurrenthp = healedHp;
        }
        actionResult = {
            id: Date.now(),
            player: healTargetRole,
            type: "heal",
            amount: healedHp - beforeHp
        };
        myhp.textContent = (myPlayerRole === "player1") ? mycurrenthp : tekicurrenthp;
        tekihp.textContent = (myPlayerRole === "player1") ? tekicurrenthp : mycurrenthp;
        selectedAttackTargetRole = getOpponentRole(myPlayerRole);
        updateAttackTargetDisplay(myPlayerRole, selectedAttackTargetRole);
        // addLog(`回復しました`);
    } else if (card.type === "mpheal") {
        const mpHealTargetRole = myPlayerRole;
        const healingSelf = mpHealTargetRole === myPlayerRole;
        const beforeMp = healingSelf ? mycurrentmp : tekicurrentmp;
        const recoveredMp = Math.min(99, beforeMp + card.value);
        if (healingSelf) {
            mycurrentmp = recoveredMp;
        } else {
            tekicurrentmp = recoveredMp;
        }
        actionResult = {
            id: Date.now(),
            player: mpHealTargetRole,
            type: "mpheal",
            amount: recoveredMp - beforeMp
        };
        player1Mp.textContent = (myPlayerRole === "player1") ? mycurrentmp : tekicurrentmp;
        player2Mp.textContent = (myPlayerRole === "player1") ? tekicurrentmp : mycurrentmp;
        selectedAttackTargetRole = getOpponentRole(myPlayerRole);
        updateAttackTargetDisplay(myPlayerRole, selectedAttackTargetRole);
    } else if (card.type === "defense") {
        mydefense = 0;
        selectedDefenseCards[myPlayerRole] = [];
        actionResult = {
            id: Date.now(),
            player: myPlayerRole,
            damage: 0,
            message: "無事"
        };
    } else if (card.type === "special" && cardKey === "choubo") {
        const currentHand = getCurrentPlayerHand();
        currentHand.splice(handIndex, 1);
        expandHandLimitForRole(myPlayerRole, card.expandHand || card.drawCards || 0);
        const addCount = Number(card.drawCards) || 0;
        for (let i = 0; i < addCount; i++) {
            currentHand.push(drawCardForNormalHand());
            freshHandIndexesGlobal[myPlayerRole]?.add(currentHand.length - 1);
        }
        actionResult = {
            id: Date.now(),
            player: myPlayerRole,
            damage: 0,
            message: `+${addCount}枚`
        };
        selectedAttackTargetRole = getOpponentRole(myPlayerRole);
        updateAttackTargetDisplay(myPlayerRole, selectedAttackTargetRole);
        clearCardActionDisplays();
        renderHands();
        clearSelectedCardState();
        if (addCount > 0) playCardDrawSoundSequence(addCount);
        sendGameState(getOpponentRole(myPlayerRole), 0, null, "", actionResult);
        return;
    }
    
    // 通常の回復・防御カードの手札消費
    const currentHand = getCurrentPlayerHand();
    const consumedHandIndexes = [...new Set([
        handIndex,
        ...comboEntriesForAction
            .filter(entry => entry.source === "hand" && entry.cardKey === TIME_CARD_KEY)
            .map(entry => entry.handIndex)
    ])].sort((a, b) => b - a);
    consumedHandIndexes.forEach(index => currentHand.splice(index, 1));
    reserveDrawForCurrentPlayer(consumedHandIndexes.length);
    

    clearCardActionDisplays();
    renderHands();
    clearSelectedCardState();
    sendGameState(usesTimeCardForAction ? myPlayerRole : getOpponentRole(myPlayerRole), 0, null, "", actionResult);
}


const myHandDiv = document.getElementById("my-hand");
const tekiHandDiv = document.getElementById("teki-hand");
const myMagicHandDiv = document.getElementById("my-magic-hand");
const tekiMagicHandDiv = document.getElementById("teki-magic-hand");

function getDefenseSortValue(card) {
    if (!card) return 9999;
    if (Number(card.value) > 0) return Number(card.value);
    if (card.reductionRate) return Math.round(card.reductionRate * 100);
    if (card.attributeNeutralizer) return 998;
    if (card.reflectAttack) return 999;
    return 9999;
}

function getHandSortGroup(cardKey, card) {
    if (!card) return 99;
    if (SPECIAL_ITEM_CARD_KEYS.has(cardKey)) return 4;
    if (card.type === "magic") return 5;
    if (card.type === "attack") return card.element ? 1 : 0;
    if (card.type === "defense") return 2;
    if (card.type === "heal" || card.type === "mpheal") return 3;
    return 4;
}

function getHandSortValue(card) {
    if (!card) return 9999;
    if (card.type === "defense") return getDefenseSortValue(card);
    return Number(card.value) || 0;
}

function compareHandEntries(a, b) {
    const groupA = getHandSortGroup(a.cardKey, a.card);
    const groupB = getHandSortGroup(b.cardKey, b.card);
    if (groupA !== groupB) return groupA - groupB;

    const valueA = getHandSortValue(a.card);
    const valueB = getHandSortValue(b.card);
    if (valueA !== valueB) return valueA - valueB;

    const indexA = Number.isFinite(Number(a.handIndex)) ? Number(a.handIndex) : 9999;
    const indexB = Number.isFinite(Number(b.handIndex)) ? Number(b.handIndex) : 9999;
    return indexA - indexB;
}

function getHandEntries(hand) {
    return hand.map((cardKey, handIndex) => ({ cardKey, handIndex, card: CARDS[cardKey] }));
}

function getSortedHandEntries(hand) {
    return getHandEntries(hand).sort(compareHandEntries);
}

function getFreshRevealHandEntries(hand, freshIndexes) {
    const entries = getHandEntries(hand);
    const isFresh = entry => freshIndexes?.has(entry.handIndex);
    const oldEntries = entries.filter(entry => !isFresh(entry)).sort(compareHandEntries);
    const freshEntries = entries.filter(isFresh).sort((a, b) => Number(a.handIndex) - Number(b.handIndex));
    return [...oldEntries, ...freshEntries];
}

function getMixedHandEntries(hand) {
    return getHandEntries(hand)
        .sort((a, b) => {
            const len = Math.max(hand.length, 1);
            const mixedA = (a.handIndex * 5 + 3) % len;
            const mixedB = (b.handIndex * 5 + 3) % len;
            return mixedA - mixedB;
        });
}

function animateHandSort(targetDiv) {
    const buttons = [...targetDiv.querySelectorAll(".hand-card")];
    if (buttons.length <= 1) return;

    buttons.forEach(btn => {
        btn.classList.remove("feed-in");
        btn.style.animation = "none";
        btn.style.animationDelay = "";
        btn.style.opacity = "1";
        btn.style.transform = "";
    });

    const firstRects = new Map(buttons.map(btn => [btn, btn.getBoundingClientRect()]));
    buttons
        .sort((a, b) => {
            const entryA = {
                cardKey: a.dataset.cardKey,
                handIndex: Number(a.dataset.handIndex),
                card: CARDS[a.dataset.cardKey]
            };
            const entryB = {
                cardKey: b.dataset.cardKey,
                handIndex: Number(b.dataset.handIndex),
                card: CARDS[b.dataset.cardKey]
            };
            return compareHandEntries(entryA, entryB);
        })
        .forEach(btn => targetDiv.appendChild(btn));

    buttons.forEach(btn => {
        const first = firstRects.get(btn);
        const last = btn.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;

        if (dx === 0 && dy === 0) return;
        btn.classList.remove("sorting");
        btn.style.transition = "none";
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
        btn.getBoundingClientRect();
        btn.classList.add("sorting");
        btn.style.transition = "";
        btn.style.transform = "";
        btn.addEventListener("transitionend", () => {
            btn.classList.remove("sorting");
            btn.style.opacity = "";
            btn.style.animation = "";
        }, { once: true });
    });
}

function applyDefenseGlowGroups(targetDiv) {
    const defenseCards = [...targetDiv.querySelectorAll(".defense-turn-available")];
    defenseCards.forEach(card => {
        card.classList.remove("defense-glow-group");
        card.style.removeProperty("--defense-glow-width");
    });

    let groupStart = 0;
    while (groupStart < defenseCards.length) {
        let groupEnd = groupStart;
        while (groupEnd + 1 < defenseCards.length) {
            const current = defenseCards[groupEnd];
            const next = defenseCards[groupEnd + 1];
            const isAdjacent = current.nextElementSibling === next && current.offsetTop === next.offsetTop;
            if (!isAdjacent) break;
            groupEnd += 1;
        }

        const first = defenseCards[groupStart];
        const last = defenseCards[groupEnd];
        const groupWidth = (last.offsetLeft + last.offsetWidth) - first.offsetLeft;
        first.classList.add("defense-glow-group");
        first.style.setProperty("--defense-glow-width", `${groupWidth}px`);
        groupStart = groupEnd + 1;
    }
}

function renderHands() {
    if (matchStartCountdownActive) {
        renderWaitingHandPlaceholders();
        return;
    }
    const activeHandDiv = myPlayerRole === "player1" ? myHandDiv : tekiHandDiv;
    if (Date.now() < initialHandRevealUntil && activeHandDiv?.querySelector(".initial-deal-reveal")) {
        setTurn(isMyTurnGlobal);
        return;
    }

    hideHandHoverPreview();
    myHandDiv.innerHTML = "";
    tekiHandDiv.innerHTML = "";
    myMagicHandDiv.innerHTML = "";
    tekiMagicHandDiv.innerHTML = "";
    const myScreen = document.getElementById("my-screen");
    const enemyScreen = document.getElementById("enemy-screen");
    myScreen?.classList.remove("magic-row-attach");
    enemyScreen?.classList.remove("magic-row-attach");
    myScreen?.classList.toggle("hand-screen-hidden", myPlayerRole !== "player1");
    enemyScreen?.classList.toggle("hand-screen-hidden", myPlayerRole !== "player2");

    const getLabel = (type, value, card = null) => {
        if (type === "attack") return `攻${value}`;
        if (type === "heal") return `回${value}`;
        if (type === "mpheal") return `MP${value}`;
        if (type === "defense") return `守${value}`;
        if (type === "special" && card?.drawCards) return `+${card.drawCards}枚`;
        return value || "";
    }

    const renderHandButtons = (hand, targetDiv) => {
        const role = (targetDiv === myHandDiv) ? "player1" : "player2";
        const animateIntro = shouldAnimateHandFeedIn;
        const freshIndexes = freshHandIndexesGlobal[role] || new Set();
        const hasFreshCards = !animateIntro && freshIndexes.size > 0;
        const entries = animateIntro
            ? getMixedHandEntries(hand)
            : (hasFreshCards ? getFreshRevealHandEntries(hand, freshIndexes) : getSortedHandEntries(hand));
        const initialRevealDuration = entries.length > 0
            ? ((entries.length - 1) * HAND_CARD_FEED_IN_GAP_MS) + INITIAL_CARD_OPEN_MS
            : 0;
        if (animateIntro && initialRevealDuration > 0) {
            const fullInitialSequenceDuration = initialRevealDuration
                + INITIAL_HAND_SORT_DELAY_MS
                + HAND_SORT_ANIMATION_MS;
            initialHandRevealUntil = Date.now() + fullInitialSequenceDuration;
        }
        const destroyEffect = (activeHandDestroyEffect?.target === role) ? activeHandDestroyEffect : null;
        if (destroyEffect) {
            const destroyPhase = destroyEffect.phase || "shatter";
            const destroyedCard = CARDS[destroyEffect.cardKey] || {
                name: destroyEffect.name,
                type: destroyEffect.cardType,
                value: destroyEffect.value,
                description: destroyEffect.description,
                imgSrc: destroyEffect.imgSrc
            };
            const displayDestroyedCard = destroyPhase === "unknown"
                ? {
                    name: "？？？",
                    type: destroyedCard.type || "special",
                    value: 0,
                    description: "まだ何が壊れたかわからない",
                    imgSrc: CARDS.mojibake.imgSrc
                }
                : destroyedCard;
            entries.splice(Math.min(destroyEffect.index, entries.length), 0, {
                handIndex: `destroy-${destroyEffect.id}`,
                cardKey: destroyEffect.cardKey,
                card: displayDestroyedCard,
                destroyed: true,
                destroyPhase
            });
        }
        entries.forEach(({ handIndex, cardKey, card, destroyed, destroyPhase }, displayIndex) => {
            if (!card) return;

            const btn = document.createElement("button");
            btn.className = `${card.type} hand-card`;
            btn.dataset.cardType = card.type;
            btn.dataset.cardKey = cardKey;
            btn.dataset.handIndex = String(handIndex);
            const isDefenseSelected = pendingAttackGlobal > 0
                && card.type === "defense"
                && (selectedDefenseCards[role] || []).some(item => item.handIndex === handIndex);
            if (isDefenseSelected) {
                btn.classList.add("defense-selected");
            }
            const isHandMagicSelected = role === myPlayerRole
                && (cardKey === MAGIC_CARD_KEY || cardKey === TIME_CARD_KEY || cardKey === RELAY_CARD_KEY)
                && selectedHandMagicCardIndexes.includes(Number(handIndex));
            if (isHandMagicSelected) {
                btn.classList.add("magic-selected");
            }
            const canDefendCurrentAttack = canDefenseCardBlockAttack(card, currentAttackCardGlobal, role);
            const canSelectCurrentDefense = canDefendCurrentAttack
                && canSelectDefenseCard(role, card, handIndex);
            if (!destroyed && role === myPlayerRole && isMyTurnGlobal && pendingAttackGlobal > 0 && canSelectCurrentDefense) {
                btn.classList.add("defense-turn-available");
                const shouldStayBright = tutorialMode === "defense-select"
                    || tutorialMode === "defense-confirm";
                if (isTutorialActive && shouldStayBright) {
                    btn.classList.add("tutorial-defense-bright");
                }
            }
            if (destroyed) {
                btn.classList.add(`destroy-phase-${destroyPhase || "shatter"}`);
                if (destroyPhase === "unknown") {
                    btn.classList.add("destroy-pending");
                }
            }
            if (destroyed && destroyPhase === "shatter") {
                btn.classList.add("shatter-out");
                btn.disabled = true;
            }

            if (!destroyed && animateIntro) {
                btn.classList.add("initial-deal-reveal");
                btn.style.setProperty("--initial-deal-delay", `${displayIndex * HAND_CARD_FEED_IN_GAP_MS}ms`);
            } else if (!destroyed && freshIndexes.has(handIndex)) {
                btn.classList.add("feed-in");
                btn.style.animationDelay = `${displayIndex * HAND_CARD_FEED_IN_GAP_MS}ms`;
            }
            //ここでいろいろいろいろ表示
            const hidesZeroAttackLabel = cardKey === "hacking" || cardKey === "mojibake";
            const cardValueLabel = destroyed && destroyPhase === "unknown"
                ? ""
                : hidesZeroAttackLabel
                ? ""
                : cardKey === "enadori"
                ? BOOST_LABEL
                : cardKey === TIME_CARD_KEY
                ? "再行動"
                : cardKey === RELAY_CARD_KEY
                ? "2連続"
                : (card.type === "defense" && card.attributeNeutralizer)
                ? "属性無効"
                : (card.type === "defense" && card.reflectAttack
                    ? "反射"
                : (card.type === "defense" && card.reductionRate
                    ? `${Math.round(card.reductionRate * 100)}%減`
                : (card.type === "attack" && card.hitRate !== undefined
                    ? `${Math.round(card.hitRate * 100)}%攻${card.value}`
                    : getLabel(card.type, card.value, card))));
            const cardValueClasses = ["card-value"];
            if (card.type === "attack" && card.hitRate !== undefined) {
                cardValueClasses.push("hit-rate-card-value");
            }
            const attributeMeta = getAttributeMeta(card.element);
            if (attributeMeta?.valueClass) {
                cardValueClasses.push(attributeMeta.valueClass);
            }
            if (card.mpCost) {
                cardValueClasses.push("mp-card-value");
            }
            const cardValueHtml = cardValueLabel
                ? `<div class="${cardValueClasses.join(" ")}">${cardValueLabel}</div>`
                : `<div class="${cardValueClasses.join(" ")} empty-card-value" aria-hidden="true"></div>`;
            btn.innerHTML = `
            <img src="${card.imgSrc}" alt="${card.name}">
            ${cardValueHtml}
            `;
            if (!destroyed) {
                btn.onclick = () => selectCard(handIndex);
                btn.addEventListener("mouseenter", () => showHandHoverPreview(btn, card));
                btn.addEventListener("focus", () => showHandHoverPreview(btn, card));
                btn.addEventListener("mouseleave", () => hideHandHoverPreview(btn));
                btn.addEventListener("blur", () => hideHandHoverPreview(btn));
            }

            const isControlledTurn = controlEffectGlobal?.target === role
                && role === myPlayerRole
                && isMyTurnGlobal
                && pendingAttackGlobal === 0;
            
            if (destroyed) {
                btn.disabled = true;
            } else if (isControlledTurn) {
                btn.disabled = true;
            } else if (!isMyTurnGlobal) {
                btn.disabled = true;
            } else if (pendingAttackGlobal > 0) {
                if (!canSelectCurrentDefense) btn.disabled = true;
            }
            if (!destroyed && role === myPlayerRole && (cardKey === MAGIC_CARD_KEY || cardKey === TIME_CARD_KEY || cardKey === RELAY_CARD_KEY) && pendingAttackGlobal === 0) {
                const selectedCard = getSelectedCard();
                const selectedCardKey = getSelectedCardKey();
                const selectedEnadoriCount = getSelectedBoostEntries().length;
                const nextCost = cardKey === MAGIC_CARD_KEY
                    ? (isHandMagicSelected ? selectedEnadoriCount : selectedEnadoriCount + 1) * card.mpCost
                    : 0;
                btn.disabled = !(isMyTurnGlobal
                    && canSelectHandComboCard(cardKey, selectedCardKey, selectedCard)
                    && (cardKey !== MAGIC_CARD_KEY || isHandMagicSelected || mycurrentmp >= nextCost)
                    && !(controlEffectGlobal?.target === myPlayerRole));
            }
            if (role === myPlayerRole && shouldTutorialDisableCard(cardKey, card, handIndex)) {
                btn.disabled = true;
            }
            
            targetDiv.appendChild(btn);
        });

        if (role === myPlayerRole && isMyTurnGlobal && pendingAttackGlobal > 0) {
            applyDefenseGlowGroups(targetDiv);
        }

        if (animateIntro && shouldAnimateHandSortAfterFeedIn && entries.length > 0) {
            setTimeout(() => animateHandSort(targetDiv), initialRevealDuration + INITIAL_HAND_SORT_DELAY_MS);
        }

        if (animateIntro && initialRevealDuration > 0) {
            setTimeout(() => {
                targetDiv.querySelectorAll(".initial-deal-reveal").forEach(button => {
                    button.classList.remove("initial-deal-reveal");
                    button.style.removeProperty("--initial-deal-delay");
                });
            }, initialRevealDuration + 60);
        }

        if (animateIntro && entries.length > 0) {
            if (role === myPlayerRole) {
                playCardDrawSoundSequence(entries.filter(entry => !entry.destroyed).length);
            }
            shouldAnimateHandFeedIn = false;
            shouldAnimateHandSortAfterFeedIn = false;
        }

        if (hasFreshCards) {
            const freshCount = entries.filter(entry => freshIndexes.has(entry.handIndex)).length;
            const freshSortDelay = Math.max(0, (freshCount - 1) * HAND_CARD_FEED_IN_GAP_MS) + 430;
            setTimeout(() => animateHandSort(targetDiv), freshSortDelay);
            freshIndexes.clear();
        }
    };

    const renderMagicHandButtons = (magicHand, targetDiv) => {
        const screenDiv = targetDiv?.closest(".screen-area");
        const normalHandLength = targetDiv === myMagicHandDiv ? myHand.length : tekiHand.length;
        const columns = window.matchMedia("(max-width: 1004px)").matches ? 6 : 8;
        const occupiedInLastRow = normalHandLength % columns;
        const normalRows = Math.max(1, Math.ceil(normalHandLength / columns));
        const freeSlotsInCurrentRow = occupiedInLastRow === 0 ? 0 : columns - occupiedInLastRow;
        const attachToCurrentRow = normalHandLength > columns && magicHand.length <= freeSlotsInCurrentRow;
        const magicRow = normalHandLength <= columns
            ? 2
            : (attachToCurrentRow ? normalRows : normalRows + 1);
        const firstMagicColumn = Math.max(1, columns - magicHand.length + 1);

        screenDiv?.classList.toggle("magic-row-attach", magicHand.length > 0);
        magicHand.forEach((cardKey, magicIndex) => {
            const card = CARDS[cardKey];
            if (!card) return;

            const btn = document.createElement("button");
            btn.className = "magic-card hand-card";
            btn.dataset.magicIndex = String(magicIndex);
            btn.style.gridColumn = String(firstMagicColumn + magicIndex);
            btn.style.gridRow = String(magicRow);
            btn.innerHTML = `
                <img src="${card.imgSrc}" alt="${card.name}">
                <div class="magic-mp-cost">${card.mpCost}MP</div>
                <div class="card-value mp-card-value">${BOOST_LABEL}</div>
            `;
            if (selectedBoostCardIndexes.includes(magicIndex)) {
                btn.classList.add("magic-selected");
            }

            const selectedCard = getSelectedCard();
            const selectedCardKey = getSelectedCardKey();
    const selectedEnadoriCount = getSelectedBoostEntries().length;
    const nextCost = (selectedEnadoriCount + 1) * card.mpCost;
            const isSelected = selectedBoostCardIndexes.includes(magicIndex);
            const canUseMagic = isMyTurnGlobal
                && pendingAttackGlobal === 0
                && canApplyAttackBoost(selectedCardKey, selectedCard)
                && (isSelected || mycurrentmp >= nextCost)
                && !(controlEffectGlobal?.target === myPlayerRole);
            btn.disabled = !canUseMagic;

            if (isTutorialActive) {
                if (tutorialMode === "boost-select") {
                    btn.disabled = !canApplyAttackBoost(selectedCardKey, selectedCard)
                        || isSelected
                        || mycurrentmp < nextCost;
                } else {
                    btn.disabled = true;
                }
            }

            btn.onclick = () => selectMagicCard(magicIndex);
            btn.addEventListener("mouseenter", () => showHandHoverPreview(btn, card));
            btn.addEventListener("focus", () => showHandHoverPreview(btn, card));
            btn.addEventListener("mouseleave", () => hideHandHoverPreview(btn));
            btn.addEventListener("blur", () => hideHandHoverPreview(btn));
            targetDiv.appendChild(btn);
        });
    };

    if (myPlayerRole === "player1") {
        renderHandButtons(myHand, myHandDiv);
        renderMagicHandButtons(myMagicHand, myMagicHandDiv);
    }
    if (myPlayerRole === "player2") {
        renderHandButtons(tekiHand, tekiHandDiv);
        renderMagicHandButtons(tekiMagicHand, tekiMagicHandDiv);
    }
    setTurn(isMyTurnGlobal);
}

function renderWaitingHandPlaceholders() {
    initialHandRevealUntil = 0;
    myHandDiv.innerHTML = "";
    tekiHandDiv.innerHTML = "";
    myMagicHandDiv.innerHTML = "";
    tekiMagicHandDiv.innerHTML = "";
    const myScreen = document.getElementById("my-screen");
    const enemyScreen = document.getElementById("enemy-screen");
    myScreen?.classList.remove("magic-row-attach");
    enemyScreen?.classList.remove("magic-row-attach");
    myScreen?.classList.toggle("hand-screen-hidden", myPlayerRole !== "player1");
    enemyScreen?.classList.toggle("hand-screen-hidden", myPlayerRole !== "player2");

    const targetDiv = myPlayerRole === "player1" ? myHandDiv : tekiHandDiv;
    if (!targetDiv) return;
    targetDiv.setAttribute("aria-label", "相手を待っています");

    for (let i = 0; i < MAX_HAND_CARDS; i++) {
        const placeholder = document.createElement("div");
        placeholder.className = "waiting-hand-placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        targetDiv.appendChild(placeholder);
    }
}




//バトルログの作成
const battleLogs = {
    player1: document.getElementById("battle-log-player1"),
    player2: document.getElementById("battle-log-player2")
};
const ENABLE_BATTLE_LOG = false;
let lastShownLogId = null;

// 変更後
function addLog(message, player = myPlayerRole) {
    if (!ENABLE_BATTLE_LOG) return;
    if (!player || !message) return;
    update(gameRoomRef, {
        last_log: {
            id: Date.now(),
            player,
            message
        }
    });
}

function showLog(log) {
    if (!ENABLE_BATTLE_LOG) return;
    const normalizedLog = (typeof log === "string")
        ? { id: log, player: myPlayerRole || "player1", message: log }
        : log;
    if (!normalizedLog || !normalizedLog.message) return;
    if (normalizedLog.id && normalizedLog.id === lastShownLogId) return;

    const logEl = battleLogs[normalizedLog.player];
    if (!logEl) return;

    lastShownLogId = normalizedLog.id || normalizedLog.message;
    const p = document.createElement("p");
    p.textContent = normalizedLog.message;
    logEl.prepend(p);
}

const gameRoomRef = ref(db, "gameRoom");
let myPlayerRole = null;
let isMyTurnGlobal = false;
let gameStartedGlobal = false;
let gameRoomUnsubscribe = null;

function isRoleJoined(data, role) {
    return typeof data?.[`${role}_name`] === "string" && data[`${role}_name`].trim() !== "";
}

function getWaitingRole(data) {
    if (!isRoleJoined(data, "player1")) return "player1";
    if (!isRoleJoined(data, "player2")) return "player2";
    return null;
}

function handleWaitingForOpponent(data) {
    if (data.reset_trigger && data.reset_trigger !== lastResetTrigger) {
        const isForcedReset = lastResetTrigger !== 0;
        lastResetTrigger = data.reset_trigger;
        closeTutorial(false);
        resetTutorialProgress();
        if (isForcedReset) {
            window.location.reload();
            return true;
        }
    }
    const waitingRole = getWaitingRole(data);
    if (!waitingRole) return false;

    cancelMatchStartCountdown(true);
    gameStartedGlobal = false;
    isMyTurnGlobal = false;
    pendingAttackGlobal = 0;
    clearSelectedCardState();
    lastTimerStateKey = null;
    stopTimer();
    clearSelectedDefenseCards();
    clearCardActionDisplays();
    hideHandHoverPreview();
    renderWaitingHandPlaceholders();
    currentRoundGlobal = data.round || 1;
    currentTurnGlobal = data.turn || "player1";
    updateRoundDisplay(currentRoundGlobal);
    playerNames = {
        player1: data.player1_name || DEFAULT_PLAYER_NAMES.player1,
        player2: data.player2_name || DEFAULT_PLAYER_NAMES.player2
    };
    updatePlayerNameDisplay();
    myhp.textContent = data.player1_hp ?? 50;
    tekihp.textContent = data.player2_hp ?? 50;
    player1Mp.textContent = data.player1_mp ?? INITIAL_MP;
    player2Mp.textContent = data.player2_mp ?? INITIAL_MP;
    showTurnNotice(`${DEFAULT_PLAYER_NAMES[waitingRole]}を待っています`, true);
    return true;
}

window.choosePlayer = function(role) {
    hideVictoryScreen();
    showNameSetup(role);
}

window.confirmPlayerName = function() {
    if (!pendingNameRole) return;
    const role = pendingNameRole;
    const playerName = normalizePlayerName(playerNameInput?.value, role);
    hideNameSetup();

    myPlayerRole = role;
    hideVictoryScreen();
    playerNames[role] = playerName;
    updatePlayerNameDisplay();
    selectedAttackTargetRole = getOpponentRole(role);
    shouldAnimateHandFeedIn = true;
    shouldAnimateHandSortAfterFeedIn = true;
    updateAttackTargetDisplay(myPlayerRole, selectedAttackTargetRole);
    lastResetTrigger = 0;

    isMyTurnGlobal = false;
    gameStartedGlobal = false;

    document.getElementById("setup-screen").style.display = "none";
    if (gameOyaDiv) gameOyaDiv.style.display = "block";
    document.getElementById("game-screen").style.display = "block";

    myHandDiv.innerHTML = "";
    tekiHandDiv.innerHTML = "";
    renderWaitingHandPlaceholders();
    showTurnNotice(`${DEFAULT_PLAYER_NAMES[getOpponentRole(role)]}を待っています`, true);
    update(gameRoomRef, {
        [`${role}_name`]: playerName
    });

    if (gameRoomUnsubscribe) {
        gameRoomUnsubscribe();
    }
    gameRoomUnsubscribe = onValue(gameRoomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        resetGame();
        return; 

    }
    if (handleWaitingForOpponent(data)) {
        hasObservedGameState = true;
        return;
    }
    if (!gameStartedGlobal) {
        hideTurnNotice();
        lastTurnNoticeKey = null;
        shouldAnimateHandFeedIn = true;
        shouldAnimateHandSortAfterFeedIn = true;
        startMatchStartCountdown(data);
    }
    gameStartedGlobal = true;

    const incomingTurn = data.turn || currentTurnGlobal;
    const turnNoticeKey = `${data.reset_trigger || "game"}:${data.round || 1}:${incomingTurn}:${data.pending_attack || 0}`;
    if (!matchStartCountdownActive && incomingTurn !== "end" && turnNoticeKey !== lastTurnNoticeKey) {
        lastTurnNoticeKey = turnNoticeKey;
        const isMyTurnNotice = incomingTurn === myPlayerRole;
        showTurnNotice(isMyTurnNotice
            ? ((data.pending_attack || 0) > 0 ? "守備の番です" : "あなたの番です")
            : "相手の番です"
        );
        if (isMyTurnNotice && hasObservedGameState && incomingTurn !== currentTurnGlobal) {
            playSound(TURN_SOUND_SRC, 0, 0.8);
        }
    }

    const player1Ko = Number(data.player1_hp) <= 0;
    const player2Ko = Number(data.player2_hp) <= 0;
    const koSoundKey = (player1Ko || player2Ko)
        ? `${data.reset_trigger || "game"}:${player1Ko ? "p1" : ""}:${player2Ko ? "p2" : ""}:${data.winner || ""}`
        : null;
    if (koSoundKey && koSoundKey !== lastKoSoundKey) {
        lastKoSoundKey = koSoundKey;
        playSound(KO_SOUND_SRC, 0, 0.85);
    } else if (!koSoundKey) {
        lastKoSoundKey = null;
    }

    currentRoundGlobal = data.round || 1;
    currentTurnGlobal = incomingTurn;
    hasObservedGameState = true;
    updateRoundDisplay(currentRoundGlobal);
    if (!myPlayerRole) return;
    playerNames = {
        player1: data.player1_name || DEFAULT_PLAYER_NAMES.player1,
        player2: data.player2_name || DEFAULT_PLAYER_NAMES.player2
    };
    updatePlayerNameDisplay();
    pendingAttackGlobal = data.pending_attack || 0;
    if (pendingAttackGlobal === 0) {
        clearSelectedDefenseCards();
    }
    const staleAttackCard = data.attack_card && pendingAttackGlobal === 0;
    const staleSelectedCard = data.selected_card && (
        (!data.selected_card.keep && data.selected_card.player !== data.turn) ||
        (data.selected_card.keep && data.selected_card.showOnTurn && data.selected_card.showOnTurn !== data.turn)
    );
    if (staleAttackCard || staleSelectedCard) {
        update(gameRoomRef, {
            ...(staleAttackCard ? { attack_card: null } : {}),
            ...(staleSelectedCard ? { selected_card: null } : {})
    });
}
    currentAttackCardGlobal = pendingAttackGlobal > 0 ? (data.attack_card || null) : null;
    damageResultGlobal = data.damage_result || null;
    receiveHandEffect(data.hand_effect || null);
    controlEffectGlobal = data.control_effect || null;
    updateControlledPlayerDisplay();
    controlledActionInProgress = controlledActionInProgress
        && controlEffectGlobal?.target === myPlayerRole
        && data.turn === myPlayerRole
        && pendingAttackGlobal === 0;
    defenseCardsGlobal = {
        player1: data.player1_def_cards || [],
        player2: data.player2_def_cards || []
    };
    pendingDrawsGlobal = {
        player1: data.player1_pending_draws || 0,
        player2: data.player2_pending_draws || 0
    };
    setHandLimitByRole("player1", data.player1_hand_limit || MAX_HAND_CARDS);
    setHandLimitByRole("player2", data.player2_hand_limit || MAX_HAND_CARDS);
    if (data.reset_trigger && data.reset_trigger !== lastResetTrigger) {
        lastResetTrigger = data.reset_trigger;
        closeTutorial(false);
        resetTutorialProgress();
        shouldAnimateHandFeedIn = true;
        shouldAnimateHandSortAfterFeedIn = true;
    }
    const oldPlayer1HandLength = myHand.length;
    const oldPlayer2HandLength = tekiHand.length;
    const incomingPlayer1Hand = Array.isArray(data.player1_hand) ? data.player1_hand : [];
    const incomingPlayer2Hand = Array.isArray(data.player2_hand) ? data.player2_hand : [];
    myMagicHand = normalizeMagicHand(data.player1_magic_hand);
    tekiMagicHand = normalizeMagicHand(data.player2_magic_hand);
    if (data.player1_hand) {
        myHand = normalizeHand(incomingPlayer1Hand);
        markFreshCardsFromHandGrowth("player1", oldPlayer1HandLength, myHand.length);
    }
    if (data.player2_hand) {
        tekiHand = normalizeHand(incomingPlayer2Hand);
        markFreshCardsFromHandGrowth("player2", oldPlayer2HandLength, tekiHand.length);
    }

    if (myPlayerRole === "player1") {
        mycurrenthp = data.player1_hp;
        tekicurrenthp = data.player2_hp;
        mycurrentmp = data.player1_mp ?? INITIAL_MP;
        tekicurrentmp = data.player2_mp ?? INITIAL_MP;
        mydefense = data.player1_def;
        tekidefense = data.player2_def;
        isMyTurnGlobal = (data.turn === "player1");
    } 
    else if (myPlayerRole === "player2") {
        mycurrenthp = data.player2_hp;
        tekicurrenthp = data.player1_hp;
        mycurrentmp = data.player2_mp ?? INITIAL_MP;
        tekicurrentmp = data.player1_mp ?? INITIAL_MP;
        mydefense = data.player2_def;
        tekidefense = data.player1_def;
        isMyTurnGlobal = (data.turn === "player2");
    }
    resetTimerWhenTurnStateChanges(data.turn, pendingAttackGlobal);
    myhp.textContent = data.player1_hp;
    tekihp.textContent = data.player2_hp;
    player1Mp.textContent = data.player1_mp ?? INITIAL_MP;
    player2Mp.textContent = data.player2_mp ?? INITIAL_MP;

    const targetDiv = (myPlayerRole === "player1") ? player1Div : player2Div;
    if (isMyTurnGlobal && pendingAttackGlobal > 0) {
        clearSelectedCardState();
    }
    if (targetDiv && isMyTurnGlobal && pendingAttackGlobal > 0 && selectedCardIndex === null) {
        let infoDiv = targetDiv.querySelector(".selected-card-info");
        if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.className = "selected-card-info";
            targetDiv.appendChild(infoDiv);
        }
        const defenseLabel = getDefenseConfirmLabel(myPlayerRole);
        const hasDefense = (selectedDefenseCards[myPlayerRole] || []).length > 0;
        infoDiv.innerHTML = `<div class="defense-confirm-display ${hasDefense ? "has-defense" : "no-defense"}">${defenseLabel}</div>`;
    } else if (targetDiv && (!isMyTurnGlobal || pendingAttackGlobal === 0) && selectedCardIndex === null && !data.selected_card) {
        const info = targetDiv.querySelector(".selected-card-info");
        if (info) info.remove();
    }
     if (ENABLE_BATTLE_LOG && data.last_log && data.last_log !== "") {
        showLog(data.last_log);
    }

    const sc = (data.selected_card && (
        data.selected_card.player === data.turn ||
        data.selected_card.randomPending ||
        (data.selected_card.keep && (!data.selected_card.showOnTurn || data.selected_card.showOnTurn === data.turn))
    )) ? data.selected_card : null;
const ac = pendingAttackGlobal > 0 ? data.attack_card : null; // 攻撃カード情報
const p1div = document.querySelector(".player1");
const p2div = document.querySelector(".player2");

if (ac?.player && pendingAttackGlobal > 0) {
    updateObservedAttackTargetDisplay(
        ac.player,
        ac.target || data.turn || selectedAttackTargetRole,
        Boolean(damageResultGlobal),
        true,
        { preserveOrder: Boolean(ac.reflected) }
    );
} else if (sc?.player && sc.target) {
    updateObservedAttackTargetDisplay(sc.player, sc.target, Boolean(damageResultGlobal), sc.type === "attack", { actionType: sc.type });
} else if (data.turn === "player1" || data.turn === "player2") {
    updateObservedAttackTargetDisplay(data.turn, getOpponentRole(data.turn), Boolean(damageResultGlobal));
}

// ラウンド開始（attack_card も selected_card も null）になったら全表示をクリア
// 結果表示中はカード紹介の上に重ねたいので、ここでは消さない。
if ((!ac || pendingAttackGlobal === 0) && !sc && !damageResultGlobal) {
    clearCardActionDisplays();
    clearSelectedCardState();
}

// 相手の selected_card（カード選択中）表示
[p1div, p2div].forEach(div => {
    const old = div?.querySelector(".selected-card-info-remote");
    if (old) old.remove();
});
if (sc && sc.player && (sc.player !== myPlayerRole || sc.keep)) {
    const targetDiv = (sc.player === "player1") ? p1div : p2div;
        if (targetDiv) {
        const infoDiv = document.createElement("div");
        infoDiv.className = "selected-card-info-remote";
        const isSelfAttack = sc.type === "attack" && sc.player === sc.target;
        infoDiv.classList.remove("self-attack-card-display");
        if (sc.randomPending) {
            infoDiv.innerHTML = `<div class="random-card-display">${sc.label || HACKING_PENDING_LABEL}</div>`;
        } else {
            const boosts = Array.isArray(sc.boosts)
                ? sc.boosts
                : (sc.boostName ? [{ name: sc.boostName, label: sc.boostLabel || BOOST_LABEL, description: sc.boostDescription, imgSrc: sc.boostImgSrc }] : []);
            const boostHtml = boosts.map(boost => renderCardInfoBlock(boost, boost.label || BOOST_LABEL, 34, true)).join("");
            infoDiv.innerHTML = `
                ${renderCardInfoBlock(sc, sc.label, 40, true)}
                ${boostHtml}
            `;
        }
        targetDiv.appendChild(infoDiv);
        if (sc.randomPending && isTutorialActive && tutorialMode === "random-control") {
            requestAnimationFrame(positionTutorial);
        }
        const keepRandomForTutorial = sc.randomPending && isTutorialActive && tutorialMode === "random-control";
        if (sc.keep && !keepRandomForTutorial) {
            const selectedCardId = sc.id || `${sc.player}-${sc.name}-${sc.showOnTurn || ""}`;
            lastRenderedSelectedCardId = selectedCardId;
            const displayDuration = sc.controlled
                ? CONTROLLED_CARD_ACTION_DISPLAY_MS
                : CARD_ACTION_DISPLAY_MS;
            setTimeout(() => {
                if (lastRenderedSelectedCardId === selectedCardId) {
                    update(gameRoomRef, { selected_card: null });
                }
            }, displayDuration);
        } else if (!sc.keep) {
            lastRenderedSelectedCardId = null;
        }
    }
}


if (ac && pendingAttackGlobal > 0) {
    const attackerDiv = (ac.player === "player1") ? p1div : p2div;
    const isSelfAttack = ac.player === ac.target;
    [p1div, p2div].forEach(div => {
        div?.querySelectorAll(".attack-card-display, .attack-total-display").forEach(el => el.remove());
    });
    if (attackerDiv) {
        const dispDiv = document.createElement("div");
        dispDiv.className = "attack-card-display";
        const attackLabel = ac.hit === false ? "外れ" : `攻 ${ac.value}`;
        const rateLabel = ac.hitRate !== undefined ? ` / 命中率${Math.round(ac.hitRate * 100)}%` : "";
        const boosts = Array.isArray(ac.boosts)
            ? ac.boosts
            : (ac.boostName ? [{ name: ac.boostName, label: ac.boostLabel || BOOST_LABEL, description: ac.boostDescription, imgSrc: ac.boostImgSrc }] : []);
        const boostHtml = boosts.map(boost => renderCardInfoBlock(boost, boost.label || BOOST_LABEL, 34, true)).join("");
        dispDiv.innerHTML = `
            ${renderCardInfoBlock(ac, `${attackLabel}${rateLabel}`, 40, true)}
            ${boostHtml}
        `;
        attackerDiv.appendChild(dispDiv);
        applyReflectedAttackSlide(dispDiv, ac, attackerDiv);
    }
    if (attackerDiv && ac.hit !== false) {
        const totalDiv = document.createElement("div");
        totalDiv.className = `attack-total-display${getAttackTotalAttributeClass(ac)}`;
        totalDiv.textContent = `攻 ${ac.value}`;
        attackerDiv.appendChild(totalDiv);
    }
}
maybeStartObservedControllerTutorial(data.selected_card || null);
renderDefenseCardDisplay("player1", p1div);
renderDefenseCardDisplay("player2", p2div);
if (isTutorialActive && tutorialMode === "defense-confirm") {
    requestAnimationFrame(positionTutorial);
}
renderResultPanelDisplay(damageResultGlobal);
    renderHands();
    maybeStartTutorial();
    maybeRunControlledRound();
    
    if (data.turn === "end") {
        const defenseRevealDelayForVictory = Array.isArray(damageResultGlobal?.usedDefenseCards)
            ? damageResultGlobal.usedDefenseCards.length * DEFENSE_REVEAL_INTERVAL_MS
            : 0;
        scheduleVictoryScreen(
            data.winner || getWinnerFromHp(data.player1_hp, data.player2_hp),
            `${data.reset_trigger || "game"}:${data.player1_hp}:${data.player2_hp}:${damageResultGlobal?.id || ""}`,
            VICTORY_SCREEN_DELAY_MS + defenseRevealDelayForVictory
        );
    } else {
        clearTimeout(scheduledVictoryTimer);
        scheduledVictoryTimer = null;
        scheduledVictoryKey = null;
    }
});
}

playerNameInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        confirmPlayerName();
    }
});

playerNameInput?.addEventListener("input", () => {
    const limitedName = Array.from(playerNameInput.value).slice(0, PLAYER_NAME_MAX_LENGTH).join("");
    if (playerNameInput.value !== limitedName) {
        playerNameInput.value = limitedName;
    }
});

function updateVolumeMeterDisplay() {
    const currentPercent = Math.round(masterVolume * 100);
    volumeSteps.forEach(step => {
        const stepVolume = Number(step.dataset.volume);
        step.classList.toggle("is-active", stepVolume <= currentPercent);
    });
    volumeMeters.forEach(meter => meter.setAttribute("aria-valuenow", String(currentPercent)));
}

function setMasterVolumePercent(percent) {
    const normalized = Math.max(0, Math.min(100, percent));
    masterVolume = normalized / 100;
    localStorage.setItem("notfield_volume", String(normalized));
    updateVolumeMeterDisplay();
}

if (volumeSteps.length > 0) {
    updateVolumeMeterDisplay();
    volumeSteps.forEach(step => {
        step.addEventListener("click", () => {
            setMasterVolumePercent(Number(step.dataset.volume));
        });
    });
}

tutorialOkButton?.addEventListener("click", () => closeTutorial(true));
tutorialSkipButton?.addEventListener("click", () => {
    TUTORIAL_STORAGE_KEYS.forEach(markTutorialComplete);
    closeTutorial(true);
});
window.addEventListener("resize", positionTutorial);

trainingButton?.addEventListener("click", () => {
    window.resetGame?.();
});

function getBookCardTypeLabel(type) {
    if (type === "attack") return "攻撃";
    if (type === "defense") return "守備";
    if (type === "heal" || type === "mpheal") return "回復";
    if (type === "magic") return "魔法";
    return "特殊";
}

function getBookCardValueLabel(card) {
    if (!card) return "-";
    if (card === CARDS.enadori) return "x2 / 7MP";
    if (card.type === "attack") return card.value || "-";
    if (card.type === "defense") {
        if (card.reflectAttack) return "反射";
        if (card.attributeNeutralizer) return "属性無効";
        return card.reductionRate
            ? `${Math.round(card.reductionRate * 100)}%減`
            : (card.value || "-");
    }
    if (card.type === "heal") return card.value || "-";
    if (card.type === "mpheal") return `MP${card.value || "-"}`;
    if (card.type === "special" && card.drawCards) return `+${card.drawCards}枚`;
    return "-";
}

function matchesCardBookFilter(card, filter = "all", cardKey = "") {
    if (!card) return false;
    if (filter === "all") return true;
    if (filter === "element-machine") return card.element === "machine" || card.element === "fire";
    if (filter === "element-electric") return card.element === "electric";
    if (filter === "element-material") return card.element === "material";
    if (filter === "element-management") return card.element === "management" || cardKey === "choubo";
    if (filter === "element-control") return card.element === "control";
    if (filter === "heal") return card.type === "heal" || card.type === "mpheal";
    return card.type === filter;
}

function setCardBookFeatured(card, cardKey = "") {
    if (!cardBookFeatured) return;
    if (!card) {
        cardBookFeatured.innerHTML = "";
        return;
    }
    cardBookFeatured.innerHTML = renderCardInfoBlock(card, getDisplayCardLabel(card), 40, true);
    cardBookContainer?.querySelectorAll(".card-book-slot").forEach(slot => {
        slot.classList.toggle("is-selected", slot.dataset.cardKey === cardKey);
    });
}

function renderAttributeGuideIcon(element) {
    const meta = getAttributeMeta(element);
    if (!meta) return "";
    return `<img class="attribute-guide-icon" src="${meta.icon}" alt="${meta.alt}">`;
}

function renderCardBookAttributeGuide() {
    if (!cardBookContainer) return;
    if (cardBookFeatured) cardBookFeatured.innerHTML = "";
    cardBookPopup?.classList.add("is-attribute-guide");
    cardBookContainer.classList.add("attribute-guide-container");
    cardBookContainer.innerHTML = `
        <div class="attribute-guide-page">
            <section class="attribute-guide-box" aria-label="属性説明">
                <p><span class="attribute-guide-no-icon" aria-hidden="true"></span><span>無属性の攻撃は、どの守備カードでも防御できる。</span></p>
                <p>${renderAttributeGuideIcon("machine")}<span><strong class="machine-attribute-name">機械属性</strong>の攻撃は、普通の守備カードでは防御できない。</span></p>
                <p>${renderAttributeGuideIcon("material")}<span><strong class="material-attribute-name">物質属性</strong>の攻撃は、普通の守備カードで防御できる。ただし1ダメージでも受けると即死する。</span></p>
                <p>${renderAttributeGuideIcon("control")}<span><strong class="control-attribute-name">制御属性</strong>は、相手の行動をランダムに操作する。</span></p>
                <p>${renderAttributeGuideIcon("electric")}<span><strong class="electric-attribute-name">電気属性</strong>は、攻撃カードと合わせて連続攻撃を行う。</span></p>
                <p>${renderAttributeGuideIcon("management")}<span><strong class="management-attribute-name">経営属性</strong>は、手札を増やしたりターンを有利に進めたりできる。</span></p>
            </section>
            <section class="attribute-guide-note">
                <p>属性アイコンが付いたカードは、通常カードとは違う追加効果を持つ。</p>
                <p>カードの説明欄を確認して、どの属性に対応しているかを判断する。</p>
            </section>
        </div>
    `;
}

function renderCardBook(filter = "all") {
    if (!cardBookContainer) return;
    if (filter === "attribute-guide") {
        renderCardBookAttributeGuide();
        return;
    }
    cardBookPopup?.classList.remove("is-attribute-guide");
    cardBookContainer.classList.remove("attribute-guide-container");
    cardBookContainer.innerHTML = "";

    const entries = Object.entries(CARDS)
        .filter(([cardKey, card]) => matchesCardBookFilter(card, filter, cardKey));

    entries.forEach(([cardKey, card]) => {
        const slot = document.createElement("button");
        slot.type = "button";
        slot.className = "card-book-slot";
        slot.dataset.type = card.type;
        slot.dataset.cardKey = cardKey;
        slot.dataset.element = card.element || "";
        slot.setAttribute("aria-label", `${card.name}: ${card.description}`);
        slot.innerHTML = `
            <span class="card-book-icon-wrap" aria-hidden="true">
                <img class="card-book-icon" src="${card.imgSrc}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
                <span class="card-book-fallback" style="display: none;">${card.name.slice(0, 1)}</span>
            </span>
            <div class="card-book-preview" role="tooltip">
                ${renderCardInfoBlock(card, getDisplayCardLabel(card), 40, true)}
            </div>
        `;
        slot.addEventListener("click", () => setCardBookFeatured(card, cardKey));
        slot.addEventListener("mouseenter", () => setCardBookFeatured(card, cardKey));
        slot.addEventListener("focus", () => setCardBookFeatured(card, cardKey));
        cardBookContainer.appendChild(slot);
    });

    const [firstCardKey, firstCard] = entries[0] || [];
    setCardBookFeatured(firstCard, firstCardKey);
}

function openCardBook() {
    if (!cardBookPopup) return;
    closeTutorial(false);
    stopTimer();
    renderCardBook(document.querySelector(".card-book-filter.is-active")?.dataset.filter || "all");
    cardBookPopup.classList.add("is-open");
    cardBookPopup.setAttribute("aria-hidden", "false");
}

function closeCardBook() {
    if (!cardBookPopup) return;
    cardBookPopup.classList.remove("is-open");
    cardBookPopup.setAttribute("aria-hidden", "true");
    lastTimerStateKey = null;
    resetTimerWhenTurnStateChanges(currentTurnGlobal, pendingAttackGlobal);
    maybeStartTutorial();
}

function openCredit() {
    if (!creditPopup) return;
    creditPopup.classList.add("is-open");
    creditPopup.setAttribute("aria-hidden", "false");
    creditCloseButton?.focus();
}

function closeCredit() {
    if (!creditPopup) return;
    creditPopup.classList.remove("is-open");
    creditPopup.setAttribute("aria-hidden", "true");
    creditOpenButton?.focus();
}

bookButton?.addEventListener("click", openCardBook);
cardBookCloseButton?.addEventListener("click", closeCardBook);
creditOpenButton?.addEventListener("click", openCredit);
creditCloseButton?.addEventListener("click", closeCredit);
cardBookPopup?.addEventListener("click", event => {
    if (event.target === cardBookPopup) closeCardBook();
});
cardBookFilterButtons.forEach(button => {
    button.addEventListener("click", () => {
        cardBookFilterButtons.forEach(item => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderCardBook(button.dataset.filter);
    });
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && creditPopup?.classList.contains("is-open")) {
        closeCredit();
        return;
    }
    if (event.key === "Escape" && cardBookPopup?.classList.contains("is-open")) {
        closeCardBook();
    }
});

function sendGameState(nextTurnRole, pendingAttackValue = 0, attackCardInfo = null, logMessage = "", damageResult = null, handEffect = null, controlEffect = undefined, selectedCardInfo = null) {
    let p1_hp, p2_hp, p1_mp, p2_mp, p1_def, p2_def;

    if (pendingAttackValue === 0) {
        refillPendingDrawsAtActionEnd();
    }

    myHand = normalizeHand(myHand);
    tekiHand = normalizeHand(tekiHand);
    myMagicHand = normalizeMagicHand(myMagicHand);
    tekiMagicHand = normalizeMagicHand(tekiMagicHand);

    if (myPlayerRole === "player1") {
        p1_hp = mycurrenthp;
        p2_hp = tekicurrenthp;
        p1_mp = mycurrentmp;
        p2_mp = tekicurrentmp;
        p1_def = mydefense;
        p2_def = tekidefense;
    } else {
        p1_hp = tekicurrenthp;
        p2_hp = mycurrenthp;
        p1_mp = tekicurrentmp;
        p2_mp = mycurrentmp;
        p1_def = tekidefense;
        p2_def = mydefense;
    }

    const nextRound = (
        pendingAttackValue === 0
        && currentTurnGlobal === "player2"
        && nextTurnRole === "player1"
    ) ? currentRoundGlobal + 1 : currentRoundGlobal;

    const nextState = {
        player1_hp: p1_hp,
        player2_hp: p2_hp,
        player1_mp: p1_mp,
        player2_mp: p2_mp,
        player1_def: p1_def,
        player2_def: p2_def,
        player1_def_cards: pendingAttackValue > 0 ? (defenseCardsGlobal.player1 || []) : [],
        player2_def_cards: pendingAttackValue > 0 ? (defenseCardsGlobal.player2 || []) : [],
        player1_pending_draws: pendingDrawsGlobal.player1 || 0,
        player2_pending_draws: pendingDrawsGlobal.player2 || 0,
        player1_hand_limit: getHandLimitByRole("player1"),
        player2_hand_limit: getHandLimitByRole("player2"),
        player1_hand: myHand,
        player2_hand: tekiHand,
        player1_magic_hand: myMagicHand,
        player2_magic_hand: tekiMagicHand,
        turn: nextTurnRole,
        round: nextRound,
        winner: nextTurnRole === "end" ? getWinnerFromHp(p1_hp, p2_hp) : null,
        pending_attack: pendingAttackValue,
        selected_card: selectedCardInfo,
        // 攻撃時だけ attack_card をセット、それ以外は null でクリア
        attack_card: pendingAttackValue > 0 ? attackCardInfo : null,
        damage_result: damageResult,
        hand_effect: handEffect,
        control_effect: controlEffect === undefined ? controlEffectGlobal : controlEffect,
        last_log: null
    };

    if (ENABLE_BATTLE_LOG && logMessage) {
        nextState.last_log = {
            id: Date.now(),
            player: myPlayerRole,
            message: logMessage
        };
    }

    update(gameRoomRef, nextState);
}


//試合のリセット
let lastResetTrigger = 0;

window.resetGame = function() {
    shouldAnimateHandFeedIn = true;
    shouldAnimateHandSortAfterFeedIn = true;
    clearTimeout(attackDisplayAfterResultTimer);
    attackDisplayAfterResultTimer = null;
    displayedAttackerRole = null;
    heldAttackDisplayAfterResult = null;
    battleSelectDiv?.classList.remove("attacker-player2", "switching-attacker-order", "self-attack-mode", "heal-mode", "heal-player1", "heal-player2");
    closeTutorial(false);
    cancelMatchStartCountdown(true);
    resetTutorialProgress();
    closeCardBook();
    closeCredit();
    hideVictoryScreen();
    hideNameSetup();
    resetPlayerNames();
    clearSelectedDefenseCards();
    stopTimer();
    lastTimerStateKey = null;
    currentTurnGlobal = "player1";
    hasObservedGameState = false;
    lastKoSoundKey = null;
    lastTurnNoticeKey = null;
    myPlayerRole = null;
    isMyTurnGlobal = false;
    gameStartedGlobal = false;
    controlEffectGlobal = null;
    controlledActionInProgress = false;
    lastControlledActionKey = null;
    updateControlledPlayerDisplay();
    clearSelectedCardState();
    mycurrentmp = INITIAL_MP;
    tekicurrentmp = INITIAL_MP;
    myMagicHand = [];
    tekiMagicHand = [];
    handLimitGlobal = {
        player1: MAX_HAND_CARDS,
        player2: MAX_HAND_CARDS
    };
    player1Mp.textContent = INITIAL_MP;
    player2Mp.textContent = INITIAL_MP;
    selectedAttackTargetRole = "player2";
    if (gameRoomUnsubscribe) {
        gameRoomUnsubscribe();
        gameRoomUnsubscribe = null;
    }
    myHandDiv.innerHTML = "";
    tekiHandDiv.innerHTML = "";
    myMagicHandDiv.innerHTML = "";
    tekiMagicHandDiv.innerHTML = "";
    document.getElementById("my-screen")?.classList.remove("hand-screen-hidden");
    document.getElementById("enemy-screen")?.classList.remove("hand-screen-hidden");
    clearCardActionDisplays();
    hideTurnNotice();
    if (gameOyaDiv) gameOyaDiv.style.display = "none";
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("setup-screen").style.display = "block";
    let p1Hand = [];
    let p2Hand = [];
    let p1MagicHand = [];
    let p2MagicHand = [];
    for (let i = 0; i < MAX_HAND_CARDS; i++) {
        p1Hand.push(drawCardForNormalHand());
        p2Hand.push(drawCardForNormalHand());
    }
    ensureInitialAttackCard(p1Hand);
    ensureInitialAttackCard(p2Hand);
    update(gameRoomRef, {
        player1_hp: 50,//それぞれのhp
        player2_hp: 50,//それぞれのhp
        player1_mp: INITIAL_MP,
        player2_mp: INITIAL_MP,
        player1_def: 0,
        player2_def: 0,
        player1_hand: p1Hand,
        player2_hand: p2Hand,
        player1_magic_hand: p1MagicHand,
        player2_magic_hand: p2MagicHand,
        player1_hand_limit: MAX_HAND_CARDS,
        player2_hand_limit: MAX_HAND_CARDS,
        pending_attack: 0,
        turn: "player1",//Player1が先行！！
        round: 1,
        winner: null,
        player1_name: null,
        player2_name: null,
        pending_attack: 0,
        player1_def_cards: [],
        player2_def_cards: [],
        player1_pending_draws: 0,
        player2_pending_draws: 0,
        selected_card: null,
        attack_card: null,
        damage_result: null,
        hand_effect: null,
        control_effect: null,
        last_log: null,
        reset_trigger: Date.now() 
        
    });
    
}




window.setTurn = function(isMyTurn) {
};
function setTurn(isMyTurn) {
}


// ---- カウントダウンタイマー ----
const TIMER_SEC = 10;
let timerInterval = null;
let timerRemaining = TIMER_SEC;

const timerBar = document.getElementById("timer-bar");

function startTimer() {
    if (isTutorialActive || matchStartCountdownActive) return;
    clearInterval(timerInterval);
    timerRemaining = TIMER_SEC;
    updateTimerBar();

    timerInterval = setInterval(() => {
        timerRemaining -= 0.1;

        // 変更後
if (timerRemaining <= 0) {
    timerRemaining = 0;
    updateTimerBar();
    clearInterval(timerInterval);
    timerInterval = null;

    if (!isMyTurnGlobal) return; // 自分のターンでなければ処理しない

    const targetDiv = (myPlayerRole === "player1") ? player1Div : player2Div;
    const info = targetDiv?.querySelector(".selected-card-info");
    if (info) info.remove();
    selectedCardIndex = null;

    if (pendingAttackGlobal > 0) {
    if (tryReflectPendingAttack(myPlayerRole)) return;
    const revealedDefenseCards = makeDefenseRevealCards(myPlayerRole, pendingAttackGlobal);
    const finalDamage = calculateDamageAfterDefense(pendingAttackGlobal, myPlayerRole);
    const usedDefenseCount = consumeSelectedDefenseCards(myPlayerRole);
    const hpBeforeDamage = mycurrenthp;
    const newHp = applyDamageToHp(mycurrenthp, finalDamage, currentAttackCardGlobal);
    mycurrenthp = newHp;
    mydefense = 0;
    reserveDrawForCurrentPlayer(usedDefenseCount);
    const damageResult = makeDamageResult(myPlayerRole, finalDamage, currentAttackCardGlobal, hpBeforeDamage);
    damageResult.usedDefenseCards = revealedDefenseCards;
    const resolvedAttackCard = currentAttackCardGlobal ? { ...currentAttackCardGlobal } : null;
    const nextTurnAfterDefense = currentAttackCardGlobal?.afterTurn || myPlayerRole;
    pendingAttackGlobal = 0;
    currentAttackCardGlobal = null;
    clearSelectedDefenseCards();
    const timeoutLog = ``;

    // HP表示を即時反映
    if (myPlayerRole === "player1") {
        myhp.textContent = newHp;
    } else {
        tekihp.textContent = newHp;
    }

    if (newHp <= 0) {
        markKnockoutResult(damageResult);
        sendGameState("end", 0, null, timeoutLog, damageResult);
    } else if ((resolvedAttackCard?.relayRepeat || 0) > 0) {
        const repeatedAttackCard = {
            ...resolvedAttackCard,
            relayRepeat: Math.max(0, (resolvedAttackCard.relayRepeat || 0) - 1),
            repeatId: Date.now()
        };
        sendGameState(myPlayerRole, repeatedAttackCard.value || 0, repeatedAttackCard, timeoutLog, damageResult);
    } else {
        sendGameState(nextTurnAfterDefense, 0, null, timeoutLog, damageResult);
    }
    } else {
        // 通常ターンで時間切れ → 相手にターンを渡す
        const nextTurn = (myPlayerRole === "player1") ? "player2" : "player1";
        sendGameState(nextTurn, 0, null);
    }
        } else {
            updateTimerBar();
        }
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRemaining = TIMER_SEC;
    updateTimerBar();
}

function updateTimerBar() {
    const pct = (timerRemaining / TIMER_SEC) * 100;
    timerBar.style.width = pct + "%";
    if (pct > 50) {
        timerBar.style.background = "rgb(0 143 111)";

    } else if (pct > 25) {
        timerBar.style.background = "#f0a500";
    } else {
        timerBar.style.background = "#e03030";
    }
}

function resetTimerWhenTurnStateChanges(turnRole, pendingAttackValue) {
    if (!myPlayerRole || !gameStartedGlobal || isTutorialActive || matchStartCountdownActive) {
        stopTimer();
        return;
    }

    const stateKey = `${turnRole}:${pendingAttackValue}:${myPlayerRole}`;
    const stateChanged = stateKey !== lastTimerStateKey;
    lastTimerStateKey = stateKey;
    if (!stateChanged) return;

    const isControlledAutoTurn = controlEffectGlobal?.target === myPlayerRole
        && turnRole === myPlayerRole
        && pendingAttackValue === 0;
    const shouldRunTimer = turnRole === myPlayerRole && turnRole !== "end" && !isControlledAutoTurn;

    if (shouldRunTimer) {
        startTimer();
    } else {
        stopTimer();
    }
}

const _origRenderHands = renderHands;
const _renderHands = renderHands;
const _origOnValueCallback = onValue;

(function patchRenderHands() {
    const original = window.renderHands ?? renderHands;
})();


const handObserver = new MutationObserver(() => {
    if (!gameStartedGlobal || isTutorialActive || matchStartCountdownActive) {
        stopTimer();
        return;
    }
    const myHandDiv = document.getElementById("my-hand");
    const tekiHandDiv = document.getElementById("teki-hand");
    const activeDiv = (myPlayerRole === "player1") ? myHandDiv : tekiHandDiv;
    if (!activeDiv) return;

    const buttons = activeDiv.querySelectorAll("button");
    const anyEnabled = [...buttons].some(b => !b.disabled);

    if (anyEnabled) {
        if (!timerInterval) startTimer();
    } else {
        stopTimer();
    }
});


const gameScreen = document.getElementById("game-screen");
const screenObserver = new MutationObserver(() => {
    if (gameScreen.style.display !== "none") {
        handObserver.observe(document.getElementById("my-hand"), { childList: true, subtree: true, attributes: true });
        handObserver.observe(document.getElementById("teki-hand"), { childList: true, subtree: true, attributes: true });
        screenObserver.disconnect();
    }
});
screenObserver.observe(gameScreen, { attributes: true, attributeFilter: ["style"] });

["copy", "cut", "contextmenu", "dragstart"].forEach(eventName => {
    document.addEventListener(eventName, event => {
        event.preventDefault();
    });
});

["gesturestart", "gesturechange", "gestureend"].forEach(eventName => {
    document.addEventListener(eventName, event => {
        event.preventDefault();
    }, { passive: false });
});

document.addEventListener("wheel", event => {
    if (event.ctrlKey) event.preventDefault();
}, { passive: false });

document.addEventListener("dblclick", event => {
    event.preventDefault();
}, { passive: false });
