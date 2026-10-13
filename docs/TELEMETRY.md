# Rastreamento de cadastros no Intelligence e uso do OpenDots

O OpenDots usa o transporte de telemetria já existente no SDK do CopilotKit. Não
é necessário configurar um SDK ou uma chave PostHog separados nesta aplicação.

## Configurar o servidor

Execute estes comandos na pasta raiz do OpenDots:

```sh
npx copilotkit@latest login
npx copilotkit@latest project select
```

Mantenha os dois valores gerados no ambiente do servidor:

| Variável                   | Finalidade                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `CPK_INTELLIGENCE_API_KEY` | Chave de projeto exclusiva do servidor para conversas persistentes.                        |
| `CPK_TELEMETRY_ID`         | Vínculo de projeto emitido pela CLI e associável a uma conta Intelligence pelo coletor.     |

Implante juntos os valores do projeto selecionado. Não gere seu próprio ID de
telemetria, não reutilize o ID de outro projeto nem coloque qualquer um dos
valores em variáveis do cliente. A chave da API, sozinha, não fornece uma
identidade que a telemetria do runtime possa resolver. Se a CLI informar uma
falha ao provisionar a identidade, resolva-a e selecione o projeto novamente
antes de considerar a atribuição à conta funcional.

O Docker Compose encaminha `CPK_TELEMETRY_ID` de `.env` para o contêiner do app.
Em outros ambientes, copie a identidade gerada pela CLI e a chave de projeto
correspondente para o ambiente do servidor e reinicie-o. Mantenha a identidade
no servidor. Não altere `OWNER_ID` nem os IDs de conversas/Threads; eles definem
o escopo dos dados do app e não representam a identidade da conta cadastrada.

O SDK envia os eventos de runtime existentes para
`https://telemetry.copilotkit.ai/ingest`. O OpenDots adiciona
`accessibility_title: "OpenDots"`. A versão atual do SDK usa amostragem integral
(`1`) por padrão, assim como o Docker Compose. Uma substituição explícita por
`COPILOTKIT_TELEMETRY_SAMPLE_RATE` é respeitada.

Remova configurações antigas da implantação que desativam a telemetria se quiser
mantê-la ativa. Para desativá-la, defina `COPILOTKIT_TELEMETRY_DISABLED=true` ou
`DO_NOT_TRACK=1` e reinicie a API. Ambas as variáveis aceitam `true` ou `1`.
O comando `npm test` desativa a telemetria nas simulações automatizadas comuns.

## O que os eventos medem

- `intelligence_signup`: uma conta Intelligence criada no Clerk, emitida pela
  sincronização existente do backend, usando o ID de usuário do Clerk como
  `distinct_id` no PostHog.
- `oss.runtime.instance_created`: o handler de runtime do OpenDots foi criado.
- `oss.runtime.copilot_request_created`: uma solicitação chegou ao runtime; isso
  comprova uso, mas não uma resposta bem-sucedida do modelo.

O sink enriquece eventos de runtime com `telemetry_id` e, quando a identidade é
resolvida, com `clerk_user_id`. Eventos de runtime e cadastro podem ter valores
`distinct_id` diferentes no PostHog: associe a propriedade `clerk_user_id` do
runtime ao `distinct_id` do cadastro, sem presumir que um funil padrão de pessoas
os associe automaticamente.

Isso associa cadastros concluídos ao uso do OpenDots. Não comprova que o OpenDots
foi a origem da aquisição: a conta pode ter sido criada antes. Para medir a
origem, seria necessário transportar essa informação durante o fluxo de cadastro
do Intelligence. O OpenDots não emite um evento de cadastro duplicado ao iniciar,
entrar ou informar uma chave.

## Validar no PostHog

