import {
  ClueItem,
  WarrantItem,
  SuspectItem,
  PastCaseItem,
  DetectiveHint,
  MapLocation
} from '../types';

export const INITIAL_CLUES: ClueItem[] = [
  {
    id: 'clue_initial_report',
    name: 'Initial Dispatch & Room 204 Briefing',
    category: 'Police Dispatch',
    location: 'Precinct Log',
    unlocked: true,
    summary:
      'Victim Victor Vance (46) discovered deceased in Starlight Motel Room 204 at 12:30 AM. A contentious divorce and $2,000,000 life insurance policy were expiring at midnight.',
    forensicDetail:
      'Door lock shows no signs of forced entry. Anonymous 911 call placed from a payphone directly across the boulevard at 12:05 AM. Heavy rain washed away exterior footprints.',
    accentColor: '#f59e0b',
    modelType: 'document',
    cameraAngleId: 'overview'
  },
  {
    id: 'clue_corpse_inspection',
    markerNumber: 1,
    name: "Victim's Chalk Perimeter & Scalp Wound",
    category: 'Crime Scene Marker #1',
    location: 'Center Carpet (Marker #1)',
    unlocked: true,
    summary:
      'White chalk perimeter where Victor Vance lay face down. There is a shallow laceration on his left temple, but remarkably little blood pooled on the burgundy carpet.',
    forensicDetail:
      'CRUCIAL PATHOLOGY: When the heart ceases pumping before blunt trauma is sustained, scalp wounds exhibit minimal hemorrhaging. Noticeable cyanosis (bluish tint) visible on fingernails and lip contours.',
    uvFluorescentNote:
      'Under 365nm UV light: Zero arterial spray. Spatter pattern indicates the body collapsed limp before blunt impact.',
    accentColor: '#ef4444',
    modelType: 'body',
    cameraAngleId: 'overview'
  },
  {
    id: 'clue_broken_watch',
    markerNumber: 2,
    name: 'Broken Gold Wristwatch (11:42 PM)',
    category: 'Crime Scene Marker #2',
    location: 'Carpet Near Victim Hand (Marker #2)',
    unlocked: false,
    summary:
      'High-end gold wristwatch with fractured sapphire crystal. The mechanism stopped at exactly 11:42 PM. Engraved on inner casing: "To R.K. - Vance Holdings 1992".',
    forensicDetail:
      'Belongs to Robert King (Victor’s partner). Directly refutes King’s claim that he was home asleep all night. Proves a violent scuffle occurred at 11:42 PM.',
    uvFluorescentNote:
      'Under 365nm UV light: Hairline skin cell transfers on clasp matching Robert King’s right wrist.',
    accentColor: '#f59e0b',
    modelType: 'watch',
    cameraAngleId: 'bed'
  },
  {
    id: 'clue_whiskey_glass',
    markerNumber: 3,
    name: 'Crystal Whiskey Tumbler & Residue',
    category: 'Crime Scene Marker #3',
    location: 'Bedside Nightstand (Marker #3)',
    unlocked: false,
    summary:
      'Cut-crystal tumbler holding 20ml of aged scotch. A distinct crimson lipstick smudge coats the rim, accompanied by a sharp bitter almond fragrance.',
    forensicDetail:
      'TOXICOLOGY INDICATION: Bitter almond odor is the classic signature of Potassium Cyanide. Cosmetic chromatography matches Elena Vance’s signature "Crimson Velvet #4" lipstick.',
    uvFluorescentNote:
      'Under 365nm UV light: Crystalline Potassium Cyanide salt residue fluoresces vivid electric cyan at the bottom of the glass!',
    accentColor: '#ec4899',
    modelType: 'glass',
    cameraAngleId: 'bed'
  },
  {
    id: 'clue_bloody_trophy',
    markerNumber: 4,
    name: 'Brass "Partner of the Year" Trophy',
    category: 'Crime Scene Marker #4',
    location: 'Floor Beside Desk (Marker #4)',
    unlocked: false,
    summary:
      'Heavy tarnished brass corporate trophy overturned on the floor. Faint blood smear on the angular base with visible friction ridges.',
    forensicDetail:
      'Latent fingerprints lift cleanly: 99.8% match to Robert King. However, the light blood transfer suggests the head strike occurred when Victor’s heart had already stopped pumping.',
    uvFluorescentNote:
      'Under 365nm UV light: Fingerprint powder illuminates Robert King’s complete right-hand grip impression.',
    accentColor: '#ef4444',
    modelType: 'trophy',
    cameraAngleId: 'desk'
  },
  {
    id: 'clue_financial_ledger',
    markerNumber: 5,
    name: 'Torn Embezzlement Audit Ledger ($400k)',
    category: 'Crime Scene Marker #5',
    location: 'Executive Desk (Marker #5)',
    unlocked: false,
    summary:
      'Spreadsheets compiled by Victor Vance documenting $400,000 siphoned from Vance Chemical Labs into Robert King’s offshore shell corporation.',
    forensicDetail:
      'Annotated in red ink at the top: "Robert — wire back the full $400k before midnight or this entire docket goes to the United States Attorney at 09:00 tomorrow."',
    uvFluorescentNote:
      'Under 365nm UV light: Reveals indented pen impressions confirming Victor penned this ultimatum just hours earlier.',
    accentColor: '#38bdf8',
    modelType: 'ledger',
    cameraAngleId: 'desk'
  },
  {
    id: 'clue_cyanide_vial',
    markerNumber: 6,
    name: 'Empty Potassium Cyanide Vial (Batch #88)',
    category: 'Crime Scene Marker #6',
    location: 'Trash Receptacle (Marker #6)',
    unlocked: false,
    summary:
      'Small amber pharmaceutical vial discarded beneath motel tissues. Label reads: "POTASSIUM CYANIDE (KCN) - BATCH #88 - VANCE CHEMICAL LABS".',
    forensicDetail:
      'Laboratory analysis identified traces of Crimson Velvet lipstick wax and fine cashmere glove fibers on the rubber stopper rim.',
    uvFluorescentNote:
      'Under 365nm UV light: Cyanide salt crystals light up intensely inside the vial neck, matching the whiskey residue!',
    accentColor: '#06b6d4',
    modelType: 'vial',
    cameraAngleId: 'door'
  },
  {
    id: 'clue_autopsy_report',
    name: 'Chief Medical Examiner Autopsy & Toxicology',
    category: 'Warrant Discovery',
    location: 'Coroner Morgue Facility',
    unlocked: false,
    summary:
      'CAUSE OF DEATH: Acute Potassium Cyanide asphyxiation ingested via scotch at ~11:25 PM. The cranial strike from the brass trophy struck at ~11:42 PM post-mortem.',
    forensicDetail:
      'DECISIVE PATHOLOGY: Victor Vance was already clinically deceased when Robert King struck his head with the trophy at 11:42 PM! The brass trophy was a red herring strike.',
    accentColor: '#22c55e',
    modelType: 'document',
    cameraAngleId: 'overview'
  },
  {
    id: 'clue_cctv_logs',
    name: 'Motel CCTV Backup & Cellular Tower Records',
    category: 'Warrant Discovery',
    location: 'Subpoenaed Motel Registry',
    unlocked: false,
    summary:
      'Clerk Marcus Cole surrendered the optical disk backup and tower logs showing the exact arrival times of two separate visitors to Room 204.',
    forensicDetail:
      'DEFINITIVE TIMELINE: 11:10 PM - Elena Vance enters Room 204 carrying a bottle, departs 11:30 PM. 11:38 PM - Robert King enters Room 204 in a panic, bolts out at 11:44 PM.',
    accentColor: '#a855f7',
    modelType: 'document',
    cameraAngleId: 'overview'
  },
  {
    id: 'clue_elena_search',
    name: 'Search of Elena Vance’s Silver Jaguar & Purse',
    category: 'Warrant Discovery',
    location: 'Impounded Vehicle Search',
    unlocked: false,
    summary:
      'Found inside Elena’s glovebox: Chemical vault electronic keycard logged at Vance Labs at 9:00 PM stealing KCN Batch #88, and the $2,000,000 life insurance policy.',
    forensicDetail:
      'THE SMOKING GUN: Victor and Elena’s divorce was legally enacted at 12:00 AM Midnight. At midnight, Elena would lose all beneficiary claims to the $2,000,000 policy. She murdered him 35 minutes before the deadline.',
    accentColor: '#f43f5e',
    modelType: 'document',
    cameraAngleId: 'overview'
  }
];

