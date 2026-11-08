/**
 * Português (pt-PT) — idioma de referência.
 *
 * As outras traduções derivam deste ficheiro. Ao acrescentar uma chave aqui,
 * acrescente-a em todos os locales: `npm test` falha se faltar alguma.
 *
 * TERMOS OFICIAIS
 * Os nomes de documentos e serviços do SNS ficam SEMPRE em português, em todos
 * os idiomas, porque é assim que aparecem na carta que a pessoa recebe e no
 * balcão onde vai perguntar. Traduzi-los faria o utente procurar uma coisa que
 * não existe. Nas outras línguas acompanha-os uma explicação entre parênteses
 * na primeira ocorrência.
 */

module.exports = {
  code: 'pt',
  name: 'Português',

  status: {
    dentro_do_prazo: 'Dentro do prazo legal',
    transferencia_devida: 'Já tem direito a transferência',
    prazo_ultrapassado: 'O prazo legal já foi ultrapassado',
  },

  careType: {
    csp: 'Cuidados de saúde primários',
    primeira_consulta: 'Primeira consulta de especialidade hospitalar',
    cirurgia: 'Cirurgia / procedimento programado',
    mcdt: 'Exame (meio complementar de diagnóstico e terapêutica)',
  },

  condition: {
    geral: 'Doença não oncológica / não cardíaca',
    oncologica: 'Doença oncológica',
    cardiaca: 'Doença cardíaca',
  },

  priority: {
    muito_prioritaria: 'Muito prioritária',
    prioritaria: 'Prioritária',
    normal: 'Normal',
    doenca_aguda: 'Doença aguda',
    sem_doenca_aguda: 'Sem doença aguda',
    sem_doenca_aguda_referenciado: 'Sem doença aguda (referenciado)',
    renovacao_medicacao_cronica: 'Renovação de medicação crónica',
    relatorios_referenciacao: 'Relatórios e cartas de referenciação',
    consulta_domicilio: 'Consulta no domicílio',
    cateterismo_cardiaco: 'Cateterismo cardíaco',
    pacemaker_cardiaco: 'Pacemaker cardíaco',
    endoscopia_gastrenterologica: 'Endoscopia gastrenterológica',
    medicina_nuclear: 'Medicina nuclear',
    tac: 'Tomografia computorizada (TAC)',
    ressonancia_magnetica: 'Ressonância magnética',
    angiografia_diagnostica: 'Angiografia diagnóstica',
    radioterapia: 'Radioterapia',
  },

  units: {
    hours: 'horas',
    business: 'dias úteis',
    calendar: 'dias seguidos',
  },

  entitlements: {
    vale_cirurgia_primeiro: {
      title: 'Vale Cirurgia / Nota de Transferência',
      summary:
        'Já ultrapassou {percent}% do prazo máximo. O vale cirurgia / nota de ' +
        'transferência deve ser emitido automaticamente.',
      whatItMeans:
        'A Nota de Transferência permite escolher outro hospital PÚBLICO da lista ' +
        'que lhe é enviada. O Vale Cirurgia permite escolher entre hospitais ' +
        'públicos, privados e do setor social. Em qualquer dos casos, a cirurgia é ' +
        'feita SEM custos adicionais para si.',
      steps: [
        'Verifique a sua caixa de correio eletrónico e o correio postal: o documento é enviado automaticamente, por via digital sempre que tenha facultado o e-mail ao hospital.',
        'Se não recebeu nada, contacte o Gabinete do Utente do seu hospital de origem e peça o estado da sua inscrição e a emissão do vale.',
        'Com o vale em mãos, compare os hospitais da lista por distância e tempo de viagem. Conte com quatro idas e voltas, não uma: consulta pré-operatória, cirurgia, alta e seguimento.',
        'Contacte o hospital escolhido indicando o número do vale, que está no canto superior direito do documento.',
        'Guarde a confirmação escrita de que o hospital aceitou a transferência e aguarde a marcação.',
      ],
      warnings: [
        'Recusar o vale mantém a sua posição na lista do hospital de origem, mas não acelera a cirurgia. Mais de metade dos vales emitidos acabam recusados.',
        'Depois de o hospital de destino confirmar, não pode voltar a mudar de hospital, salvo falha grave desse hospital.',
      ],
    },

    vale_cirurgia_segundo: {
      title: 'Segundo Vale Cirurgia / Nota de Transferência',
      summary:
        'Ultrapassou 100% do prazo máximo. Deve ser emitido automaticamente um ' +
        'segundo vale cirurgia.',
      whatItMeans:
        'São emitidos automaticamente até dois vales: o primeiro ao atingir o ' +
        'limiar de transferência, o segundo quando o prazo máximo se esgota por ' +
        'completo. As condições são as mesmas do primeiro.',
      steps: [
        'Confirme no Gabinete do Utente se o segundo vale já foi emitido.',
        'Se não foi, peça por escrito a sua emissão, referindo a data do primeiro vale.',
        'Escolha o hospital de destino e contacte-o com o número do vale.',
      ],
      warnings: [
        'Esgotados os dois vales automáticos, um terceiro tem de ser pedido por si ou pela instituição de origem.',
      ],
    },

    vale_cirurgia_terceiro: {
      title: 'Pedido de vale cirurgia adicional',
      summary:
        'São emitidos no máximo dois vales de forma automática. Um terceiro pode ' +
        'ser pedido por si ou pela instituição de origem.',
      whatItMeans:
        'Se já recebeu dois vales e continua sem cirurgia marcada, pode pedir ' +
        'expressamente um vale adicional, em vez de esperar por emissão automática.',
      steps: [
        'Dirija um pedido escrito ao Gabinete do Utente do hospital de origem a solicitar a emissão de novo vale cirurgia.',
        'Refira as datas dos vales anteriores e o tempo total de espera desde a indicação cirúrgica.',
        'Peça registo de entrada do pedido e guarde o comprovativo.',
      ],
      warnings: [],
    },

    diretiva_transfronteirica: {
      title: 'Cuidados de saúde noutro Estado-Membro da UE (Diretiva 2011/24/UE)',
      summary:
        'Com o prazo máximo ultrapassado, tem um argumento forte para pedir ' +
        'autorização prévia para ser tratado noutro país da UE, com reembolso ' +
        'pelo Estado português.',
      whatItMeans:
        'Pode pedir a prestação de {careType} noutro Estado-Membro. A regra é que o ' +
        'Estado de afiliação deve, em princípio, conceder a autorização prévia ' +
        'quando os cuidados não possam ser prestados num prazo aceitável do ponto ' +
        'de vista médico. O reembolso é devido até ao limite do que o Estado ' +
        'português teria suportado se os cuidados tivessem sido prestados em ' +
        'Portugal, e nunca acima do custo real. Abrange também unidades privadas ' +
        'no país de tratamento.',
      steps: [
        'Peça ao seu médico assistente um relatório clínico que documente a necessidade dos cuidados e a impossibilidade de resposta em tempo clinicamente útil em Portugal. É a peça decisiva.',
        'Submeta o Pedido de Autorização Prévia na Área do Cidadão do SNS, em "Contacto com Unidades de Saúde" › "Mobilidade de Doentes".',
        'Junte comprovativo da data de inscrição na lista de espera e do prazo máximo aplicável.',
        'Peça ao prestador estrangeiro um orçamento escrito antes de viajar: o reembolso tem como teto a tabela portuguesa, logo a diferença fica a seu cargo.',
        'Guarde todas as faturas originais e relatórios para o pedido de reembolso.',
      ],
      warnings: [
        'Esta via é para cuidados PROGRAMADOS. Não cobre urgência durante estada temporária noutro Estado-Membro; nesse caso aplica-se o Cartão Europeu de Seguro de Doença.',
        'A autorização prévia pode ser recusada se a entidade competente considerar que consegue prestar os cuidados em prazo clinicamente justificável. Por isso o relatório clínico é decisivo.',
        'O recurso a esta Diretiva é historicamente muito baixo em Portugal, e a ERS identificou a falta de informação da população como uma das causas. Insista e formalize tudo por escrito.',
      ],
    },

    reclamacao_ers: {
      title: 'Reclamação à Entidade Reguladora da Saúde (ERS)',
      summary:
        'O incumprimento do prazo máximo é fundamento de reclamação. A ERS ' +
        'monitoriza e pode instaurar processo contra o prestador.',
      whatItMeans:
        'Uma reclamação formal cria registo documental do incumprimento, útil tanto ' +
        'para pressionar o hospital como para instruir um pedido ao abrigo da ' +
        'Diretiva 2011/24/UE.',
      steps: [
        'Apresente reclamação no Livro de Reclamações Eletrónico ou diretamente no portal da ERS.',
        'Identifique o hospital, a especialidade, a data do pedido ou indicação, e o prazo máximo aplicável.',
        'Anexe tudo o que comprove a data de inscrição e a ausência de marcação.',
        'Guarde o número de reclamação: é a sua prova de diligência.',
      ],
      warnings: [],
    },

    revisao_prioridade: {
      title: 'Pedido de reavaliação da prioridade clínica',
      summary:
        'A prioridade atribuída determina o prazo máximo. Se o seu estado clínico ' +
        'piorou, a prioridade pode ser revista, e o prazo encurta.',
      whatItMeans:
        'Subir de "normal" para "prioritária" pode reduzir o prazo de uma cirurgia ' +
        'geral de 180 para 30 dias. A reavaliação é um ato clínico: tem de ser ' +
        'pedida ao médico.',
      steps: [
        'Marque consulta com o médico que o inscreveu e descreva concretamente a evolução dos sintomas e o impacto funcional no seu dia a dia.',
        'Peça que a reavaliação da prioridade fique registada no processo clínico.',
        'Se a prioridade for alterada, confirme no Gabinete do Utente que o prazo foi recalculado.',
      ],
      warnings: [
        'A prioridade é uma decisão clínica. Esta aplicação não a pode alterar nem estimar.',
      ],
    },

    acompanhamento_gabinete_utente: {
      title: 'Acompanhar a sua inscrição',
      summary:
        'Ainda está dentro do prazo legal. Faltam {daysRemaining} dias para o prazo ' +
        'expirar ({dueDate}).',
      whatItMeans:
        'Nesta fase não há ainda um direito de transferência ativado. Vale a pena ' +
        'confirmar que os seus contactos, sobretudo o e-mail, estão corretos no ' +
        'hospital: o vale cirurgia é enviado por via digital e muitos utentes ' +
        'perdem-no por desatualização.',
      steps: [
        'Confirme no Gabinete do Utente do hospital que o seu e-mail e telefone estão atualizados.',
        'Peça por escrito a confirmação da data de registo do pedido e da prioridade clínica atribuída: é a data a partir da qual o prazo conta.',
        'Consulte os tempos médios de espera do seu hospital e especialidade para calibrar expectativas.',
      ],
      warnings: [],
    },
  },

  disclaimer:
    'Esta avaliação é informativa e baseia-se nos prazos legais publicados. Não ' +
    'constitui aconselhamento jurídico nem clínico, não substitui a avaliação do ' +
    'seu médico e não altera a prioridade clínica atribuída. Em caso de ' +
    'agravamento, contacte o SNS 24 (808 24 24 24) ou, em emergência, o 112.',

  valeGuidance: [
    'Uma cirurgia programada não é uma ida só: conte com consulta pré-operatória, cirurgia, alta e seguimento. É por isso que mostramos a carga total de viagens.',
    'Confirme se tem acompanhante disponível para o dia da alta: vários procedimentos exigem-no.',
    'Antes de recusar o vale, pondere: recusar mantém a sua posição na lista do hospital de origem, mas não acelera a cirurgia.',
    'Depois de o hospital de destino confirmar a transferência, já não pode mudar de hospital, salvo falha grave desse hospital.',
    'Ligue ao hospital escolhido com o número do vale à mão (canto superior direito do documento) e peça confirmação escrita.',
  ],

  valeDisclaimer:
    'Classificação estritamente LOGÍSTICA. Não avalia qualidade clínica, não ordena ' +
    'hospitais por resultados de saúde e não constitui recomendação médica. A ' +
    'escolha do hospital deve ser discutida com o seu médico.',

  valeTripsExplanation:
    '{trips} idas e voltas estimadas (pré-operatória, cirurgia, alta, seguimento).',

  errors: {
    tmrgNotFound:
      'Combinação não prevista na tabela de prazos em vigor. Verifique tipo de ' +
      'cuidado, doença e prioridade.',
    invalidDate: 'Data inválida. Use o formato AAAA-MM-DD.',
    futureDate: 'A data do pedido não pode ser no futuro.',
    noHospitals: 'Indique os hospitais que constam do seu vale cirurgia.',
    tooManyHospitals: 'Máximo de 20 hospitais por pedido.',
    noneLocated:
      'Não foi possível localizar nenhum dos hospitais indicados. Verifique a ' +
      'grafia dos nomes exatamente como aparecem no documento do vale.',
  },
};
