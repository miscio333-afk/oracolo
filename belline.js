// Oracolo di Belline - dataset e logica di supporto
// Struttura classica: 3 "carte prime" (n.1-3) + 49 carte (n.4-52) in 7 "Luci" planetarie da 7
// + Carta Blu (jolly opzionale). Nessun senso "rovesciato": si legge per serie,
// polarità e abbinamenti ("una buona carta neutralizza la cattiva accanto").
// Nomi tradotti dal francese, significati, parole chiave e associazioni adattati
// dalla guida (fonti: guida-belline.csv / guidaok.csv / okkkkkk.csv).

const bellineSeriesMeta = {
    prime:   { label: 'Carte Prime', planet: 'Il Destino', element: '—', accent: '#FFBF00' },
    sole:    { label: 'Luce I · Sole', planet: 'Sole', element: 'Fuoco', accent: '#FFBF00' },
    luna:    { label: 'Luce II · Luna', planet: 'Luna', element: 'Acqua', accent: '#C9A9E8' },
    mercurio:{ label: 'Luce III · Mercurio', planet: 'Mercurio', element: 'Aria', accent: '#A8D8EA' },
    venere:  { label: 'Luce IV · Venere', planet: 'Venere', element: 'Acqua', accent: '#F7C8D8' },
    marte:   { label: 'Luce V · Marte', planet: 'Marte', element: 'Fuoco', accent: '#E8836A' },
    giove:   { label: 'Luce VI · Giove', planet: 'Giove', element: 'Fuoco', accent: '#FFE08A' },
    saturno: { label: 'Luce VII · Saturno', planet: 'Saturno', element: 'Terra', accent: '#B8B8C8' }
};

const bellineSeriesBullet = {
    prime: 'Significato dominante: segni che pesano su tutta la stesa.',
    sole: 'Luce, forza vitale e creatrice: ogni carta della serie ha significato intrinsecamente positivo.',
    luna: 'Oscurità, ignoto, sogno e intuizione: la mente notturna, le azioni nascoste.',
    mercurio: 'Scambi, comunicazioni, intelligenza e adattamento: rapide mutazioni, occasioni da cogliere al volo.',
    venere: 'Piacere, affettività e bellezza: la gioia di vivere e la vita dei sentimenti.',
    marte: 'Lotta, energia e impulsività: scontri, conflitti e passioni forti.',
    giove: 'Riuscita, autorità e protezione: benedizioni e realizzazione delle speranze.',
    saturno: 'Fatica, pazienza e destino: rallentamenti, maturità e ricerca interiore.'
};

// Polarità per carta (good / neutral / bad); se assente si usa il default della serie.
const BELLINE_POLARITY_DEFAULTS = {
    prime: 'good', sole: 'good', luna: 'neutral', mercurio: 'good', venere: 'good',
    marte: 'neutral', giove: 'good', saturno: 'neutral', azzurra: 'good'
};

const BELLINE_POLARITY_OVERRIDES = {
    1: 'neutral', 11: 'bad', 13: 'neutral', 14: 'good', 16: 'good', 17: 'bad',
    21: 'bad', 24: 'neutral', 25: 'good', 26: 'good', 27: 'good', 29: 'good',
    30: 'good', 31: 'neutral', 32: 'bad', 33: 'neutral', 34: 'bad', 35: 'bad',
    37: 'good', 38: 'bad', 43: 'good', 44: 'neutral', 46: 'bad', 47: 'bad',
    48: 'bad', 49: 'good', 50: 'bad', 51: 'neutral', 52: 'neutral'
};

// Builder compatto: B(num, name, series, meaning, pairs, association, keywords)
function B(num, name, series, meaning, pairs, association, keywords) {
    return {
        id: num, num: num, name: name, series: series, meaning: meaning,
        pairs: pairs || [], association: association || '', keywords: keywords || []
    };
}

