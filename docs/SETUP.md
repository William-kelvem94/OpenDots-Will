# Como executar o modelo

O OpenDots executa uma aplicação React e um servidor Node. O servidor armazena páginas, configurações de espaços e Dots e vínculos com Threads no SQLite, além de se conectar aos serviços de conversa, modelo e mensagens que você configurar.

## Desenvolvimento local

Use Node.js 24 e npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Abra http://127.0.0.1:5173. A API é executada na porta 4310. Sem credenciais dos serviços, o app mostra a tela de configuração; ele não gera respostas simuladas.

Durante `npm run dev`, as origens http://localhost:5173 e http://127.0.0.1:5173 são permitidas no navegador. A interface envia as solicitações à API pelo proxy `/api` do Vite. Para usar outro proxy ou domínio personalizado, defina `APP_ORIGIN` com uma origem exata ou uma lista separada por vírgulas, por exemplo, `APP_ORIGIN=http://localhost:5173,http://127.0.0.1:5173`. Um valor explícito substitui os padrões de desenvolvimento. As origens devem corresponder exatamente ao esquema, host e porta; não inclua caminhos nem barras finais. Espaços ao redor dos itens são removidos e itens vazios são ignorados. Fora do modo de desenvolvimento, se `APP_ORIGIN` não estiver definido, a origem do navegador deve corresponder à origem da URL solicitada. Esta configuração mantém o bloqueio de solicitações entre sites; ela não habilita acesso direto à API pelo navegador a partir de outra origem.

Para iniciar a aplicação local compilada:

```sh
npm run build
npm start
```

Abra http://127.0.0.1:4310. Mantenha o servidor em execução para que as tarefas em segundo plano funcionem.

## Serviços de conversa

