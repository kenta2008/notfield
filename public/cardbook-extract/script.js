const ATTRIBUTE_ICON_VERSION = "20260717-attribute-icons";

const ATTRIBUTE_META = {
    machine: {
        icon: `../images/zokusei/m.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "機械属性",
        nameClass: "machine-attribute-name"
    },
    material: {
        icon: `../images/zokusei/c.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "物質属性",
        nameClass: "material-attribute-name"
    },
    management: {
        icon: `../images/zokusei/b.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "経営属性",
        nameClass: "management-attribute-name"
    },
    electric: {
        icon: `../images/zokusei/e.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "電気属性",
        nameClass: "electric-attribute-name"
    },
    control: {
        icon: `../images/zokusei/s.png?v=${ATTRIBUTE_ICON_VERSION}`,
        alt: "制御属性",
        nameClass: "control-attribute-name"
    }
};

const CARDS = {
    pencil: { name:"シャーペン", type:"attack", value: 10, description:"相手に攻撃力10を与えることができる。", imgSrc: "../images/attack/pen.png"},
    hacking: { name:"ハッキング", type:"attack", element:"control", value: 0, description:"相手を3ターンランダムに行動させることができる。", imgSrc: "../images/attack/kontorora.png"},
    mojibake: { name:"文字化けファイル", type:"attack", element:"control", value: 0, description:"相手の手札からカードを一枚消すことができる。", imgSrc: "../images/attack/mojibake.png"},
    kusaifuku: { name:"臭い服", type:"attack", value: 5, description:"部屋干しのにおいが臭すぎて気絶。5ダメージあたることができる。", imgSrc: "../images/attack/kusaifuku.png"},
    gojyuukyuu: { name:"59点のテスト", type:"attack", value: 6, description:"60点から合格です。", imgSrc: "../images/attack/59ten.png"},
    kanningu: { name:"カンニング", type:"attack", value: 12, hitRate: 0.3, description:"30%の確率で12ダメージを与えることができる。", imgSrc: "../images/attack/kanningu.png"},
    seisankari: { name:"青酸カリ", type:"attack", element:"material", value: 8, description:"1ダメージでも受けると即死する。", imgSrc: "../images/attack/seisankari.png"},
    ensan: { name:"塩酸", type:"attack", element:"material", value: 3, description:"1ダメージでも受けると即死する。", imgSrc: "../images/attack/ensan.png"},
    yousetu: { name:"溶接", type:"attack", element:"machine", value: 3, description:"機械属性。普通の守備では防ぐことができない。", imgSrc: "../images/attack/yousetsu.png"},
    handa: { name:"はんだごて", type:"attack", element:"machine", value: 2, description:"機械属性。普通の守備では防ぐことができない。", imgSrc: "../images/attack/handagote.png"},

    kakomon: { name:"過去問", type:"heal", value: 5, description:"5HP回復することができる。", imgSrc: "../images/heal/test.png"},
    kyuukou: { name:"カフェイン", type:"heal", value: 10, description:"10HP回復することができる", imgSrc: "../images/heal/kyuukou.png"},
    ramen: { name:"カップラーメン", type:"heal", value: 3, description:"3HP回復することができる", imgSrc: "../images/heal/ramen.png"},
    megusuri: { name:"目薬", type:"mpheal", value: 5, description:"5MP回復することができる。", imgSrc: "../images/heal/megusuri.png"},
    ramune: { name:"ラムネ", type:"mpheal", value: 10, description:"10MP回復することができる。", imgSrc: "../images/heal/ramune.png"},
    ryougae: { name:"両替", type:"special", element:"management", value: 0, exchange: true, exchangeValue: 15, description:"HPとMPを1対1で交換できる。", imgSrc: "../images/special/ryougae.png"},

    enadori: { name:"エナジードリンク", type:"magic", value: 2, mpCost: 7, description:"7MPを消費して攻撃力を2倍にする", imgSrc: "../images/heal/enadori.png"},
    harapeko: { name:"抵抗器", type:"defense", element:"control", value: 0, reductionRate: 0.6, description:"受ける攻撃を60%減らす", imgSrc: "../images/defense/teikou.png"},
    hakui: { name:"白衣", type:"defense", element:"material", value: 5, materialDefenseValue: 10, description:"物質属性の攻撃には守10、それ以外には守5", imgSrc: "../images/defense/hakui.png"},
    roppou: { name:"六法全書", type:"defense", element:"management", value: 0, attributeNeutralizer: true, description:"攻撃の属性効果を消し、普通の守備で防げるようにする", imgSrc: "../images/defense/roppou.png"},
    anzenmegane: { name:"安全メガネ", type:"defense", value: 4, description:"攻撃を防ぐことができる", imgSrc: "../images/defense/anzenmegane.png"},
    helmet: { name:"ヘルメット", type:"defense", value: 5, description:"攻撃を防ぐことができる", imgSrc: "../images/defense/helmet.png"},
    mobairubatteri: { name:"モバイルバッテリー", type:"defense", value: 6, description:"攻撃を防ぐことができる", imgSrc: "../images/defense/mobairubatteri.png"},

    nuton: { name:"ニュートンのゆりかご", type:"defense", value: 0, reflectAttack: true, description:"攻撃を確定で跳ね返すことができる", imgSrc: "../images/kakuritu/nuton.png"},
    choubo: { name:"帳簿", type:"special", element:"management", value: 0, drawCards: 2, expandHand: 2, description:"最大手札枠を1増やすことができる", imgSrc: "../images/attack/tyobo.png"},
    timecard: { name:"タイムカード", type:"special", element:"management", value: 0, extraTurn: true, description:"普通のカードと併せて使うと、自分のターンをもう一度行える", imgSrc: "../images/special/timecard.png"},
    relay: { name:"電磁リレー", type:"special", element:"electric", value: 0, repeatAttack: 1, description:"攻撃カードと併せて使うと、2連続攻撃を行える", imgSrc: "../images/attack/relay.png"}
};