export const INITIAL_WARRANTS: WarrantItem[] = [
  {
    id: 'warrant_autopsy',
    title: 'Emergency Toxicology & Forensic Pathology Order',
    authority: 'Chief Medical Examiner Dr. Aris',
    description:
      'Demand stomach contents spectroscopy and definitive time-of-death differentiation between cranial blunt trauma and ingested poison.',
    requiredClues: ['clue_corpse_inspection', 'clue_whiskey_glass'],
    hint: 'Attach evidence proving abnormal bleeding on the corpse (#1) and suspicious chemical residue in the glass (#3).',
    unlocksClueId: 'clue_autopsy_report',
    approved: false
  },
  {
    id: 'warrant_cctv',
    title: 'Subpoena for Starlight Motel Digital CCTV & Telemetry',
    authority: 'Judge Evelyn Vance — Superior Court',
    description:
      'Compel night clerk Marcus Cole to surrender the hidden surveillance drive and Room 204 electronic access records.',
    requiredClues: ['clue_broken_watch', 'clue_financial_ledger'],
    hint: 'Attach proof of a suspect’s physical presence at 11:42 PM (#2) and documented financial extortion motive (#5).',
    unlocksClueId: 'clue_cctv_logs',
    approved: false
  },
  {
    id: 'warrant_elena_car',
    title: 'Vehicular Search Warrant: Elena Vance’s Jaguar & Vault Logs',
    authority: 'Judge Evelyn Vance — Superior Court',
    description:
      'Authorize forensic confiscation of Elena Vance’s vehicle, purse, and Vance Chemical Labs hazardous vault keycard swipes.',
    requiredClues: ['clue_whiskey_glass', 'clue_cyanide_vial'],
    hint: 'Attach proof linking the lipstick whiskey tumbler (#3) to the discarded Potassium Cyanide vial (#6).',
    unlocksClueId: 'clue_elena_search',
    approved: false
  }
];