const bellineBlueCard = {
    id: 'blue', num: null, name: 'La Carta Blu', series: 'azzurra',
    association: 'Nessuno',
    keywords: ['Pace', 'Protezione', 'Equilibrio', 'Serenità'],
    meaning: "La Carta Blu è la protezione suprema. Rappresenta la dissoluzione delle ombre e il ritorno alla calma; agisce come uno scudo energetico che rimuove le difficoltà.",
    pairs: []
};

const bellineDeck = [
    // ---------- CARTE PRIME (1-3) ----------
    B(1, 'Il Destino', 'prime',
        "Un segnale di partenza. Rappresenta un carrefour (bivio) dove è necessario scegliere. Spinge all'evoluzione fuori dall'immobilismo.",
        [], 'Fondamentale',
        ['Decisione', 'Iniziativa', 'Scelta', 'Destino']),
    B(2, "La Stella dell'Uomo", 'prime',
        "Rappresenta l'archetipo del guerriero moderno: forza, conquista e azione. Indica il consultante o una figura maschile influente.",
        [], 'Consultante Maschile',
        ['Coraggio', 'Affermazione', 'Energia Attiva', 'Protezione']),
    B(3, 'La Stella della Donna', 'prime',
        "Rappresenta l'energia ricettiva, la dolcezza e l'intuizione. Invita alla riflessione profonda e all'ascolto del cuore.",
        [], 'Consultante Femminile',
        ['Intuizione', 'Sensibilità', 'Benevolenza', 'Guida']),

    // ---------- LUCE I · SOLE (4-10) ----------
    B(4, 'La Natività', 'sole',
        "Allineamento perfetto degli astri. Rappresenta una piccola graina che germoglia in terra fertile: un nuovo inizio con assenza totale di ostacoli.",
        [], 'Sole',
        ['Nuovo ciclo', 'Gravidanza', 'Progetti', 'Sicurezza']),
    B(5, 'La Riuscita', 'sole',
        "La vittoria dopo uno sforzo costante, come il traguardo di una maratona. Il successo è meritato e non casuale.",
        [], 'Sole',
        ['Trionfo', 'Merito', 'Compimento', 'Vittoria']),
    B(6, "L'Elevazione", 'sole',
        "Progresso costante. Simboleggiata da una piramide e una scala coricata: gli strumenti ci sono, ma vanno raddrizzati e attivati dal consultante.",
        [], 'Sole',
        ['Metodo', 'Evoluzione', 'Ambizione', 'Sforzo']),
    B(7, 'Gli Onori', 'sole',
        "Potere legittimo. Simbolizzata dalla Corona, il Sacerdote e la Mano della Giustizia. Riconoscimento sociale basato sull'onestà.",
        [], 'Sole',
        ['Etica', 'Distinzione', 'Rispetto', 'Giustizia']),
    B(8, "L'Amicizia", 'sole',
        "Legami inalienabili. Rappresenta persone fidate che offrono una mano tesa. Invito alla socialità e a nuove connessioni.",
        [], 'Sole',
        ['Lealtà', 'Sincerità', 'Sostegno', 'Fiducia']),
    B(9, 'La Campagna', 'sole',
        "Simbolo di pace e ritorno alle radici. Necessità tecnica di ricaricare le batterie e allontanarsi dal frastuono.",
        [{ with: 30, note: "Vicino a La Tavola (n.30): l'idea di una piacevole gita fuori porta, un picnic." }], 'Sole',
        ['Riposo', 'Natura', 'Convalescenza', 'Risorse']),
    B(10, 'I Doni', 'sole',
        "Un dono inaspettato che cade dal cielo. Rappresenta un miglioramento materiale o un riconoscimento tangibile della generosità.",
        [], 'Sole',
        ['Abbondanza', 'Ricompensa', 'Fortuità', 'Dono']),

    // ---------- LUCE II · LUNA (11-17) ----------
    B(11, 'Il Tradimento', 'luna',
        "Avvertimento su inganni esterni o pericoloso autosabotaggio interno. Spirale di pensieri negativi che offusca il giudizio.",
        [], 'Luna',
        ['Invidia', 'Vigilanza', 'Gelosia', 'Dubbio']),
    B(12, 'La Partenza', 'luna',
        "Distacco netto. Le montagne rappresentano il passato da lasciare; gli uccelli, il volo verso l'ignoto. Emancipazione necessaria.",
        [{ with: 15, note: "Accanto all'Acqua (n.15): un viaggio all'estero." }], 'Luna',
        ['Viaggio', 'Indipendenza', 'Libertà', 'Cambiamento']),
    B(13, "L'Incostanza", 'luna',
        "Instabilità come in una tempesta. Parole \"al vento\" o promesse poco solide. Necessità di centratura per non perdersi.",
        [{ with: 38, note: "Accanto a L'Incidente (n.38): sconsiglia i viaggi aerei." }], 'Luna',
        ['Indecisione', 'Versatilità', 'Incertezza', 'Confusione']),
    B(14, 'La Scoperta', 'luna',
        "Il telescopio invita a guardare oltre. La stella nel mirino simboleggia la guida verso verità nascoste o nuovi saperi.",
        [], 'Luna',
        ['Curiosità', 'Ricerca', 'Indagine', 'Sapere']),
    B(15, "L'Acqua", 'luna',
        "Connessione profonda con la medianità e la preveggenza. Nonostante le onde emotive, la nave resta stabile se si segue l'intuizione.",
        [{ with: 38, note: 'Accanto a L\'Incidente (n.38): ti mette in guardia da annegamento, inondazione o naufragio.' }], 'Luna',
        ['Femminilità', 'Introspezione', 'Preveggenza', 'Emozioni']),
    B(16, 'I Penati', 'luna',
        "La torre solida rappresenta il rifugio, le tradizioni e le radici familiari. Legata strettamente ai beni immobili.",
        [], 'Luna',
        ['Casa', 'Sicurezza', 'Tradizione', 'Stabilità']),
    B(17, 'La Malattia', 'luna',
        "L'uccello di preda che ghermisce la vittima indica oppressione e stanchezza. Richiede resilienza e ascolto dei propri limiti.",
        [{ with: 48, note: 'Accanto a La Fatalità (n.48): malattia a esito fatale.' },
         { with: 49, note: 'Accanto a La Grazia (n.49): guarigione, convalescenza.' }], 'Luna',
        ['Blocco', 'Stress', 'Ansia', 'Indebolimento']),

    // ---------- LUCE III · MERCURIO (18-24) ----------
    B(18, 'Il Cambiamento', 'mercurio',
        "Movimento naturale e favorevole, come riorganizzare una stanza per renderla più armoniosa. Evoluzione non brutale.",
        [], 'Mercurio',
        ['Adattamento', 'Flessibilità', 'Rinnovamento', 'Scelta']),
    B(19, 'Il Denaro', 'mercurio',
        "Prosperità materiale simboleggiata dalla Cornucopia. Afflusso di risorse da gestire con responsabilità.",
        [{ with: 23, note: 'Accanto a Il Traffico (n.23): investimenti interessanti.' }], 'Mercurio',
        ['Abbondanza', 'Bonus', 'Sicurezza', 'Ricchezza']),
    B(20, "L'Intelligenza", 'mercurio',
        "Il libro e le candele indicano lucidità mentale e studio. Uso della strategia per risolvere complessità.",
        [], 'Mercurio',
        ['Apprendimento', 'Chiarezza', 'Analisi', 'Sapere']),
    B(21, 'Il Furto', 'mercurio',
        "Pericolo di manipolazione o sottrazione (materiale o emotiva) da parte di terzi. Richiede estrema vigilanza.",
        [{ with: 23, note: 'Accanto a Il Traffico (n.23): affari loschi.' },
         { with: 35, note: 'Accanto a Il Nemico (n.35): rischio di scippo o aggressione a scopo di furto.' }], 'Mercurio',
        ['Furto', 'Inganno', 'Vulnerabilità', 'Manipolazione']),
    B(22, "L'Impresa", 'mercurio',
        "La figura dell'architetto: strutturare i progetti con piani solidi. Applicabile a costruzioni reali o simboliche.",
        [{ with: 32, note: 'Accanto a La Malvagità (n.32): può profilarsi una trappola.' }], 'Mercurio',
        ['Lavoro', 'Organizzazione', 'Metodo', 'Progetto']),
    B(23, 'Il Traffico', 'mercurio',
        "Sotto l'influenza di Hermes: dinamismo commerciale e negoziazioni. Ruolo di mediatore in scambi vantaggiosi.",
        [{ with: 19, note: 'Accanto a Il Denaro (n.19): investimenti interessanti.' }], 'Mercurio',
        ['Commercio', 'Dialogo', 'Contratto', 'Espansione']),
    B(24, 'La Novità', 'mercurio',
        "Nota Tecnica: la carta più rapida. L'esito (positivo o negativo) dipende dalle carte circostanti. Arrivo improvviso di segnali.",
        [], 'Mercurio',
        ['Messaggio', 'Velocità', 'Sorpresa', 'Segnale']),

    // ---------- LUCE IV · VENERE (25-31) ----------
    B(25, 'I Piaceri', 'venere',
        "L'arpa diffonde vibrazioni di armonia. Godimento dell'estetica, delle arti e del benessere sensoriale.",
        [], 'Venere',
        ['Arte', 'Bellezza', 'Gioia', 'Estetica']),
    B(26, 'La Pace', 'venere',
        "Conciliazione dopo la tempesta. I rami di lauro indicano un accordo trovato e il silenzio rigenerante.",
        [], 'Venere',
        ['Accordo', 'Serenità', 'Silenzio', 'Armonia']),
    B(27, "L'Unione", 'venere',
        "Legame stabile (matrimonio o partnership). Le catene simboleggiano solidarietà e impegno indissolubile.",
        [{ with: 30, note: 'Accanto a La Tavola (n.30): una partecipazione di nozze.' },
         { with: 50, note: "Accanto a La Rovina (n.50): divorzio, separazione, rottura dell'unione." }], 'Venere',
        ['Contratto', 'Fedeltà', 'Associazione', 'Impegno']),
    B(28, 'La Famiglia', 'venere',
        "Osmosi emotiva nel primo cerchio. Protezione, fiducia e potenziale fecondità (nascita di figli o strutture).",
        [], 'Venere',
        ['Radici', 'Solidarietà', 'Focolare', 'Fecondità']),
    B(29, "L'Amore", 'venere',
        "Alchimia potente e nascente. Rappresenta l'affezione pura che motiva ogni azione, anche nel lavoro.",
        [{ with: 33, note: 'Accanto a Il Processo (n.33): rivalità amorosa.' }], 'Venere',
        ['Tenerezza', 'Passione', 'Felicità', 'Sincerità']),
    B(30, 'La Tavola', 'venere',
        "Convivialità. La giara simboleggia l'archetipo della maîtresse (amante) o di relazioni leggere e piacevoli.",
        [{ with: 17, note: 'Accanto a La Malattia (n.17): eccessi che possono nuocere.' },
         { with: 9, note: 'Accanto a La Campagna (n.9): una gita fuori porta, un picnic.' }], 'Venere',
        ['Festa', 'Incontro', 'Piaceri', 'Amante']),
    B(31, 'Le Passioni', 'venere',
        "Emozioni vulcaniche e incontrollabili. Intensità che può illuminare o bruciare se non canalizzata.",
        [{ with: 34, note: "Accanto a Il Dispotismo (n.34): passioni sfortunate, persino al disonore." }], 'Venere',
        ['Desiderio', 'Focosità', 'Eccesso', 'Impulsività']),

    // ---------- LUCE V · MARTE (32-38) ----------
    B(32, 'La Malvagità', 'marte',
        "Violenza morale. La lama taglia, ma la lanterna rivela il complotto. Necessità di audacia per svelare l'inganno.",
        [{ with: 36, note: 'Accanto a Le Trattative (n.36): probabile complotto.' }], 'Marte',
        ['Gelosia', 'Complotti', 'Coraggio', 'Vigilanza']),
    B(33, 'Il Processo', 'marte',
        "Rapporto di forza legale o amministrativo. Invito a cercare un compromesso tramite la mediazione e il dialogo.",
        [{ with: 29, note: 'Accanto a L\'Amore (n.29): rivalità amorosa.' }], 'Marte',
        ['Conflitto', 'Difesa', 'Negoziazione', 'Regolamento']),
    B(34, 'Il Dispotismo', 'marte',
        "Archetipo del prigioniero di guerra. Senso di oppressione e catene che impediscono il movimento. Ritrovare la fiducia.",
        [], 'Marte',
        ['Vincoli', 'Sottomissione', 'Frustrazione', 'Blocco']),
    B(35, 'Il Nemico', 'marte',
        "Ombre e ostilità nell'entourage. Richiede discernimento per individuare chi frena l'evoluzione del consultante.",
        [{ with: 21, note: 'Accanto a Il Furto (n.21): rischio di scippo o aggressione.' }], 'Marte',
        ['Rivalità', 'Pericolo', 'Limiti', 'Tossicità']),
    B(36, 'Le Trattative', 'marte',
        "Dibattiti accesi. L'uccello indica un aiuto esterno (mediatore) necessario per giungere a una decisione.",
        [{ with: 32, note: 'Accanto a La Malvagità (n.32): l\'esistenza di un complotto.' }], 'Marte',
        ['Carisma', 'Diplomazia', 'Discussione', 'Mediazione']),
    B(37, 'Il Fuoco', 'marte',
        "Simboleggiata dai galli (coq) in combattimento. Forza di carattere, ego e determinazione per difendere i propri valori.",
        [{ with: 38, note: 'Accanto a L\'Incidente (n.38): incendio, elettrocuzione.' }], 'Marte',
        ['Volontà', 'Ardire', 'Combattività', 'Convinzione']),
    B(38, "L'Incidente", 'marte',
        "Un terremoto improvviso. Le torri crollano, ma l'erba che cresce tra le macerie indica la possibilità di ricostruire meglio.",
        [{ with: 13, note: 'Accanto a L\'Incostanza (n.13): consiglia di evitare i viaggi aerei.' },
         { with: 15, note: "Accanto all'Acqua (n.15): rischio di naufragio o inondazione." }], 'Marte',
        ['Crollo', 'Shock', 'Resilienza', 'Rinascita']),

    // ---------- LUCE VI · GIOVE (39-45) ----------
    B(39, 'Gli Appoggi', 'giove',
        "L'aquila maestosa rappresenta un mentore o una figura influente che offre tutela e risoluzione materiale.",
        [], 'Giove',
        ['Sostegno', 'Influenza', 'Tutela', 'Protezione']),
    B(40, 'La Bellezza', 'giove',
        "Equilibrio tra sentimenti e realtà. Fioritura personale e successo nelle arti o nella creazione.",
        [], 'Giove',
        ['Armonia', 'Soddisfazione', 'Arte', 'Serenità']),
    B(41, "L'Eredità", 'giove',
        "Trasmissione di patrimonio. Il cranio segna il confine tra ciò che è passato e ciò che viene lasciato in dote.",
        [], 'Giove',
        ['Patrimonio', 'Passato', 'Memoria', 'Donazione']),
    B(42, 'La Saggezza', 'giove',
        "La corona della saggezza indica autorità benevola. Visione oggettiva e prudenza prima di ogni azione.",
        [], 'Giove',
        ['Discernimento', 'Maturità', 'Consiglio', 'Equilibrio']),
    B(43, 'La Fama', 'giove',
        "Consacrazione pubblica. La tromba e la corona di lauro annunciano la legittimazione ufficiale del merito.",
        [], 'Giove',
        ['Celebrazione', 'Fama', 'Orgoglio', 'Validazione']),
    B(44, 'Il Caso', 'giove',
        "Nota Tecnica: opportunità effimera. Le ali indicano che la fortuna va colta al volo. Consultare le carte vicine per l'esito.",
        [{ with: 50, note: 'Accanto a La Rovina (n.50): sfortuna al gioco, speculazioni mal riuscite.' }], 'Giove',
        ['Fortuna', 'Rapidità', 'Occasione', 'Bivio']),
    B(45, 'La Felicità', 'giove',
        "Appagamento totale. La stella guida assicura che il consultante è sulla rotta giusta verso la propria luce.",
        [], 'Giove',
        ['Gioia', 'Realizzazione', 'Speranza', 'Successo']),

    // ---------- LUCE VII · SATURNO (46-52) ----------
    B(46, 'La Sfortuna', 'saturno',
        "Rallentamento e prova di resistenza. La mano tesa indica la necessità assoluta di chiedere aiuto esterno.",
        [], 'Saturno',
        ['Ostacoli', 'Fatica', 'Prova', 'Umiltà']),
    B(47, 'La Sterilità', 'saturno',
        "Il deserto: i progetti non portano frutti. Necessità di isolarsi per tagliare l'inutile e rivalutare gli obiettivi.",
        [], 'Saturno',
        ['Impasse', 'Aridità', 'Riflessione', 'Distacco']),
    B(48, 'La Fatalità', 'saturno',
        "Concetto di karma. La falce (faux) indica il momento del raccolto e della chiusura definitiva di un ciclo ineludibile.",
        [{ with: 17, note: 'Accanto a La Malattia (n.17): malattia a esito fatale.' }], 'Saturno',
        ['Fine', 'Taglio', 'Destino', 'Passaggio']),
    B(49, 'La Grazia', 'saturno',
        "Intervento divino. La Trinità e lo Spirito Santo portano guarigione inaspettata e risoluzione delle sofferenze.",
        [{ with: 17, note: 'Accanto a La Malattia (n.17): guarigione e convalescenza.' }], 'Saturno',
        ['Perdono', 'Miracolo', 'Sollievo', 'Benedizione']),
    B(50, 'La Rovina', 'saturno',
        "Crollo di strutture logore. La vegetazione ai piedi della torre indica che il terreno è fertile per una rinascita autentica.",
        [{ with: 27, note: 'Accanto a L\'Unione (n.27): divorzio, separazione.' },
         { with: 44, note: 'Accanto a Il Caso (n.44): sfortuna al gioco.' }], 'Saturno',
        ['Trasformazione', 'Fine', 'Fondamenta', 'Rinnovamento']),
    B(51, 'Il Ritardo', 'saturno',
        "La ruota bloccata. Pausa forzata che invita alla prudenza e alla rivalutazione prima di procedere.",
        [], 'Saturno',
        ['Attesa', 'Dilazione', 'Prudenza', 'Riflessione']),
    B(52, 'Il Chiostro', 'saturno',
        "Ritiro necessario. Può indicare ospedali, prigioni o semplicemente un rifugio dell'anima per meditare.",
        [{ with: 17, note: 'Accanto a La Malattia (n.17): tempo passato in ospedale o in prigione.' },
         { with: 29, note: "Accanto a L'Amore (n.29): un amore sacrificato." }], 'Saturno',
        ['Solitudine', 'Introspezione', 'Cura', 'Silenzio']),
];

