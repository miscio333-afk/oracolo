// Italian Tarot Reading Website - Main JavaScript
// Complete tarot deck with Art Nouveau styling and Italian interpretations

// Global variables
let currentReading = null;
let readingHistory = [];
let shuffledDeck = [];
let drawnCards = [];
let currentReadingType = 'three-card';
let particles = [];

// Tarot Card Database - Complete 78 cards with Italian interpretations
const tarotDeck = {
    majorArcana: [
        {
            id: 0,
            name: "Il Matto",
            italianName: "Il Matto",
            image: "resources/cards/major/il_matto.png",
            keywords: ["libertà", "nuovi inizi", "spontaneità", "viaggio", "innocenza"],
            meaning: "Il Matto rappresenta l'inizio di un viaggio spirituale, la purezza dell'anima e la fiducia nell'universo. È la carta dell'innocenza e dell'audacia, che invita a prendere rischi e ad abbracciare l'incertezza con cuore aperto.",
            reversed: "Follia, imprudenza, mancanza di direzione. Il Matto invertito suggerisce di fermarsi e riflettere prima di agire, di non lasciarsi guidare solo dall'impulso.",
            symbolism: "Il Matto simboleggia lo stato di grazia primordiale, l'essere che non conosce il peccato e vive in armonia con la natura. Rappresenta l'innocenza divina e la possibilità di ricominciare.",
            element: "Aria",
            category: "major"
        },
        {
            id: 1,
            name: "Il Bagatto",
            italianName: "Il Bagatto",
            image: "resources/cards/major/il_bagatto.png",
            keywords: ["volontà", "creazione", "abilità", "manifestazione", "potere"],
            meaning: "Il Bagatto simboleggia il potere di trasformare i pensieri in realtà. Rappresenta la volontà e la capacità di agire nel mondo fisico, la maestria e il controllo sugli elementi.",
            reversed: "Manipolazione, inganno, abilità non utilizzate. Il Bagatto invertito indica che si potrebbe essere abili ma non etici, o che il proprio potere non viene riconosciuto.",
            symbolism: "Il Bagatto rappresenta l'uomo divino, colui che ha ricevuto il potere di creare e manifestare. È il ponte tra il divino e l'umano.",
            element: "Aria",
            category: "major"
        },
        {
            id: 2,
            name: "La Papessa",
            italianName: "La Papessa",
            image: "resources/cards/major/la_papessa.png",
            keywords: ["intuizione", "mistero", "saggezza interiore", "segreti", "conoscenza occulta"],
            meaning: "La Papessa è la guardiana dei segreti e della saggezza interiore. Rappresenta l'intuizione femminile e il potere dell'inconscio, la connessione con i misteri della vita.",
            reversed: "Segreti rivelati, mancanza di intuizione, superficialità. La Papessa invertita suggerisce di non fidarsi troppo delle apparenze e di cercare la verità sotto la superficie.",
            symbolism: "La Papessa simboleggia la conoscenza mistica e la saggezza interiore. È la sacerdotessa che custodisce i segreti del divino femminile.",
            element: "Acqua",
            category: "major"
        },
        {
            id: 3,
            name: "L'Imperatrice",
            italianName: "L'Imperatrice",
            image: "resources/cards/major/l_imperatrice.png",
            keywords: ["fertilità", "abbondanza", "nutrizione", "natura", "creazione"],
            meaning: "L'Imperatrice rappresenta la fertilità, la creatività e l'abbondanza. È la madre universale che nutre e protegge, simboleggia la creazione e la prosperità.",
            reversed: "Dipendenza, scarsità, mancanza di crescita. L'Imperatrice invertita indica un blocco creativo o una mancanza di risorse.",
            symbolism: "L'Imperatrice rappresenta la dea madre, la forza creatrice della natura. È la manifestazione della vita e dell'abbondanza.",
            element: "Terra",
            category: "major"
        },
        {
            id: 4,
            name: "L'Imperatore",
            italianName: "L'Imperatore",
            image: "resources/cards/major/l_imperatore.png",
            keywords: ["autorità", "struttura", "controllo", "leadership", "stabilità"],
            meaning: "L'Imperatore simboleggia l'autorità maschile, la struttura e il controllo. Rappresenta la stabilità, l'ordine e la capacità di guidare con saggezza.",
            reversed: "Tirannia, rigidità, abuso di potere. L'Imperatore invertito suggerisce un uso eccessivo del controllo o una struttura troppo rigida.",
            symbolism: "L'Imperatore rappresenta la legge divina e l'ordine cosmico. È il padre che protegge e guida con giustizia.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 5,
            name: "Il Papa",
            italianName: "Il Papa",
            image: "resources/cards/major/il_papa.png",
            keywords: ["tradizione", "spiritualità", "istruzione", "conformità", "guida spirituale"],
            meaning: "Il Papa rappresenta la tradizione, la spiritualità istituzionale e la trasmissione della conoscenza attraverso l'educazione e la guida spirituale.",
            reversed: "Rifiuto della tradizione, rottura delle convenzioni. Il Papa invertito indica una ribellione contro le strutture tradizionali.",
            symbolism: "Il Papa simboleggia la tradizione spirituale e la trasmissione della saggezza attraverso le generazioni.",
            element: "Terra",
            category: "major"
        },
        {
            id: 6,
            name: "Gli Amanti",
            italianName: "Gli Amanti",
            image: "resources/cards/major/gli_amanti.png",
            keywords: ["amore", "scelta", "armonia", "relazione", "unione"],
            meaning: "Gli Amanti rappresentano le scelte importanti della vita, l'amore romantico e l'unione spirituale. Simboleggia l'armonia e la connessione profonda.",
            reversed: "Conflitto, scelta sbagliata, disarmonia. Gli Amanti invertiti indicano incomprensioni o decisioni affrettate.",
            symbolism: "Gli Amanti rappresentano l'unione divina e la scelta consapevole. È la carta dell'amore come forza creatrice.",
            element: "Aria",
            category: "major"
        },
        {
            id: 7,
            name: "Il Carro",
            italianName: "Il Carro",
            image: "resources/cards/major/il_carro.png",
            keywords: ["vittoria", "determinazione", "controllo", "avanzamento", "successo"],
            meaning: "Il Carro simboleggia la vittoria attraverso la determinazione e il controllo delle forze opposte. Rappresenta il successo ottenuto con la forza di volontà.",
            reversed: "Sconfitta, mancanza di controllo, agitazione. Il Carro invertito suggerisce di rallentare e riequilibrare le forze.",
            symbolism: "Il Carro rappresenta la vittoria spirituale e il controllo delle energie opposte. È il trionfo della volontà divina.",
            element: "Acqua",
            category: "major"
        },
        {
            id: 8,
            name: "La Giustizia",
            italianName: "La Giustizia",
            image: "resources/cards/major/la_giustizia.png",
            keywords: ["equilibrio", "verità", "giustizia", "karma", "equità"],
            meaning: "La Giustizia rappresenta l'equilibrio, la verità e le conseguenze delle nostre azioni. Simboleggia la legge morale e il karma.",
            reversed: "Ingiustizia, parzialità, biasimo. La Giustizia invertita indica che le decisioni potrebbero essere influenzate da pregiudizi.",
            symbolism: "La Giustizia rappresenta la legge divina e l'equilibrio cosmico. È la verità che trascende le apparenze.",
            element: "Aria",
            category: "major"
        },
        {
            id: 9,
            name: "L'Eremita",
            italianName: "L'Eremita",
            image: "resources/cards/major/l_eremita.png",
            keywords: ["ricerca interiore", "solitudine", "guida", "saggezza", "introspezione"],
            meaning: "L'Eremita rappresenta la ricerca interiore, la saggezza che viene dall'introspezione e la guida spirituale. Simboleggia il cammino solitario verso la verità.",
            reversed: "Isolamento, rifiuto della guida, ostinazione. L'Eremita invertito suggerisce di aprirsi agli altri e accettare l'aiuto.",
            symbolism: "L'Eremita rappresenta la saggezza interiore e la guida spirituale. È il cercatore di verità che illumina il cammino degli altri.",
            element: "Terra",
            category: "major"
        },
        {
            id: 10,
            name: "La Ruota",
            italianName: "La Ruota",
            image: "resources/cards/major/la_ruota.png",
            keywords: ["cicli", "destino", "cambiamento", "fortuna", "karma"],
            meaning: "La Ruota rappresenta i cicli della vita, il cambiamento inevitabile e il ruolo della fortuna nei nostri destini. Simboleggia l'impermanenza di tutte le cose.",
            reversed: "Cattiva fortuna, resistenza al cambiamento, stagnazione. La Ruota invertita indica che si sta resistendo al cambiamento naturale.",
            symbolism: "La Ruota rappresenta il ciclo cosmico e la legge del karma. È la ruota del destino che gira secondo le azioni umane.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 11,
            name: "La Forza",
            italianName: "La Forza",
            image: "resources/cards/major/la_forza.png",
            keywords: ["forza interiore", "coraggio", "pazienza", "controllo", "compassione"],
            meaning: "La Forza rappresenta la forza interiore, il coraggio di affrontare le sfide e il controllo degli istinti. Simboleggia la potenza della gentilezza.",
            reversed: "Debolezza, mancanza di autocontrollo, paura. La Forza invertita suggerisce di lavorare sulla propria autostima.",
            symbolism: "La Forza rappresenta la potenza dell'amore e la forza interiore. È la capacità di dominare gli istinti con la compassione.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 12,
            name: "L'Appeso",
            italianName: "L'Appeso",
            image: "resources/cards/major/l_appeso.png",
            keywords: ["sacrificio", "attesa", "prospettiva", "rinuncia", "illuminazione"],
            meaning: "L'Appeso rappresenta il sacrificio, la pazienza e la necessità di cambiare prospettiva per trovare la saggezza. Simboleggia la resa che porta alla liberazione.",
            reversed: "Rinuncia inutile, resistenza al cambiamento, frustrazione. L'Appeso invertito indica che il sacrificio potrebbe non essere necessario.",
            symbolism: "L'Appeso rappresenta la resa spirituale e la rinascita attraverso il sacrificio. È l'illuminazione che viene dall'accettazione.",
            element: "Acqua",
            category: "major"
        },
        {
            id: 13,
            name: "Il Tredici",
            italianName: "Il Tredici",
            image: "resources/cards/major/il_tredici.png",
            keywords: ["trasformazione", "fine", "rinascita", "cambiamento", "rinnovamento"],
            meaning: "Il Tredici rappresenta la fine di un ciclo e l'inizio di uno nuovo. È la trasformazione attraverso la morte simbolica, la rinascita e il rinnovamento.",
            reversed: "Resistenza al cambiamento, stagnazione, paura della trasformazione. Il Tredici invertito suggerisce di accettare il cambiamento.",
            symbolism: "Il Tredici rappresenta la trasformazione spirituale e la rinascita. È la morte simbolica che porta a una nuova vita.",
            element: "Acqua",
            category: "major"
        },
        {
            id: 14,
            name: "La Temperanza",
            italianName: "La Temperanza",
            image: "resources/cards/major/la_temperanza.png",
            keywords: ["equilibrio", "moderazione", "pazienza", "alchimia", "armonia"],
            meaning: "La Temperanza rappresenta l'equilibrio, la moderazione e l'arte di combinare elementi opposti. Simboleggia la pazienza e l'alchimia interiore.",
            reversed: "Eccesso, squilibrio, mancanza di pazienza. La Temperanza invertita indica che si sta agendo con eccesso o impazienza.",
            symbolism: "La Temperanza rappresenta l'armonia cosmica e l'equilibrio interiore. È l'arte di unire gli opposti in perfetta armonia.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 15,
            name: "Il Diavolo",
            italianName: "Il Diavolo",
            image: "resources/cards/major/il_diavolo.png",
            keywords: ["tentazione", "materialismo", "schiavitù", "ombre", "dipendenza"],
            meaning: "Il Diavolo rappresenta le tentazioni, le dipendenze e le ombre che ci tengono prigionieri. Simboleggia il materialismo e le paure interiori.",
            reversed: "Liberazione, superamento delle dipendenze, consapevolezza. Il Diavolo invertito indica che si sta rompendo le catene.",
            symbolism: "Il Diavolo rappresenta le illusioni materiali e le paure interiori. È la catena che ci lega alle nostre ombre.",
            element: "Terra",
            category: "major"
        },
        {
            id: 16,
            name: "La Torre",
            italianName: "La Torre",
            image: "resources/cards/major/la_torre.png",
            keywords: ["rovina", "improvviso cambiamento", "rivelazione", "distruzione", "illuminazione"],
            meaning: "La Torre rappresenta il crollo delle false certezze e la rivelazione della verità attraverso eventi improvvisi. Simboleggia la liberazione attraverso la distruzione.",
            reversed: "Evitare il disastro, resistenza alla verità, cambiamento graduale. La Torre invertita suggerisce che il cambiamento può essere più dolce.",
            symbolism: "La Torre rappresenta l'ego che crolla e la verità che emerge. È la distruzione che porta alla libertà.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 17,
            name: "Le Stelle",
            italianName: "Le Stelle",
            image: "resources/cards/major/le_stelle.png",
            keywords: ["speranza", "ispirazione", "guarigione", "guida", "spiritualità"],
            meaning: "Le Stelle portano speranza, ispirazione e guarigione. Rappresentano la luce che guida nel buio, la fede e la connessione con il divino.",
            reversed: "Mancanza di speranza, disillusione, perdita di fede. Le Stelle invertite indicano un periodo di oscurità spirituale.",
            symbolism: "Le Stelle rappresentano la guida divina e la speranza eterna. Sono la luce che illumina il cammino spirituale.",
            element: "Aria",
            category: "major"
        },
        {
            id: 18,
            name: "La Luna",
            italianName: "La Luna",
            image: "resources/cards/major/la_luna.png",
            keywords: ["illusione", "intuito", "sogni", "subconscio", "mistero"],
            meaning: "La Luna rappresenta il regno dell'illusione, dell'intuito e dei sogni. È la carta dei misteri e delle verità nascoste nel subconscio.",
            reversed: "Confusione, paura, illusione, inganno. La Luna invertita suggerisce di cercare la chiarezza e non lasciarsi ingannare dalle apparenze.",
            symbolism: "La Luna rappresenta il subconscio e il mondo dei sogni. È la luce che illumina le ombre interiori.",
            element: "Acqua",
            category: "major"
        },
        {
            id: 19,
            name: "Il Sole",
            italianName: "Il Sole",
            image: "resources/cards/major/il_sole.png",
            keywords: ["gioia", "successo", "vitalità", "illuminazione", "felicità"],
            meaning: "Il Sole rappresenta la gioia, il successo e la vitalità. È la carta dell'illuminazione e della felicità, simboleggia la piena realizzazione del sé.",
            reversed: "Eccesso di ottimismo, illusione, mancanza di chiarezza. Il Sole invertito indica che si potrebbe essere troppo ottimisti.",
            symbolism: "Il Sole rappresenta la coscienza divina e la piena illuminazione. È la luce che dissipa tutte le ombre.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 20,
            name: "Il Giudizio",
            italianName: "Il Giudizio",
            image: "resources/cards/major/il_giudizio.png",
            keywords: ["rinascita", "risveglio", "redenzione", "chiamata", "rinnovamento"],
            meaning: "Il Giudizio rappresenta il risveglio spirituale, la rinascita e la redenzione attraverso l'autovalutazione. Simboleggia il perdono e la nuova vita.",
            reversed: "Rifiuto del risveglio, autocritica eccessiva, mancanza di redenzione. Il Giudizio invertito suggerisce di essere troppo critici con sé stessi.",
            symbolism: "Il Giudizio rappresenta il risveglio finale e la redenzione. È la chiamata alla coscienza divina.",
            element: "Fuoco",
            category: "major"
        },
        {
            id: 21,
            name: "Il Mondo",
            italianName: "Il Mondo",
            image: "resources/cards/major/il_mondo.png",
            keywords: ["completamento", "realizzazione", "viaggio", "integrazione", "successo"],
            meaning: "Il Mondo rappresenta il completamento di un ciclo, la realizzazione dei obiettivi e l'integrazione di tutte le esperienze. Simboleggia la piena realizzazione.",
            reversed: "Mancanza di completamento, frustrazione, incompletamento. Il Mondo invertito indica che c'è ancora lavoro da fare.",
            symbolism: "Il Mondo rappresenta la realizzazione finale e l'integrazione totale. È il compimento del viaggio spirituale.",
            element: "Terra",
            category: "major"
        }
    ],
    minorArcana: {
        bastoni: [
            {
                id: 22,
                name: "Asso di Bastoni",
                italianName: "Asso di Bastoni",
                image: "resources/cards/minor/asso_bastoni.png",
                keywords: ["nuovi inizi", "creatività", "ispirazione", "potenziale", "energia"],
                meaning: "L'Asso di Bastoni rappresenta nuovi inizi creativi, ispirazione pura e il potenziale per la creazione. È la scintilla iniziale di un progetto o idea.",
                reversed: "Mancanza di ispirazione, blocchi creativi, energia dispersa. L'Asso invertito suggerisce di cercare nuove fonti di ispirazione.",
                symbolism: "L'Asso di Bastoni simboleggia la scintilla divina della creazione. È l'energia pura che dà inizio a tutto.",
                element: "Fuoco",
                category: "bastoni"
            }
        ],
        coppe: [
            {
                id: 23,
                name: "Asso di Coppe",
                italianName: "Asso di Coppe",
                image: "resources/cards/minor/asso_coppe.png",
                keywords: ["nuovi inizi emotivi", "amore", "intuizione", "felicità", "ispirazione"],
                meaning: "L'Asso di Coppe rappresenta nuovi inizi emotivi, l'amore puro e l'intuizione. È l'apertura del cuore a nuove esperienze di amore.",
                reversed: "Emozioni represse, delusione amorosa, intuizione bloccata. L'Asso invertito suggerisce di guarire il cuore prima di amare di nuovo.",
                symbolism: "L'Asso di Coppe simboleggia la fonte dell'amore divino. È il cuore che si apre alla gioia e alla compassione.",
                element: "Acqua",
                category: "coppe"
            }
        ],
        spade: [
            {
                id: 24,
                name: "Asso di Spade",
                italianName: "Asso di Spade",
                image: "resources/cards/minor/asso_spade.png",
                keywords: ["nuovi inizi mentali", "chiarezza", "verità", "intelletto", "comunicazione"],
                meaning: "L'Asso di Spade rappresenta nuovi inizi mentali, la chiarezza di pensiero e la verità. È la spada della mente che taglia le illusioni.",
                reversed: "Confusione mentale, pensieri negativi, conflitti interni. L'Asso invertito suggerisce di cercare la chiarezza interiore.",
                symbolism: "L'Asso di Spade simboleggia la verità assoluta e la chiarezza mentale. È la spada della saggezza che taglia le menzogne.",
                element: "Aria",
                category: "spade"
            }
        ],
        denari: [
            {
                id: 25,
                name: "Asso di Denari",
                italianName: "Asso di Denari",
                image: "resources/cards/minor/asso_denari.png",
                keywords: ["nuovi inizi materiali", "opportunità finanziarie", "manifestazione", "ricchezza", "stabilità"],
                meaning: "L'Asso di Denari rappresenta nuovi inizi materiali, opportunità finanziarie e la manifestazione dei desideri nel mondo fisico.",
                reversed: "Perdita finanziaria, opportunità mancate, instabilità materiale. L'Asso invertito suggerisce di riesaminare le priorità materiali.",
                symbolism: "L'Asso di Denari simboleggia la manifestazione divina nel mondo fisico. È l'abbondanza che nasce dalla gratitudine.",
                element: "Terra",
                category: "denari"
            }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize typewriter effect on index page
    if (document.getElementById('typewriter')) {
        initializeTypewriter();
    }
    
    // Initialize particles
    initializeParticles();
    
    // Load reading history
    loadReadingHistory();
    
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
}

// Typewriter effect for hero section
function initializeTypewriter() {
    const messages = [
 "Scopri i segreti del tuo destino attraverso l'antica arte dei tarocchi italiani",
 "Lasciati guidare dalla saggezza delle carte in un viaggio di auto-scoperta",
 "Ogni carta racconta una storia, ogni lettura rivela un mistero",
 "L'arte divinatoria in stile Art Nouveau ti attende"
    ];
    
    new Typed('#typewriter', {
        strings: messages,
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Particle system for mystical background
function initializeParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    // Create p5.js sketch for particles
    new p5(function(p) {
        let particles = [];
        
        p.setup = function() {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('particles');
            
            // Create initial particles
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(p));
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw particles
            for (let particle of particles) {
                particle.update();
                particle.display();
            }
        };
        
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
        
        // Particle class
        function Particle(p) {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.vx = p.random(-0.5, 0.5);
            this.vy = p.random(-0.5, 0.5);
            this.alpha = p.random(50, 150);
            this.size = p.random(2, 6);
            
            this.update = function() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Wrap around edges
                if (this.x < 0) this.x = p.width;
                if (this.x > p.width) this.x = 0;
                if (this.y < 0) this.y = p.height;
                if (this.y > p.height) this.y = 0;
            };
            
            this.display = function() {
                p.fill(184, 134, 11, this.alpha); // Antique gold with transparency
                p.noStroke();
                p.ellipse(this.x, this.y, this.size);
            };
        }
    });
}

// Start reading function
function startReading() {
    // Smooth scroll to reading section
    document.getElementById('reading-section').style.display = 'block';
    document.getElementById('reading-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    // Animate section appearance
    anime({
        targets: '#reading-section',
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 800,
        easing: 'easeOutQuart'
    });
}

// Select reading type
function selectReadingType(type) {
    currentReadingType = type;
    
    // Update UI based on reading type
    const positionsContainer = document.getElementById('card-positions');
    const singlePosition = document.getElementById('single-position');
    const readingTitle = document.getElementById('reading-title');
    const readingDescription = document.getElementById('reading-description');
    
    switch(type) {
        case 'three-card':
            positionsContainer.style.display = 'flex';
            singlePosition.style.display = 'none';
            readingTitle.textContent = 'Lettura a Tre Carte - Passato, Presente, Futuro';
            readingDescription.textContent = 'Clicca sulle posizioni per pescare le carte';
            break;
        case 'single':
            positionsContainer.style.display = 'none';
            singlePosition.style.display = 'flex';
            document.getElementById('single-position-title').textContent = 'La Tua Carta del Giorno';
            readingTitle.textContent = 'Carta del Giorno';
            readingDescription.textContent = 'Clicca sulla carta per ricevere la tua guida quotidiana';
            break;
        case 'love':
            positionsContainer.style.display = 'flex';
            singlePosition.style.display = 'none';
            readingTitle.textContent = 'Lettura Amore e Relazioni';
            readingDescription.textContent = 'Clicca sulle posizioni per scoprire il tuo percorso amoroso';
            document.querySelectorAll('.reading-position')[0].textContent = 'Te Stesso/a';
            document.querySelectorAll('.reading-position')[1].textContent = 'Il/la Partner';
            document.querySelectorAll('.reading-position')[2].textContent = 'Il Futuro Insieme';
            break;
        case 'career':
            positionsContainer.style.display = 'flex';
            singlePosition.style.display = 'none';
            readingTitle.textContent = 'Lettura Carriera e Lavoro';
            readingDescription.textContent = 'Clicca sulle posizioni per esplorare il tuo percorso professionale';
            document.querySelectorAll('.reading-position')[0].textContent = 'Posizione Attuale';
            document.querySelectorAll('.reading-position')[1].textContent = 'Sfide da Affrontare';
            document.querySelectorAll('.reading-position')[2].textContent = 'Opportunità Future';
            break;
    }
    
    // Reset drawn cards
    drawnCards = [];
    resetCardPositions();
}

// Shuffle deck
function shuffleDeck() {
    // Create deck with all major arcana (simplified for demo)
    shuffledDeck = [...tarotDeck.majorArcana];
    
    // Shuffle using Fisher-Yates algorithm
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    
    // Animate deck shuffling
    anime({
        targets: '#deck',
        rotate: [0, 360],
        scale: [1, 1.1, 1],
        duration: 1000,
        easing: 'easeInOutQuart'
    });
    
    // Update UI
    document.getElementById('reading-description').textContent = 'Il mazzo è stato mescolato. Clicca sulle posizioni per pescare le carte!';
    
    // Add particle burst effect
    createParticleBurst();
}

// Draw card for position
function drawCard(position) {
    if (drawnCards.length >= 3) return;
    
    // Get random card from shuffled deck
    const card = shuffledDeck.pop();
    if (!card) return;
    
    drawnCards.push({
        ...card,
        position: position,
        positionName: getPositionName(position)
    });
    
    // Update card display
    const cardElement = document.getElementById(`position-${position}`);
    cardElement.style.backgroundImage = `url('${card.image}')`;
    cardElement.style.backgroundSize = 'cover';
    cardElement.style.backgroundPosition = 'center';
    cardElement.innerHTML = '';
    cardElement.classList.remove('border-dashed');
    
    // Animate card appearance
    anime({
        targets: cardElement,
        rotateY: [180, 0],
        scale: [0.8, 1],
        duration: 800,
        easing: 'easeOutQuart'
    });
    
    // Check if all cards are drawn
    if (drawnCards.length === 3) {
        setTimeout(() => {
            showInterpretation();
        }, 1000);
    }
}

// Draw single card
function drawSingleCard() {
    const card = shuffledDeck.pop();
    if (!card) return;
    
    drawnCards.push({
        ...card,
        position: 1,
        positionName: 'Carta del Giorno'
    });
    
    const cardElement = document.getElementById('single-card');
    cardElement.style.backgroundImage = `url('${card.image}')`;
    cardElement.style.backgroundSize = 'cover';
    cardElement.style.backgroundPosition = 'center';
    cardElement.innerHTML = '';
    cardElement.classList.remove('border-dashed');
    
    // Animate card appearance
    anime({
        targets: cardElement,
        rotateY: [180, 0],
        scale: [0.8, 1.2, 1],
        duration: 1000,
        easing: 'easeOutQuart'
    });
    
    setTimeout(() => {
        showInterpretation();
    }, 1000);
}

// Get position name based on reading type
function getPositionName(position) {
    switch(currentReadingType) {
        case 'three-card':
            return ['Passato', 'Presente', 'Futuro'][position - 1];
        case 'love':
            return ['Te Stesso/a', 'Il/la Partner', 'Il Futuro Insieme'][position - 1];
        case 'career':
            return ['Posizione Attuale', 'Sfide da Affrontare', 'Opportunità Future'][position - 1];
        default:
            return `Posizione ${position}`;
    }
}

// Show interpretation
function showInterpretation() {
    const interpretationArea = document.getElementById('interpretation-area');
    const interpretationsContainer = document.getElementById('interpretations');
    
    // Clear previous interpretations
    interpretationsContainer.innerHTML = '';
    
    // Create interpretation for each card
    drawnCards.forEach((card, index) => {
        const interpretationCard = createInterpretationCard(card);
        interpretationsContainer.appendChild(interpretationCard);
        
        // Animate appearance
        anime({
            targets: interpretationCard,
            opacity: [0, 1],
            translateY: [30, 0],
            delay: index * 200,
            duration: 600,
            easing: 'easeOutQuart'
        });
    });
    
    // Show interpretation area
    interpretationArea.style.display = 'block';
    interpretationArea.scrollIntoView({ behavior: 'smooth' });
    
    // Create current reading object
    currentReading = {
        id: Date.now(),
        type: currentReadingType,
        date: new Date().toLocaleDateString('it-IT'),
        cards: drawnCards,
        theme: generateReadingTheme()
    };
    
    // Animate interpretation area
    anime({
        targets: interpretationArea,
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuart'
    });
}

// Create interpretation card element
function createInterpretationCard(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'interpretation-card';
    
    cardDiv.innerHTML = `
        <div class="reading-position">${card.positionName}</div>
        <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="tarot-card w-32 h-48 flex-shrink-0" style="background-image: url('${card.image}'); background-size: cover; background-position: center;"></div>
            <div class="flex-1">
                <h3 class="card-name text-2xl mb-3">${card.italianName}</h3>
                <div class="keywords-list mb-4">
                    ${card.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                </div>
                <p class="text-lg mb-4">${card.meaning}</p>
                <div class="text-sm text-gray-600">
                    <strong>Simbolismo:</strong> ${card.symbolism}
                </div>
            </div>
        </div>
    `;
    
    return cardDiv;
}

// Generate reading theme
function generateReadingTheme() {
    const themes = [
        "Un periodo di trasformazione e crescita spirituale",
        "Nuove opportunità che richiedono coraggio e determinazione",
        "Il potere dell'amore e della connessione nella tua vita",
        "Un viaggio interiore verso la saggezza e la comprensione",
        "L'importanza dell'equilibrio e della moderazione",
        "La necessità di affrontare le paure e superare i limiti"
    ];
    
    return themes[Math.floor(Math.random() * themes.length)];
}

// Reset card positions
function resetCardPositions() {
    const positions = document.querySelectorAll('[id^="position-"]');
    positions.forEach(position => {
        position.style.backgroundImage = '';
        position.classList.add('border-dashed');
        position.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><div class="text-2xl">?</div></div>';
    });
    
    const singleCard = document.getElementById('single-card');
    if (singleCard) {
        singleCard.style.backgroundImage = '';
        singleCard.classList.add('border-dashed');
        singleCard.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><div class="text-2xl">?</div></div>';
    }
}

// Save reading
function saveReading() {
    if (!currentReading) return;
    
    // Load existing history
    const existingHistory = JSON.parse(localStorage.getItem('tarotReadingHistory') || '[]');
    
    // Add current reading
    existingHistory.unshift(currentReading);
    
    // Keep only last 10 readings
    if (existingHistory.length > 10) {
        existingHistory.splice(10);
    }
    
    // Save to localStorage
    localStorage.setItem('tarotReadingHistory', JSON.stringify(existingHistory));
    
    // Show confirmation
    showNotification('Lettura salvata con successo!');
}

// Start new reading
function newReading() {
    // Reset everything
    drawnCards = [];
    currentReading = null;
    resetCardPositions();
    
    // Hide interpretation area
    document.getElementById('interpretation-area').style.display = 'none';
    
    // Reset deck
    document.getElementById('reading-description').textContent = 'Clicca sul mazzo per mescolare le carte';
    
    // Scroll to top
    document.getElementById('reading-section').scrollIntoView({ behavior: 'smooth' });
}

// Create particle burst effect
function createParticleBurst() {
    const deckElement = document.getElementById('deck');
    const rect = deckElement.getBoundingClientRect();
    
    // Create temporary particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width/2 + 'px';
        particle.style.top = rect.top + rect.height/2 + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = '#B8860B';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        document.body.appendChild(particle);
        
        // Animate particle
        anime({
            targets: particle,
            translateX: (Math.random() - 0.5) * 200,
            translateY: (Math.random() - 0.5) * 200,
            opacity: [1, 0],
            scale: [1, 0],
            duration: 1000,
            easing: 'easeOutQuart',
            complete: () => {
                document.body.removeChild(particle);
            }
        });
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-6 bg-yellow-600 text-purple-900 px-6 py-3 rounded-lg font-bold z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuart'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}

// Library page functions
function populateCardsGrid() {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;
    
    // Clear existing cards
    grid.innerHTML = '';
    
    // Add major arcana cards
    tarotDeck.majorArcana.forEach(card => {
        const cardElement = createLibraryCard(card);
        grid.appendChild(cardElement);
    });
    
    // Add minor arcana aces
    Object.values(tarotDeck.minorArcana).forEach(suit => {
        suit.forEach(card => {
            const cardElement = createLibraryCard(card);
            grid.appendChild(cardElement);
        });
    });
}

// Create library card element
function createLibraryCard(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'tarot-card-mini w-32 h-48 cursor-pointer fade-in';
    cardDiv.style.backgroundImage = `url('${card.image}')`;
    cardDiv.style.backgroundSize = 'cover';
    cardDiv.style.backgroundPosition = 'center';
    
    cardDiv.onclick = () => showCardModal(card);
    
    // Add card name overlay
    const overlay = document.createElement('div');
    overlay.className = 'absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 text-center';
    overlay.textContent = card.italianName;
    cardDiv.style.position = 'relative';
    cardDiv.appendChild(overlay);
    
    return cardDiv;
}

// Show card modal
function showCardModal(card) {
    const modal = document.getElementById('card-modal');
    
    // Populate modal content
    document.getElementById('modal-card-image').style.backgroundImage = `url('${card.image}')`;
    document.getElementById('modal-card-image').style.backgroundSize = 'cover';
    document.getElementById('modal-card-image').style.backgroundPosition = 'center';
    
    document.getElementById('modal-card-name').textContent = card.italianName;
    document.getElementById('modal-card-category').textContent = getCategoryName(card.category);
    document.getElementById('modal-card-meaning').textContent = card.meaning;
    document.getElementById('modal-card-reversed').textContent = card.reversed;
    document.getElementById('modal-card-symbolism').textContent = card.symbolism;
    
    // Populate keywords
    const keywordsContainer = document.getElementById('modal-keywords');
    keywordsContainer.innerHTML = card.keywords.map(keyword => 
        `<span class="keyword-tag">${keyword}</span>`
    ).join('');
    
    // Show modal
    modal.style.display = 'block';
    
    // Animate modal appearance
    anime({
        targets: '.modal-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('card-modal');
    
    anime({
        targets: '.modal-content',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuart',
        complete: () => {
            modal.style.display = 'none';
        }
    });
}

// Get category name in Italian
function getCategoryName(category) {
    const categories = {
        'major': 'Arcani Maggiori',
        'bastoni': 'Bastoni (Fuoco)',
        'coppe': 'Coppe (Acqua)',
        'spade': 'Spade (Aria)',
        'denari': 'Denari (Terra)'
    };
    return categories[category] || category;
}

// Filter cards
function filterCards(category) {
    const cards = document.querySelectorAll('.tarot-card-mini');
    const buttons = document.querySelectorAll('.filter-button');
    
    // Update button states
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter cards
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            // This would need to be enhanced with actual card data
            card.style.display = 'block';
        }
    });
}

// Search cards
function searchCards() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.tarot-card-mini');
    
    cards.forEach(card => {
        const cardName = card.querySelector('div').textContent.toLowerCase();
        if (cardName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Reading page functions
function displayCurrentReading() {
    if (!currentReading && window.location.pathname.includes('reading.html')) {
        // Load from localStorage or show placeholder
        const savedReading = loadLastReading();
        if (savedReading) {
            currentReading = savedReading;
        } else {
            showNoReadingMessage();
            return;
        }
    }
    
    if (!currentReading) return;
    
    // Update reading summary
    document.getElementById('reading-date').textContent = `Data: ${currentReading.date}`;
    document.getElementById('reading-type').textContent = `Tipo: ${getReadingTypeName(currentReading.type)}`;
    document.getElementById('overall-theme').textContent = currentReading.theme;
    
    // Display cards
    const cardsGrid = document.getElementById('cards-grid');
    cardsGrid.innerHTML = '';
    
    currentReading.cards.forEach(card => {
        const cardElement = createReadingPageCard(card);
        cardsGrid.appendChild(cardElement);
    });
    
    // Generate and display interpretations
    generateDetailedInterpretations();
}

// Create card for reading page
function createReadingPageCard(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'text-center fade-in';
    
    cardDiv.innerHTML = `
        <div class="position-label mb-4">${card.positionName}</div>
        <div class="tarot-card-large w-48 h-72 mx-auto mb-4" style="background-image: url('${card.image}'); background-size: cover; background-position: center;"></div>
        <h3 class="card-name text-xl mb-2">${card.italianName}</h3>
        <div class="keywords-section justify-center mb-4">
            ${card.keywords.slice(0, 3).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
        </div>
    `;
    
    return cardDiv;
}

// Generate detailed interpretations
function generateDetailedInterpretations() {
    const container = document.getElementById('interpretations-container');
    container.innerHTML = '';
    
    currentReading.cards.forEach((card, index) => {
        const interpretationDiv = document.createElement('div');
        interpretationDiv.className = 'interpretation-text fade-in';
        
        interpretationDiv.innerHTML = `
            <h3 class="card-name text-2xl mb-4">${card.positionName} - ${card.italianName}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-bold text-lg mb-2">Significato nella Posizione</h4>
                    <p class="mb-4">${getPositionMeaning(card, index)}</p>
                    <h4 class="font-bold text-lg mb-2">Consiglio</h4>
                    <p>${getCardAdvice(card)}</p>
                </div>
                <div>
                    <h4 class="font-bold text-lg mb-2">Simbolismo</h4>
                    <p class="mb-4">${card.symbolism}</p>
                    <div class="keywords-section">
                        ${card.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(interpretationDiv);
    });
    
    // Generate combined analysis
    generateCombinedAnalysis();
}

// Get position-specific meaning
function getPositionMeaning(card, position) {
    const meanings = {
        'three-card': [
            `Nel passato, ${card.name.toLowerCase()} indica che...`,
            `Nel presente, ${card.name.toLowerCase()} suggerisce che...`,
            `Nel futuro, ${card.name.toLowerCase()} rivela che...`
        ],
        'love': [
            `Come rappresentazione di te stesso/a, ${card.name.toLowerCase()} mostra che...`,
            `Nel rapporto con il/la partner, ${card.name.toLowerCase()} indica che...`,
            `Per il vostro futuro insieme, ${card.name.toLowerCase()} suggerisce che...`
        ],
        'career': [
            `Nella tua posizione attuale, ${card.name.toLowerCase()} mostra che...`,
            `Le sfide che devi affrontare sono rappresentate da ${card.name.toLowerCase()} che...`,
            `Le opportunità future indicate da ${card.name.toLowerCase()} suggeriscono che...`
        ]
    };
    
    return meanings[currentReadingType]?.[position] || card.meaning;
}

// Get card advice
function getCardAdvice(card) {
    const adviceTemplates = [
        `Lascia che l'energia di ${card.name} ti guidi verso...`,
        `La saggezza di ${card.name} ti insegna che...`,
        `Impara dalla lezione di ${card.name} che...`,
        `L'essenza di ${card.name} ti suggerisce di...`
    ];
    
    const template = adviceTemplates[Math.floor(Math.random() * adviceTemplates.length)];
    return template + ' ' + card.meaning.split('.')[0] + '.';
}

// Generate combined analysis
function generateCombinedAnalysis() {
    const heartMessage = `Le carte rivelano un messaggio profondo dal tuo cuore: ${currentReading.theme}. Questo periodo richiede attenzione e consapevolezza.`;
    
    const adviceGuidance = `La combinazione delle carte suggerisce che il tuo percorso richiede ${drawnCards[0].keywords[0]} nel passato, ${drawnCards[1].keywords[0]} nel presente, e ${drawnCards[2].keywords[0]} nel futuro. Fidati del processo e segui la tua intuizione.`;
    
    document.getElementById('heart-message').textContent = heartMessage;
    document.getElementById('advice-guidance').textContent = adviceGuidance;
    
    // Generate reflection questions
    const questionsContainer = document.getElementById('reflection-questions');
    questionsContainer.innerHTML = '';
    
    const questions = [
        `Come posso integrare la saggezza di ${drawnCards[0].italianName} nel mio passato?`,
        `Cosa mi insegna ${drawnCards[1].italianName} sulla mia situazione attuale?`,
        `Come prepararmi per l'energia di ${drawnCards[2].italianName} nel futuro?`,
        `Qual è il messaggio più importante che posso portare con me da questa lettura?`
    ];
    
    questions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'text-lg mb-3 p-3 bg-gray-100 rounded-lg';
        questionDiv.textContent = `• ${question}`;
        questionsContainer.appendChild(questionDiv);
    });
}

// Get reading type name in Italian
function getReadingTypeName(type) {
    const types = {
        'three-card': 'Lettura a Tre Carte',
        'single': 'Carta del Giorno',
        'love': 'Lettura Amore e Relazioni',
        'career': 'Lettura Carriera e Lavoro'
    };
    return types[type] || type;
}

// Load reading history
function loadReadingHistory() {
    const history = JSON.parse(localStorage.getItem('tarotReadingHistory') || '[]');
    readingHistory = history;
    
    const historyGrid = document.getElementById('history-grid');
    if (!historyGrid) return;
    
    historyGrid.innerHTML = '';
    
    if (history.length === 0) {
        historyGrid.innerHTML = '<div class="col-span-full text-center text-yellow-200">Nessuna lettura salvata</div>';
        return;
    }
    
    history.forEach(reading => {
        const readingCard = document.createElement('div');
        readingCard.className = 'interpretation-text cursor-pointer hover:shadow-lg transition-shadow';
        readingCard.onclick = () => loadReading(reading);
        
        readingCard.innerHTML = `
            <h3 class="card-name text-lg mb-2">${getReadingTypeName(reading.type)}</h3>
            <p class="text-sm text-gray-600 mb-2">${reading.date}</p>
            <p class="text-sm mb-3">${reading.theme}</p>
            <div class="text-xs text-gray-500">
                ${reading.cards.length} carte • ${reading.cards.map(c => c.italianName).join(', ')}
            </div>
        `;
        
        historyGrid.appendChild(readingCard);
    });
}

// Load specific reading
function loadReading(reading) {
    currentReading = reading;
    displayCurrentReading();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load last reading
function loadLastReading() {
    const history = JSON.parse(localStorage.getItem('tarotReadingHistory') || '[]');
    return history[0] || null;
}

// Show no reading message
function showNoReadingMessage() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="text-center py-20">
                <h2 class="mystical-title text-4xl mb-6">Nessuna Lettura Disponibile</h2>
                <p class="text-xl text-yellow-200 mb-8">Non hai ancora effettuato alcuna lettura.</p>
                <a href="index.html" class="mystical-button px-8 py-4 rounded-full text-xl">
                    Inizia la Tua Prima Lettura
                </a>
            </div>
        `;
    }
}

// Save current reading (for reading page)
function saveCurrentReading() {
    if (!currentReading) return;
    
    saveReading();
}

// Share reading
function shareReading() {
    if (!currentReading) return;
    
    const shareText = `Ho appena fatto una lettura dei tarocchi: ${getReadingTypeName(currentReading.type)}. ${currentReading.theme}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'La Mia Lettura dei Tarocchi',
            text: shareText
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Testo della lettura copiato negli appunti!');
        });
    }
}

// Utility function to get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Export functions for global access
window.startReading = startReading;
window.selectReadingType = selectReadingType;
window.shuffleDeck = shuffleDeck;
window.drawCard = drawCard;
window.drawSingleCard = drawSingleCard;
window.saveReading = saveReading;
window.newReading = newReading;
window.showCardModal = showCardModal;
window.closeModal = closeModal;
window.filterCards = filterCards;
window.searchCards = searchCards;
window.saveCurrentReading = saveCurrentReading;
window.shareReading = shareReading;