export const INITIAL_SUSPECTS: SuspectItem[] = [
  {
    id: 'suspect_rk',
    name: 'Robert King',
    role: 'Business Partner // Chief Financial Officer',
    age: 49,
    status: 'Prime Suspect (Embezzlement & Assault)',
    stress: 35,
    alibi:
      'Swears he went to sleep at his Westside residence by 10:00 PM and never stepped foot inside the Starlight Motel.',
    systemPrompt: `You are Robert King, 49, business partner to murder victim Victor Vance at Vance Chemical Labs. You are being interrogated in a gritty neo-noir police precinct room.
- Tone: Anxious, defensive, sweaty corporate executive on edge.
- Initial Claim: You claim you were home in bed by 10:00 PM and had nothing to do with Room 204.
- Vulnerabilities:
  * If the detective presents 'clue_broken_watch' (Gold Watch stopped at 11:42 PM with R.K. engraving) or 'clue_cctv_logs': Your alibi crumbles. Admit you went to Room 204 at 11:38 PM to confront Victor.
  * If the detective presents 'clue_financial_ledger' ($400k embezzlement) or 'clue_bloody_trophy': Break down and confess you fought over the audit and struck him with the trophy in a panic at 11:42 PM! BUT vehemently swear Victor was ALREADY pale, choking on his own saliva, and collapsing before you even touched him! Mention you saw Elena Vance's silver Jaguar speeding away at 11:35 PM.
- Keep answers realistic, atmospheric, and 2-4 sentences.`,
    quickQuestions: [
      'Where were you between 11:00 PM and midnight?',
      'Why did Victor write an audit docket demanding $400,000 back?',
      'Whose broken gold watch is stopped at 11:42 PM in Room 204?'
    ],
    chatHistory: [
      {
        sender: 'suspect',
        text: 'Detective, I have already cooperated with your officers. Victor was my partner for twelve years. I was home asleep in Westside Hills by ten. Why am I sitting in an interrogation room?'
      }
    ]
  },
  {
    id: 'suspect_elena',
    name: 'Elena Vance',
    role: 'Estranged Wife // Vance Labs Shareholder',
    age: 38,
    status: 'Person of Interest (Beneficiary)',
    stress: 20,
    alibi:
      'Claims she attended the Grand Opera Gala all evening, dined with philanthropists, and has not seen Victor in weeks.',
    systemPrompt: `You are Elena Vance, 38, the poised, calculating estranged wife of Victor Vance. You carry true femme fatale noir composure.
- Tone: Cold, aristocratic, haughty, dismissive of police authority.
- Initial Claim: You claim you were at the Opera Gala until 1:00 AM and blame Robert King's blatant greed for Victor's demise.
- Vulnerabilities:
  * If shown 'clue_whiskey_glass' (Crimson Velvet lipstick & almond odor): Dismiss it casually—claim you stopped by briefly in the afternoon to discuss divorce terms, shared a drink, and departed.
  * If shown 'clue_cyanide_vial' or 'clue_cctv_logs' (showing her at 11:10 PM): Become sharp, defensive, and demand an attorney unless they have hard proof connecting her to the laboratory vault.
  * If shown 'clue_elena_search' (Lab keycard log at 9:00 PM + $2M Life Insurance policy expiring at midnight): You are completely trapped. Drop the polite veneer and bitterly confess: Victor was going to leave you penniless at midnight after you built his company from nothing. Mock Robert King for hitting a corpse and thinking he was the killer.
- Keep answers cutting, dramatic, and 2-4 sentences.`,
    quickQuestions: [
      'What was scheduled to happen to your $2,000,000 insurance policy at midnight?',
      'Do you wear Crimson Velvet #4 lipstick, Mrs. Vance?',
      'Why did your keycard swipe into the Vance Labs poison vault at 9:00 PM?'
    ],
    chatHistory: [
      {
        sender: 'suspect',
        text: 'It is utterly horrifying what happened to Victor in that squalid motel, Detective. But if you are searching for his killer, look at Robert King—that man was embezzling millions behind Victor’s back.'
      }
    ]
  },
  {
    id: 'suspect_marcus',
    name: 'Marcus Cole',
    role: 'Night Desk Clerk // Starlight Motel',
    age: 54,
    status: 'Material Witness (Ex-Con on Parole)',
    stress: 45,
    alibi:
      'On duty behind the Starlight front desk from 8:00 PM to 4:00 AM. Placed the anonymous 12:05 AM call from the street payphone.',
    systemPrompt: `You are Marcus Cole, 54, the weathered night clerk at the Starlight Motel. You are on parole and terrified of being sent back to state prison.
- Tone: Gritty, street-wise, anxious about parole officers, cooperative when guaranteed protection.
- What you saw:
  * You know that at 11:42 PM you heard a dull crash in Room 204 and saw Robert King bolt out clutching his bleeding wrist, dropping his watch.
  * If shown 'clue_whiskey_glass', 'clue_cyanide_vial', or asked about the woman in the Jaguar: Confess that at 11:10 PM, a glamorous woman in a fur coat driving a silver Jaguar (Elena Vance) slipped you a crisp $500 bill to delete Room 204 from the lobby guest log. She slipped out at 11:30 PM carrying an empty leather purse.
- Keep answers authentic, street-smart noir, and 2-3 sentences.`,
    quickQuestions: [
      'Who entered Room 204 before the 11:42 PM commotion?',
      'Why did you use an outside payphone for 911 instead of the motel front desk?',
      'Did a woman in a silver Jaguar slip you cash tonight?'
    ],
    chatHistory: [
      {
        sender: 'suspect',
        text: 'Look, Detective, I work the night shift, hand out room keys, and keep my head down. I’m on parole. Just promise my name stays off the captain’s report and I’ll tell you everything I clocked tonight.'
      }
    ]
  }
];