// ---------- FUNZIONI DI SUPPORTO ----------

// Polarità effettiva di una carta (good / neutral / bad)
function bellinePolarityOf(card) {
    if (!card) return 'neutral';
    if (card.num !== null && card.num !== undefined && BELLINE_POLARITY_OVERRIDES[card.num]) {
        return BELLINE_POLARITY_OVERRIDES[card.num];
    }
    return BELLINE_POLARITY_DEFAULTS[card.series] || 'neutral';
}

// Deck completo (52 o 53 con la Carta Blu) con polarità calcolata
function getBellineCards(includeBlue) {
    const list = bellineDeck.map(function (card) {
        return Object.assign({}, card, { polarity: bellinePolarityOf(card) });
    });
    if (includeBlue) {
        list.push(Object.assign({}, bellineBlueCard, { polarity: 'good' }));
    }
    return list;
}

function getBellineCardById(id) {
    if (id === 'blue') return bellineBlueCard;
    return bellineDeck.find(function (c) { return c.num === id; }) || null;
}

function bellineSeriesName(series) {
    const meta = bellineSeriesMeta[series];
    return meta ? meta.label : series;
}

function bellineSeriesBulletFor(series) {
    return bellineSeriesBullet[series] || '';
}

function bellinePolarityLabel(polarity) {
    return polarity === 'good' ? 'Favorevole' : (polarity === 'bad' ? 'Avversa' : 'Neutra');
}