const cardBookContainer = document.getElementById("card-book-container");
const cardBookFeatured = document.getElementById("card-book-featured");
const cardBookFilterButtons = [...document.querySelectorAll(".card-book-filter")];

function getAttributeMeta(element) {
    return ATTRIBUTE_META[element] || null;
}

function getDisplayCardLabel(card) {
    if (!card) return "";
    if (card.type === "attack") {
        if (card.hitRate) return `${Math.round(card.hitRate * 100)}%攻${card.value}`;
        return card.value > 0 ? `攻 ${card.value}` : "";
    }
    if (card.type === "defense") {
        if (card.reflectAttack) return "反射";
        if (card.attributeNeutralizer) return "属性無効";
        if (card.reductionRate) return `${Math.round(card.reductionRate * 100)}%減`;
        return `守 ${card.value}`;
    }
    if (card.type === "heal") return `回 ${card.value}`;
    if (card.type === "mpheal") return `MP${card.value}`;
    if (card.type === "magic") return `×${card.value}`;
    if (card.exchange) return "両替";
    if (card.drawCards) return `+${card.drawCards}枚`;
    if (card.extraTurn) return "再行動";
    if (card.repeatAttack) return "連続";
    return "";
}

function renderCardInfoBlock(card, label) {
    const attributeMeta = getAttributeMeta(card?.element);
    const hasMpCost = Number(card?.mpCost) > 0;
    const attributeIcon = attributeMeta
        ? `<img class="card-attribute-icon" src="${attributeMeta.icon}" alt="${attributeMeta.alt}">`
        : "";
    const attributeNameClass = attributeMeta ? ` ${attributeMeta.nameClass}` : "";
    const effectHtml = hasMpCost
        ? `<span class="card-info-main-effect">${label || ""}</span><span class="card-info-mp-cost-badge">消費<br>MP${card.mpCost}</span>`
        : (label || "");
    return `
        <article class="card-info-panel${hasMpCost ? " mp-cost-card-info" : ""}">
            <div class="card-info-image">
                <img src="${card.imgSrc}" alt="${card.name}" onerror="this.style.display='none';">
            </div>
            <div class="card-info-body">
                <div class="card-info-name${attributeNameClass}">
                    <span class="card-info-name-text">${card.name}</span>${attributeIcon}
                </div>
                <div class="card-info-effect">${effectHtml}</div>
                <div class="card-info-description">${card.description || ""}</div>
            </div>
        </article>
    `;
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
    cardBookFeatured.innerHTML = renderCardInfoBlock(card, getDisplayCardLabel(card));
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
                ${renderCardInfoBlock(card, getDisplayCardLabel(card))}
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

cardBookFilterButtons.forEach(button => {
    button.addEventListener("click", () => {
        cardBookFilterButtons.forEach(item => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderCardBook(button.dataset.filter);
    });
});

document.getElementById("card-book-close")?.addEventListener("click", () => {
    history.back();
});

renderCardBook("all");