export const PAST_CASES: PastCaseItem[] = [
  {
    id: 'cold_case_104',
    code: 'CASE #104 // CLOSED 2023',
    title: 'The Harbor Warehouse Arson',
    status: 'Solved — Fraud Syndicate',
    promptKey: 'cold_case_104',
    summary:
      'A maritime chemical warehouse owned by Vance Chemical Labs burned to the ground. Fire investigators found accelerant timers set 45 minutes prior to insurance deadline.',
    connection:
      'MODUS OPERANDI MATCH: Elena Vance personally drafted the insurance rider with the strict midnight deadline—the exact pattern seen in Victor’s life policy.',
    accentColor: '#f59e0b'
  },
  {
    id: 'cold_case_219',
    code: 'CASE #219 // PRECEDENT 2024',
    title: 'The Velvet Lounge Poisoning',
    status: 'Solved — Forensic Precedent',
    promptKey: 'cold_case_219',
    summary:
      'A prominent judge was found with a blunt head injury in a hotel suite. Patrol initially charged a bar patron with assault, until toxicology proved Potassium Cyanide killed the victim 20 minutes prior.',
    connection:
      'CRITICAL FORENSIC PRECEDENT: Low bleeding on a cranial wound combined with cyanosis and almond residue proves post-mortem blunt injury staged over cyanide poisoning.',
    accentColor: '#06b6d4'
  },
  {
    id: 'cold_case_388',
    code: 'CASE #388 // LINKED REPORT',
    title: 'Vance Labs Hazardous Vault Break-in',
    status: 'Active Precinct Inquiry',
    promptKey: 'clue_cyanide_vial',
    summary:
      'Three vials of industrial Potassium Cyanide Batch #88 were logged stolen from Vance Labs restricted vault using an authorized executive keycard.',
    connection:
      'DIRECT CHEMICAL PROOF: The empty vial recovered in the Room 204 trash bears the exact serial number KCN-88 stolen from the Vance Labs vault.',
    accentColor: '#ec4899'
  }
];