O OpenDots exige o CopilotKit Intelligence para conversas. Escolha a avaliação local abaixo, uma [implantação autogerenciada licenciada](https://docs.copilotkit.ai/intelligence/self-hosting) ou o Intelligence hospedado. Páginas e metadados do espaço de trabalho permanecem no SQLite; o histórico das conversas é armazenado separadamente. Consulte [Dados e privacidade](../README.md#dados-e-privacidade).

### Intelligence hospedado

Para obter uma chave de projeto hospedado, execute estes comandos na pasta do OpenDots depois de `cp .env.example .env`:

```sh
npx copilotkit@latest login
npx copilotkit@latest project select
```

`login` abre o navegador para entrar ou criar uma conta. `project select` permite selecionar ou criar um projeto e grava em `.env` uma chave com escopo de projeto chamada `CPK_INTELLIGENCE_API_KEY`. Ao implantar, inclusive com Docker, mantenha o `CPK_TELEMETRY_ID` gerado junto com a chave do projeto. Ele associa a telemetria do SDK à conta Intelligence selecionada; consulte [rastreamento de cadastro e uso](TELEMETRY.md). O comando remove uma linha `INTELLIGENCE_API_KEY`, para que o arquivo mantenha apenas uma credencial. Use o mesmo projeto para o Slack e o Aprendizado automático descritos abaixo.

Não execute `copilotkit onboard` nesta pasta. O onboarding é voltado a apps que ainda não têm CopilotKit; o OpenDots já inclui essa integração.

<a id="local-intelligence-evaluation"></a>
### Avaliação local do Intelligence

A [versão de avaliação local](https://docs.copilotkit.ai/intelligence/self-hosting-local) executa o Intelligence no Docker Desktop para macOS. Disponibilize pelo menos 4 CPUs, 12 GiB de RAM e 40 GiB de espaço livre. O OpenDots requer Node.js 24. É necessária uma conta CopilotKit; o plano Developer gratuito dá direito a uma licença de avaliação renovável por 30 dias. Esta não é uma instalação para produção.

Com o Docker Desktop em execução, rode os comandos a seguir na pasta do OpenDots, depois de `cp .env.example .env`:

```sh
npx copilotkit@latest login
npx copilotkit@latest local setup
npx copilotkit@latest local connect
npx copilotkit@latest local connect --approve-connection
```

`local connect` mostra as alterações previstas; o comando aprovado grava em `.env` a URL da API local, a URL WebSocket do gateway e a chave do projeto. O OpenDots aceita esses valores diretamente. Não execute `project select` depois, pois ele seleciona um projeto hospedado. Adicione `OPENAI_API_KEY` e `OPENAI_MODEL` para o app e reinicie `npm run dev`. O modelo usado pelo Aprendizado na configuração é separado do modelo da aplicação.

Envie uma mensagem e confira se ela aparece no painel local (`npx copilotkit@latest local login`). Use `local status` para verificar a saúde dos serviços. Threads, Aprendizado automático e Channels estão incluídos; User Memory e Product Analytics não estão. O Channels exige um endereço HTTPS público acessível pelo Slack ou Teams.

Para restaurar a conexão anterior da aplicação, execute `npx copilotkit@latest local cancel` e reinicie o app. A stack e os dados serão mantidos. Use `local stop` para parar a stack ou `local renew` para renovar a licença de avaliação. As conversas existentes no serviço hospedado não são copiadas para o projeto local.

Para esta avaliação, execute o OpenDots diretamente no Mac com `npm run dev`; o Intelligence roda no Docker. As URLs `localhost` da CLI não funcionam de dentro de um contêiner do OpenDots. Uma aplicação em contêiner precisa de um endereço de API acessível por seu contêiner e de um endereço de gateway acessível pelo servidor e pelo navegador, pois o runtime informa esse gateway aos clientes. Alterar o gateway para um nome de host acessível apenas pelo Docker não é suficiente.

### Configurações de conexão

Edite `.env` no servidor e reinicie-o após as alterações:

| Variável                                             | Finalidade                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `INTELLIGENCE_API_KEY`                               | Credencial do projeto para persistir conversas                         |
| `INTELLIGENCE_API_URL`                               | Substituição do endpoint da API da sua implantação do Intelligence    |
| `INTELLIGENCE_GATEWAY_WS_URL`, `INTELLIGENCE_WS_URL` | URL WebSocket alternativa do gateway (prefira o nome da CLI; o legado é aceito) |
| `OPENAI_API_KEY`, `OPENAI_MODEL`                     | Credencial e identificador do modelo                                   |
| `OPENAI_BASE_URL`                                    | Endpoint compatível com a API de modelos                               |
| `OWNER_ID`                                           | Identidade estável das conversas desta implantação                    |
| `DATABASE_PATH`                                      | Arquivo SQLite com páginas, espaços de trabalho e metadados de tarefas |
| `OWNER_TOKEN`                                        | Token de acesso à aplicação; obrigatório para integrações externas     |
| `APP_ORIGIN`                                         | Origens exatas do navegador, separadas por vírgulas, para proxy ou domínio próprio |

`npx copilotkit project select` exclui a linha `INTELLIGENCE_API_KEY` e grava a mesma credencial como `CPK_INTELLIGENCE_API_KEY`. O servidor aceita qualquer um dos nomes. Se `CPK_INTELLIGENCE_API_KEY` não estiver vazio, ele tem prioridade sobre `INTELLIGENCE_API_KEY`.

Se `INTELLIGENCE_GATEWAY_WS_URL` não estiver vazio, ele tem prioridade sobre `INTELLIGENCE_WS_URL`. Sem nenhuma dessas substituições de WebSocket, o OpenDots usa o gateway hospedado. Ao conectar uma implantação autogerenciada, configure os endpoints da API e do gateway.

Os nomes das variáveis de ambiente do modelo seguem o adaptador do provedor configurado. As credenciais do provedor devem ficar em `.env`, não em variáveis do cliente nem no código-fonte. O histórico das conversas fica no projeto Intelligence configurado; copiar apenas o arquivo SQLite não faz backup desse histórico.

## Páginas e conversas sobre páginas

Selecione um espaço para abrir a biblioteca de páginas. Busque um documento, alterne entre as visualizações em grade e lista ou crie uma página. O editor visual oferece formatação, títulos, listas, listas de tarefas, tabelas e comandos de barra. Use `/` para inserir um bloco e Cmd/Ctrl+S para salvar imediatamente. As páginas são salvas automaticamente quando você pausa a edição; o status indica se as alterações chegaram ao servidor.

As ações da página incluem criar subpáginas, mover uma página dentro do espaço, excluir uma página (as subpáginas sobem para a página principal da excluída) e editar o código-fonte Markdown. Documentos existentes com sintaxe não compatível com o editor visual permanecem no modo de código-fonte para preservar o conteúdo. A edição manual funciona sem credenciais de conversa.

Abra o chat de uma página e escolha um especialista com acesso ao espaço. Conceda o acesso nas configurações do Dot na barra lateral. O servidor cria ou reutiliza uma Thread do CopilotKit para a página e o especialista. O Dot recebe a versão salva da página como contexto e pode ler, criar e editar páginas nos espaços autorizados. A conversa da página usa o espaço dela por padrão; outros chats usam o destino padrão de páginas do Dot. Salve suas edições manuais antes de pedir uma revisão do documento. As verificações de revisão rejeitam gravações desatualizadas; em caso de conflito, seu rascunho local fica disponível para recuperação. Após falhas, novas tentativas automáticas são interrompidas até que você tente novamente ou resolva o conflito, evitando que uma sessão desconectada substitua conteúdo mais recente sem aviso.

Use a ação de salvar como página da conversa para criar um documento a partir do histórico de texto salvo. É necessário que o serviço de conversas esteja funcionando. As páginas mantêm um link para a conversa de origem, e links para páginas no chat abrem o espaço de documentos.

Faça backup das duas camadas de armazenamento: o SQLite contém o conteúdo das páginas e os vínculos com Threads; o projeto Intelligence contém o histórico das conversas. O modelo não inclui compartilhamento de páginas entre usuários, colaboração em tempo real, envio de arquivos nem incorporações interativas genéricas.

## Ferramenta de navegador

O Parallel é selecionado por padrão (`WEB_SEARCH_PROVIDER=parallel`). Pesquisas reais precisam da configuração do modelo, mas não de um worker de navegador. A variável opcional `PARALLEL_API_KEY` no servidor habilita uso autenticado e limites maiores. O endpoint MCP anônimo é gratuito para uso leve. Consultas, URLs selecionadas, objetivos da pesquisa e um identificador estável de sessão são enviados ao Parallel. Consulte [Pesquisa na Web pública](../README.md#pesquisa-na-web-pública) para saber sobre compartilhamento de dados, permissões e limitações.

Defina `WEB_SEARCH_PROVIDER=disabled` para desativar essas ferramentas de pesquisa ou `WEB_SEARCH_PROVIDER=browser` para usar o leitor existente, limitado a URLs. O serviço de navegador acessa uma URL pública informada e retorna o texto e uma captura da página. Configure `BROWSER_URL` e `BROWSER_SECRET` e execute:

```sh
npx playwright install chromium
npm run browser
```

Use o mesmo segredo nos processos do app e do navegador. A navegação é somente leitura, com JavaScript desativado. Endereços privados, redirecionamentos e páginas autenticadas não são compatíveis; informe uma URL pública canônica. Esta é uma ferramenta de pesquisa limitada, não um computador ou terminal de uso geral.

## Computadores persistentes dos Dots

Para disponibilizar um navegador separado, arquivos persistentes e um terminal opcional a cada especialista, siga [Configuração do computador](COMPUTERS.md). Esse recurso usa serviços de computador/supervisor do OpenBot com versões fixadas e permissões por Dot. As ferramentas de pesquisa do Parallel continuam disponíveis junto com as ferramentas de computador configuradas. Ao selecionar o provedor de navegador, os Dots usam as ferramentas de computador no lugar da ferramenta somente leitura para páginas públicas; habilite os recursos necessários para cada Dot antes de usá-los.

## Slack

O OpenDots usa `@copilotkit/channels` com uma conexão gerenciada do Slack, seguindo o padrão de runtime e canais do [OpenTag](https://github.com/CopilotKit/OpenTag). A aplicação declara o canal e seu agente especialista; o Intelligence gerencia o adaptador do Slack e a entrega das mensagens. Não é necessário configurar um servidor webhook do Slack separado nem uma conexão Socket Mode no OpenDots.

Os comandos da CLI para selecionar projetos abaixo se aplicam ao Intelligence hospedado. Para avaliação local, configure o Channels no painel local e siga os [requisitos locais do Channels](https://docs.copilotkit.ai/intelligence/self-hosting-local#connect-slack-or-microsoft-teams), incluindo um endereço HTTPS público. Não substitua a chave do projeto local usando `project select`.

### Criar o canal gerenciado

Selecione o mesmo projeto Intelligence usado por esta aplicação e crie um canal com nome exclusivo:

```sh
npx --yes copilotkit@latest project select
npx --yes copilotkit@latest channels add --name opendots --display-name "OpenDots" --adapter slack --json
```

Siga o `nextAction` retornado pela CLI para criar o app do Slack usando o manifesto gerado, informar as credenciais pelo fluxo de configuração gerenciado e executar o `resumeCommand`. Uma resposta `blocked` significa que ainda é necessária uma etapa no console do Slack; resolva uma resposta `failed` antes de continuar. Mantenha o Socket Mode desativado. Instale ou reinstale o app gerado no espaço de trabalho com os escopos solicitados. Use um nome de canal diferente em cada implantação para evitar concorrência na entrega de mensagens.

Consulte o [guia de configuração do OpenTag](https://github.com/CopilotKit/OpenTag/blob/main/setup.md) para ver as etapas no console do Slack. Tokens de bot e segredos de assinatura do Slack devem ficar na configuração do adaptador gerenciado, nunca no navegador ou no `.env` desta aplicação.

### Conectar um especialista

Configure o arquivo `.env` do servidor da aplicação junto com as credenciais do Intelligence e do modelo:

```dotenv
SLACK_CHANNEL_NAME=opendots
SLACK_TEAM_ID=T_REPLACE_WITH_WORKSPACE_ID
SLACK_USER_IDS=U_REPLACE_WITH_YOUR_USER_ID
SLACK_DOT_ID=REPLACE_WITH_DOT_ID
```

`SLACK_CHANNEL_NAME` deve corresponder exatamente ao nome do canal gerenciado, não ao nome de uma conversa do Slack, como `#geral`. No OpenTag, essa configuração é chamada `INTELLIGENCE_CHANNEL_NAME`; no OpenDots, use `SLACK_CHANNEL_NAME`. `SLACK_TEAM_ID` e a lista de `SLACK_USER_IDS` separada por vírgulas limitam quem pode invocar o especialista. `SLACK_DOT_ID` seleciona um Dot existente; consulte os IDs na resposta autenticada de `/api/workspace`. Se omitido, o Dot inicial será usado.

Reinicie o OpenDots após alterar as variáveis de ambiente e confira o status do Slack em Configurações. A ativação do canal precisa ser concluída antes de enviar mensagens. Mencione o bot instalado em um canal ao qual ele tenha acesso; as mensagens seguintes nessa conversa serão encaminhadas ao mesmo especialista. Conversas sem relação, eventos de bots, edições, exclusões e usuários fora da lista autorizada não iniciam execuções do agente. Não é possível editar uma mensagem para adicionar uma menção; envie uma nova mensagem.

Este modelo associa os usuários autorizados do Slack ao único proprietário do OpenDots. As respostas ficam visíveis para todas as pessoas na conversa do Slack; escolha o acesso a espaços e as ferramentas permitidas do especialista de acordo com isso. Este não é um modelo de identidade multiusuário.

### Verificar sua implantação

Com um usuário autorizado, mencione o bot e confira se a resposta chega na mesma conversa do Slack. Responda nessa conversa e confirme que o contexto continua. Verifique se uma conversa sem relação e um usuário não autorizado não conseguem invocar o bot. Pause o assistente no OpenDots e confirme que uma solicitação permitida recebe um aviso de pausa. Confira em Configurações se há falhas de conexão com o canal.

Os testes locais exercitam o comportamento do canal com simulações. Menções e respostas reais do Slack não foram verificadas; isso exige configurar a conexão gerenciada e as credenciais do modelo. A [documentação do Channels SDK](https://github.com/CopilotKit/channels-sdk) explica como ampliar o adaptador e o comportamento dos canais.

## Chamadas

O adaptador de voz incluído usa a Realtime API em `api.openai.com`. Defina `VOICE_API_KEY` com uma chave que tenha acesso à API e `VOICE_MODEL` com um modelo Realtime compatível (o teste local da interface usou `gpt-realtime-2.1`); `VOICE_NAME` seleciona a voz. `OPENAI_BASE_URL` altera apenas o endpoint do modelo de execução, não o serviço de voz. As chamadas usam o microfone do navegador e WebRTC. Implantações hospedadas precisam de HTTPS. O servidor coordena a configuração do provedor e delega a execução à conversa do Dot selecionado.

Uma chave configurada não garante que a chamada funcione. Antes de depender de fluxos por voz, verifique na sua implantação o acesso ao microfone, a reprodução de áudio, a delegação de execução, a interrupção, o encerramento e o registro salvo.

## Contêineres

Defina `OWNER_TOKEN` e `BROWSER_SECRET` como segredos aleatórios diferentes, com pelo menos 24 caracteres, em `.env`. Depois, execute:

```sh
docker compose up --build -d
```

Abra http://localhost:4310. A porta do app é vinculada ao loopback. O serviço de navegador é opcional: defina `BROWSER_SECRET` com pelo menos 24 caracteres e execute `docker compose --profile browser up --build` para habilitá-lo; nenhuma porta é publicada. Os metadados da aplicação ficam no volume `opendots-data`.

```sh
# Pare os serviços sem excluir os dados salvos.
docker compose down
```

Para hospedagem remota, configure um proxy reverso HTTPS e o `APP_ORIGIN` correspondente. Consulte [Segurança](../SECURITY.md) para conhecer os limites previstos para a implantação deste modelo.

<a id="automatic-learning"></a>
## Aprendizado automático

O OpenDots conecta o [Aprendizado automático do CopilotKit](https://docs.copilotkit.ai/learning)
a Dots individuais. Ele usa a credencial do Intelligence no servidor
(`CPK_INTELLIGENCE_API_KEY` ou `INTELLIGENCE_API_KEY`) e, opcionalmente,
`INTELLIGENCE_API_URL`; não é necessária uma chave adicional de modelo ou de frontend.

1. Abra **Learning** no mesmo projeto Intelligence e crie um contêiner para
   um fluxo de trabalho específico, como `research-workflow`. Os IDs aceitam
   de 1 a 64 letras minúsculas, números e hífens simples.
2. No OpenDots, edite o Dot e informe esse ID em **Aprendizado automático**.
   Salvar o ID configura o roteamento, mas não cria nem verifica o contêiner remoto.
3. Inicie novas conversas e conclua fluxos relacionados. Cada conversa mantém
   o contêiner atribuído quando foi criada. Conversas existentes, inclusive as
   anteriores a esta integração, não são incluídas retroativamente. Alterar ou
   remover o ID do Dot afeta apenas novas conversas. Isso se aplica ao chat da
   página, às tarefas agendadas e por voz nessas conversas e a novas conversas no Slack.
4. No Intelligence, inspecione as evidências, execute o Learning manualmente ou use o agendamento,
   e revise e publique as habilidades propostas. O limite automático padrão é de
   15 Threads elegíveis; use a contagem de prontidão exibida na sua implantação.
5. Ative **Skill delivery** no contêiner Intelligence e, em seguida, **Usar
   habilidades publicadas** nas configurações do Dot. Inicie uma nova interação em uma
   conversa incluída. O BuiltInAgent carrega o catálogo publicado verificado mais
   recente; a factory do TanStack AI executa o modelo e disponibiliza
   `copilotkit_load_skill` e `copilotkit_read_skill_file`. O modelo decide quais
   habilidades relevantes carregar. Confira as chamadas de ferramentas da execução
   para verificar o uso; salvar as configurações não comprova a conexão.

O envio de habilidades sempre usa o contêiner original da conversa, mesmo depois que o
Dot é associado a outro contêiner. A caixa de seleção de entrega do Dot vale para
todas as conversas dele. Desmarcá-la interrompe a entrega nas próximas interações;
alterar as configurações do Learning também interrompe o trabalho em andamento.
Conversas sem contêiner não solicitam habilidades. As permissões existentes de
pesquisa, memória, páginas e computador continuam valendo.

A ingestão e a entrega são independentes. Remover o contêiner não exclui conversas
anteriores; pause o Learning no Intelligence para interromper a análise. Desativar
a entrega não interrompe a coleta de evidências. Se a entrega for negada ou o
snapshot inicial das habilidades estiver indisponível, a interação falhará em vez
de continuar sem as habilidades configuradas. Restaure a entrega ou desmarque
**Usar habilidades publicadas** para continuar sem elas. As habilidades precisam
ser revisadas e publicadas no Intelligence; o OpenDots não as aprova automaticamente.

A integração usa uma lista explícita de contêineres; portanto, as variáveis
`CPK_INTELLIGENCE_LEARNING_CONTAINER_ID` e `CPK_INTELLIGENCE_SKILLS_REVISION`
do ambiente não substituem a configuração da conversa. O Intelligence
autogerenciado precisa oferecer suporte aos [endpoints de entrega de habilidades](https://docs.copilotkit.ai/intelligence/learned-skills).

## Verificações de desenvolvimento

```sh
npm run check-format
npm run lint
npm run typecheck
npm test
npm run build
```

Os testes automatizados usam simulações de serviços. Para verificar o modelo, o Intelligence, o Slack e a voz ao vivo, configure seus próprios serviços.
