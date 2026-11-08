/**
 * Internacionalização da interface.
 *
 * Divisão de responsabilidades: o texto do CONTEÚDO JURÍDICO (direitos, passos,
 * avisos) vem traduzido do servidor, porque tem de ser versionado com a lei
 * num sítio só. Aqui ficam apenas os rótulos da interface.
 *
 * Idiomas a partir do Relatório de Migrações e Asilo 2025 da AIMA: dos
 * 1 585 854 estrangeiros residentes em Portugal, as maiores comunidades não
 * lusófonas são a Índia (91 405), a Ucrânia (84 889), o Bangladeche (55 579) e
 * o Nepal (53 304). O hindi cobre a comunidade indiana e boa parte da nepalesa.
 *
 * Designações oficiais do SNS ficam em português em todos os idiomas.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGES = [
  { code: 'pt', name: 'Português', short: 'PT' },
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Español', short: 'ES' },
  { code: 'ru', name: 'Русский', short: 'RU' },
  { code: 'hi', name: 'हिन्दी', short: 'हि' },
];

const CODES = LANGUAGES.map((l) => l.code);
export const DEFAULT_LANGUAGE = 'pt';

const STRINGS = {
  pt: {
    appName: 'Run To Health',
    nav: { search: 'Procurar', rights: 'Os meus direitos', vale: 'Vale cirurgia' },
    language: { label: 'Idioma', change: 'Mudar de idioma' },
    severity: { alta: 'prioritário', media: 'importante', informativa: 'nota' },
    footer: {
      disclaimer:
        'O Run To Health presta informação sobre acesso a cuidados de saúde. Não é aconselhamento médico nem jurídico, não faz diagnósticos e não substitui a avaliação do seu médico.',
      emergency: 'SNS 24: 808 24 24 24. Emergência: 112.',
      attribution: 'Dados de localização © OpenStreetMap contributors, sob ODbL.',
    },
    common: {
      loading: 'A carregar...',
      calculating: 'A calcular...',
      searching: 'A procurar...',
      locating: 'A localizar...',
      sending: 'A enviar...',
      cancel: 'Cancelar',
      send: 'Enviar',
      optional: 'opcional',
      howTo: 'Como fazer',
      less: 'Menos',
      steps: 'Passos',
      legalBasis: 'Base legal',
      byCar: 'de carro',
      estimated: 'estimado',
      publicNetwork: 'Rede pública',
      privateSocial: 'Privado / social',
      emergencyDept: 'Urgência',
      accessible: 'Acessível',
    },
    search: {
      title: 'Encontrar cuidados de saúde',
      byCity: 'Por cidade',
      nearMe: 'Perto de mim',
      speciality: 'Especialidade (opcional)',
      specialityHint: 'cardiologia, dentista, pediatria...',
      city: 'Cidade',
      cityHint: 'Braga',
      submit: 'Pesquisar',
      unitsFound: (n) => `${n} ${n === 1 ? 'unidade' : 'unidades'}`,
      byName: '(pesquisa por nome)',
      noneInCity: (city, spec) =>
        `Nenhuma unidade encontrada em ${city}${spec ? ` para ${spec}` : ''}. Tente sem especialidade, ou uma cidade maior.`,
      noneNearby: 'Nenhuma unidade encontrada num raio de 15 km.',
      needCity: 'Indique uma cidade.',
      noGeo: 'O seu navegador não permite obter a localização.',
      geoDenied: 'Autorização de localização recusada. Pesquise por cidade.',
      geoFailed: 'Não foi possível obter a sua localização.',
      fixOsm: 'Corrigir no OSM',
      website: 'Site',
    },
    rights: {
      title: 'Os meus direitos',
      lede: 'Está à espera de uma consulta, cirurgia ou exame no SNS? A lei fixa prazos máximos. Quando são ultrapassados, tem direitos concretos — e a maioria das pessoas não sabe quais. Responda a quatro perguntas.',
      careType: 'Do que está à espera?',
      condition: 'Tipo de situação',
      priority: 'Prioridade atribuída pelo médico',
      requestDate: 'Data em que o pedido foi registado',
      requestDateHint:
        'É a data a partir da qual o prazo conta. Se tiver dúvidas, o Gabinete do Utente do hospital é obrigado a confirmá-la por escrito.',
      vales: 'Quantos vales cirurgia já recebeu?',
      valeNone: 'Nenhum',
      valeOne: 'Um',
      valeTwo: 'Dois ou mais',
      submit: 'Ver os meus direitos',
      needDate: 'Indique a data em que o pedido foi registado.',
      loadFailed: 'Não foi possível carregar a tabela de prazos',
      ofDays: (waited, total, unit) => `${waited} de ${total} ${unit}`,
      thresholdNote: (pct, date) =>
        `A marca aos ${pct}% é o ponto em que o vale cirurgia deve ser emitido automaticamente. Prazo legal até ${date}.`,
      whatYouCanDo: (n) => (n === 1 ? 'O que pode fazer' : `${n} coisas que pode fazer`),
      maxTime: 'Prazo máximo',
      verifiedOn: (date, link) => `Valores verificados em ${date} na ${link}.`,
      ersTable: 'tabela de TMRG da ERS',
    },
    vale: {
      title: 'Recebi um vale cirurgia. Que hospital escolho?',
      lede: 'O vale dá-lhe uma lista de nomes e nada mais. Cole aqui essa lista e indique onde mora: calculamos o tempo de viagem a cada um e ordenamos as opções pela carga total de deslocações — porque uma cirurgia programada não é uma ida só.',
      hospitals: 'Hospitais indicados no vale (um por linha)',
      recognised: (n) =>
        `${n} ${n === 1 ? 'hospital reconhecido' : 'hospitais reconhecidos'}. Numeração e marcas de lista são removidas automaticamente.`,
      pasteHint: 'Pode colar diretamente do documento: a numeração é limpa automaticamente.',
      origin: 'De onde parte?',
      useLocation: 'Usar a minha localização',
      typeAddress: 'Escrever a morada',
      getLocation: 'Obter localização',
      locationOk: 'Localização obtida',
      address: 'A sua morada ou localidade',
      addressHint: 'Rua Example 12, Braga',
      submit: 'Comparar hospitais',
      needHospitals: 'Cole ou escreva os nomes dos hospitais que constam do seu vale.',
      needAddress: 'Indique a sua morada, ou use a localização do dispositivo.',
      needOrigin: 'Indique a sua localização para calcular as distâncias.',
      addressFailed: (msg) => `Não foi possível localizar a morada: ${msg}`,
      unresolved: (n) => `${n} não localizado${n === 1 ? '' : 's'}`,
      unresolvedHint:
        'Tente escrever o nome como aparece no documento, ou acrescente a cidade.',
      nearest: 'Mais perto',
      ranked: 'Opções ordenadas por logística',
      totalTravel: 'Total de viagens',
      logistics: 'logística',
      beforeDeciding: 'Antes de decidir',
      weights: (drive, walk, data) =>
        `Pontuação: ${drive}% tempo de carro, ${walk}% acessibilidade a pé, ${data}% dados de contacto disponíveis.`,
    },
    feedback: {
      open: 'Enviar feedback',
      title: 'Enviar feedback',
      intro:
        'Encontrou informação errada, um prazo desatualizado ou uma unidade que não existe? Diga-nos. Lemos tudo.',
      message: 'A sua mensagem',
      email: 'E-mail (opcional)',
      emailHint: 'Só se quiser resposta. Não é usado para mais nada.',
      needMessage: 'Escreva a sua mensagem.',
      thanks: 'Obrigado. Mensagem recebida.',
      failed: 'Não foi possível enviar. Tente novamente.',
      privacy:
        'Usamos a sua mensagem e, se o indicar, o seu e-mail apenas para lhe responder e melhorar a aplicação. Não os partilhamos com terceiros. Pode pedir a sua eliminação a qualquer momento, enviando outra mensagem com o mesmo e-mail. Não inclua dados de saúde.',
    },
  },

  en: {
    appName: 'Run To Health',
    nav: { search: 'Search', rights: 'My rights', vale: 'Surgery voucher' },
    language: { label: 'Language', change: 'Change language' },
    severity: { alta: 'urgent', media: 'important', informativa: 'note' },
    footer: {
      disclaimer:
        'Run To Health provides information about access to healthcare. It is not medical or legal advice, makes no diagnoses and does not replace your doctor’s assessment.',
      emergency: 'SNS 24: 808 24 24 24. Emergency: 112.',
      attribution: 'Location data © OpenStreetMap contributors, under ODbL.',
    },
    common: {
      loading: 'Loading...',
      calculating: 'Calculating...',
      searching: 'Searching...',
      locating: 'Locating...',
      sending: 'Sending...',
      cancel: 'Cancel',
      send: 'Send',
      optional: 'optional',
      howTo: 'How to do it',
      less: 'Less',
      steps: 'Steps',
      legalBasis: 'Legal basis',
      byCar: 'by car',
      estimated: 'estimated',
      publicNetwork: 'Public health service',
      privateSocial: 'Private / social',
      emergencyDept: 'Emergency dept.',
      accessible: 'Accessible',
    },
    search: {
      title: 'Find healthcare',
      byCity: 'By city',
      nearMe: 'Near me',
      speciality: 'Specialty (optional)',
      specialityHint: 'cardiology, dentist, paediatrics...',
      city: 'City',
      cityHint: 'Braga',
      submit: 'Search',
      unitsFound: (n) => `${n} ${n === 1 ? 'facility' : 'facilities'}`,
      byName: '(matched by name)',
      noneInCity: (city, spec) =>
        `No facilities found in ${city}${spec ? ` for ${spec}` : ''}. Try without a specialty, or a larger city.`,
      noneNearby: 'No facilities found within 15 km.',
      needCity: 'Enter a city.',
      noGeo: 'Your browser does not allow location access.',
      geoDenied: 'Location permission denied. Search by city instead.',
      geoFailed: 'Could not get your location.',
      fixOsm: 'Fix on OSM',
      website: 'Website',
    },
    rights: {
      title: 'My rights',
      lede: 'Waiting for an appointment, surgery or test on the SNS? The law sets maximum waiting times. Once they are exceeded you have concrete rights — and most people do not know which. Answer four questions.',
      careType: 'What are you waiting for?',
      condition: 'Type of condition',
      priority: 'Priority assigned by the doctor',
      requestDate: 'Date the request was registered',
      requestDateHint:
        'This is the date the clock starts from. If unsure, the hospital Gabinete do Utente (patient office) must confirm it in writing.',
      vales: 'How many surgery vouchers have you received?',
      valeNone: 'None',
      valeOne: 'One',
      valeTwo: 'Two or more',
      submit: 'Show my rights',
      needDate: 'Enter the date the request was registered.',
      loadFailed: 'Could not load the table of time limits',
      ofDays: (waited, total, unit) => `${waited} of ${total} ${unit}`,
      thresholdNote: (pct, date) =>
        `The mark at ${pct}% is where the vale cirurgia must be issued automatically. Legal limit until ${date}.`,
      whatYouCanDo: (n) => (n === 1 ? 'What you can do' : `${n} things you can do`),
      maxTime: 'Maximum waiting time',
      verifiedOn: (date, link) => `Figures verified on ${date} against the ${link}.`,
      ersTable: 'ERS table of maximum waiting times',
    },
    vale: {
      title: 'I received a surgery voucher. Which hospital do I choose?',
      lede: 'The voucher gives you a list of names and nothing else. Paste that list here and tell us where you live: we work out the travel time to each one and rank them by total travel burden, because scheduled surgery is never a single trip.',
      hospitals: 'Hospitals listed on the voucher (one per line)',
      recognised: (n) =>
        `${n} ${n === 1 ? 'hospital' : 'hospitals'} recognised. Numbering and bullets are stripped automatically.`,
      pasteHint: 'You can paste straight from the document: numbering is cleaned up automatically.',
      origin: 'Where are you travelling from?',
      useLocation: 'Use my location',
      typeAddress: 'Type an address',
      getLocation: 'Get location',
      locationOk: 'Location obtained',
      address: 'Your address or town',
      addressHint: 'Rua Example 12, Braga',
      submit: 'Compare hospitals',
      needHospitals: 'Paste or type the hospital names listed on your voucher.',
      needAddress: 'Enter your address, or use your device location.',
      needOrigin: 'Enter your location so we can work out the distances.',
      addressFailed: (msg) => `Could not locate that address: ${msg}`,
      unresolved: (n) => `${n} not located`,
      unresolvedHint:
        'Try writing the name exactly as it appears on the document, or add the city.',
      nearest: 'Nearest',
      ranked: 'Options ranked by logistics',
      totalTravel: 'Total travel',
      logistics: 'logistics',
      beforeDeciding: 'Before you decide',
      weights: (drive, walk, data) =>
        `Score: ${drive}% driving time, ${walk}% walking access, ${data}% contact details available.`,
    },
    feedback: {
      open: 'Send feedback',
      title: 'Send feedback',
      intro:
        'Found wrong information, an out-of-date time limit, or a facility that does not exist? Tell us. We read everything.',
      message: 'Your message',
      email: 'E-mail (optional)',
      emailHint: 'Only if you want a reply. Not used for anything else.',
      needMessage: 'Write your message.',
      thanks: 'Thank you. Message received.',
      failed: 'Could not send. Please try again.',
      privacy:
        'We use your message and, if you give it, your email only to reply to you and improve the app. We do not share them with third parties. You can ask us to delete them at any time by sending another message from the same email. Please do not include health information.',
    },
  },

  es: {
    appName: 'Run To Health',
    nav: { search: 'Buscar', rights: 'Mis derechos', vale: 'Vale de cirugía' },
    language: { label: 'Idioma', change: 'Cambiar de idioma' },
    severity: { alta: 'urgente', media: 'importante', informativa: 'nota' },
    footer: {
      disclaimer:
        'Run To Health ofrece información sobre acceso a la asistencia sanitaria. No es asesoramiento médico ni jurídico, no hace diagnósticos y no sustituye la valoración de su médico.',
      emergency: 'SNS 24: 808 24 24 24. Emergencia: 112.',
      attribution: 'Datos de localización © OpenStreetMap contributors, bajo ODbL.',
    },
    common: {
      loading: 'Cargando...',
      calculating: 'Calculando...',
      searching: 'Buscando...',
      locating: 'Localizando...',
      sending: 'Enviando...',
      cancel: 'Cancelar',
      send: 'Enviar',
      optional: 'opcional',
      howTo: 'Cómo hacerlo',
      less: 'Menos',
      steps: 'Pasos',
      legalBasis: 'Base legal',
      byCar: 'en coche',
      estimated: 'estimado',
      publicNetwork: 'Red pública',
      privateSocial: 'Privado / social',
      emergencyDept: 'Urgencias',
      accessible: 'Accesible',
    },
    search: {
      title: 'Encontrar asistencia sanitaria',
      byCity: 'Por ciudad',
      nearMe: 'Cerca de mí',
      speciality: 'Especialidad (opcional)',
      specialityHint: 'cardiología, dentista, pediatría...',
      city: 'Ciudad',
      cityHint: 'Braga',
      submit: 'Buscar',
      unitsFound: (n) => `${n} ${n === 1 ? 'centro' : 'centros'}`,
      byName: '(búsqueda por nombre)',
      noneInCity: (city, spec) =>
        `No se encontró ningún centro en ${city}${spec ? ` para ${spec}` : ''}. Pruebe sin especialidad, o una ciudad mayor.`,
      noneNearby: 'No se encontró ningún centro en 15 km a la redonda.',
      needCity: 'Indique una ciudad.',
      noGeo: 'Su navegador no permite obtener la ubicación.',
      geoDenied: 'Permiso de ubicación denegado. Busque por ciudad.',
      geoFailed: 'No se pudo obtener su ubicación.',
      fixOsm: 'Corregir en OSM',
      website: 'Web',
    },
    rights: {
      title: 'Mis derechos',
      lede: '¿Está esperando una consulta, cirugía o prueba en el SNS? La ley fija plazos máximos. Cuando se superan, usted tiene derechos concretos, y la mayoría de la gente no sabe cuáles. Responda a cuatro preguntas.',
      careType: '¿Qué está esperando?',
      condition: 'Tipo de situación',
      priority: 'Prioridad asignada por el médico',
      requestDate: 'Fecha en que se registró la solicitud',
      requestDateHint:
        'Es la fecha desde la que cuenta el plazo. Si tiene dudas, el Gabinete do Utente (oficina del paciente) del hospital está obligado a confirmarla por escrito.',
      vales: '¿Cuántos vales de cirugía ha recibido ya?',
      valeNone: 'Ninguno',
      valeOne: 'Uno',
      valeTwo: 'Dos o más',
      submit: 'Ver mis derechos',
      needDate: 'Indique la fecha en que se registró la solicitud.',
      loadFailed: 'No se pudo cargar la tabla de plazos',
      ofDays: (waited, total, unit) => `${waited} de ${total} ${unit}`,
      thresholdNote: (pct, date) =>
        `La marca del ${pct}% es el punto en que el vale cirurgia debe emitirse automáticamente. Plazo legal hasta el ${date}.`,
      whatYouCanDo: (n) => (n === 1 ? 'Qué puede hacer' : `${n} cosas que puede hacer`),
      maxTime: 'Plazo máximo',
      verifiedOn: (date, link) => `Valores verificados el ${date} en la ${link}.`,
      ersTable: 'tabla de plazos máximos de la ERS',
    },
    vale: {
      title: 'He recibido un vale de cirugía. ¿Qué hospital elijo?',
      lede: 'El vale le da una lista de nombres y nada más. Pegue aquí esa lista e indique dónde vive: calculamos el tiempo de viaje a cada uno y ordenamos las opciones por carga total de desplazamientos, porque una cirugía programada nunca es un solo viaje.',
      hospitals: 'Hospitales indicados en el vale (uno por línea)',
      recognised: (n) =>
        `${n} ${n === 1 ? 'hospital reconocido' : 'hospitales reconocidos'}. La numeración y las viñetas se eliminan automáticamente.`,
      pasteHint: 'Puede pegar directamente del documento: la numeración se limpia sola.',
      origin: '¿Desde dónde sale?',
      useLocation: 'Usar mi ubicación',
      typeAddress: 'Escribir la dirección',
      getLocation: 'Obtener ubicación',
      locationOk: 'Ubicación obtenida',
      address: 'Su dirección o localidad',
      addressHint: 'Rua Example 12, Braga',
      submit: 'Comparar hospitales',
      needHospitals: 'Pegue o escriba los nombres de los hospitales que figuran en su vale.',
      needAddress: 'Indique su dirección, o use la ubicación del dispositivo.',
      needOrigin: 'Indique su ubicación para calcular las distancias.',
      addressFailed: (msg) => `No se pudo localizar la dirección: ${msg}`,
      unresolved: (n) => `${n} sin localizar`,
      unresolvedHint:
        'Pruebe a escribir el nombre tal como aparece en el documento, o añada la ciudad.',
      nearest: 'Más cerca',
      ranked: 'Opciones ordenadas por logística',
      totalTravel: 'Total de viajes',
      logistics: 'logística',
      beforeDeciding: 'Antes de decidir',
      weights: (drive, walk, data) =>
        `Puntuación: ${drive}% tiempo en coche, ${walk}% accesibilidad a pie, ${data}% datos de contacto disponibles.`,
    },
    feedback: {
      open: 'Enviar comentarios',
      title: 'Enviar comentarios',
      intro:
        '¿Ha encontrado información errónea, un plazo desactualizado o un centro que no existe? Díganoslo. Lo leemos todo.',
      message: 'Su mensaje',
      email: 'Correo electrónico (opcional)',
      emailHint: 'Solo si quiere respuesta. No se usa para nada más.',
      needMessage: 'Escriba su mensaje.',
      thanks: 'Gracias. Mensaje recibido.',
      failed: 'No se pudo enviar. Inténtelo de nuevo.',
      privacy:
        'Usamos su mensaje y, si lo indica, su correo únicamente para responderle y mejorar la aplicación. No los compartimos con terceros. Puede pedir que los eliminemos en cualquier momento enviando otro mensaje con el mismo correo. No incluya datos de salud.',
    },
  },

  ru: {
    appName: 'Run To Health',
    nav: { search: 'Поиск', rights: 'Мои права', vale: 'Талон на операцию' },
    language: { label: 'Язык', change: 'Сменить язык' },
    severity: { alta: 'срочно', media: 'важно', informativa: 'к сведению' },
    footer: {
      disclaimer:
        'Run To Health предоставляет информацию о доступе к медицинской помощи. Это не юридическая и не медицинская консультация, здесь не ставят диагнозов, и это не заменяет осмотр вашего врача.',
      emergency: 'SNS 24: 808 24 24 24. Экстренная помощь: 112.',
      attribution: 'Данные о местоположении © OpenStreetMap contributors, лицензия ODbL.',
    },
    common: {
      loading: 'Загрузка...',
      calculating: 'Расчёт...',
      searching: 'Поиск...',
      locating: 'Определение места...',
      sending: 'Отправка...',
      cancel: 'Отмена',
      send: 'Отправить',
      optional: 'необязательно',
      howTo: 'Как это сделать',
      less: 'Свернуть',
      steps: 'Шаги',
      legalBasis: 'Правовое основание',
      byCar: 'на машине',
      estimated: 'примерно',
      publicNetwork: 'Государственная сеть',
      privateSocial: 'Частная / социальная',
      emergencyDept: 'Неотложная помощь',
      accessible: 'Доступно для инвалидов',
    },
    search: {
      title: 'Найти медицинскую помощь',
      byCity: 'По городу',
      nearMe: 'Рядом со мной',
      speciality: 'Специальность (необязательно)',
      specialityHint: 'кардиология, стоматолог, педиатрия...',
      city: 'Город',
      cityHint: 'Брага',
      submit: 'Искать',
      unitsFound: (n) => `Найдено учреждений: ${n}`,
      byName: '(поиск по названию)',
      noneInCity: (city, spec) =>
        `В городе ${city} ничего не найдено${spec ? ` по запросу «${spec}»` : ''}. Попробуйте без специальности или более крупный город.`,
      noneNearby: 'В радиусе 15 км ничего не найдено.',
      needCity: 'Укажите город.',
      noGeo: 'Ваш браузер не разрешает определять местоположение.',
      geoDenied: 'Доступ к местоположению запрещён. Ищите по городу.',
      geoFailed: 'Не удалось определить ваше местоположение.',
      fixOsm: 'Исправить в OSM',
      website: 'Сайт',
    },
    rights: {
      title: 'Мои права',
      lede: 'Ждёте приёма, операции или обследования в SNS? Закон устанавливает максимальные сроки. Когда они превышены, у вас появляются конкретные права, и большинство людей о них не знает. Ответьте на четыре вопроса.',
      careType: 'Чего вы ждёте?',
      condition: 'Тип ситуации',
      priority: 'Приоритет, присвоенный врачом',
      requestDate: 'Дата регистрации запроса',
      requestDateHint:
        'С этой даты идёт отсчёт срока. Если сомневаетесь, Gabinete do Utente (отдел по работе с пациентами) больницы обязан подтвердить её письменно.',
      vales: 'Сколько талонов на операцию вы уже получили?',
      valeNone: 'Ни одного',
      valeOne: 'Один',
      valeTwo: 'Два или больше',
      submit: 'Показать мои права',
      needDate: 'Укажите дату регистрации запроса.',
      loadFailed: 'Не удалось загрузить таблицу сроков',
      ofDays: (waited, total, unit) => `${waited} из ${total} ${unit}`,
      thresholdNote: (pct, date) =>
        `Отметка на ${pct}% — момент, когда Vale Cirurgia должен быть выдан автоматически. Законный срок до ${date}.`,
      whatYouCanDo: (n) => (n === 1 ? 'Что вы можете сделать' : `Что вы можете сделать: ${n} варианта`),
      maxTime: 'Максимальный срок',
      verifiedOn: (date, link) => `Данные проверены ${date} по источнику: ${link}.`,
      ersTable: 'таблица максимальных сроков ERS',
    },
    vale: {
      title: 'Я получил талон на операцию. Какую больницу выбрать?',
      lede: 'Талон даёт только список названий и больше ничего. Вставьте этот список сюда и укажите, где вы живёте: мы рассчитаем время в пути до каждой больницы и расставим варианты по общей транспортной нагрузке, ведь плановая операция — это не одна поездка.',
      hospitals: 'Больницы, указанные в талоне (по одной в строке)',
      recognised: (n) => `Распознано больниц: ${n}. Нумерация и маркеры списка убираются автоматически.`,
      pasteHint: 'Можно вставить прямо из документа: нумерация очистится сама.',
      origin: 'Откуда вы поедете?',
      useLocation: 'Использовать моё местоположение',
      typeAddress: 'Ввести адрес',
      getLocation: 'Определить местоположение',
      locationOk: 'Местоположение определено',
      address: 'Ваш адрес или населённый пункт',
      addressHint: 'Rua Example 12, Braga',
      submit: 'Сравнить больницы',
      needHospitals: 'Вставьте или впишите названия больниц из вашего талона.',
      needAddress: 'Укажите адрес или используйте местоположение устройства.',
      needOrigin: 'Укажите своё местоположение, чтобы рассчитать расстояния.',
      addressFailed: (msg) => `Не удалось найти адрес: ${msg}`,
      unresolved: (n) => `Не найдено: ${n}`,
      unresolvedHint:
        'Попробуйте написать название ровно так, как в документе, или добавьте город.',
      nearest: 'Ближайшая',
      ranked: 'Варианты по удобству поездок',
      totalTravel: 'Всего в пути',
      logistics: 'логистика',
      beforeDeciding: 'Прежде чем решить',
      weights: (drive, walk, data) =>
        `Оценка: ${drive}% время на машине, ${walk}% доступность пешком, ${data}% наличие контактов.`,
    },
    feedback: {
      open: 'Отправить отзыв',
      title: 'Отправить отзыв',
      intro:
        'Нашли неверную информацию, устаревший срок или несуществующее учреждение? Напишите нам. Мы читаем всё.',
      message: 'Ваше сообщение',
      email: 'Электронная почта (необязательно)',
      emailHint: 'Только если хотите ответ. Больше ни для чего не используется.',
      needMessage: 'Напишите сообщение.',
      thanks: 'Спасибо. Сообщение получено.',
      failed: 'Не удалось отправить. Попробуйте ещё раз.',
      privacy:
        'Мы используем ваше сообщение и, если вы его укажете, адрес электронной почты только для того, чтобы ответить вам и улучшить приложение. Мы не передаём их третьим лицам. Вы можете в любой момент попросить удалить их, отправив новое сообщение с того же адреса. Не указывайте медицинские данные.',
    },
  },

  hi: {
    appName: 'Run To Health',
    nav: { search: 'खोजें', rights: 'मेरे अधिकार', vale: 'सर्जरी वाउचर' },
    language: { label: 'भाषा', change: 'भाषा बदलें' },
    severity: { alta: 'ज़रूरी', media: 'महत्वपूर्ण', informativa: 'सूचना' },
    footer: {
      disclaimer:
        'Run To Health स्वास्थ्य सेवा तक पहुँच के बारे में जानकारी देता है। यह न चिकित्सकीय सलाह है न कानूनी, यहाँ निदान नहीं किया जाता, और यह आपके डॉक्टर की जाँच की जगह नहीं लेता।',
      emergency: 'SNS 24: 808 24 24 24। आपातकाल: 112।',
      attribution: 'स्थान डेटा © OpenStreetMap contributors, ODbL लाइसेंस के अंतर्गत।',
    },
    common: {
      loading: 'लोड हो रहा है...',
      calculating: 'गणना हो रही है...',
      searching: 'खोज रहे हैं...',
      locating: 'स्थान पता कर रहे हैं...',
      sending: 'भेजा जा रहा है...',
      cancel: 'रद्द करें',
      send: 'भेजें',
      optional: 'वैकल्पिक',
      howTo: 'कैसे करें',
      less: 'कम दिखाएँ',
      steps: 'चरण',
      legalBasis: 'कानूनी आधार',
      byCar: 'कार से',
      estimated: 'अनुमानित',
      publicNetwork: 'सरकारी नेटवर्क',
      privateSocial: 'निजी / सामाजिक',
      emergencyDept: 'आपातकालीन विभाग',
      accessible: 'सुगम्य',
    },
    search: {
      title: 'स्वास्थ्य सेवा खोजें',
      byCity: 'शहर से',
      nearMe: 'मेरे पास',
      speciality: 'विशेषज्ञता (वैकल्पिक)',
      specialityHint: 'हृदय रोग, दंत चिकित्सक, बाल रोग...',
      city: 'शहर',
      cityHint: 'Braga',
      submit: 'खोजें',
      unitsFound: (n) => `${n} केंद्र मिले`,
      byName: '(नाम से मिलान)',
      noneInCity: (city, spec) =>
        `${city} में कोई केंद्र नहीं मिला${spec ? ` (${spec} के लिए)` : ''}। विशेषज्ञता हटाकर देखें, या कोई बड़ा शहर चुनें।`,
      noneNearby: '15 किमी के दायरे में कोई केंद्र नहीं मिला।',
      needCity: 'शहर दर्ज करें।',
      noGeo: 'आपका ब्राउज़र स्थान की अनुमति नहीं देता।',
      geoDenied: 'स्थान की अनुमति नहीं मिली। शहर से खोजें।',
      geoFailed: 'आपका स्थान पता नहीं चल सका।',
      fixOsm: 'OSM में सुधारें',
      website: 'वेबसाइट',
    },
    rights: {
      title: 'मेरे अधिकार',
      lede: 'SNS में किसी भेंट, सर्जरी या जाँच का इंतज़ार कर रहे हैं? कानून अधिकतम समय तय करता है। वह पार हो जाए तो आपके पास ठोस अधिकार होते हैं, और ज़्यादातर लोगों को पता ही नहीं होता कि कौन से। चार सवालों के जवाब दें।',
      careType: 'आप किसका इंतज़ार कर रहे हैं?',
      condition: 'स्थिति का प्रकार',
      priority: 'डॉक्टर द्वारा दी गई प्राथमिकता',
      requestDate: 'अनुरोध दर्ज होने की तारीख़',
      requestDateHint:
        'गिनती इसी तारीख़ से शुरू होती है। संदेह हो तो अस्पताल का Gabinete do Utente (मरीज़ कार्यालय) इसे लिखित में बताने के लिए बाध्य है।',
      vales: 'आपको अब तक कितने सर्जरी वाउचर मिले हैं?',
      valeNone: 'एक भी नहीं',
      valeOne: 'एक',
      valeTwo: 'दो या अधिक',
      submit: 'मेरे अधिकार दिखाएँ',
      needDate: 'अनुरोध दर्ज होने की तारीख़ दर्ज करें।',
      loadFailed: 'समय-सीमा तालिका लोड नहीं हो सकी',
      ofDays: (waited, total, unit) => `${total} में से ${waited} ${unit}`,
      thresholdNote: (pct, date) =>
        `${pct}% का निशान वह बिंदु है जहाँ Vale Cirurgia अपने आप जारी होना चाहिए। कानूनी सीमा ${date} तक।`,
      whatYouCanDo: (n) => (n === 1 ? 'आप क्या कर सकते हैं' : `आप ${n} काम कर सकते हैं`),
      maxTime: 'अधिकतम समय',
      verifiedOn: (date, link) => `आँकड़े ${date} को ${link} से जाँचे गए।`,
      ersTable: 'ERS की अधिकतम समय-सीमा तालिका',
    },
    vale: {
      title: 'मुझे सर्जरी वाउचर मिला है। कौन-सा अस्पताल चुनूँ?',
      lede: 'वाउचर में सिर्फ़ नामों की सूची होती है, और कुछ नहीं। वह सूची यहाँ चिपकाएँ और बताएँ कि आप कहाँ रहते हैं: हम हर अस्पताल तक का यात्रा-समय निकालकर विकल्पों को कुल यात्रा-भार के हिसाब से क्रम में लगाते हैं, क्योंकि नियोजित सर्जरी कभी एक बार जाने का मामला नहीं होती।',
      hospitals: 'वाउचर में दिए गए अस्पताल (हर पंक्ति में एक)',
      recognised: (n) => `${n} अस्पताल पहचाने गए। क्रमांक और बुलेट अपने आप हट जाते हैं।`,
      pasteHint: 'आप सीधे दस्तावेज़ से चिपका सकते हैं: क्रमांक अपने आप साफ़ हो जाएगा।',
      origin: 'आप कहाँ से चलेंगे?',
      useLocation: 'मेरा स्थान इस्तेमाल करें',
      typeAddress: 'पता लिखें',
      getLocation: 'स्थान पता करें',
      locationOk: 'स्थान मिल गया',
      address: 'आपका पता या शहर',
      addressHint: 'Rua Example 12, Braga',
      submit: 'अस्पतालों की तुलना करें',
      needHospitals: 'अपने वाउचर में दिए अस्पतालों के नाम चिपकाएँ या लिखें।',
      needAddress: 'अपना पता दर्ज करें, या डिवाइस का स्थान इस्तेमाल करें।',
      needOrigin: 'दूरी निकालने के लिए अपना स्थान बताएँ।',
      addressFailed: (msg) => `यह पता नहीं मिल सका: ${msg}`,
      unresolved: (n) => `${n} का पता नहीं चला`,
      unresolvedHint: 'नाम ठीक वैसा लिखें जैसा दस्तावेज़ में है, या शहर जोड़ें।',
      nearest: 'सबसे नज़दीक',
      ranked: 'आने-जाने की सुविधा के क्रम में विकल्प',
      totalTravel: 'कुल यात्रा',
      logistics: 'यात्रा-सुविधा',
      beforeDeciding: 'फ़ैसला करने से पहले',
      weights: (drive, walk, data) =>
        `अंक: ${drive}% कार का समय, ${walk}% पैदल पहुँच, ${data}% संपर्क जानकारी उपलब्ध।`,
    },
    feedback: {
      open: 'प्रतिक्रिया भेजें',
      title: 'प्रतिक्रिया भेजें',
      intro:
        'कोई ग़लत जानकारी, पुरानी समय-सीमा या ऐसा केंद्र मिला जो मौजूद नहीं? हमें बताएँ। हम सब पढ़ते हैं।',
      message: 'आपका संदेश',
      email: 'ई-मेल (वैकल्पिक)',
      emailHint: 'केवल तभी जब उत्तर चाहिए। इसका और कोई उपयोग नहीं।',
      needMessage: 'अपना संदेश लिखें।',
      thanks: 'धन्यवाद। संदेश मिल गया।',
      failed: 'भेजा नहीं जा सका। फिर से कोशिश करें।',
      privacy:
        'हम आपके संदेश और, यदि आप दें, आपके ईमेल का उपयोग केवल आपको उत्तर देने और ऐप को बेहतर बनाने के लिए करते हैं। हम इन्हें किसी तीसरे पक्ष के साथ साझा नहीं करते। आप उसी ईमेल से दूसरा संदेश भेजकर किसी भी समय इन्हें हटाने का अनुरोध कर सकते हैं। कृपया स्वास्थ्य संबंधी जानकारी न लिखें।',
    },
  },
};

const STORAGE_KEY = 'rth.language';

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && CODES.includes(saved)) return saved;
  } catch {
    /* localStorage pode estar indisponível (modo privado, iframe) */
  }
  const candidates = navigator.languages || [navigator.language || ''];
  for (const tag of candidates) {
    const short = String(tag).slice(0, 2).toLowerCase();
    if (CODES.includes(short)) return short;
  }
  return DEFAULT_LANGUAGE;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);

  const setLanguage = (code) => {
    if (!CODES.includes(code)) return;
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* preferência só nesta sessão */
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t: STRINGS[language] || STRINGS[DEFAULT_LANGUAGE] }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage tem de ser usado dentro de <LanguageProvider>');
  return ctx;
}

/** Atalho para quem só precisa dos textos. */
export function useT() {
  return useLanguage().t;
}

export { STRINGS };
