/**
 * English.
 *
 * OFFICIAL TERMS STAY IN PORTUGUESE, everywhere, in every language. "Vale
 * Cirurgia", "Nota de Transferência", "Gabinete do Utente", "SNS 24" are what
 * is printed on the letter the person receives and what the clerk at the desk
 * will recognise. Translating them would send the user asking for something
 * that does not exist. Each is glossed in English on first use.
 */

module.exports = {
  code: 'en',
  name: 'English',

  status: {
    dentro_do_prazo: 'Within the legal time limit',
    transferencia_devida: 'You are already entitled to a transfer',
    prazo_ultrapassado: 'The legal time limit has been exceeded',
  },

  careType: {
    csp: 'Primary care (health centre)',
    primeira_consulta: 'First hospital specialist appointment',
    cirurgia: 'Scheduled surgery or procedure',
    mcdt: 'Diagnostic test',
  },

  condition: {
    geral: 'Non-oncological, non-cardiac condition',
    oncologica: 'Cancer',
    cardiaca: 'Heart disease',
  },

  priority: {
    muito_prioritaria: 'Very high priority',
    prioritaria: 'High priority',
    normal: 'Normal',
    doenca_aguda: 'Acute illness',
    sem_doenca_aguda: 'Non-acute',
    sem_doenca_aguda_referenciado: 'Non-acute (referred)',
    renovacao_medicacao_cronica: 'Repeat prescription, chronic condition',
    relatorios_referenciacao: 'Reports and referral letters',
    consulta_domicilio: 'Home visit',
    cateterismo_cardiaco: 'Cardiac catheterisation',
    pacemaker_cardiaco: 'Cardiac pacemaker',
    endoscopia_gastrenterologica: 'Gastrointestinal endoscopy',
    medicina_nuclear: 'Nuclear medicine',
    tac: 'CT scan',
    ressonancia_magnetica: 'MRI scan',
    angiografia_diagnostica: 'Diagnostic angiography',
    radioterapia: 'Radiotherapy',
  },

  units: {
    hours: 'hours',
    business: 'working days',
    calendar: 'calendar days',
  },

  entitlements: {
    vale_cirurgia_primeiro: {
      title: 'Vale Cirurgia / Nota de Transferência (surgery voucher)',
      summary:
        'You have passed {percent}% of the maximum waiting time. The vale cirurgia ' +
        'must be issued automatically.',
      whatItMeans:
        'The Nota de Transferência lets you choose another PUBLIC hospital from the ' +
        'list you are sent. The Vale Cirurgia lets you choose between public, ' +
        'private and social-sector hospitals. Either way, the surgery is performed ' +
        'at NO additional cost to you. Keep the Portuguese names: that is how the ' +
        'documents are labelled and how hospital staff will know what you mean.',
      steps: [
        'Check your e-mail and postal mail. The document is sent automatically, digitally whenever you gave the hospital your e-mail address.',
        'If nothing arrived, contact the Gabinete do Utente (patient office) of your original hospital and ask for the status of your listing and for the voucher to be issued.',
        'With the voucher in hand, compare the hospitals on the list by distance and travel time. Count on four round trips, not one: pre-operative appointment, surgery, discharge and follow-up.',
        'Call the hospital you chose and give the voucher number, printed in the top right corner of the document.',
        'Keep written confirmation that the hospital accepted the transfer, then wait for your date.',
      ],
      warnings: [
        'Refusing the voucher keeps your place on the original hospital list but does not make the surgery any sooner. More than half of all vouchers issued end up refused.',
        'Once the destination hospital confirms, you cannot switch hospitals again unless that hospital seriously fails you.',
      ],
    },

    vale_cirurgia_segundo: {
      title: 'Second Vale Cirurgia / Nota de Transferência',
      summary:
        'You have passed 100% of the maximum waiting time. A second vale cirurgia ' +
        'must be issued automatically.',
      whatItMeans:
        'Up to two vouchers are issued automatically: the first when you reach the ' +
        'transfer threshold, the second once the maximum waiting time runs out ' +
        'completely. The conditions are the same as for the first.',
      steps: [
        'Ask the Gabinete do Utente whether the second voucher has already been issued.',
        'If it has not, request it in writing, quoting the date of the first voucher.',
        'Choose the destination hospital and call them with the voucher number.',
      ],
      warnings: [
        'Once both automatic vouchers are used up, a third has to be requested by you or by your original hospital.',
      ],
    },

    vale_cirurgia_terceiro: {
      title: 'Request an additional Vale Cirurgia',
      summary:
        'Only two vouchers are issued automatically. A third can be requested by ' +
        'you or by your original hospital.',
      whatItMeans:
        'If you have already received two vouchers and still have no surgery date, ' +
        'you can explicitly request another one rather than waiting for an ' +
        'automatic issue that will not come.',
      steps: [
        'Send a written request to the Gabinete do Utente of your original hospital asking for a new vale cirurgia.',
        'Quote the dates of the previous vouchers and the total time waited since surgery was indicated.',
        'Ask for a receipt of your request and keep it.',
      ],
      warnings: [],
    },

    diretiva_transfronteirica: {
      title: 'Treatment in another EU country (Directive 2011/24/EU)',
      summary:
        'With the maximum waiting time exceeded, you have a strong case for prior ' +
        'authorisation to be treated in another EU country, reimbursed by the ' +
        'Portuguese state.',
      whatItMeans:
        'You can request {careType} in another Member State. The rule is that your ' +
        'country of affiliation must, in principle, grant prior authorisation when ' +
        'the care cannot be provided within a medically justifiable time. ' +
        'Reimbursement is owed up to what Portugal would have paid had the care ' +
        'been given here, and never above the actual cost. It also covers private ' +
        'providers in the treating country.',
      steps: [
        'Ask your doctor for a clinical report documenting that you need the care and that Portugal cannot deliver it within a medically useful time. This is the decisive document.',
        'Submit the Pedido de Autorização Prévia (prior authorisation request) in the SNS Área do Cidadão, under "Contacto com Unidades de Saúde" › "Mobilidade de Doentes".',
        'Attach proof of the date you were put on the waiting list and of the maximum waiting time that applies.',
        'Ask the foreign provider for a written quote before you travel: reimbursement is capped at the Portuguese tariff, so the difference is yours to pay.',
        'Keep every original invoice and report for the reimbursement claim.',
      ],
      warnings: [
        'This route is for PLANNED care. It does not cover emergencies during a temporary stay abroad; the European Health Insurance Card covers those.',
        'Prior authorisation can be refused if the authority believes it can deliver the care within a clinically justifiable time. That is why the clinical report matters so much.',
        'Use of this Directive has historically been very low in Portugal, and the health regulator identified public ignorance of the right as one of the causes. Be persistent and put everything in writing.',
      ],
    },

    reclamacao_ers: {
      title: 'Complaint to the health regulator (ERS)',
      summary:
        'Missing the maximum waiting time is grounds for a complaint. The ERS ' +
        'monitors this and can open proceedings against the provider.',
      whatItMeans:
        'A formal complaint creates a documentary record of the breach. That is ' +
        'useful both to push the hospital and as evidence for a request under ' +
        'Directive 2011/24/EU.',
      steps: [
        'File a complaint through the Livro de Reclamações Eletrónico (electronic complaints book) or directly on the ERS portal.',
        'Name the hospital, the specialty, the date of the request or surgical indication, and the maximum waiting time that applies.',
        'Attach anything proving the listing date and the absence of an appointment.',
        'Keep the complaint number. It is your proof that you acted.',
      ],
      warnings: [],
    },

    revisao_prioridade: {
      title: 'Ask for your clinical priority to be reassessed',
      summary:
        'Your priority level sets the maximum waiting time. If your condition has ' +
        'worsened, the priority can be revised and the limit shortens.',
      whatItMeans:
        'Moving from "normal" to "high priority" can cut the limit for general ' +
        'surgery from 180 days to 30. Reassessment is a clinical act: you have to ' +
        'ask a doctor for it.',
      steps: [
        'Book an appointment with the doctor who listed you and describe concretely how the symptoms have progressed and how they affect your daily life.',
        'Ask for the priority reassessment to be recorded in your clinical file.',
        'If the priority changes, confirm with the Gabinete do Utente that the time limit has been recalculated.',
      ],
      warnings: [
        'Priority is a clinical decision. This application cannot change it or estimate it.',
      ],
    },

    acompanhamento_gabinete_utente: {
      title: 'What to do in the meantime',
      summary:
        'You are still within the legal limit. {daysRemaining} days remain before ' +
        'it expires ({dueDate}).',
      whatItMeans:
        'No transfer right is active yet. It is worth making sure your contact ' +
        'details, above all your e-mail, are correct at the hospital: the vale ' +
        'cirurgia is sent digitally and many people miss it because their address ' +
        'is out of date.',
      steps: [
        'Check at the hospital Gabinete do Utente that your e-mail and phone number are up to date.',
        'Ask in writing for confirmation of the date your request was registered and the clinical priority assigned. That date is when the clock starts.',
        'Look up the average waiting times for your hospital and specialty to set your expectations.',
      ],
      warnings: [],
    },
  },

  disclaimer:
    'This assessment is informational and based on published legal time limits. It ' +
    'is not legal or medical advice, does not replace your doctor’s assessment and ' +
    'does not change the clinical priority you were assigned. If your condition ' +
    'worsens, call SNS 24 (808 24 24 24) or, in an emergency, 112.',

  valeGuidance: [
    'Scheduled surgery is not a single trip: expect a pre-operative appointment, the surgery, discharge and follow-up. That is why we show the total travel burden.',
    'Check that someone can accompany you on discharge day. Several procedures require it.',
    'Before refusing the voucher, consider: refusing keeps your place on the original list but does not make the surgery any sooner.',
    'Once the destination hospital confirms the transfer, you can no longer switch hospitals unless that hospital seriously fails you.',
    'Call the hospital you chose with the voucher number to hand (top right corner of the document) and ask for written confirmation.',
  ],

  valeDisclaimer:
    'This ranking is strictly LOGISTICAL. It does not assess clinical quality, does ' +
    'not rank hospitals by health outcomes and is not a medical recommendation. ' +
    'Discuss the choice of hospital with your doctor.',

  valeTripsExplanation:
    '{trips} estimated round trips (pre-operative, surgery, discharge, follow-up).',

  errors: {
    tmrgNotFound:
      'That combination is not in the time-limit table in force. Check the type of ' +
      'care, the condition and the priority.',
    invalidDate: 'Invalid date. Use the format YYYY-MM-DD.',
    futureDate: 'The request date cannot be in the future.',
    noHospitals: 'Enter the hospitals listed on your vale cirurgia.',
    tooManyHospitals: 'Maximum of 20 hospitals per request.',
    noneLocated:
      'None of the hospitals you entered could be located. Check the spelling ' +
      'exactly as it appears on the voucher document.',
  },
};
