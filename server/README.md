# Run To Health — API (v2)

API da plataforma Run To Health. Duas coisas distintas:

1. **Pesquisa de unidades de saúde** — encontrar clínicas e hospitais por
   especialidade e localização, com distâncias e tempos de viagem reais.
2. **Motor de direitos do utente do SNS** — a parte que não existe em mais
   nenhum sítio: dado o tempo de espera, calcular que direitos legais o utente
   já pode exercer, e como.

## Arranque rápido

```bash
cp .env.example .env     # funciona mesmo vazio
npm install
npm start                # http://localhost:5000
npm test                 # 76 testes, sem rede
npm run smoke            # valida os serviços externos reais
```

Node >= 20. Uma única dependência de produção (`express`).

## Custo de operação: zero

Não há chaves de API. Não há faturação. Não há cartão de crédito.

| Função | Antes (v1) | Agora (v2) |
|---|---|---|
| Mapa | Google Maps JS API | Leaflet + tiles OpenStreetMap |
| Pesquisa de locais | Google Places | Overpass API (dados OSM) |
| Geocodificação | Google Geocoding | Nominatim |
| Tempos de viagem | Google Directions, 2 chamadas por cartão | OSRM `/table`, 1 chamada para todos |
| LLM | `cohere-ai` (avariado) | qualquer API compatível com OpenAI, opcional |

### Uso responsável dos serviços comunitários

Nominatim, Overpass e o OSRM público são mantidos por donativos. O código
cumpre as políticas de uso do nosso lado:

- fila com intervalo mínimo entre pedidos (1,1 s no Nominatim);
- cache por camada (30 dias na geocodificação, 24 h nos POIs, 30 min nas rotas);
- degradação graciosa: se o roteamento falhar, devolve distância geodésica
  marcada com `estimated: true`, em vez de falhar.

Define `HTTP_USER_AGENT` com um contacto real antes de ir para produção, ou
serás bloqueado. Para volume a sério, aloja as tuas instâncias e muda apenas
`NOMINATIM_BASE`, `OVERPASS_BASE` e `OSRM_BASE` — não é preciso tocar no código.

## Endpoints

### Unidades de saúde

```
GET  /api/healthcare?speciality=cardiologia&city=Braga
GET  /api/healthcare/nearby?lat=41.5454&lng=-8.4265&radius=10000
GET  /api/geocode?q=Hospital de Braga
GET  /api/reverse-geocode?lat=41.5454&lng=-8.4265
POST /api/travel-matrix        { origin, destinations[], mode }
GET  /api/specialities
```

### Motor de direitos

```
GET  /api/rights/options       combinações válidas de TMRG, para o formulário
POST /api/rights/assess        { careType, condition, priority, requestDate }
```

Exemplo:

```bash
curl -s localhost:5000/api/rights/assess \
  -H 'Content-Type: application/json' \
  -d '{"careType":"cirurgia","condition":"geral","priority":"normal","requestDate":"2025-01-01"}'
```

Devolve o TMRG aplicável, os dias de espera, o estado
(`dentro_do_prazo` / `transferencia_devida` / `prazo_ultrapassado`) e a lista de
direitos exercíveis — cada um com base legal, passos concretos e ligações
oficiais.

### Seletor de Vale Cirurgia

```
POST /api/vale-cirurgia/rank   { hospitalNames[], origin: {lat,lng} }
```

O vale cirurgia chega ao utente como uma lista de nomes de hospitais. Este
endpoint resolve cada nome, calcula tempos de viagem e ordena as opções pela
**carga logística total** do percurso (uma cirurgia programada são ~4 idas e
voltas: pré-operatória, cirurgia, alta, seguimento).

Não classifica qualidade clínica — não temos dados para isso e inventá-los
seria enganador num contexto cirúrgico.

### Orientação (não diagnóstico)

```
POST /api/orientation          { description, language }
POST /api/getDiagnosis         → 410 Gone
```

## Base legal dos TMRG

A tabela de prazos está em `src/config/tmrg.js`, com fonte e data de
verificação por entrada:

- Lei n.º 15/2014, de 21 de março
- Portaria n.º 153/2017, de 4 de maio
- Portaria n.º 135/2026/1, de 31 de março (adapta ao SINACC)

Fonte dos valores: página de TMRG da Entidade Reguladora da Saúde.
**Verificado em 2026-11-01.**

A lei mudou em abril de 2026 — e vai mudar outra vez. Reverifica a tabela
contra o Diário da República antes de cada release e atualiza `verifiedOn`.

## Segurança: o que foi corrigido

A v1 tinha três problemas graves. Ficam registados para não voltarem.

**1. Proxy aberto com drenagem de faturação (crítico)**

```js
// v1 — qualquer pessoa podia passar QUALQUER URL
app.get('/places', async (req, res) => {
  const apiUrl = `${req.query.apiUrl}&key=${apiKey}`;
  const response = await axios.get(apiUrl);
});
```

SSRF contra serviços internos, e consumo ilimitado da conta Google por
terceiros. Hoje o servidor nunca aceita URLs do cliente: recebe parâmetros
tipados e constrói ele próprio o endpoint.

**2. Segredos no repositório**

`.env` estava commitado com `OPENAI_API_KEY`, `COHERE_API_KEY` e a credencial
do Google Cloud; havia ainda uma chave Google escrita no código em três
ficheiros. Hoje: `.env` está no `.gitignore`, existe `.env.example` com
placeholders, e nenhuma chave vive no código.

> **O histórico do Git continua a conter as chaves antigas.** Remover o
> ficheiro não as desvaza. Elas têm de ser **revogadas**.

**3. Endpoint de diagnóstico**

`POST /api/getDiagnosis` pedia a um LLM "provide multiple possible diagnoses" e
mostrava o resultado ao utente sob o título "Diagnosis". Software com
finalidade de diagnóstico é um dispositivo médico ao abrigo do Regulamento
(UE) 2017/745 (tipicamente classe IIa pela regra 11) e exige avaliação de
conformidade e marcação CE; o Regulamento de IA da UE classifica-o ainda como
de alto risco. Substituído por `/api/orientation`, que faz encaminhamento no
sistema de saúde sem produzir diagnósticos, e cujos sinais de alarme
(dor torácica, AVC, ideação suicida, …) são detetados por regras
determinísticas que funcionam mesmo sem LLM.

Além disso: CORS por lista branca (era `*`, aplicado duas vezes), limitação de
ritmo (não existia), limite de corpo de 100 kB (era 15 MB), cabeçalhos de
segurança, e mensagens de erro que não expõem o interior do servidor.

Dependências removidas: `mongoose`, `moongoose` (*typo-squat* do nome real,
risco de cadeia de fornecimento), `multer`, `@google-cloud/storage`, `openai`,
`cohere-ai`, `fs` (pacote-placeholder, não o módulo do Node), `axios`, `cors`.
Nenhuma era usada.

## Atribuição

Dados de localização © OpenStreetMap contributors, sob
[ODbL](https://opendatacommons.org/licenses/odbl/). A atribuição tem de
aparecer no mapa do cliente.

## Aviso

Esta aplicação presta informação sobre acesso a cuidados de saúde. Não é
aconselhamento médico nem jurídico, não faz diagnósticos e não substitui
avaliação clínica. SNS 24: 808 24 24 24. Emergência: 112.
