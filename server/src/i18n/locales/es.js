/**
 * Español.
 *
 * LOS TÉRMINOS OFICIALES SE QUEDAN EN PORTUGUÉS, en todos los idiomas. "Vale
 * Cirurgia", "Nota de Transferência", "Gabinete do Utente" y "SNS 24" son lo
 * que viene impreso en la carta que recibe la persona y lo que reconoce quien
 * atiende en el mostrador. Traducirlos haría que el usuario pidiera algo que
 * no existe. Van glosados en español la primera vez.
 */

module.exports = {
  code: 'es',
  name: 'Español',

  status: {
    dentro_do_prazo: 'Dentro del plazo legal',
    transferencia_devida: 'Ya tiene derecho a traslado',
    prazo_ultrapassado: 'El plazo legal ya se ha superado',
  },

  careType: {
    csp: 'Atención primaria (centro de salud)',
    primeira_consulta: 'Primera consulta de especialidad hospitalaria',
    cirurgia: 'Cirugía o procedimiento programado',
    mcdt: 'Prueba diagnóstica',
  },

  condition: {
    geral: 'Enfermedad no oncológica ni cardíaca',
    oncologica: 'Enfermedad oncológica',
    cardiaca: 'Enfermedad cardíaca',
  },

  priority: {
    muito_prioritaria: 'Muy prioritaria',
    prioritaria: 'Prioritaria',
    normal: 'Normal',
    doenca_aguda: 'Enfermedad aguda',
    sem_doenca_aguda: 'Sin enfermedad aguda',
    sem_doenca_aguda_referenciado: 'Sin enfermedad aguda (derivado)',
    renovacao_medicacao_cronica: 'Renovación de medicación crónica',
    relatorios_referenciacao: 'Informes y volantes de derivación',
    consulta_domicilio: 'Consulta a domicilio',
    cateterismo_cardiaco: 'Cateterismo cardíaco',
    pacemaker_cardiaco: 'Marcapasos cardíaco',
    endoscopia_gastrenterologica: 'Endoscopia digestiva',
    medicina_nuclear: 'Medicina nuclear',
    tac: 'TAC (tomografía computarizada)',
    ressonancia_magnetica: 'Resonancia magnética',
    angiografia_diagnostica: 'Angiografía diagnóstica',
    radioterapia: 'Radioterapia',
  },

  units: {
    hours: 'horas',
    business: 'días hábiles',
    calendar: 'días naturales',
  },

  entitlements: {
    vale_cirurgia_primeiro: {
      title: 'Vale Cirurgia / Nota de Transferência (vale de cirugía)',
      summary:
        'Ya ha superado el {percent}% del plazo máximo. El vale cirurgia debe ' +
        'emitirse automáticamente.',
      whatItMeans:
        'La Nota de Transferência le permite elegir otro hospital PÚBLICO de la ' +
        'lista que le envían. El Vale Cirurgia le permite elegir entre hospitales ' +
        'públicos, privados y del sector social. En cualquiera de los dos casos, la ' +
        'cirugía se hace SIN coste adicional para usted. Quédese con los nombres en ' +
        'portugués: así vienen en los documentos y así los reconoce el personal del ' +
        'hospital.',
      steps: [
        'Revise su correo electrónico y el correo postal: el documento se envía automáticamente, por vía digital siempre que haya dado su e-mail al hospital.',
        'Si no ha recibido nada, contacte con el Gabinete do Utente (oficina del paciente) de su hospital de origen y pida el estado de su inscripción y la emisión del vale.',
        'Con el vale en la mano, compare los hospitales de la lista por distancia y tiempo de viaje. Cuente con cuatro idas y vueltas, no una: consulta preoperatoria, cirugía, alta y seguimiento.',
        'Llame al hospital elegido indicando el número del vale, que está en la esquina superior derecha del documento.',
        'Guarde la confirmación escrita de que el hospital aceptó el traslado y espere la fecha.',
      ],
      warnings: [
        'Rechazar el vale mantiene su posición en la lista del hospital de origen, pero no adelanta la cirugía. Más de la mitad de los vales emitidos acaban rechazados.',
        'Una vez que el hospital de destino confirma, ya no puede cambiar de hospital, salvo fallo grave de ese hospital.',
      ],
    },

    vale_cirurgia_segundo: {
      title: 'Segundo Vale Cirurgia / Nota de Transferência',
      summary:
        'Ha superado el 100% del plazo máximo. Debe emitirse automáticamente un ' +
        'segundo vale cirurgia.',
      whatItMeans:
        'Se emiten automáticamente hasta dos vales: el primero al alcanzar el umbral ' +
        'de traslado, el segundo cuando el plazo máximo se agota por completo. Las ' +
        'condiciones son las mismas que las del primero.',
      steps: [
        'Confirme en el Gabinete do Utente si el segundo vale ya se ha emitido.',
        'Si no, pida su emisión por escrito, citando la fecha del primer vale.',
        'Elija el hospital de destino y llámelo con el número del vale.',
      ],
      warnings: [
        'Agotados los dos vales automáticos, un tercero tiene que pedirlo usted o su hospital de origen.',
      ],
    },

    vale_cirurgia_terceiro: {
      title: 'Pedir un vale cirurgia adicional',
      summary:
        'Solo se emiten dos vales de forma automática. Un tercero puede pedirlo ' +
        'usted o su hospital de origen.',
      whatItMeans:
        'Si ya ha recibido dos vales y sigue sin fecha de cirugía, puede pedir ' +
        'expresamente otro, en vez de esperar una emisión automática que no va a ' +
        'llegar.',
      steps: [
        'Dirija una petición escrita al Gabinete do Utente de su hospital de origen solicitando un nuevo vale cirurgia.',
        'Cite las fechas de los vales anteriores y el tiempo total de espera desde la indicación quirúrgica.',
        'Pida registro de entrada de la petición y guarde el justificante.',
      ],
      warnings: [],
    },

    diretiva_transfronteirica: {
      title: 'Tratamiento en otro país de la UE (Directiva 2011/24/UE)',
      summary:
        'Con el plazo máximo superado, tiene un argumento sólido para pedir ' +
        'autorización previa y tratarse en otro país de la UE, con reembolso del ' +
        'Estado portugués.',
      whatItMeans:
        'Puede solicitar {careType} en otro Estado miembro. La regla es que el Estado ' +
        'de afiliación debe, en principio, conceder la autorización previa cuando la ' +
        'asistencia no pueda prestarse en un plazo médicamente justificable. El ' +
        'reembolso se debe hasta el límite de lo que Portugal habría pagado si la ' +
        'asistencia se hubiera prestado aquí, y nunca por encima del coste real. ' +
        'Cubre también centros privados en el país de tratamiento.',
      steps: [
        'Pida a su médico un informe clínico que documente la necesidad de la asistencia y la imposibilidad de respuesta en tiempo clínicamente útil en Portugal. Es la pieza decisiva.',
        'Presente el Pedido de Autorização Prévia (solicitud de autorización previa) en el Área do Cidadão del SNS, en "Contacto com Unidades de Saúde" › "Mobilidade de Doentes".',
        'Adjunte justificante de la fecha de inscripción en la lista de espera y del plazo máximo aplicable.',
        'Pida al proveedor extranjero un presupuesto por escrito antes de viajar: el reembolso tiene como techo la tarifa portuguesa, así que la diferencia corre de su cuenta.',
        'Guarde todas las facturas originales y los informes para la solicitud de reembolso.',
      ],
      warnings: [
        'Esta vía es para asistencia PROGRAMADA. No cubre urgencias durante una estancia temporal en otro país; para eso está la Tarjeta Sanitaria Europea.',
        'La autorización previa puede denegarse si la autoridad considera que puede prestar la asistencia en un plazo clínicamente justificable. Por eso el informe clínico es decisivo.',
        'El uso de esta Directiva ha sido históricamente muy bajo en Portugal, y el regulador señaló la falta de información de la población como una de las causas. Insista y formalícelo todo por escrito.',
      ],
    },

    reclamacao_ers: {
      title: 'Reclamación al regulador sanitario (ERS)',
      summary:
        'Incumplir el plazo máximo es motivo de reclamación. La ERS lo supervisa y ' +
        'puede abrir expediente contra el centro.',
      whatItMeans:
        'Una reclamación formal crea registro documental del incumplimiento. Sirve ' +
        'tanto para presionar al hospital como de prueba para una solicitud al ' +
        'amparo de la Directiva 2011/24/UE.',
      steps: [
        'Presente la reclamación en el Livro de Reclamações Eletrónico (libro de reclamaciones electrónico) o directamente en el portal de la ERS.',
        'Identifique el hospital, la especialidad, la fecha de la solicitud o indicación, y el plazo máximo aplicable.',
        'Adjunte todo lo que acredite la fecha de inscripción y la ausencia de cita.',
        'Guarde el número de reclamación: es su prueba de diligencia.',
      ],
      warnings: [],
    },

    revisao_prioridade: {
      title: 'Pedir la reevaluación de la prioridad clínica',
      summary:
        'La prioridad asignada determina el plazo máximo. Si su estado ha empeorado, ' +
        'la prioridad puede revisarse y el plazo se acorta.',
      whatItMeans:
        'Pasar de "normal" a "prioritaria" puede reducir el plazo de una cirugía ' +
        'general de 180 a 30 días. La reevaluación es un acto clínico: hay que ' +
        'pedírsela al médico.',
      steps: [
        'Pida cita con el médico que le inscribió y describa concretamente cómo han evolucionado los síntomas y cómo le afectan en el día a día.',
        'Pida que la reevaluación de la prioridad quede registrada en su historia clínica.',
        'Si la prioridad cambia, confirme en el Gabinete do Utente que el plazo se ha recalculado.',
      ],
      warnings: [
        'La prioridad es una decisión clínica. Esta aplicación no puede cambiarla ni estimarla.',
      ],
    },

    acompanhamento_gabinete_utente: {
      title: 'Qué hacer mientras tanto',
      summary:
        'Todavía está dentro del plazo legal. Faltan {daysRemaining} días para que ' +
        'expire ({dueDate}).',
      whatItMeans:
        'Aún no hay derecho de traslado activado. Conviene confirmar que sus datos de ' +
        'contacto, sobre todo el correo electrónico, están correctos en el hospital: ' +
        'el vale cirurgia se envía por vía digital y mucha gente lo pierde por ' +
        'tenerlo desactualizado.',
      steps: [
        'Confirme en el Gabinete do Utente del hospital que su e-mail y teléfono están actualizados.',
        'Pida por escrito la confirmación de la fecha de registro de la solicitud y de la prioridad clínica asignada: esa fecha es desde cuando cuenta el plazo.',
        'Consulte los tiempos medios de espera de su hospital y especialidad para calibrar expectativas.',
      ],
      warnings: [],
    },
  },

  disclaimer:
    'Esta evaluación es informativa y se basa en los plazos legales publicados. No ' +
    'constituye asesoramiento jurídico ni médico, no sustituye la valoración de su ' +
    'médico y no cambia la prioridad clínica asignada. Si empeora, llame al SNS 24 ' +
    '(808 24 24 24) o, en emergencia, al 112.',

  valeGuidance: [
    'Una cirugía programada no es un solo viaje: cuente con consulta preoperatoria, cirugía, alta y seguimiento. Por eso mostramos la carga total de desplazamientos.',
    'Compruebe que tiene acompañante disponible para el día del alta: varios procedimientos lo exigen.',
    'Antes de rechazar el vale, piénselo: rechazarlo mantiene su posición en la lista de origen, pero no adelanta la cirugía.',
    'Una vez que el hospital de destino confirma el traslado, ya no puede cambiar de hospital, salvo fallo grave de ese hospital.',
    'Llame al hospital elegido con el número del vale a mano (esquina superior derecha del documento) y pida confirmación por escrito.',
  ],

  valeDisclaimer:
    'Clasificación estrictamente LOGÍSTICA. No evalúa calidad clínica, no ordena ' +
    'hospitales por resultados de salud y no es una recomendación médica. La ' +
    'elección del hospital debe hablarla con su médico.',

  valeTripsExplanation:
    '{trips} idas y vueltas estimadas (preoperatoria, cirugía, alta, seguimiento).',

  errors: {
    tmrgNotFound:
      'Esa combinación no está en la tabla de plazos vigente. Revise el tipo de ' +
      'asistencia, la enfermedad y la prioridad.',
    invalidDate: 'Fecha no válida. Use el formato AAAA-MM-DD.',
    futureDate: 'La fecha de la solicitud no puede ser futura.',
    noHospitals: 'Indique los hospitales que figuran en su vale cirurgia.',
    tooManyHospitals: 'Máximo de 20 hospitales por solicitud.',
    noneLocated:
      'No se ha podido localizar ninguno de los hospitales indicados. Compruebe la ' +
      'grafía exactamente como aparece en el documento del vale.',
  },
};