function bellinePolarityNote(polarity) {
    if (polarity === 'good') {
        return 'Carta favorevole: porta slancio e opportunità. In presenza di carte avverse, è lei ad attenuare il loro peso.';
    }
    if (polarity === 'bad') {
        return 'Carta avversa: chiede prudenza e lucidità. Se accanto c\'è una buona carta, questa ne neutralizza in parte la forza.';
    }
    return 'Carta di transizione: l\'esito dipende dalle carte accanto e dal contesto.';
}

// Consiglio generato dalla polarità e dalla serie
function bellineAdvice(card) {
    const polarity = bellinePolarityOf(card);
    const seriesText = bellineSeriesBulletFor(card.series);
    let lead;
    if (polarity === 'good') lead = 'Carta di buon auspicio: accogli con apertura la lettura.';
    else if (polarity === 'bad') lead = 'Carta di avviso: fai della prudenza la tua guida.';
    else lead = 'Carta di passaggio: osserva cosa accade accanto a essa per leggere meglio.';
    return lead + (seriesText ? ' ' + seriesText : '');
}

// Carta personale di nascita (formula classica italiana):
// giorno + mese reali + anno ridotto a una cifra; se il totale supera 52 si sottrae 52.
function bellineNatalCard(day, month, year) {
    let sum = String(year).split('').reduce(function (a, d) { return a + parseInt(d, 10); }, 0);
    while (sum > 9) {
        sum = String(sum).split('').reduce(function (a, d) { return a + parseInt(d, 10); }, 0);
    }
    let n = parseInt(day, 10) + parseInt(month, 10) + sum;
    if (n > 52) n -= 52;
    return n;
}