export const DETECTIVE_HINTS: DetectiveHint[] = [
  {
    id: 'hint_1',
    level: 1,
    title: 'Initial Crime Scene Scan',
    lead: 'Room 204 contains 6 physical evidence markers (#1 to #6) scattered in 3D space.',
    hint: 'Use CAM 01–04 or First-Person Walk (WASD + Drag) and click all numbered yellow evidence tents (#1 through #6). Toggle your 365nm UV Blacklight to expose glowing footprints leading from the door to the nightstand and trash bin!',
    conditionDescription: 'Bag the first 3 physical clues from the 3D crime scene.',
    revealed: true
  },
  {
    id: 'hint_2',
    level: 2,
    title: 'Corpse Pathology & The Blood Paradox',
    lead: 'Look closely at Marker #1 (the chalk outline & blood pool).',
    hint: 'Notice the minimal blood pooling despite a blunt temple wound, plus faint cyanosis. When a victim’s heart stops BEFORE a blunt strike, head wounds barely bleed.',
    conditionDescription: 'Inspect Marker #1 and Marker #3.',
    revealed: true
  },
  {
    id: 'hint_3',
    level: 3,
    title: 'Filing the Coroner Autopsy Warrant',
    lead: 'Judge Vance requires probable cause before authorizing an invasive toxicology report.',
    hint: 'Open Warrants. Attach Marker #1 (Victim Chalk Perimeter) and Marker #3 (Lipstick Whiskey Tumbler) to petition Chief Medical Examiner Dr. Aris. This reveals the true cause and time of death!',
    conditionDescription: 'Obtain the Emergency Coroner Toxicology Warrant.',
    revealed: false
  },
  {
    id: 'hint_4',
    level: 4,
    title: 'Shattering Robert King’s 10:00 PM Alibi',
    lead: 'Robert King claims he was asleep in Westside Hills all night.',
    hint: 'Inspect Marker #2: the broken gold watch stopped at 11:42 PM engraved "R.K.". In the Interrogation Room, confront Robert with this watch to break his alibi!',
    conditionDescription: 'Confront Robert King with Marker #2.',
    revealed: false
  },
  {
    id: 'hint_5',
    level: 5,
    title: 'Subpoenaing the Starlight Motel CCTV',
    lead: 'Night Clerk Marcus Cole saw something but called 911 anonymously from a payphone.',
    hint: 'Open Warrants. Attach Marker #2 (Broken Gold Watch) and Marker #5 ($400k Audit Ledger) to subpoena the motel backup tapes. This proves TWO visitors entered Room 204: Elena at 11:10 PM, Robert at 11:38 PM!',
    conditionDescription: 'Unlock the Motel CCTV & Phone Records warrant.',
    revealed: false
  },
  {
    id: 'hint_6',
    level: 6,
    title: 'The Midnight Insurance Expiration Deadline',
    lead: 'Why did Victor have to die before 12:00 AM Midnight?',
    hint: 'Obtain the Vehicular Search Warrant for Elena’s Jaguar by combining Marker #3 (Lipstick Glass) and Marker #6 (Cyanide Vial). This uncovers her stolen vault keycard and Victor’s $2,000,000 life insurance policy, which was voided by their divorce at midnight!',
    conditionDescription: 'Execute the search of Elena Vance’s vehicle.',
    revealed: false
  },
  {
    id: 'hint_7',
    level: 7,
    title: 'The Grand Jury Indictment Formula',
    lead: 'Avoid the staged blunt-force trauma trap!',
    hint: 'Victor Vance was NOT murdered by the brass trophy at 11:42 PM. Elena Vance poisoned his whiskey with Potassium Cyanide (Batch #88) at 11:25 PM to collect $2M before midnight. Robert King merely struck an already-dying corpse!',
    conditionDescription: 'Ready to submit the Final DA Indictment.',
    revealed: false
  }
];