Após implantar, reinicie a API e envie uma solicitação pelo chat. No
[projeto PostHog 26816](https://eu.posthog.com/project/26816), execute:

```sql
SELECT event, timestamp, distinct_id,
       properties.accessibility_title AS app,
       properties.telemetry_id AS telemetry_id,
       properties.clerk_user_id AS clerk_user_id
FROM events
WHERE event IN (
    'oss.runtime.instance_created',
    'oss.runtime.copilot_request_created'
  )
  AND properties.accessibility_title = 'OpenDots'
  AND timestamp >= now() - INTERVAL 1 DAY
ORDER BY timestamp DESC
LIMIT 20
```

Confirme a identificação do app, a identidade de telemetria esperada e o usuário
Clerk resolvido. Depois, localize o evento `intelligence_signup` desse usuário.
Para contar as contas cadastradas nos últimos 30 dias que também usaram o
OpenDots nesse período:

Execute a [consulta salva de contas cadastradas](telemetry/opendots-signups.hogql.sql).
Ela associa solicitações às contas cadastradas pelo ID do Clerk. Se uma
solicitação não tiver enriquecimento Clerk, usa o evento de inicialização/runtime
resolvido mais recente com a mesma identidade de telemetria no período do
relatório. Assim, não se presume que toda solicitação tenha uma conta resolvida
nem se associam instalações diferentes por IP ou ID de pessoa do PostHog. A
[consulta diária de uso](telemetry/opendots-usage.hogql.sql) usa a mesma busca de
identidade. Ambas excluem eventos de validação identificados das solicitações e
das buscas por identidade.

Uma resposta HTTP `202` da ingestão não comprova, por si só, que o evento chegou
ao PostHog. Se o evento ou o enriquecimento de identidade estiver ausente,
verifique o ambiente do servidor implantado e os logs do CloudWatch
`TelemetrySinkIngest` / `TelemetrySinkFanout`. O painel oficial é o
[dashboard 664553](https://eu.posthog.com/project/26816/dashboard/664553).

## Verificação local

`npm test` desativa a telemetria de produção nas simulações comuns. Os testes de
telemetria iniciam processos novos, interceptam chamadas fetch do SDK antes de
importá-lo e verificam a identificação do OpenDots, o cabeçalho de identidade da
CLI, a amostragem integral, a substituição explícita da taxa de amostragem, as
duas formas de desativação e a ausência da chave do projeto no payload. Essas
verificações comprovam o contrato local do SDK; o envio em produção e a resolução
de identidade exigem as verificações do PostHog acima. Contas internas
`@copilotkit.ai` são excluídas da sincronização de cadastros; valide separadamente
um novo cadastro externo.

Peça à pessoa responsável pelos relatórios para adicionar o filtro OpenDots e a
associação pelo ID do Clerk à regra de relatório. A consulta conta contas
cadastradas associadas ao uso, não cadastros causados pelo modelo. A avaliação
local do Intelligence também exige login no CopilotKit, mas um evento de runtime,
por si só, não indica um novo cadastro.

## Consultas de relatório e evidências de validação

As consultas salvas de [contas cadastradas](telemetry/opendots-signups.hogql.sql)
e [uso diário](telemetry/opendots-usage.hogql.sql) excluem testes de validação
identificados. A [consulta de eventos de configuração](telemetry/opendots-setup.hogql.sql)
e a [consulta de conversão por instalação](telemetry/opendots-setup-conversion.hogql.sql)
relatam o [fluxo de configuração no navegador](SETUP-TELEMETRY.md). As quatro
consultas foram executadas com sucesso na API de consultas PostHog de produção.
Use-as como regra de relatório do OpenDots no PostHog. A contagem de solicitações
representa tentativas, incluindo as rejeitadas pelo SDK; não representa respostas
bem-sucedidas.

Em 5 de outubro de 2026, um teste ao vivo do SDK usando o projeto `opendots`
selecionado pela CLI enviou `oss.runtime.instance_created` e
`oss.runtime.copilot_request_created` ao sink de produção. Ambos retornaram HTTP
`202` com o marcador `opendots-validation-be790d6a-ff3e-4ce9-be30-5e3741ffc707`.
A solicitação foi interrompida na validação do corpo pelo SDK, antes de executar
um agente. Não fez chamada ao modelo nem criou cadastro ou conversa de cliente.

Consultas autenticadas ao PostHog retornaram um evento de cada tipo, ambos com
identidade de telemetria e ID de usuário Clerk resolvido. Os dois eventos foram
associados a uma conta da equipe (`@copilotkit.ai`), excluída da sincronização de
cadastros; por isso, a contagem correspondente foi zero. Isso comprova o envio
ao vivo pelo SDK e a resolução da conta, não um novo cadastro externo. As
consultas salvas foram executadas com sucesso: zero contas cadastradas e nenhuma
linha de uso diário sem marcador de validação naquele momento.

A chave de validação pode executar HogQL, mas não ler o dashboard 664553 (`403`,
falta `dashboard:read`). As consultas foram preparadas e executadas, mas não
salvas como gráficos do dashboard. Para salvar a regra de relatório, são
necessários escopos de leitura/gravação de dashboards e insights ou a intervenção
da pessoa responsável pelo relatório.

O emissor de configuração de produção também enviou ao PostHog um evento
`oss.runtime.setup_step_viewed` identificado pelo UUID de instalação:
`opendots-setup-validation-1ddf8b49-4d6a-434e-b345-4982d48cd9a5`. Eventos de
configuração não recebem enriquecimento de conta Clerk pela distribuição
compartilhada; apenas os dois tipos exatos de evento de runtime acima recebem.
Associe configuração e runtime pelo `installation_id` compartilhado para
relacionar a configuração ao uso associado a uma conta. O runtime continua
usando a identidade da CLI como identidade de transporte. Casos extremos de
ativação e abandono são validados localmente, não simulados em produção.

O teste combinado atualizado
`opendots-validation-70c8067c-aa54-48c5-8d37-725baca262cf` enviou eventos de
inicialização, solicitação e visualização de configuração com um UUID de
instalação compartilhado. A inicialização foi associada à conta Clerk; a
solicitação manteve a identidade de telemetria, mas não recebeu enriquecimento
Clerk. Por isso, os relatórios consultam a inicialização com a mesma identidade.
A ausência do ID Clerk em uma solicitação não indica, por si só, que o modelo
perdeu sua identidade. A resolução de dependências do sink compartilhado é
independente da integração de transporte deste modelo.