// Tirare i N numeri romani semplici (per le etichette)
function toRoman(num) {
    const map = { 10: 'X', 9: 'IX', 5: 'V', 4: 'IV', 1: 'I' }; // per 1-10
    if (num > 10) {
        return String(num); // per le carte oltre il X usiamo il numero arabo
    }
    let out = '';
    for (const k of [10, 9, 5, 4, 1]) {
        while (num >= k) { out += map[k]; num -= k; }
    }
    return out;
}

// Export per il browser globale
if (typeof window !== 'undefined') {
    window.bellineDeck = bellineDeck;
    window.bellineBlueCard = bellineBlueCard;
    window.getBellineCards = getBellineCards;
    window.getBellineCardById = getBellineCardById;
    window.bellinePolarityOf = bellinePolarityOf;
    window.bellineSeriesName = bellineSeriesName;
    window.bellineSeriesMeta = bellineSeriesMeta;
    window.getBellineSeriesBullet = bellineSeriesBulletFor;
    window.bellinePolarityLabel = bellinePolarityLabel;
    window.bellinePolarityNote = bellinePolarityNote;
    window.bellineAdvice = bellineAdvice;
    window.bellineNatalCard = bellineNatalCard;
    window.bellineNatalCardNumber = bellineNatalCard;
}

// Export CommonJS per gli strumenti da console (es. generatore SVG)
if (typeof module !== 'undefined') {
    module.exports = {
        bellineDeck, bellineBlueCard, bellineSeriesMeta, bellineSeriesBullet,
        bellinePolarityOf, getBellineCards, getBellineCardById,
        bellineSeriesName, bellinePolarityLabel, bellinePolarityNote,
        bellineAdvice, bellineNatalCard, toRoman
    };
}