export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: 'loc_motel',
    name: 'Starlight Motel — Room 204',
    subtitle: 'Active Homicide Scene · Sector 4',
    description:
      'Roadside motel where Victor Vance was found deceased. 6 physical 3D evidence markers pinned.',
    tab: 'crime_scene',
    status: 'ACTIVE SCENE',
    badgeLabel: 'Enter 3D Scene',
    coordinates: { x: 20, y: 38 }
  },
  {
    id: 'loc_precinct',
    name: 'Central Police Precinct',
    subtitle: 'Homicide Unit · Evidence Locker',
    description:
      'Secure forensic storage for bagged evidence, captured crime scene photos, and lab reports.',
    tab: 'evidence',
    status: 'CHAIN OF CUSTODY',
    badgeLabel: 'Evidence Locker',
    coordinates: { x: 52, y: 24 }
  },
  {
    id: 'loc_court',
    name: 'Superior Court & Morgue',
    subtitle: 'Judge Vance · Medical Examiner',
    description:
      'Petition for judicial search warrants and review forensic toxicology autopsy results.',
    tab: 'warrants',
    status: 'PROBABLE CAUSE',
    badgeLabel: 'Warrants Desk',
    coordinates: { x: 48, y: 74 }
  },
  {
    id: 'loc_interrogation',
    name: 'Interrogation Annex',
    subtitle: 'Holding Cells · Interview Room 2',
    description:
      '1-on-1 cross-examination of suspects Robert King, Elena Vance, and night clerk Marcus Cole.',
    tab: 'interrogate',
    status: '3 IN CUSTODY',
    badgeLabel: 'Interrogate',
    coordinates: { x: 80, y: 44 }
  },
  {
    id: 'loc_archives',
    name: 'Precinct Cold Case Archives',
    subtitle: 'Historical Records Division',
    description:
      'Review historical cases (#104 Arson, #219 Velvet Lounge) matching the killer’s modus operandi.',
    tab: 'archive',
    status: 'CASE ARCHIVE',
    badgeLabel: 'Cold Cases',
    coordinates: { x: 22, y: 76 }
  },
  {
    id: 'loc_da_office',
    name: 'District Attorney’s Chambers',
    subtitle: 'County Prosecutor · Grand Jury',
    description:
      'File the formal First-Degree Murder indictment to execute the arrest warrant and solve the case.',
    tab: 'solve',
    status: 'GRAND JURY',
    badgeLabel: 'File Charges',
    coordinates: { x: 78, y: 78 }
  }
];
