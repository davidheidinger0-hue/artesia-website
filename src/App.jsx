import { useState, useEffect } from 'react';

export default function App() {
  // Navigation & Page State
  const [activeView, setActiveView] = useState('home'); // 'home' | 'pricing' | 'faq' | 'docs' | 'about' | 'impressum' | 'datenschutz'

  // Persona Target Landing Page Engine
  const [targetPersona, setTargetPersona] = useState('default'); // 'default' | 'einkauf' | 'programmierer' | 'gf' | 'endkunde'

  // Saved Leads State (persisted in localStorage for Odoo / Webhook sync readiness)
  const [savedLeads, setSavedLeads] = useState(() => {
    try {
      const stored = localStorage.getItem('artesia_customer_leads');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showCrmDrawer, setShowCrmDrawer] = useState(false);
  const [showDataInfoModal, setShowDataInfoModal] = useState(false);
  const [showStealthLinksModal, setShowStealthLinksModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Floating CTA visibility state (visible ONLY when inline CTA buttons are scrolled out of view)
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  // Stealth URL Parameter Decoder Map (Unobtrusive / Numeric URL codes so target audiences don't notice!)
  const personaCodeMap = {
    // Geschäftsführung (GF)
    '1': 'gf',
    '101': 'gf',
    'v1': 'gf',
    'p1': 'gf',
    'gf': 'gf',
    'executive': 'gf',

    // Einkauf
    '2': 'einkauf',
    '102': 'einkauf',
    'v2': 'einkauf',
    'p2': 'einkauf',
    'einkauf': 'einkauf',
    'procurement': 'einkauf',

    // Programmierer / Automatisierer
    '3': 'programmierer',
    '103': 'programmierer',
    'v3': 'programmierer',
    'p3': 'programmierer',
    'programmierer': 'programmierer',
    'dev': 'programmierer',

    // Endkunde
    '4': 'endkunde',
    '104': 'endkunde',
    'v4': 'endkunde',
    'p4': 'endkunde',
    'endkunde': 'endkunde',
    'client': 'endkunde',
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Support neutral parameters like ?v=1, ?p=101, ?ref=1, ?id=101, ?code=1, ?target=1
    const rawVal = params.get('v') || params.get('p') || params.get('ref') || params.get('id') || params.get('code') || params.get('target');

    if (rawVal) {
      const normalized = rawVal.trim().toLowerCase();
      const matchedPersona = personaCodeMap[normalized];
      if (matchedPersona) {
        setTargetPersona(matchedPersona);
      }

      // Stealth Mode: Scrub parameter from address bar after 300ms so target (e.g. GF) doesn't see suspicious parameters in the browser URL bar!
      setTimeout(() => {
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 300);
    }
  }, []);

  // Smart Visibility Observer for Floating CTA Button
  useEffect(() => {
    if (activeView !== 'home') {
      setShowFloatingCta(false);
      return;
    }

    const checkCtaVisibility = () => {
      const heroCtaElem = document.getElementById('hero-cta');
      const orderSectionElem = document.getElementById('order-section');

      const isHeroVisible = heroCtaElem
        ? (heroCtaElem.getBoundingClientRect().top < window.innerHeight && heroCtaElem.getBoundingClientRect().bottom > 0)
        : false;

      const isOrderVisible = orderSectionElem
        ? (orderSectionElem.getBoundingClientRect().top < window.innerHeight && orderSectionElem.getBoundingClientRect().bottom > 0)
        : false;

      // Show floating CTA ONLY when neither the hero CTA button nor the order form is visible in viewport!
      setShowFloatingCta(!isHeroVisible && !isOrderVisible);
    };

    window.addEventListener('scroll', checkCtaVisibility, { passive: true });
    checkCtaVisibility(); // Initial check

    return () => {
      window.removeEventListener('scroll', checkCtaVisibility);
    };
  }, [activeView]);

  // Softened Industrial Theme Controls
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDarkBg, setSelectedDarkBg] = useState('#111827'); // Soft Slate Dark

  const darkBgOptions = [
    { id: 'slate', name: 'Industrial Slate', hex: '#111827' },
    { id: 'zinc', name: 'Dark Graphite', hex: '#18181b' },
    { id: 'charcoal', name: 'Deep Charcoal', hex: '#161e2e' },
    { id: 'steel', name: 'Steel Navy', hex: '#0f172a' },
    { id: 'obsidian', name: 'Soft Obsidian', hex: '#1c1e24' },
  ];

  // Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    iban: '',
  });
  const [orderBump, setOrderBump] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Interactive Calculator State
  const [machines, setMachines] = useState(5);
  const [dataFrequency, setDataFrequency] = useState(10); // signals/sec

  const estimatedDataVolume = (machines * dataFrequency * 3600 * 8 * 22) / 1000000; // GB/month
  const payPerUseCost = Math.round(15 + estimatedDataVolume * 12);
  const legacyLicenseCost = machines * 450;
  const monthlySavings = legacyLicenseCost - payPerUseCost;

  // Active Interface Tech Preview
  const [selectedProtocol, setSelectedProtocol] = useState('opcua');

  const protocols = {
    opcua: {
      name: 'OPC UA (IEC 62541)',
      latency: '< 2.4 ms',
      payload: 'Binary / JSON encrypted',
      setup: 'Plug & Play Autodiscovery',
    },
    s7: {
      name: 'Siemens S7-1200 / S7-1500',
      latency: '< 1.8 ms',
      payload: 'Direct DB Read',
      setup: 'Zero PLC Modification',
    },
    twincat: {
      name: 'Beckhoff TwinCAT ADS',
      latency: '< 1.2 ms',
      payload: 'ADS Symbol Stream',
      setup: 'Native Route Config',
    },
    modbus: {
      name: 'Modbus TCP',
      latency: '< 5.0 ms',
      payload: 'Register Polling',
      setup: 'Universal Gateway',
    }
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState(null);
  const [openMasterFaq, setOpenMasterFaq] = useState(null);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('Alle');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Dynamic Persona Content Strategy Map based on value_proposition_canvas_strategy_artesia.md
  const personaContent = {
    default: {
      title: "STOPPEN SIE DIE VERSCHWENDUNG FÜR TEURE SOFTWARE-LIZENZEN.",
      subtitle: "Das Artesia-System zur SPS-Prozessbeobachtung. Zahlen Sie fair und transparent per 'Pay-per-Use' – nur für die Daten, die Sie wirklich nutzen.",
      secretTitle: "Das Geheimnis der Pay-per-Use Revolution",
      secretText1: "Warum zahlen Industrieunternehmen weiterhin tausende Euros für ungenutzte Software-Lizenzen? Weil herkömmliche Anbieter Sie in starre Jahresverträge zwingen.",
      secretText2: "Artesia nutzt eine proprietäre, schreibgeschützte Adapter-Architektur, die Ihre SPS-Prozessdaten in Echtzeit abgreift – ohne Eingriff in den bestehenden Bausteincode. Sie zahlen exakt für die Signale, die verarbeitet werden. Kein Cent mehr.",
      benefits: [
        "Minimalistische Schnittstellen-Architektur (OPC UA, S7, TwinCAT, Modbus)",
        "Sofortige Fehlererkennung in Anlagenprozessen ohne TIA-Portal Zwang",
        "Keine Fixkosten-Fallen: Volle Transparenz durch exakte Pay-per-Use Abrechnung"
      ],
      faqs: [
        {
          q: 'Wie genau wird das "Pay-per-Use" Modell abgerechnet?',
          a: 'Sie zahlen absolut keine monatlichen Grundgebühren oder Lizenzpauschalen. Es werden ausschließlich die tatsächlich übertragenen und verarbeiteten SPS-Prozesssignale abgerechnet.',
          category: 'Allgemein'
        },
        {
          q: 'Benötige ich Änderungen an den bestehenden SPS-Programmen?',
          a: 'Nein. Das Artesia-System greift über schreibgeschützte Schnittstellen direkt auf die Prozessdaten zu. Ihr laufender Anlagenbetrieb wird zu keinem Zeitpunkt beeinflusst.',
          category: 'Programmierer'
        },
        {
          q: 'Ist die Schnittstellen-Architektur DSGVO- und IT-Sicherheits-konform?',
          a: 'Ja. Sämtliche Datenübertragungen sind Ende-zu-Ende verschlüsselt (TLS 1.3 / AES-256). Das System arbeitet streng nach IEC 62443 Industrial Security Standards.',
          category: 'Allgemein'
        },
        {
          q: 'Wie funktioniert die Anbindung an kaufmännische Systeme (z.B. Odoo)?',
          a: 'Das Artesia-System verfügt über standardisierte Webhook-Schnittstellen für den automatischen Abgleich der Kundenstammdaten mit Odoo CRM, Azure Cloud pipelines oder individuellen ERP-Systemen.',
          category: 'Einkauf'
        }
      ]
    },
    gf: {
      title: "SKALIERBARE OPERATIVE EXZELLENZ & ZEITGEWINN FÜR IHRE FERTIGUNG.",
      subtitle: "Lösen Sie den Engpass Fachkräftemangel in der SPS-Programmierung. Verwandeln Sie starre Software-Fixkosten in flexible Betriebsausgaben und steigern Sie Ihren Projektdurchsatz ohne linearen Personalaufbau.",
      secretTitle: "Das Geheimnis: Entlastung der Engpassressource & Know-How-Schutz",
      secretText1: "Bestehende Top-SPS-Programmierer verbringen unverhältnismäßig viel Zeit mit monotoner Copy-Paste-Routine statt mit wertschöpfender Problemlösung. Das bremst das Wachstum Ihres gesamten Unternehmens aus.",
      secretText2: "Artesia übernimmt Routine-Aktivitäten, schützt Ihr Maschinen- und Prozesswissen intern und ermöglicht Kollegen, bei ungeplanten Einsätzen nahtlos einzuspringen. So gewinnen Sie wertvolle Kapazitäten für beschleunigten Projektdurchsatz.",
      benefits: [
        "Maximale Skalierbarkeit & Durchsatzsteigerung ohne linearen Personalaufbau",
        "Entlastung der Engpassressource durch Vereinfachung von Basisaufgaben",
        "Lückenloser Know-How-Schutz: Maschinenwissen verbleibt streng intern",
        "Hohe Resilienz & Flexibilität bei ungeplanten Personalausfällen"
      ],
      faqs: [
        {
          q: "Wie hilft Artesia konkret beim Fachkräftemangel an SPS-Programmierern?",
          a: "Artesia vereinfacht Routine-Aufgaben und die Vorbereitung der Inbetriebnahme (IBN), sodass beispielsweise Elektriker oder Monteure den Handbetrieb vorarbeiten können. Ihre hochqualifizierten SPS-Entwickler kommen zur fertigen Anlage und schalten lediglich den Automatikbetrieb frei.",
          category: "Geschäftsführung"
        },
        {
          q: "Wie wirkt sich Artesia auf den Projektdurchsatz und Time-to-Market aus?",
          a: "Zeit ist der größte Hebel für Umsatzwachstum in der Automatisierungstechnik. Durch drastisch reduzierte Routine-Schleifen werden Inbetriebnahmen schneller abgeschlossen, Folgeprojekte können früher angenommen werden und Ihr Umsatz wächst entkoppelt vom Personalbestand.",
          category: "Geschäftsführung"
        },
        {
          q: "Wie bleibt unser wertvolles Maschinen- und Prozesswissen geschützt?",
          a: "Das System arbeitet mit standardisierter Basissoftware im eigenen Haus. Sämtliches Betriebs- und Prozesswissen verbleibt streng intern und fließt zu keinem Zeitpunkt an externe Dienstleister oder offene Schnittstellen ab.",
          category: "Geschäftsführung"
        },
        {
          q: "Warum ist das Pay-per-Use Modell betriebswirtschaftlich überlegen?",
          a: "Anstatt hohe Einmalkosten und Kapitalbindung für starre Softwarepakete einzugehen, die oft zu 80% ungenutzt bleiben, zahlen Sie flexibel und rein verbrauchsabhängig nach verarbeiteten Prozesssignalen. Das schont die Liquidität.",
          category: "Geschäftsführung"
        }
      ]
    },
    einkauf: {
      title: "KEINE FIXKOSTEN-FALLEN IN DER SOFTWARE-BESCHAFFUNG.",
      subtitle: "Maximale Kostentransparenz und schlanke kaufmännische Prozesse für den Einkauf. Zahlen Sie ausschließlich für tatsächlich verarbeitete SPS-Prozessdaten mit automatisiertem Buchhaltungs-Sync.",
      secretTitle: "Das Geheimnis: Volle Budgetkontrolle ohne Pauschalvertrags-Fallen",
      secretText1: "Herkömmliche Software-Abonnements zwingen den Einkauf in überteuerte Pauschalverträge und komplizierte Lizenzprüfungen. Die Folge sind unvorhersehbare Nachzahlungen und hoher administrativer Aufwand.",
      secretText2: "Artesia bietet eine zentrale Backend-Verwaltung mit schlanken Schnittstellen zu Odoo CRM, ERP und Finanzbuchhaltung. Sie erhalten exakte, prüfungsfeste Verbrauchsdaten für 100% nachvollziehbare Kosten.",
      benefits: [
        "Schlanke Schnittstellen zu ERP-, Buchhaltungs- und kaufmännischen Systemen",
        "Automatisierte Verbuchung und kaufmännische Abrechnungsworkflows",
        "Granulare Verbrauchs- und Lizenznachweise zur Vermeidung von Nachzahlungen",
        "Entlastung der Finanzverwaltung durch zentrale Backend-Administration"
      ],
      faqs: [
        {
          q: "Wie werden unvorhergesehene Nachlizenzierungen und Fixkosten-Fallen vermieden?",
          a: "Das Artesia Pay-per-Use Modell verzichtet vollständig auf starre Jahrespauschalen oder Mindestabnahmen. Das System liefert hochpräzise Nachweise über Datenvolumen, Bandbreite und Signalaufzeichnung, sodass Sie nur das bezahlen, was genutzt wurde.",
          category: "Einkauf"
        },
        {
          q: "Wie funktioniert die Anbindung an Buchhaltungs- und ERP-Systeme (z.B. Odoo)?",
          a: "Artesia verfügt über vordefinierte Webhook- und ERP-Schnittstellen. Verbrauchs- und Kundendaten können automatisiert an Odoo CRM, kaufmännische Systeme oder Azure-Cloud-Pipelines zur Direktverbuchung übergeben werden.",
          category: "Einkauf"
        },
        {
          q: "Welche Nachweise erhält der Einkauf für Rechnungsprüfungen?",
          a: "In der zentralen Verwaltung stehen granulare Berichte über Datenmengen und aufgezeichnete Parameter je Maschine oder Standort zur Verfügung, die transparent als PDF oder JSON exportiert werden können.",
          category: "Einkauf"
        },
        {
          q: "Wie aufwendig ist die Verwaltung bei mehreren Produktionsstandorten?",
          a: "Die Lizenz- und Datenverwaltung ist zentral gebündelt. Der Einkauf muss keine Vielzahl getrennter Softwarelizenzen mehr verwalten, was den administrativen Aufwand drastisch reduziert.",
          category: "Einkauf"
        }
      ]
    },
    programmierer: {
      title: "MINIMALISTISCHE SCHNITTSTELLEN & ENTLASTUNG IM SPS-ALLTAG.",
      subtitle: "Für Automatisierer und SPS-Programmierer. Werden Sie frei von monotonen Routineaufgaben, beschleunigen Sie Inbetriebnahmen und binden Sie SPS-Systeme performanceneutral an.",
      secretTitle: "Das Geheimnis: Der 'virtuelle Partner' für den SPS-Entwickler",
      secretText1: "SPS-Programmierer verbringen oft wertvolle Stunden mit Standard-Bausteinen, der Fehlersuche in komplexen Schnittstellen und langwierigen Inbetriebnahmen vor Ort.",
      secretText2: "Artesia fungiert als entlastender 'virtueller Partner': Die schreibgeschützte Architektur erfordert keinerlei Code-Änderungen in TIA-Portal oder TwinCAT. Monteure übernehmen den Handbetrieb – Sie schalten nur noch den Automatikbetrieb frei.",
      benefits: [
        "Minimalistische Schnittstellen-Architektur (OPC UA, Siemens S7, TwinCAT, Modbus)",
        "Entlastung bei der Inbetriebnahme (IBN) – Handbetrieb durch Monteure möglich",
        "Schreibgeschützte Kapselung – Null Beeinträchtigung der SPS-Echtzeitzykluszeit",
        "Schnelle, intuitive Fehlerlokalisierung in Prozessdaten ohne Herstellersupport-Wartezeiten"
      ],
      faqs: [
        {
          q: "Müssen bestehende SPS-Programme im TIA-Portal oder TwinCAT geändert werden?",
          a: "Nein. Artesia greift über eine gekapselte, schreibgeschützte Adapter-Architektur auf die Prozessdaten zu. Es sind keinerlei Änderungen an Bausteinen oder im SPS-Echtzeitcode erforderlich.",
          category: "Programmierer"
        },
        {
          q: "Wie entlastet Artesia den Programmierer konkret bei der Inbetriebnahme (IBN)?",
          a: "Der Handbetrieb und die E/A-Tests können im Vorfeld durch Elektriker oder Monteure durchgeführt werden. Der Programmierer kommt zur fertig vorbereiteten Anlage und nimmt lediglich den Automatikbetrieb in Betrieb.",
          category: "Programmierer"
        },
        {
          q: "Was passiert, wenn ein Kollege ungeplant in ein Projekt einsteigen muss?",
          a: "Durch die standardisierte Basissoftware und einheitliche Schnittstellenlogik können Kollegen ohne lange Einarbeitung verzögerungsfrei an laufenden Projekten weiterarbeiten.",
          category: "Programmierer"
        },
        {
          q: "Beeinflusst die Datenübertragung die Zykluszeit der SPS?",
          a: "Nein. Die Datenabfrage ist architektonisch entkoppelt und schreibgeschützt, sodass die Echtzeitperformance der Steuerung vollständig garantiert bleibt.",
          category: "Programmierer"
        }
      ]
    },
    endkunde: {
      title: "TRANSPARENTE PROZESSÜBERWACHUNG & LÜCKENLOSES TRACK & TRACE.",
      subtitle: "Lückenlose Transparenz für Ihren Maschinenpark. Erkennen Sie verborgene Anlagenpotenziale, reduzieren Sie Stillstandszeiten und sichern Sie höchste Zuverlässigkeit bei voller Liquiditätsschonung.",
      secretTitle: "Das Geheimnis: Echtzeit-Transparenz ohne SPS-Performance-Risiko",
      secretText1: "Anlagenbetreiber kämpfen oft mit intransparenten Prozessabläufen, ungeplanten Stillständen und teuren Software-Pauschalen, die kaum genutzt werden.",
      secretText2: "Artesia bietet tiefe Einblicke in operative Prozessdaten und Taktschwankungen. Die performanceneutrale Architektur garantiert höchste Stabilität, während das Pay-per-Use Modell Ihre betriebliche Liquidität schont.",
      benefits: [
        "Lückenloses Track & Trace und kontinuierliche Prozessbeobachtung in Echtzeit",
        "Aufdecken ungenutzter Anlagenpotenziale und Vorbeugung ungeplanter Ausfälle",
        "Performanceneutrale Datenanalyse ohne Stabilitätsrisiko für laufende Steuerungen",
        "Fairer Pay-per-Use Tarif – Schonung liquider Mittel für operative Kernaufgaben"
      ],
      faqs: [
        {
          q: "Beeinträchtigt die Prozessbeobachtung die Stabilität oder Geschwindigkeit unserer Anlagen?",
          a: "Nein. Die Tracking-Architektur arbeitet absolut schreibgeschützt und performanceneutral. Die Steuerung der Anlage läuft ungestört in gewohnter Geschwindigkeit weiter.",
          category: "Anlagenbetreiber"
        },
        {
          q: "Wie hilft Artesia beim Erkennen von Stillstandsursachen und Qualitätsschwankungen?",
          a: "Sämtliche relevante Prozesssignale werden kontinuierlich aufgezeichnet und visualisiert. Abweichungen im Takt oder fehlerhafte Prozessschritte lassen sich sofort lokalisieren.",
          category: "Anlagenbetreiber"
        },
        {
          q: "Warum schont das Pay-per-Use Modell die Liquidität unseres Betriebs?",
          a: "Anstatt hohes Kapital in starre Software-Lizenzen zu binden, bezahlen Sie rein nach verarbeitetem Datenvolumen. In Phasen geringerer Auslastung sinken die Softwarekosten automatisch mit.",
          category: "Anlagenbetreiber"
        },
        {
          q: "Wie schnell lässt sich das Artesia System in bestehenden Anlagen nachrüsten?",
          a: "Dank vorgefertigter Standardschnittstellen (OPC UA, Modbus, S7) erfolgt die Anbindung extrem zügig und ohne langwierige Betriebsunterbrechungen.",
          category: "Anlagenbetreiber"
        }
      ]
    }
  };

  const currentContent = personaContent[targetPersona] || personaContent.default;

  // Master List of Combined FAQs for the dedicated FAQ Subpage View
  const allFaqs = [
    ...personaContent.gf.faqs,
    ...personaContent.einkauf.faqs,
    ...personaContent.programmierer.faqs,
    ...personaContent.endkunde.faqs,
    ...personaContent.default.faqs.filter(f => !personaContent.gf.faqs.some(p => p.q === f.q))
  ];

  const filteredMasterFaqs = allFaqs.filter(item => {
    const matchesCategory = faqCategoryFilter === 'Alle' || item.category === faqCategoryFilter;
    const matchesSearch = faqSearchQuery === '' ||
      item.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim() && formData.company.trim()) {
      setStep(2);
      document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    const newLead = {
      id: `LEAD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: formData.name,
      email: formData.email,
      company: formData.company,
      paymentMethod: formData.paymentMethod,
      orderBump,
      targetPersona,
      status: 'Ready for Odoo / Azure Sync'
    };

    const updatedLeads = [newLead, ...savedLeads];
    setSavedLeads(updatedLeads);
    try {
      localStorage.setItem('artesia_customer_leads', JSON.stringify(updatedLeads));
    } catch (err) {
      console.error('Storage error', err);
    }

    setOrderComplete(true);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(''), 2500);
  };

  // High-Contrast, Softened Industrial Theme Style Variables
  const mainStyle = isDarkMode ? { backgroundColor: selectedDarkBg, color: '#f3f4f6' } : { backgroundColor: '#f8fafc', color: '#0f172a' };
  const borderColorClass = isDarkMode ? 'border-slate-700' : 'border-slate-300';
  const subtextColorClass = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const labelColorClass = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const cardBgClass = isDarkMode ? 'bg-slate-800/60' : 'bg-white shadow-xs';
  const primaryBtnClass = isDarkMode
    ? 'bg-slate-100 text-slate-900 font-bold py-5 px-10 uppercase tracking-[0.2em] text-lg transition-all duration-300 hover:bg-white active:scale-[0.98] text-center inline-block cursor-pointer rounded-lg shadow-md'
    : 'btn-primary';

  // High-Legibility Input Style with auto-clearing placeholder on click / focus (`focus:placeholder-transparent`)
  const inputClass = isDarkMode
    ? 'w-full p-4 border-2 border-slate-600 bg-slate-800 text-slate-100 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:placeholder-transparent rounded-md transition-all text-base'
    : 'w-full p-4 border-2 border-slate-400 bg-white text-slate-900 font-semibold placeholder:text-slate-500 focus:outline-none focus:border-slate-900 focus:placeholder-transparent rounded-md transition-all text-base';

  return (
    <div className={`min-h-screen transition-colors duration-300 relative pb-20 ${isDarkMode ? 'dark' : ''}`} style={mainStyle}>
      {/* PERSISTENT CONTEXTUAL FLOATING CTA BUTTON - VISIBLE ONLY WHEN INLINE CTAs ARE OUT OF VIEW */}
      {showFloatingCta && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3.5 px-5 py-2.5 rounded-full shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35)] border-2 border-emerald-500/40 bg-slate-950/95 text-slate-100 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono uppercase font-bold text-emerald-400 hidden md:inline shrink-0">
              Pay-per-Use • 0€ Grundgebühr
            </span>
          </div>

          <a
            href="#order-section"
            onClick={() => {
              if (activeView !== 'home') setActiveView('home');
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-black text-xs sm:text-sm uppercase tracking-wider px-5 py-2 rounded-full shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Jetzt Zugang sichern →
          </a>
        </div>
      )}

      {/* COMPACT DEV TOOLBAR */}
      <div className={`border-b text-[0.72rem] font-mono py-2 px-4 ${isDarkMode ? 'bg-slate-950/90 border-slate-800 text-slate-300' : 'bg-slate-900 text-slate-200 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto whitespace-nowrap gap-4 scrollbar-none">
          <div className="flex items-center space-x-3 shrink-0">
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 font-bold uppercase rounded-sm text-[0.65rem]">DEV TOOLBAR</span>
            <span className="opacity-70 hidden sm:inline">Persona Simulation:</span>

            <div className="flex items-center space-x-1">
              {[
                { key: 'default', label: 'Standard' },
                { key: 'gf', label: 'Geschäftsführung (?v=1)' },
                { key: 'einkauf', label: 'Einkauf (?v=2)' },
                { key: 'programmierer', label: 'Programmierer (?v=3)' },
                { key: 'endkunde', label: 'Endkunde (?v=4)' }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => {
                    setTargetPersona(p.key);
                    setActiveView('home');
                  }}
                  className={`px-2 py-0.5 rounded-sm cursor-pointer transition-colors text-[0.7rem] ${
                    targetPersona === p.key
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Discrete URL Link Generator Modal Button */}
            <button
              onClick={() => setShowStealthLinksModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-sm cursor-pointer transition-colors text-[0.7rem] font-bold"
            >
              🔗 Discrete Links Generator
            </button>

            {/* Odoo CRM Lead Sync Drawer Toggle */}
            <button
              onClick={() => setShowCrmDrawer(!showCrmDrawer)}
              className="bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-500/40 px-2 py-0.5 rounded-sm cursor-pointer transition-colors text-[0.7rem] font-bold"
            >
              📊 Odoo Leads ({savedLeads.length})
            </button>

            {/* Invert Dark/Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-2.5 py-0.5 rounded-sm cursor-pointer border border-slate-600 transition-colors text-[0.7rem] font-bold"
            >
              {isDarkMode ? '☀️ Mode: Soft Slate' : '🌙 Mode: Dark Industrial'}
            </button>

            {/* Dark Mode Background Selector */}
            {isDarkMode && (
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
                <span className="opacity-60 text-[0.65rem] uppercase">BG:</span>
                {darkBgOptions.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedDarkBg(bg.hex)}
                    className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform ${
                      selectedDarkBg === bg.hex ? 'scale-125 ring-2 ring-amber-400' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                    title={bg.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISCRETE LINK GENERATOR MODAL */}
      {showStealthLinksModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full p-6 border-2 rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-current">
              <h3 className="font-heading font-bold text-xl uppercase">🔗 Discrete Link Generator (Stealth Tracking)</h3>
              <button onClick={() => setShowStealthLinksModal(false)} className="text-xl font-mono font-bold cursor-pointer">✕</button>
            </div>
            <p className="text-xs font-mono mb-4 opacity-80 leading-relaxed">
              Verwenden Sie diese unverdächtigen Links mit neutralen Zahlenparametern (z.B. <code className="bg-amber-400/20 px-1 py-0.5 rounded">?v=1</code> für Geschäftsführung). Das System lädt automatisch die spezifische Landingpage-Variante und entfernt den Parameter nach 300ms aus der Adresszeile des Browsers.
            </p>

            <div className="space-y-3 font-mono text-xs mb-6">
              {[
                { label: 'Geschäftsführung (GF)', code: '?v=1', desc: 'Fokus: Fachkräftemangel, Zeitgewinn, Skalierbarkeit' },
                { label: 'Einkauf (Procurement)', code: '?v=2', desc: 'Fokus: Keine Fixkosten, schlanker Odoo-Sync' },
                { label: 'Programmierer / Entwickler', code: '?v=3', desc: 'Fokus: Minimalistische Schnittstelle, TIA-Portal Entlastung' },
                { label: 'Endkunde / Betreiber', code: '?v=4', desc: 'Fokus: Transparentes Monitoring, Track & Trace' },
              ].map((item, idx) => {
                const fullUrl = `${window.location.origin}${window.location.pathname}${item.code}`;
                return (
                  <div key={idx} className={`p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <div className="font-bold text-amber-500">{item.label}</div>
                      <div className="opacity-70 text-[0.7rem]">{item.desc}</div>
                      <div className="font-semibold text-blue-500 dark:text-blue-400 mt-1">{fullUrl}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(fullUrl, item.label)}
                      className="px-3 py-1.5 bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900 font-bold uppercase rounded text-[0.68rem] cursor-pointer shrink-0 hover:opacity-80"
                    >
                      Kopieren
                    </button>
                  </div>
                );
              })}
            </div>

            {copiedNotification && (
              <div className="p-2 bg-green-500 text-slate-950 font-mono text-xs font-bold rounded mb-4 text-center animate-pulse">
                ✓ Link für "{copiedNotification}" in die Zwischenablage kopiert!
              </div>
            )}

            <div className="text-right">
              <button
                onClick={() => setShowStealthLinksModal(false)}
                className="px-4 py-2 border-2 border-current font-mono text-xs font-bold uppercase rounded-lg cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ODOO CRM LEAD DRAWER */}
      {showCrmDrawer && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex justify-end">
          <div className={`w-full max-w-lg h-full p-6 border-l-2 overflow-y-auto ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-current">
              <div>
                <h3 className="font-heading font-bold text-xl">ODOO CRM LEAD STORAGE</h3>
                <p className="text-xs font-mono opacity-60">Erfasste Kundenanfragen ({savedLeads.length})</p>
              </div>
              <button onClick={() => setShowCrmDrawer(false)} className="text-xl font-mono font-bold cursor-pointer">✕</button>
            </div>

            {savedLeads.length === 0 ? (
              <p className="text-xs font-mono opacity-60 italic py-8 text-center">Noch keine Leads vorhanden. Füllen Sie das Registrierungsformular aus.</p>
            ) : (
              <div className="space-y-4">
                {savedLeads.map((lead) => (
                  <div key={lead.id} className={`p-4 border-2 font-mono text-xs rounded-lg space-y-2 ${isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-300 bg-slate-50'}`}>
                    <div className="flex justify-between font-bold text-amber-500">
                      <span>{lead.company}</span>
                      <span className="text-[0.65rem] opacity-60">{new Date(lead.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div><strong className="opacity-70">Name:</strong> {lead.name}</div>
                    <div><strong className="opacity-70">E-Mail:</strong> {lead.email}</div>
                    <div><strong className="opacity-70">Abrechnung:</strong> {lead.paymentMethod}</div>
                    <div><strong className="opacity-70">Zielgruppe Persona:</strong> <span className="uppercase text-blue-500 dark:text-blue-400 font-bold">{lead.targetPersona}</span></div>
                    <div><strong className="opacity-70">Erweiterte Historie (+19€):</strong> {lead.orderBump ? 'JA' : 'NEIN'}</div>
                    <div className="pt-2 border-t border-current/20 flex justify-between items-center">
                      <span className="text-[0.65rem] bg-green-500/20 text-green-600 dark:text-green-400 font-bold px-2 py-0.5 rounded">{lead.status}</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(lead, null, 2), lead.company)}
                        className="text-[0.65rem] underline cursor-pointer"
                      >
                        JSON Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DATA PRIVACY INFO MODAL */}
      {showDataInfoModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 border-2 rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}>
            <h3 className="font-heading font-bold text-lg mb-3">🛡️ Datensicherheit & Odoo Integration</h3>
            <p className="text-xs font-mono leading-relaxed mb-4 opacity-80 space-y-2">
              <span>Ihre eingegebenen Registrierungsdaten werden verschlüsselt gespeichert und direkt zur automatischen Kundenstamm-Erstellung an kaufmännische Backend-Systeme (Odoo CRM / Azure Cloud) übermittelt.</span>
              <br /><br />
              <span>Es werden keine Daten an unbefugte Dritte weitergegeben. Die Datenverarbeitung erfolgt streng DSGVO-konform.</span>
            </p>
            <button
              onClick={() => setShowDataInfoModal(false)}
              className="w-full py-2 bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900 font-mono text-xs font-bold uppercase rounded-lg cursor-pointer"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <header className={`border-b-2 py-6 mb-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          {/* Top-Left Logo rendered in Blade Runner Font & Clickable to Return Home */}
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center space-x-3 cursor-pointer group text-left transition-transform active:scale-95"
            title="Zurück zur Startseite"
          >
            <span className="font-logo text-3xl sm:text-4xl tracking-widest uppercase hover:opacity-80 transition-opacity">
              ARTESIA
            </span>
          </button>

          {/* Subpage Nav Links */}
          <nav className="flex items-center space-x-6 text-xs font-mono uppercase tracking-widest flex-wrap gap-y-2">
            <button
              onClick={() => setActiveView('pricing')}
              className={`hover:underline cursor-pointer ${activeView === 'pricing' ? 'font-bold underline' : 'opacity-70'}`}
            >
              Preismodelle
            </button>
            <button
              onClick={() => setActiveView('faq')}
              className={`hover:underline cursor-pointer ${activeView === 'faq' ? 'font-bold underline' : 'opacity-70'}`}
            >
              FAQ & Wissen
            </button>
            <button
              onClick={() => setActiveView('docs')}
              className={`hover:underline cursor-pointer ${activeView === 'docs' ? 'font-bold underline' : 'opacity-70'}`}
            >
              Dokumentation
            </button>
            <button
              onClick={() => setActiveView('about')}
              className={`hover:underline cursor-pointer ${activeView === 'about' ? 'font-bold underline' : 'opacity-70'}`}
            >
              Über uns
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="max-w-4xl mx-auto px-6">
        {activeView === 'home' && (
          <>
            {/* ABOVE THE FOLD: Emotional Persona-Tailored Headline */}
            <section className="pt-6 pb-10">
              <h1 className="text-[2.2rem] sm:text-[3.2rem] md:text-[3.8rem] font-heading font-black leading-[1.08] tracking-tight mb-6">
                {currentContent.title}
              </h1>

              <p className={`text-lg md:text-xl mb-8 max-w-3xl leading-relaxed font-normal ${subtextColorClass}`}>
                {currentContent.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  id="hero-cta"
                  href="#order-section"
                  className={primaryBtnClass}
                >
                  Jetzt Zugang sichern
                </a>
                <span className="text-xs font-mono uppercase text-red-500 font-bold tracking-wider animate-pulse">
                  ⚡ Nur noch 3 Onboarding-Kapazitäten diesen Monat
                </span>
              </div>
            </section>

            {/* Divider */}
            <div className={`w-full h-px mb-12 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

            {/* CURIOSITY & "DAS GEHEIMNIS" (Russell Brunson Secret Teaser) */}
            <section className={`mb-16 border-2 ${borderColorClass} p-6 sm:p-8 ${cardBgClass} rounded-xl`}>
              <h3 className="text-2xl font-heading font-bold mb-4">
                {currentContent.secretTitle}
              </h3>
              <p className={`text-base leading-relaxed ${subtextColorClass} mb-4`}>
                {currentContent.secretText1}
              </p>
              <p className={`text-base leading-relaxed ${subtextColorClass}`}>
                {currentContent.secretText2}
              </p>
            </section>

            {/* LOGIC & PROOFS: Benefits */}
            <section className="mb-16 space-y-12">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">Ihre Vorteile auf einen Blick</h3>
                <ul className="space-y-5">
                  {currentContent.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className={`mr-4 mt-1 p-1 shrink-0 ${isDarkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'} rounded-md`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-lg font-medium pt-0.5">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Interactive Pay-per-Use Calculator Section */}
            <section className={`mb-16 border-2 ${borderColorClass} p-6 sm:p-8 ${cardBgClass} rounded-xl`}>
              <div className={`flex items-center justify-between mb-6 border-b pb-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                <h3 className="text-2xl font-heading font-bold">Pay-Per-Use Rechner</h3>
                <span className={`text-xs font-mono uppercase px-2.5 py-1 font-bold rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-900'}`}>
                  Echtzeit-Kostenvergleich
                </span>
              </div>

              <p className={`text-sm mb-6 ${subtextColorClass}`}>
                Ermitteln Sie Ihre geschätzte monatliche Ersparnis mit dem Artesia Pay-per-Use Modell gegenüber herkömmlichen starren Jahreslizenzen.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Anzahl verbundener SPS / Maschinen:</span>
                      <span className="font-mono text-base">{machines} Maschinen</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={machines}
                      onChange={(e) => setMachines(Number(e.target.value))}
                      className={`w-full h-2 rounded-none cursor-pointer ${isDarkMode ? 'accent-slate-100 bg-slate-700' : 'accent-slate-900 bg-slate-300'}`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Abtastrate (Signale / Sekunde):</span>
                      <span className="font-mono text-base">{dataFrequency} Signale/s</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="5"
                      value={dataFrequency}
                      onChange={(e) => setDataFrequency(Number(e.target.value))}
                      className={`w-full h-2 rounded-none cursor-pointer ${isDarkMode ? 'accent-slate-100 bg-slate-700' : 'accent-slate-900 bg-slate-300'}`}
                    />
                  </div>
                </div>

                <div className={`p-6 flex flex-col justify-between border-2 rounded-xl ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-900 text-slate-100 border-slate-900'}`}>
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-400">
                      Geschätzte Ersparnis pro Monat
                    </span>
                    <div className="text-4xl font-heading font-bold mt-2 text-green-400">
                      ~ {monthlySavings.toLocaleString('de-DE')} €
                    </div>
                    <div className="text-xs mt-1 text-slate-400">
                      Vergleich: {legacyLicenseCost.toLocaleString('de-DE')} € (Fix-Lizenz) vs. {payPerUseCost} € (Artesia Pay-per-Use)
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-[0.75rem] border-slate-800 text-slate-400">
                    * Basiert auf durchschnittlicher Auslastung von 8h/Tag. Abrechnung erfolgt genau nach Nutzung.
                  </div>
                </div>
              </div>
            </section>

            {/* VALUE STACK & BONI (Russell Brunson Framework) */}
            <section className="mb-16 border-2 border-slate-900 p-6 sm:p-8 bg-slate-900 text-slate-100 shadow-xl rounded-xl">
              <h3 className="text-2xl font-heading font-bold mb-2 uppercase">
                🎁 Exklusives Onboarding-Paket
              </h3>
              <p className="text-xs font-mono uppercase text-slate-400 mb-6">
                Bei heutigen Zugangsanforderung kostenlos enthalten:
              </p>

              <div className="space-y-4 font-mono text-xs border-y border-slate-800 py-6 my-6">
                <div className="flex justify-between items-center">
                  <span>✓ Bonus #1: TIA-Portal & OPC UA Schnellstart-Gateway</span>
                  <span className="font-bold text-green-400">490 € Wert</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>✓ Bonus #2: Live SLA-Latenz & Protokoll-Analyse</span>
                  <span className="font-bold text-green-400">650 € Wert</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>✓ Bonus #3: Persönlicher 1-on-1 Onboarding-Ingenieur</span>
                  <span className="font-bold text-green-400">750 € Wert</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-heading font-bold text-lg sm:text-xl pt-2">
                <span>GESAMTWERT: <span className="line-through text-red-400">1.890 €</span></span>
                <span className="text-green-400 text-2xl uppercase">HEUTE 0 €</span>
              </div>
            </section>

            {/* Interactive Architecture Selector */}
            <section className={`mb-16 border-2 ${borderColorClass} p-6 sm:p-8 rounded-xl`}>
              <h3 className="text-2xl font-heading font-bold mb-2">Schnittstellen-Kompatibilität</h3>
              <p className={`text-sm mb-6 ${subtextColorClass}`}>Wählen Sie Ihr Industrieprotokoll zur Überprüfung der Anbindungsparameter:</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {Object.keys(protocols).map((key) => {
                  const isActive = selectedProtocol === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedProtocol(key)}
                      className={`p-3 text-xs font-mono font-bold uppercase transition-colors border-2 cursor-pointer rounded-lg ${
                        isActive
                          ? (isDarkMode ? 'bg-slate-100 text-slate-900 border-slate-100' : 'bg-slate-900 text-slate-100 border-slate-900')
                          : (isDarkMode ? 'bg-transparent text-slate-200 border-slate-700 hover:border-slate-500' : 'bg-white text-slate-900 border-slate-300 hover:border-slate-900')
                      }`}
                    >
                      {key.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              <div className={`p-5 font-mono text-xs space-y-2 border-l-4 rounded-r-lg ${isDarkMode ? 'bg-slate-800/80 border-slate-400' : 'bg-slate-100 border-slate-900'}`}>
                <div className={`flex justify-between border-b pb-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Protokoll Name:</span>
                  <span className="font-bold">{protocols[selectedProtocol].name}</span>
                </div>
                <div className={`flex justify-between border-b pb-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Latenz-Prozesswert:</span>
                  <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{protocols[selectedProtocol].latency}</span>
                </div>
                <div className={`flex justify-between border-b pb-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Payload Format:</span>
                  <span className="font-bold">{protocols[selectedProtocol].payload}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Integration:</span>
                  <span className="font-bold">{protocols[selectedProtocol].setup}</span>
                </div>
              </div>
            </section>

            {/* RISIKOREDUKTION / GARANTIE BADGE */}
            <section className={`mb-16 border-2 ${borderColorClass} p-6 sm:p-8 text-center space-y-3 ${cardBgClass} rounded-xl`}>
              <div className="inline-block p-3 bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900 font-mono font-bold text-sm uppercase rounded-lg">
                🛡️ 100% Risikofrei-Garantie
              </div>
              <h3 className="text-xl font-heading font-bold">Keine Bindung. Keine Grundgebühr. Monatlich kündbar.</h3>
              <p className={`text-sm max-w-xl mx-auto ${subtextColorClass}`}>
                Testen Sie Artesia völlig ohne Risiko. Wenn Sie das System nicht mehr nutzen, fallen automatisch 0 € Kosten an.
              </p>
            </section>

            {/* Persona Specific FAQ Accordion */}
            <section className="mb-16">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h3 className="text-2xl font-heading font-bold">Häufig Gestellte Fragen</h3>
                <button
                  onClick={() => setActiveView('faq')}
                  className="text-xs font-mono uppercase underline font-bold cursor-pointer hover:opacity-80"
                >
                  Alle FAQs & Filter anzeigen →
                </button>
              </div>
              <div className="space-y-4">
                {currentContent.faqs.map((faq, idx) => (
                  <div key={idx} className={`border-2 ${borderColorClass} rounded-lg overflow-hidden`}>
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className={`w-full text-left p-4 font-bold flex justify-between items-center transition-colors cursor-pointer ${
                        isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                      <span className="font-mono text-xl shrink-0">{openFaq === idx ? '-' : '+'}</span>
                    </button>
                    {openFaq === idx && (
                      <div className={`p-4 border-t-2 ${borderColorClass} ${isDarkMode ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-800'} text-sm leading-relaxed`}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Divider 2 */}
            <div className={`w-full h-1 mb-16 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

            {/* Order Header Section */}
            <section id="order-section" className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-3 uppercase tracking-tight">
                ZUGANG SICHERN
              </h2>
              <p className={`text-base sm:text-lg ${subtextColorClass}`}>
                Zwei Schritte. Transparentes Pay-per-Use. Jederzeit nachvollziehbar.
              </p>
            </section>

            {/* Form Container with REQUIRED Company Name & Info Modal Toggle */}
            <section className="max-w-2xl mb-24">
              {orderComplete ? (
                <div className={`border-2 p-8 text-center space-y-4 rounded-xl ${
                  isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-900 bg-slate-900 text-slate-100'
                }`}>
                  <div className="inline-block p-3 font-mono font-bold text-xl mb-2 rounded-lg bg-emerald-500 text-slate-950">
                    ✓ ANFRAGE EMPFANGEN & GESPEICHERT
                  </div>
                  <h3 className="text-2xl font-heading font-bold">Vielen Dank, {formData.name}!</h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Ihre Anforderung für den Artesia System-Zugang von <strong className="underline">{formData.company}</strong> wurde erfolgreich verarbeitet. Wir haben die Zugangsdaten und die Schnittstellen-Konfiguration an <strong className="underline">{formData.email}</strong> versendet.
                  </p>
                  <button
                    onClick={() => {
                      setOrderComplete(false);
                      setStep(1);
                    }}
                    className="mt-6 border-2 border-slate-100 px-6 py-3 text-xs uppercase font-mono transition-colors cursor-pointer rounded-lg text-slate-100 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Neue Anfrage starten
                  </button>
                </div>
              ) : (
                <div className={`border-2 ${borderColorClass} p-6 sm:p-8 ${cardBgClass} rounded-xl`}>
                  {/* Step indicator */}
                  <div className={`flex items-center justify-between mb-6 pb-4 border-b text-xs font-mono uppercase ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 font-bold rounded-md ${
                        step === 1
                          ? (isDarkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100')
                          : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700')
                      }`}>
                        Schritt 1: Kontaktdaten
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-3 py-1 font-bold rounded-md ${
                        step === 2
                          ? (isDarkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100')
                          : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700')
                      }`}>
                        Schritt 2: Abrechnung
                      </span>
                    </div>

                    {/* Info Icon Button explaining Data Handling */}
                    <button
                      type="button"
                      onClick={() => setShowDataInfoModal(true)}
                      className="flex items-center space-x-1 font-bold hover:underline cursor-pointer text-blue-500 dark:text-blue-400"
                      title="Informationen zur Datenverarbeitung"
                    >
                      <span className="w-5 h-5 rounded-full border-2 border-current inline-flex items-center justify-center text-[0.7rem] font-bold">i</span>
                      <span className="hidden sm:inline">Datenschutz Info</span>
                    </button>
                  </div>

                  {step === 1 ? (
                    <form onSubmit={handleNext} className="space-y-5">
                      <div>
                        <label className={`block text-xs font-bold uppercase mb-1.5 font-mono ${labelColorClass}`}>
                          Vollständiger Name *
                        </label>
                        <input
                          required
                          type="text"
                          name="name"
                          placeholder="z.B. Markus Weber"
                          className={inputClass}
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase mb-1.5 font-mono ${labelColorClass}`}>
                          Firmen-E-Mail (Nur Firmen-E-Mails erlaubt) *
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          placeholder="m.weber@unternehmen.de"
                          className={inputClass}
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        {/* Company Name REQUIRED Field */}
                        <label className={`block text-xs font-bold uppercase mb-1.5 font-mono ${labelColorClass}`}>
                          Firmenname / Werk Standort *
                        </label>
                        <input
                          required
                          type="text"
                          name="company"
                          placeholder="z.B. Automations GmbH München"
                          className={inputClass}
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </div>
                      <button
                        id="step1-submit"
                        type="submit"
                        className={`w-full mt-2 ${primaryBtnClass}`}
                      >
                        Weiter zu Schritt 2
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                      {/* Payment Method Selector */}
                      <div>
                        <label className={`block text-xs font-bold uppercase mb-2 font-mono ${labelColorClass}`}>
                          Abrechnungsmethode wählen
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, paymentMethod: 'card' }))}
                            className={`p-3 text-xs font-bold font-mono border-2 uppercase cursor-pointer rounded-md ${
                              formData.paymentMethod === 'card'
                                ? (isDarkMode ? 'border-slate-100 bg-slate-100 text-slate-900' : 'border-slate-900 bg-slate-900 text-slate-100')
                                : (isDarkMode ? 'border-slate-700 text-slate-200 hover:border-slate-500' : 'border-slate-300 bg-white text-slate-900 hover:border-slate-900')
                            }`}
                          >
                            Kreditkarte
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, paymentMethod: 'sepa' }))}
                            className={`p-3 text-xs font-bold font-mono border-2 uppercase cursor-pointer rounded-md ${
                              formData.paymentMethod === 'sepa'
                                ? (isDarkMode ? 'border-slate-100 bg-slate-100 text-slate-900' : 'border-slate-900 bg-slate-900 text-slate-100')
                                : (isDarkMode ? 'border-slate-700 text-slate-200 hover:border-slate-500' : 'border-slate-300 bg-white text-slate-900 hover:border-slate-900')
                            }`}
                          >
                            SEPA-Lastschrift
                          </button>
                        </div>

                        {formData.paymentMethod === 'card' ? (
                          <div className="space-y-3">
                            <input
                              required
                              type="text"
                              name="cardNumber"
                              placeholder="Kreditkartennummer"
                              className={inputClass}
                              value={formData.cardNumber}
                              onChange={handleChange}
                            />
                            <div className="flex space-x-3">
                              <input
                                required
                                type="text"
                                name="expiry"
                                placeholder="MM / JJ"
                                className={inputClass}
                                value={formData.expiry}
                                onChange={handleChange}
                              />
                              <input
                                required
                                type="text"
                                name="cvc"
                                placeholder="CVC"
                                className={inputClass}
                                value={formData.cvc}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              required
                              type="text"
                              name="iban"
                              placeholder="DE00 0000 0000 0000 0000 00"
                              className={inputClass}
                              value={formData.iban}
                              onChange={handleChange}
                            />
                          </div>
                        )}
                      </div>

                      {/* Order Bump Box */}
                      <div className={`border-2 p-5 sm:p-6 rounded-lg ${isDarkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-300 bg-slate-100'}`}>
                        <label className="flex items-start cursor-pointer group">
                          <div className="relative flex items-center mt-0.5">
                            <input
                              type="checkbox"
                              checked={orderBump}
                              onChange={(e) => setOrderBump(e.target.checked)}
                              className={`peer h-6 w-6 cursor-pointer appearance-none border-2 bg-transparent checked:bg-current transition-all rounded-sm ${borderColorClass}`}
                            />
                            <svg className={`absolute left-1 h-4 w-4 opacity-0 peer-checked:opacity-100 transition-opacity ${isDarkMode ? 'text-slate-900' : 'text-slate-100'}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="ml-4 text-sm sm:text-base font-bold uppercase leading-snug">
                            JA, aktiviere erweiterte Daten-Historie! Speichern Sie Ihre SPS-Daten dauerhaft zur Langzeitauswertung für nur 19€/Monat extra.
                          </span>
                        </label>
                      </div>

                      {/* Summary */}
                      <div className={`p-4 font-mono text-xs space-y-1 border-l-4 rounded-r-md ${isDarkMode ? 'bg-slate-800/60 border-slate-400' : 'bg-slate-100 border-slate-900'}`}>
                        <div className="flex justify-between">
                          <span>Kunde / Firma:</span>
                          <span className="font-bold">{formData.company}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Einrichtung Artesia System:</span>
                          <span className="font-bold">0,00 €</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Abrechnungsmodus:</span>
                          <span className="font-bold">Pay-per-Use (Monatlich)</span>
                        </div>
                        {orderBump && (
                          <div className="flex justify-between font-bold text-green-500">
                            <span>Erweiterte Daten-Historie:</span>
                            <span>19,00 € / Monat</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className={`w-full ${primaryBtnClass}`}
                      >
                        Jetzt kostenfrei aktivieren
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-center text-xs font-mono uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity py-2 cursor-pointer"
                      >
                        ← Zurück zu Schritt 1
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* Subpage View: Dedicated Master Combined FAQ Page */}
        {activeView === 'faq' && (
          <section className="py-8 space-y-8">
            <div className={`border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className="text-xs font-mono uppercase opacity-60">[ZENTRALE WISSENSDATENBANK]</span>
              <h2 className="text-3xl font-heading font-bold mt-1">Häufig Gestellte Fragen (FAQ)</h2>
              <p className={`text-sm mt-2 ${subtextColorClass}`}>
                Alle Fragen & Antworten geordnet nach Zielgruppen und Fachbereichen (Geschäftsführung, Einkauf, Programmierer, Anlagenbetreiber).
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="FAQ durchsuchen (z.B. Lizenz, TIA-Portal, Odoo, DSGVO)..."
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    className={inputClass}
                  />
                  <span className="absolute left-3.5 top-4 opacity-50 text-sm">🔍</span>
                  {faqSearchQuery && (
                    <button
                      onClick={() => setFaqSearchQuery('')}
                      className="absolute right-3.5 top-3.5 opacity-60 hover:opacity-100 font-mono text-xs cursor-pointer bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['Alle', 'Geschäftsführung', 'Einkauf', 'Programmierer', 'Anlagenbetreiber', 'Allgemein'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-md border-2 cursor-pointer transition-colors whitespace-nowrap ${
                      faqCategoryFilter === cat
                        ? (isDarkMode ? 'bg-slate-100 text-slate-900 border-slate-100' : 'bg-slate-900 text-slate-100 border-slate-900')
                        : (isDarkMode ? 'border-slate-700 hover:border-slate-500 text-slate-300' : 'border-slate-300 hover:border-slate-900 text-slate-700')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Master FAQ List */}
            <div className="space-y-4">
              {filteredMasterFaqs.length === 0 ? (
                <div className={`p-8 text-center border-2 ${borderColorClass} rounded-xl font-mono text-sm opacity-60`}>
                  Keine Ergebnisse für "{faqSearchQuery}" in Kategorie "{faqCategoryFilter}" gefunden.
                </div>
              ) : (
                filteredMasterFaqs.map((faq, idx) => (
                  <div key={idx} className={`border-2 ${borderColorClass} rounded-lg overflow-hidden`}>
                    <button
                      onClick={() => setOpenMasterFaq(openMasterFaq === idx ? null : idx)}
                      className={`w-full text-left p-4 font-bold flex justify-between items-center transition-colors cursor-pointer ${
                        isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pr-4">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 uppercase bg-amber-400 text-slate-950 rounded shrink-0 self-start sm:self-auto">
                          {faq.category}
                        </span>
                        <span className="text-base sm:text-lg">{faq.q}</span>
                      </div>
                      <span className="font-mono text-xl shrink-0">{openMasterFaq === idx ? '-' : '+'}</span>
                    </button>
                    {openMasterFaq === idx && (
                      <div className={`p-4 border-t-2 ${borderColorClass} ${isDarkMode ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-800'} text-sm leading-relaxed`}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="text-xs font-mono uppercase underline cursor-pointer pt-4 block"
            >
              ← Zurück zur Hauptseite
            </button>
          </section>
        )}

        {/* Subpage View: Preismodelle (Refined, Uniform Typography & Layout) */}
        {activeView === 'pricing' && (
          <section className="py-8 space-y-8">
            <div className={`border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className="text-xs font-mono uppercase opacity-60">[TRANSPARENTE ABRECHNUNG]</span>
              <h2 className="text-3xl font-heading font-bold mt-1">Preismodelle & Pay-per-Use Tarife</h2>
              <p className={`text-sm mt-2 ${subtextColorClass}`}>
                Zahlen Sie nur für die tatsächlich übertragenen SPS-Prozesssignale. Keine starren Lizenzverträge, keine versteckten Fixkosten.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Card 1: Starter */}
              <div className={`p-6 border-2 ${borderColorClass} ${cardBgClass} rounded-xl flex flex-col justify-between space-y-6`}>
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Einstieg</div>
                  <h3 className="font-heading font-bold text-xl mb-2">Starter Pay-per-Use</h3>
                  <p className={`text-xs ${subtextColorClass} mb-4 font-body`}>Ideal für kleine Teststände & Pilot-Projekte.</p>

                  <div className="text-3xl font-heading font-bold mb-1">0 €</div>
                  <div className="text-xs font-mono opacity-60 mb-6">Monatliche Grundgebühr</div>

                  <ul className="text-xs font-mono space-y-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Bis zu 3 SPS-Schnittstellen</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Abrechnung exakt nach Datenmenge</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Standard-Latenz (&lt; 5ms)</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> SSL / TLS 1.3 Verschlüsselung</li>
                  </ul>
                </div>

                <a
                  href="#order-section"
                  onClick={() => setActiveView('home')}
                  className={`w-full py-3 text-center text-xs font-mono uppercase font-bold border-2 ${borderColorClass} rounded-lg hover:bg-slate-900 hover:text-slate-100 transition-colors`}
                >
                  Jetzt starten
                </a>
              </div>

              {/* Card 2: Professional (Highlighted) */}
              <div className={`p-6 border-2 border-emerald-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl flex flex-col justify-between space-y-6 relative shadow-lg`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-mono text-[0.65rem] font-bold uppercase px-3 py-0.5 rounded-full tracking-wider">
                  Empfohlen für Fertiger
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-emerald-500 font-bold mb-2 pt-1">Produktion</div>
                  <h3 className="font-heading font-bold text-xl mb-2">Professional Industrial</h3>
                  <p className={`text-xs ${subtextColorClass} mb-4 font-body`}>Für Serienfertiger, Maschinenbauer & Werksstandorte.</p>

                  <div className="text-3xl font-heading font-bold mb-1 text-emerald-500">Pay-per-Use</div>
                  <div className="text-xs font-mono opacity-60 mb-6">Transparente Signalabrechnung</div>

                  <ul className="text-xs font-mono space-y-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Unbegrenzte SPS-Schnittstellen</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> OPC UA, S7, TwinCAT & Modbus</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> High-Speed Latenz (&lt; 1.8ms)</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Automatische Odoo & ERP Verbuchung</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Priorisierter Technischer Support</li>
                  </ul>
                </div>

                <a
                  href="#order-section"
                  onClick={() => setActiveView('home')}
                  className="w-full py-3 text-center text-xs font-mono uppercase font-bold bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  Pay-per-Use Aktivieren
                </a>
              </div>

              {/* Card 3: Enterprise */}
              <div className={`p-6 border-2 ${borderColorClass} ${cardBgClass} rounded-xl flex flex-col justify-between space-y-6`}>
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Skalierung</div>
                  <h3 className="font-heading font-bold text-xl mb-2">Enterprise Custom</h3>
                  <p className={`text-xs ${subtextColorClass} mb-4 font-body`}>Für Konzerne, Mehrmaschinen-Parks & On-Premise.</p>

                  <div className="text-3xl font-heading font-bold mb-1">Auf Anfrage</div>
                  <div className="text-xs font-mono opacity-60 mb-6">Maßgeschneiderter Vertrag</div>

                  <ul className="text-xs font-mono space-y-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Dedicated Azure Cloud Pipeline</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> On-Premise Gateway Server Option</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> Individuelle SLA Vereinbarungen</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2 font-bold">✓</span> 24/7 Dedicated Inbetriebnahmeteam</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setActiveView('home');
                    setTimeout(() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className={`w-full py-3 text-center text-xs font-mono uppercase font-bold border-2 ${borderColorClass} rounded-lg hover:bg-slate-900 hover:text-slate-100 transition-colors cursor-pointer`}
                >
                  Individuell Anfragen
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="text-xs font-mono uppercase underline cursor-pointer pt-4 block"
            >
              ← Zurück zur Hauptseite
            </button>
          </section>
        )}

        {/* Subpage View: Wissensdatenbank / Dokumentation */}
        {activeView === 'docs' && (
          <section className="py-8 space-y-8">
            <div className={`border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className="text-xs font-mono uppercase opacity-60">[ENTWICKLER & SCHNITTSTELLEN]</span>
              <h2 className="text-3xl font-heading font-bold mt-1">Wissensdatenbank & Schnittstellen-Dokumentation</h2>
              <p className={`text-sm mt-2 ${subtextColorClass}`}>
                Anwendungsorientierte Handbücher, TIA-Portal Integration und API-Spezifikationen.
              </p>
            </div>

            <div className={`p-6 border-2 ${borderColorClass} ${cardBgClass} space-y-4 rounded-xl`}>
              <div className="space-y-4 text-sm leading-relaxed opacity-90">
                <p className="font-body">
                  Hier finden Entwickler und Automatisierungsingenieure anwendungsorientierte Dokumentationen, TIA-Portal Anbindungshilfen und API-Spezifikationen.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className={`p-4 border ${borderColorClass} font-mono text-xs rounded-lg`}>
                    <strong className="block text-sm mb-1">📄 Schnellstart-Anleitung TIA Portal V17 / V18</strong>
                    <p className="opacity-70">Schritt-für-Schritt Einrichtung ohne Programmcode-Änderung.</p>
                  </div>
                  <div className={`p-4 border ${borderColorClass} font-mono text-xs rounded-lg`}>
                    <strong className="block text-sm mb-1">📄 OPC UA Security Best Practices</strong>
                    <p className="opacity-70">Zertifikatsverwaltung und Verschlüsselungsstandards.</p>
                  </div>
                  <div className={`p-4 border ${borderColorClass} font-mono text-xs rounded-lg`}>
                    <strong className="block text-sm mb-1">📄 Odoo CRM & ERP Sync Spec</strong>
                    <p className="opacity-70">Schnittstellendokumentation für automatisierte Kundenbuchung.</p>
                  </div>
                  <div className={`p-4 border ${borderColorClass} font-mono text-xs rounded-lg`}>
                    <strong className="block text-sm mb-1">📄 Beckhoff TwinCAT ADS Adapter Guide</strong>
                    <p className="opacity-70">High-Speed Symbol-Streaming Konfiguration.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="text-xs font-mono uppercase underline cursor-pointer"
            >
              ← Zurück zur Hauptseite
            </button>
          </section>
        )}

        {/* Subpage View: Über uns */}
        {activeView === 'about' && (
          <section className="py-8 space-y-8">
            <div className={`border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className="text-xs font-mono uppercase opacity-60">[UNSERE MISSION]</span>
              <h2 className="text-3xl font-heading font-bold mt-1">Über Artesia Automation</h2>
            </div>

            <div className={`p-6 border-2 ${borderColorClass} ${cardBgClass} space-y-4 rounded-xl`}>
              <div className="text-sm leading-relaxed opacity-90 space-y-4 font-body">
                <p>
                  Artesia entwickelt moderne, hochmoderne Software-Architekturen zur SPS-Prozessbeobachtung in der industriellen Fertigung. Unser Ziel ist die Befreiung produzierender Unternehmen von starren, überteuerten Software-Lizenzen.
                </p>
                <p>
                  Durch minimalistische, schreibgeschützte Schnittstellen bieten wir volle Prozesstransparenz und entlasten qualifizierte SPS-Entwickler von monotonen Routineaufgaben.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="text-xs font-mono uppercase underline cursor-pointer"
            >
              ← Zurück zur Hauptseite
            </button>
          </section>
        )}

        {/* Subpage View: Impressum */}
        {activeView === 'impressum' && (
          <section className="py-8 space-y-8">
            <div className={`border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className="text-xs font-mono uppercase opacity-60">[RECHTLICHES]</span>
              <h2 className="text-3xl font-heading font-bold mt-1">Impressum</h2>
            </div>

            <div className={`p-6 border-2 ${borderColorClass} ${cardBgClass} space-y-4 rounded-xl`}>
              <div className="text-xs font-mono space-y-2 opacity-90">
                <p className="font-bold text-sm">Artesia Automation GmbH</p>
                <p>Industriestraße 100, D-80331 München</p>
                <p>Vertreten durch die Geschäftsführung</p>
                <p>E-Mail: kontakt@artesia-automation.de</p>
                <p>Handelsregister: HRB 000000 | Amtsgericht München</p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="text-xs font-mono uppercase underline cursor-pointer"
            >
              ← Zurück zur Hauptseite
            </button>
          </section>
        )}

        {/* Subpage View: Datenschutz */}
        {activeView === 'datenschutz' && (
          <section className="py-8 space-y-8">
            <div className={`border-b-2 pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className="text-xs font-mono uppercase opacity-60">[RECHTLICHES]</span>
              <h2 className="text-3xl font-heading font-bold mt-1">Datenschutzerklärung</h2>
            </div>

            <div className={`p-6 border-2 ${borderColorClass} ${cardBgClass} space-y-4 rounded-xl`}>
              <div className="text-xs font-mono space-y-3 opacity-90 leading-relaxed">
                <p><strong>1. Datenschutz auf einen Blick:</strong> Sämtliche übertragene SPS-Anlagendaten werden ausschließlich Ende-zu-Ende verschlüsselt verarbeitet.</p>
                <p><strong>2. Erhebung von Kundendaten:</strong> Es werden nur geschäftliche E-Mail-Adressen und Firmennamen für den Registrierungsprozess verarbeitet.</p>
                <p><strong>3. Keine Datenweitergabe:</strong> Ihre Daten werden ausschließlich zur Auftragsabwicklung und Systembereitstellung genutzt.</p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="text-xs font-mono uppercase underline cursor-pointer"
            >
              ← Zurück zur Hauptseite
            </button>
          </section>
        )}
      </main>

      <footer className={`border-t-2 py-12 mt-16 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-300 bg-slate-900 text-slate-100'}`}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-xs font-mono uppercase tracking-widest gap-4">
          <div className="flex items-center space-x-4">
            <span>Artesia System • SPS-Prozessbeobachtung</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveView('faq')} className="hover:underline cursor-pointer">FAQ</button>
            <button onClick={() => setActiveView('impressum')} className="hover:underline cursor-pointer">Impressum</button>
            <button onClick={() => setActiveView('datenschutz')} className="hover:underline cursor-pointer">Datenschutz</button>
            <span>© 2026 ARTESIA AUTOMATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
