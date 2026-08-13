// Synced copy of ../belline.js for native builds. Keep this file aligned with the web dataset.
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

// Dettagli estesi per carta (iconografia, psicologia, ritratto, consiglio, direzione, esito).
// Fonti: guida-belline (tabella per-card), normalizzato da tools/csv-to-detail.js
const BELLINE_CARD_DETAILS = {
    "1": {
        icon: "Una grande chiave antica. Apertura di porte, forzieri e lucchetti. Accesso all'ignoto.",
        psych: "Il nome evoca il \"fato scritto\", ma l'immagine della chiave esalta il libero arbitrio. Rappresenta la lotta tra condizionamenti e libertà personale.",
        portrait: "Persona carismatica, padrona delle sue scelte, libera da vincoli, capace di sbloccare situazioni.",
        advice: "Usare il libero arbitrio, uscire dalla comfort zone, osare l'inesplorato.",
        direction: "Nuove opportunità, porte che si spalancano, espansione delle esperienze.",
        outcome: "Successo legato alla conquista della libertà e all'apertura di nuove vie."
    },
    "2": {
        icon: "Stella a 6 punte (Sigillo di Salomone), volto maschile con copricapo egizio. La Sfinge (corpo di leone/Rê, testa umana/faraone).",
        psych: "Il principio attivo, yang. Forza bruta, stabilità, coraggio e vitalità. L'ego che si afferma nel mondo materiale.",
        portrait: "Persona intraprendente, combattiva, stabile, dotata di grande forza morale e fisica.",
        advice: "Esternare forza, sicurezza, virilità e coraggio. Agire da \"guerriero\".",
        direction: "Verso azioni che richiedono energia, leadership e affermazione di sé.",
        outcome: "Successo ottenuto tramite azioni attive, coraggio e sforzo personale."
    },
    "3": {
        icon: "Stella a 6 punte, volto femminile. Il principio passivo, yin, ricettivo ma non debole.",
        psych: "Forza interiore, resilienza, intuizione, empatia. La capacità di creare e nutrire (emozioni e progetti).",
        portrait: "Persona empatica, diplomatica, intuitiva, dotata di grande intelligenza emotiva.",
        advice: "Agire con dolcezza, usare l'intuizione, comunicare con sincerità e tatto.",
        direction: "Via di calma, tenerezza, creatività feconda e ascolto profondo.",
        outcome: "Successo tramite sensibilità, diplomazia e connessioni umane autentiche."
    },
    "4": {
        icon: "Pergamena con tema astrale (Sole in Capricorno, Luna in Cancro). Il Natale, la nascita \"sacra\" e divina.",
        psych: "L'entusiasmo del nuovo inizio, l'autenticità infantile, la fede nel futuro. Potenziale puro non ancora corrotto.",
        portrait: "Persona aperta al nuovo, sognatrice, autentica, in stato di \"grazia\" creativa.",
        advice: "Mettere al mondo un progetto, affermare idee, abbracciare la vita con fede.",
        direction: "Affermazione di nuovi progetti, idee che prendono corpo e nascono.",
        outcome: "Successo nella genesi di qualcosa di importante e \"sacro\" per il consultante."
    },
    "5": {
        icon: "Corona d'alloro (imperatori romani) e medaglia. Trionfo sociale, prestigio, luce solare.",
        psych: "Attenzione all'orgoglio. La carta avverte di \"non riposare sugli allori\" una volta raggiunta la vetta.",
        portrait: "Persona solare, soddisfatta, carismatica, che ha raggiunto i suoi obiettivi.",
        advice: "Avere fiducia in sé, osare, incarnare la soddisfazione e l'audacia.",
        direction: "Via gioiosa, luminosa, promettente e ricca di conferme.",
        outcome: "Pieno successo, obiettivi materiali e sociali raggiunti."
    },
    "6": {
        icon: "Piramide e scala rovesciata. La Piramide (convergenza verso il divino), la scala (iniziazione a step).",
        psych: "Il bisogno di prendere le distanze dall'ego e dal materiale. Maturità, distacco, visione dall'alto.",
        portrait: "Persona matura, saggia, visionaria, distaccata dalle meschinità quotidiane.",
        advice: "Prendere distanza critica e prospettiva, formarsi, vedere le cose da una prospettiva più ampia.",
        direction: "Crescita morale/spirituale, nuove visioni, maturazione interiore.",
        outcome: "Successo che porta a una nuova consapevolezza, non solo materiale."
    },
    "7": {
        icon: "Due scettri (mondo e giustizia) e corona. Potere temporale, autorità, giudizio, riconoscimento pubblico.",
        psych: "Riconoscimento dell'Ego e del talento individuale, più che dei valori dell'anima. Fierezza personale.",
        portrait: "Persona di talento, autorevole, stimata, che impone rispetto.",
        advice: "Affermare il proprio ego, essere sicuri di sé, rivendicare il proprio valore.",
        direction: "Riconoscimento degli sforzi, fierezza, validazione sociale.",
        outcome: "Successo e riconoscimento pubblico del lavoro e del talento."
    },
    "8": {
        icon: "Cane con medaglia (fedeltà) e viola del pensiero (Pensée). Legami scelti, lealtà, rete di supporto.",
        psych: "La necessità di non essere soli. La guarigione attraverso la benevolenza e la condivisione sincera.",
        portrait: "Persona amichevole, generosa, affidabile, circondata da affetti veri.",
        advice: "Usare la rete amicale, essere generosi, chiedere o offrire aiuto.",
        direction: "Evoluzione tranquilla, pacifica, supportata da alleanze solide.",
        outcome: "Successo tramite la collaborazione, la fiducia e la stabilità relazionale."
    },
    "9": {
        icon: "Casetta sotto un albero con giglio (purezza). Il ritiro bucolico, la rigenerazione, la pausa dal caos.",
        psych: "Il diritto al riposo. Rifiuto dell'iperattività a favore dell'essere e della rigenerazione cellulare/mentale.",
        portrait: "Persona serena, rilassata, rassicurante, in pace con se stessa.",
        advice: "Riposare, agire con calma, pazientare, curare il proprio benessere.",
        direction: "Situazione calma, senza scossoni, tempo di recupero e pace.",
        outcome: "Successo legato al benessere, alla salute e alla tranquillità."
    },
    "10": {
        icon: "Mano divina tra le nuvole che fa cadere gioielli e corone. La manna dal cielo, la provvidenza.",
        psych: "L'abbondanza richiede reattività. I doni cadono, bisogna essere lesti ad afferrarli al volo.",
        portrait: "Persona generosa, solare, o situazione in cui il consultante è \"baciato\" dalla fortuna.",
        advice: "Essere generosi, offrire opportunità, ma anche saper cogliere l'attimo.",
        direction: "Periodo prodigo, opportunità inattese da afferrare immediatamente.",
        outcome: "Successo materiale, finanziario o onorifico ricevuto o donato."
    },
    "11": {
        icon: "Gatto blu notte, irto, pupille dilatate. Il gatto nero (sfortuna, stregoneria), l'ambivalenza felina.",
        psych: "L'ombra, l'autoinganno. Il divario tra ciò che crediamo e la realtà. Cecità emotiva o fiducia mal riposta.",
        portrait: "Errore di giudizio, illusione, persona subdola o situazione ingannevole.",
        advice: "Prudenza, mantenere il mistero, non dire tutto, diffidare delle apparenze.",
        direction: "Delusione, scarto brutale tra aspettative e realtà, risveglio doloroso.",
        outcome: "Fallimento o delusione per mancanza di lucidità e discernimento."
    },
    "12": {
        icon: "Uccelli migratori che lasciano montagne aride. L'istinto di sopravvivenza, l'abbandono del nido sterile.",
        psych: "Il lutto della comfort zone. La paura dell'ignoto mista alla speranza di un altrove migliore.",
        portrait: "Persona in transizione, in fuga da un ambiente tossico o sterile.",
        advice: "Uscire dalla comfort zone, tagliare i rami secchi, accettare il movimento.",
        direction: "Nuove prospettive, ma con rinunce. Abbandono del progetto iniziale.",
        outcome: "Risultato in mezza tinta: si parte, ma la destinazione è ancora ignota."
    },
    "13": {
        icon: "Casa fortificata investita da un vento con volto umano. Eolo, i venti capricciosi. L'imponderabile.",
        psych: "L'incapacità di radicarsi. Versatilità che diventa precarietà. Ansia da scelta e paura di bloccarsi.",
        portrait: "Persona instabile, lunatica, o circostanze esterne caotiche e imprevedibili.",
        advice: "Flessibilità estrema, non scegliere, neutralità, adattarsi al vento.",
        direction: "Cammino incerto, rischio di cambiamenti bruschi e faticosi.",
        outcome: "Indeterminazione, nessuna vera riuscita stabile, continuo riadattamento."
    },
    "14": {
        icon: "Cannocchiale, libri, civetta (Atena/Saggezza). Galileo, Colombo. La verità che sconvolge i paradigmi.",
        psych: "La crisi cognitiva. Apprendere una verità che distrugge le vecchie credenze. Shock salutare ma destabilizzante.",
        portrait: "Persona che apprende un segreto o una verità nascosta che cambia tutto.",
        advice: "Apertura mentale, accettare la \"rimessa in discussione\", cercare la verità.",
        direction: "Altra via, inattesa ma reale. Cambio di paradigma inevitabile.",
        outcome: "Successo altrove, in una direzione prima ignorata o sconosciuta."
    },
    "15": {
        icon: "Nave su mare agitato. L'inconscio, le emozioni profonde, il viaggio senza ritorno, la gestazione.",
        psych: "L'incertezza emotiva. Il transito obbligato dove non si ha il controllo, ci si può solo affidare al flusso.",
        portrait: "Persona in transito, inquieta, in balia delle emozioni o di un lungo percorso.",
        advice: "Prendere il largo, accettare l'incertezza, gestire le proprie emozioni.",
        direction: "Progressione lenta, faticosa, fluttuante, ma verso una meta lontana.",
        outcome: "Sforzo prolungato, esito incerto ma in inarrestabile movimento."
    },
    "16": {
        icon: "Piccola torre fortificata (Lari romani). Divinità protettrici della casa e del focolare.",
        psych: "Il bisogno di regressione uterina, di protezione. Il rischio della sclerosi, della routine e dell'immobilismo.",
        portrait: "Persona riservata, emotiva, casalinga, o situazione di stasi protettiva.",
        advice: "Riposare, lasciar decantare le emozioni, curare il proprio \"nido\".",
        direction: "Routine, tranquillità, mancanza di azione esterna, incubazione.",
        outcome: "Successo solo se si cerca calma, lentezza e protezione interiore."
    },
    "17": {
        icon: "Rospo (impurità) colpito da un'aquila (spirito/aria). Il conflitto tra basso e alto, il malessere psicosomatico.",
        psych: "Il sintomo come messaggio. Un disequilibrio profondo che chiede di essere diagnosticato e portato alla luce.",
        portrait: "Persona sofferente, stressata, squilibrata, o progetto che \"non gira\".",
        advice: "Far emergere i problemi, fare una diagnosi, non ignorare i segnali d'allarme.",
        direction: "Flottamento, crisi necessaria, ricerca faticosa di un nuovo equilibrio.",
        outcome: "Nessun successo finché non si risolve la causa radice dello squilibrio."
    },
    "18": {
        icon: "Eclissi solare. Lo sconvolgimento cosmico, la fine di un'era, il movimento ineluttabile.",
        psych: "La necessità di rompere gli schemi. L'adattamento come unica via di sopravvivenza. Dinamismo puro.",
        portrait: "Persona dinamica, in mutamento, o situazione che sta per ribaltarsi.",
        advice: "Cambiare prospettiva, accettare il movimento, non resistere al flusso.",
        direction: "Evoluzione significativa, tonificante, rottura della staticità.",
        outcome: "Adattamento, risultato diverso dalle attese ma progressivo e vitale."
    },
    "19": {
        icon: "Cornucopia con monete d'argento. Energia condensata, mezzi materiali, logistica, tempo.",
        psych: "Il pragmatismo. Non solo ricchezza, ma \"risorse\" (tempo, salute, mezzi) per concretizzare le idee.",
        portrait: "Persona con mezzi materiali/fisici disponibili, pragmatica, gestionale.",
        advice: "Organizzare, strutturare, investire, usare le risorse in modo efficiente.",
        direction: "Sviluppo materiale, migliore efficienza, circolazione di energie concrete.",
        outcome: "Successo materiale, finanziario, logistico e organizzativo."
    },
    "20": {
        icon: "Libro sacro (Torah) e Menorah (7 bracci). Conoscenza esoterica, illuminazione, mente analitica.",
        psych: "L'adattabilità mentale, la creatività, l'ascolto attivo. Superamento dell'ignoranza tramite lo studio.",
        portrait: "Persona intellettualmente dotata, creativa, rapida, comunicativa.",
        advice: "Studiare, imparare, comunicare, analizzare la situazione con lucidità.",
        direction: "Crescita intellettuale, apertura, risoluzione tramite l'ingegno.",
        outcome: "Successo tramite l'apprendimento, la strategia e l'adattamento."
    },
    "21": {
        icon: "Pipistrello (vampiro/oscurità) che afferra un ratto (pestilenza). Energie parassite, dispersione, cattivi investimenti.",
        psych: "L'auto-sabotaggio, la fiducia abusata, il \"buco\" energetico. Spreco di talento o risorse.",
        portrait: "Persona che perde energia/tempo, mal consigliata, o situazione di fallimento.",
        advice: "Investire a fondo perduto (paradossale), accettare la perdita per rinascere.",
        direction: "Perdita di mezzi, mancanza di redditività, dispersione caotica.",
        outcome: "Insuccesso, energie sprecate, necessità di chiudere un rubinetto aperto."
    },
    "22": {
        icon: "Progetto, squadra, compasso (massoneria) e martello. L'architettura, la pianificazione, il \"Faber\", il lavoro strutturato.",
        psych: "Il passaggio dall'idea all'azione concreta. La disciplina, la gerarchia, la costruzione mattone su mattone.",
        portrait: "Persona strutturata, dinamica, organizzata, \"builder\".",
        advice: "Organizzarsi, pianificare, iniziare, darsi una regola e un metodo.",
        direction: "Avvio concreto, inizio di costruzione, strutturazione del caos.",
        outcome: "Successo nell'avvio, nella concretizzazione e nell'organizzazione."
    },
    "23": {
        icon: "Caduceo ed elmo alato (Ermes/Mercurio). Il dio dei commerci, dei viaggi, dei ladri e dei confini.",
        psych: "L'iper-connessione, la rete, il networking. L'incapacità (o rifiuto) di stare fermi. Innovazione.",
        portrait: "Persona in movimento, creativa, viaggiatrice, adattabile e sfuggente.",
        advice: "Muoversi, viaggiare, fare networking, adattarsi, comunicare.",
        direction: "Cambiamento, nuovi incontri, stimoli esterni, espansione territoriale.",
        outcome: "Successo nel movimento, nel commercio, nella reattività e nei viaggi."
    },
    "24": {
        icon: "Cometa e piccione viaggiatore. L'araldo, il messaggio che cambia il corso della storia.",
        psych: "L'elemento sorpresa, l'informazione che sblocca la stasi. Verso destra (il futuro).",
        portrait: "Persona tonica, portatrice di novità, o evento inatteso e fecondo.",
        advice: "Vedere le cose in modo nuovo, essere reattivi, cogliere l'attimo.",
        direction: "Nuove prospettive, occasioni da cogliere, accelerazione degli eventi.",
        outcome: "Soddisfazione tramite novità, messaggi positivi ed evoluzione rapida."
    },
    "25": {
        icon: "Lira (Orfeo, Apollo). L'arte, la poesia, l'epicureismo, l'armonia estetica.",
        psych: "La ricerca del bello, la leggerezza, l'ispirazione. Rifiuto della volgarità e della pesantezza.",
        portrait: "Persona raffinata, intuitiva, romantica, amante dell'arte e del bello.",
        advice: "Cercare il piacere, la dolcezza, l'ispirazione, curare l'estetica.",
        direction: "Evoluzione dolce, affetto, appagamento sensoriale e artistico.",
        outcome: "Soddisfazione sentimentale, sottile, romantica e culturale."
    },
    "26": {
        icon: "Fascio dei littori con ascia (ascia di guerra sepolta). La Pax Romana, la diplomazia, la fine delle ostilità.",
        psych: "La temperanza, la capacità di mediare, il rifiuto del conflitto distruttivo. Armonia ritrovata.",
        portrait: "Persona tranquilla, diplomatica, equilibrata, pacificatrice.",
        advice: "Evitare conflitti, usare diplomazia, cercare il compromesso nobile.",
        direction: "Via serena, armoniosa, senza tensioni, riconciliazione.",
        outcome: "Risultato piacevole, sereno, appagante, fine delle ostilità."
    },
    "27": {
        icon: "Due cuori su un altare (sacrificio/impegno). L'alchimia degli opposti, il matrimonio, la partnership.",
        psych: "Il bisogno di fusione, l'impegno reciproco, la sinergia. 1+1=3.",
        portrait: "Persona equilibrata, amorevole, pronta all'impegno e alla condivisione.",
        advice: "Unire le forze, impegnarsi, associarsi, fondere le energie.",
        direction: "Incontro, armonia, progetti condivisi, sinergia potente.",
        outcome: "Successo relazionale, unità, collaborazione feconda."
    },
    "28": {
        icon: "Gallina con pulcini. Il clan, la tribù, la protezione materna, l'appartenenza.",
        psych: "Le radici, la solidarietà incondizionata, il calore del gruppo. Sicurezza emotiva.",
        portrait: "Persona affettuosa, solidale, rassicurante, legata ai propri cari.",
        advice: "Appoggiarsi ai propri cari, creare legami, proteggere il \"clan\".",
        direction: "Sviluppo di relazioni affettuose, stabilità, sostegno reciproco.",
        outcome: "Successo tramite legami, solidarietà e reti di supporto."
    },
    "29": {
        icon: "Cuori portati da una colomba (Spirito/Pace) in corona di fiori. Eros/Agape, l'amore universale e puro.",
        psych: "La vulnerabilità accettata, la sincerità totale, l'elevazione spirituale tramite il sentimento.",
        portrait: "Persona amorevole, sincera, generosa, aperta sentimentalmente.",
        advice: "Essere affettuosi, aprire il cuore, amare senza condizioni.",
        direction: "Evoluzione sentimentale felice, armonia profonda, guarigione.",
        outcome: "Grande soddisfazione morale, affettiva e spirituale."
    },
    "30": {
        icon: "Anfora e coppe. Il banchetto, l'ospitalità, la convivialità, i piaceri terreni.",
        psych: "La gioia della condivisione materiale, il networking informale, l'abbondanza condivisa.",
        portrait: "Persona conviviale, comunicativa, generosa, \"bon vivant\".",
        advice: "Essere conviviali, condividere, ascoltare, invitare, networking.",
        direction: "Evoluzione simpatica, contatti amichevoli, accordi informali.",
        outcome: "Soddisfazione tramite condivisione, piacere e contatti sociali."
    },
    "31": {
        icon: "Gallo e cuori trafitti da frecce. L'istinto, la gelosia, il fuoco che brucia, l'irrazionalità.",
        psych: "L'ombra di Venere. L'amore tossico, l'ossessione, l'impulso che distrugge la ragione. Intensità effimera.",
        portrait: "Persona impulsiva, intera, passionale, preda di desideri brucianti.",
        advice: "Seguire i desideri (con cautela), agire d'impulso, vivere il momento.",
        direction: "Evoluzione entusiasmante ma instabile, conflitti emotivi, fuoco.",
        outcome: "Successo energico ma effimero, rischioso o conflittuale."
    },
    "32": {
        icon: "Lanterna e pugnale. Il viandante notturno, il pericolo in agguato, la legittima difesa.",
        psych: "La paranoia o la reale minaccia. L'istinto di sopravvivenza, la diffidenza, il \"dente per dente\".",
        portrait: "Persona prudente, sulla difensiva, diffidente, o ambiente ostile.",
        advice: "Difendersi, prevenire, mostrare i denti, non essere ingenui.",
        direction: "Rischi esterni, necessità di difendersi, tensione latente.",
        outcome: "Difficoltà, necessità di lottare contro ostilità e invidie."
    },
    "33": {
        icon: "Due spade incrociate. Il duello, l'arbitrio, il bivio, la tensione dialettica.",
        psych: "Il conflitto interiore o esteriore che richiede una presa di posizione. Non si può più restare neutrali.",
        portrait: "Persona sotto tensione, in lotta, indecisa o in causa legale/morale.",
        advice: "Prendere posizione, combattere per i propri diritti, tranciare.",
        direction: "Necessità di tranciare, risolvere opposizioni, crisi decisiva.",
        outcome: "Lotta da vincere, ostacoli da superare tramite la forza o la legge."
    },
    "34": {
        icon: "Uomo incatenato a un palo. Il tiranno, la privazione della libertà, il martirio.",
        psych: "L'impotenza appresa, la sottomissione a forze maggiori (Stato, capo, karma). Attesa forzata.",
        portrait: "Persona vincolata, privata di libertà, o situazione di blocco totale.",
        advice: "Non agire, accettare i limiti, pazientare, preservare le energie.",
        direction: "Vincoli esterni, perdita di indipendenza, stasi obbligata.",
        outcome: "Insuccesso, azioni bloccate da forze maggiori o leggi rigide."
    },
    "35": {
        icon: "Serpente attorno a una spada. Il tentatore, l'ostacolo viscido, la guerra aperta.",
        psych: "L'ambiente tossico, le persone che remano contro, la necessità di \"uccidere\" il male alla radice.",
        portrait: "Persona combattiva sotto attacco, reattiva, o presenza di avversari occulti.",
        advice: "Combattere, non subire, usare la forza, estirpare il male.",
        direction: "Avversità, scontri, difficoltà esterne, guerre aperte o occulte.",
        outcome: "Insuccesso immediato, prima bisogna vincere e neutralizzare le opposizioni."
    },
    "36": {
        icon: "Uccelli che discutono (starnazzare). Il parlamento caotico, la divergenza di opinioni, la fatica di convincere.",
        psych: "L'incapacità di trovare un consenso. L'ego che si scontra con l'ego. Rumore di fondo senza azione.",
        portrait: "Persona che si esprime, sicura di sé, impulsiva, o riunioni inconcludenti.",
        advice: "Affermare le proprie idee, non temere il disaccordo, negoziare.",
        direction: "Discussioni, mancanza di consenso immediato, tensioni verbali.",
        outcome: "Risultato contrariato, tensioni persistenti, accordi faticosi."
    },
    "37": {
        icon: "Galli che si contendono una torcia. L'arena, la competizione bruta, l'energia marziale pura, l'incendio.",
        psych: "L'adrenalina, la collera, la distruzione purificatrice. Vincere o perdere, senza compromessi.",
        portrait: "Persona fervente, combattiva, impulsiva, o situazione esplosiva.",
        advice: "Battersi, attaccare, non essere docili, usare la forza bruta.",
        direction: "Lotta, avversità, scontro frontale, competizione agguerrita.",
        outcome: "Successo solo dopo dura lotta, competizione e vittoria sul rivale."
    },
    "38": {
        icon: "Fulmine su torre (Penati) e albero, grandine. L'ira di Zeus, la Torre nei Tarocchi, il crollo delle certezze.",
        psych: "Il trauma, lo shock, la rottura improvvisa dell'omeostasi. La vita che ti costringe a cambiare rotta.",
        portrait: "Persona destabilizzata, in crisi, scossa da un evento improvviso.",
        advice: "Rimettere tutto in discussione, cambiare rotta, accettare il crollo.",
        direction: "Crollo improvviso, fine brutale delle aspettative, shock liberatorio.",
        outcome: "Fallimento, crollo, necessità di ricostruire da zero altrove."
    },
    "39": {
        icon: "Aquila coronata (Zeus/Giove). Il re degli uccelli, la protezione divina, la stabilità dall'alto.",
        psych: "La grazia di essere sostenuti. Mentorship, aiuti inattesi, basi solide su cui costruire.",
        portrait: "Persona stabile, equilibrata, sostenuta, o presenza di un mentore.",
        advice: "Cercare aiuto, appoggiarsi a basi solide, fidarsi della protezione.",
        direction: "Evoluzione stabile, aiuti esterni, espansione protetta.",
        outcome: "Successo, protezione, espansione e basi solide garantite."
    },
    "40": {
        icon: "Giglio, cuore e corona. L'armonia delle sfere, la nobiltà d'animo, l'estetica morale.",
        psych: "L'allineamento tra interno ed esterno. La pace dei sensi e dello spirito. Assenza di conflitto.",
        portrait: "Persona carismatica, appagata, armoniosa, nobile nei modi.",
        advice: "Cercare l'armonia, agire con eleganza, elevare la situazione.",
        direction: "Evoluzione bella, equilibrata, appagante, nobile.",
        outcome: "Successo armonioso, benessere interiore ed esteriore, grazia."
    },
    "41": {
        icon: "Testamento, teschio (Memento mori) e clessidra. Il tempo, la trasmissione, il karma, le radici.",
        psych: "L'uso della memoria e dell'esperienza. Non si parte da zero, si capitalizza il passato (genetico o materiale).",
        portrait: "Persona esperta, saggia, lungimirante, o arrivo di risorse dal passato.",
        advice: "Usare l'esperienza passata, far fruttare gli acquis, onorare le radici.",
        direction: "Sviluppo basato sul passato e sull'esperienza, rendita.",
        outcome: "Successo grazie alle fondamenta, all'esperienza e ai beni acquisiti."
    },
    "42": {
        icon: "Civetta coronata (Atena/Minerva). L'uccello notturno che vede oltre le apparenze.",
        psych: "Il distacco dalle passioni, la visione a lungo termine, l'accettazione serena della realtà.",
        portrait: "Persona calma, saggia, distaccata, mentore spirituale o filosofico.",
        advice: "Prendere tempo, riflettere, avere distanza critica e prospettiva, agire con etica.",
        direction: "Arricchimento morale/spirituale, nuova visione, pace interiore.",
        outcome: "Successo misurato, saggezza, evoluzione interiore e distacco."
    },
    "43": {
        icon: "Stendardo, tromba e corona. Il trionfo romano, la reputazione pubblica, l'influenza.",
        psych: "Il bisogno di riconoscimento sociale, l'impatto sul mondo, l'espansione della propria influenza.",
        portrait: "Persona di talento, stimata, carismatica, con forte reputazione.",
        advice: "Farsi conoscere, affermare i propri talenti, espandere la rete.",
        direction: "Espansione, riconoscimento sociale, influenza, celebrità.",
        outcome: "Grande successo, consacrazione, visibilità e impatto pubblico."
    },
    "44": {
        icon: "Ruota alata con corona (Rota Fortunae). (i dadi). Il rischio, il gioco.",
        psych: "L'accettazione dell'imprevedibilità. Provocare il destino, osare, l'esperienza vale più del risultato.",
        portrait: "Persona intraprendente, giocosa, fortunata, amante del rischio.",
        advice: "Tentare la sorte, osare, creare movimento, non temere l'errore.",
        direction: "Opportunità, crescita, espansione tramite il movimento e il rischio.",
        outcome: "Successo tramite il rischio, l'esperienza e l'apertura all'ignoto."
    },
    "45": {
        icon: "Mano che offre una stella coronata. Il dono divino, la pienezza, l'ottimismo, la grazia.",
        psych: "La gioia semplice, la gratitudine, l'assenza di desideri inappagati. Il \"qui e ora\" perfetto.",
        portrait: "Persona gioviale, ottimista, appagata, portatrice di gioia.",
        advice: "Essere positivi, gioire del presente, coltivare la gratitudine.",
        direction: "Evoluzione gioiosa, appagamento, serenità duratura.",
        outcome: "Pieno successo, felicità, soddisfazione globale e duratura."
    },
    "46": {
        icon: "Vecchia donna con stampella. La strega, la fatica, il peso del tempo e della povertà.",
        psych: "La resilienza, il lavoro duro, l'essenzialità forzata. Spogliarsi del superfluo per sopravvivere.",
        portrait: "Persona laboriosa, provata, perseverante, o situazione di grande fatica.",
        advice: "Concentrarsi sull'essenziale, lavorare duro, stringere i denti.",
        direction: "Austerità, sforzi costanti, restrizioni, lentezza esasperante.",
        outcome: "Difficile, richiede enorme sforzo, pazienza e perseveranza."
    },
    "47": {
        icon: "Isola rocciosa senza vegetazione. Il deserto, l'aridità, l'assenza di vita e creatività.",
        psych: "Il blocco creativo o emotivo. L'ostinazione su una via morta. Necessità di cambiare radicalmente.",
        portrait: "Persona austera, chiusa, limitata, o progetto che non può germogliare.",
        advice: "Limitarsi, ridurre al minimo vitale, abbandonare le illusioni.",
        direction: "Nessun sviluppo, calcificazione, blocco totale, aridità.",
        outcome: "Insuccesso totale, necessità impellente di cambiare via o progetto."
    },
    "48": {
        icon: "Falce (Cronos/Saturno, Tarocco XIII). La mietitura, la fine ineluttabile, il taglio netto.",
        psych: "Il lutto, la chiusura di un ciclo karmico. L'accettazione dell'impermanenza. Morte per rinascere.",
        portrait: "Persona in profonda mutazione, in lutto, o fine irreversibile di un'era.",
        advice: "Lasciar andare, accettare la fine di un ciclo, non opporsi al destino.",
        direction: "Fine irreversibile, chiusura, trasformazione obbligata e radicale.",
        outcome: "Fine del progetto, necessità di rinascere altrove e in altro modo."
    },
    "49": {
        icon: "Colomba in triangolo di luce. L'intervento divino, il perdono, l'assoluzione, la speranza.",
        psych: "Il sollievo dopo la lunga prova saturnina. La fede che ripaga, la compassione, l'inaspettato aiuto.",
        portrait: "Persona umile, spirituale, resiliente, o situazione che si sblocca per miracolo.",
        advice: "Avere fede, non arrendersi, sperare, perdonare e perdonarsi.",
        direction: "Miglioramento dopo prova, sollievo, intervento provvidenziale.",
        outcome: "Successo insperato, grazia, sollevamento dal peso e dal dolore."
    },
    "50": {
        icon: "Torre in rovina (erosione lenta, non fulmine). Il tempo che logora, la nostalgia, il ritorno alla polvere.",
        psych: "La decadenza accettata, il lasciar andare ciò che non serve più, il minimalismo estremo.",
        portrait: "Persona solida ma logorata, essenziale, o situazione in lento declino.",
        advice: "Limitare gli sforzi, lasciar fare al tempo, conservare solo l'essenziale.",
        direction: "Deterioramento lento, perdita del superfluo, ritorno alle basi.",
        outcome: "Insuccesso materiale, ma mantenimento del solo minimo vitale e vero."
    },
    "51": {
        icon: "Ruota immobile tra rocce. L'ostacolo, la pausa forzata, il tempo sospeso.",
        psych: "L'arte della pazienza. Il rifiuto della fretta moderna. Maturazione silenziosa e invisibile.",
        portrait: "Persona austera, paziente, interiorizzata, o situazione bloccata.",
        advice: "Rallentare, pazientare, lasciar perdere, meditare, non forzare.",
        direction: "Ostacoli, pausa, immobilismo, gestazione lunghissima.",
        outcome: "Insuccesso temporaneo, necessità di attesa e accettazione dei tempi."
    },
    "52": {
        icon: "Chiostro con saracinesca abbassata. Il monastero, l'isolamento, l'introspezione, il ritiro dal mondo.",
        psych: "Il bisogno di silenzio, di fare il punto, di tagliare i ponti col rumore mondano per trovare sé stessi.",
        portrait: "Persona contemplativa, saggia, ritirata, o necessità di isolamento.",
        advice: "Isolarsi, riflettere, meditare, curare l'anima, staccare la spina.",
        direction: "Pausa, ritiro, lavoro interiore, silenzio rigenerante.",
        outcome: "Successo SOLO se si cerca introspezione, studio e pace interiore."
    },
    "blue": {
        icon: "Cielo azzurro uniforme (Talismano). L'infinito, la spiritualità pura, l'assenza di nubi.",
        psych: "La protezione suprema, la fluidità, la fede incrollabile. L'assenza totale di attrito o resistenza.",
        portrait: "Persona spirituale, generosa, rassicurante, \"angelo custode\".",
        advice: "Avere fiducia, sviluppare compassione, lasciarsi guidare, fluire.",
        direction: "Avanzare senza difficoltà, protetti, fluidità totale.",
        outcome: "Successo senza ostacoli, grazia assoluta, protezione divina."
    },
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
        pairs: pairs || [], association: association || '', keywords: keywords || [],
        detail: BELLINE_CARD_DETAILS[num] || null
    };
}

const bellineBlueCard = {
    id: 'blue', num: null, name: 'La Carta Blu', series: 'azzurra',
    association: 'Nessuno',
    keywords: ['Pace', 'Protezione', 'Equilibrio', 'Serenità'],
    meaning: "La Carta Blu è la protezione suprema. Rappresenta la dissoluzione delle ombre e il ritorno alla calma; agisce come uno scudo energetico che rimuove le difficoltà.",
    pairs: [],
    detail: BELLINE_CARD_DETAILS.blue || null
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
