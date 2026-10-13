# Um computador para cada Dot

O OpenDots conecta cada especialista ao próprio contêiner pelo supervisor e serviço de computador do [OpenBot](https://github.com/CopilotKit/OpenBot). O ID de um Dot determina seu computador e volumes persistentes. Arquivos e perfis do navegador são mantidos ao parar e iniciar o serviço; eles são independentes das páginas dos espaços e do histórico de conversas do CopilotKit.

O app disponibiliza ferramentas selecionadas do computador ao mesmo agente Dot usado no chat Web, no Slack, em tarefas agendadas e na execução delegada por voz. As permissões de navegador, arquivos do espaço de trabalho e terminal são salvas por Dot e verificadas pelo servidor. Elas começam desativadas. Se o serviço de computador estiver indisponível, nenhuma ação será redirecionada para o terminal ou os arquivos do host.

## Iniciar os serviços para desenvolvimento local

Use um Docker Engine funcional, com Compose v2 e suporte a contextos de compilação adicionais. Mantenha a aplicação no Node.js 24, conforme descrito em [Configuração](SETUP.md). Adicione a `.env` dois segredos aleatórios diferentes, com pelo menos 24 caracteres, e defina:

```dotenv
COMPUTER_SUPERVISOR_URL=http://127.0.0.1:4312
COMPUTER_SUPERVISOR_TOKEN=REPLACE_WITH_A_RANDOM_SECRET
COMPUTER_TOKEN=REPLACE_WITH_A_DIFFERENT_RANDOM_SECRET
COMPUTER_NAMESPACE=opendots
```

Não use os valores de exemplo. O token do supervisor autoriza solicitações de ciclo de vida. O token de computador é um segredo mestre usado para gerar uma credencial diferente para cada Dot; o segredo mestre permanece na aplicação e no supervisor.

Crie as duas imagens antes de iniciar o supervisor:

```sh
docker compose -f compose.computers.yml build computer-image computer-supervisor
docker compose -f compose.computers.yml up -d computer-supervisor
npm run dev
```

O serviço `computer-image` é um destino de compilação, não um computador compartilhado a ser executado. O supervisor cria um contêiner quando você inicia o computador de um Dot. Nesta configuração local, cada computador publica uma porta loopback dinâmica para o app acessar. A porta 4312 é o endpoint loopback do supervisor. A rede de controle local usa uma bridge comum para permitir que o Docker publique essa porta. A configuração adicional para executar o app em contêiner torna a rede de controle interna e remove a porta do host; o app passa a se conectar pelo DNS do serviço.

Abra o painel **Computador** de um Dot, habilite o acesso ao computador e os recursos desejados e selecione **Iniciar**. Confira o status, navegue até uma página e atualize a tela. Conceda acesso ao terminal apenas quando o Dot precisar executar comandos.

## Executar a aplicação em contêineres

Configure também `OWNER_TOKEN` e `BROWSER_SECRET`, além dos segredos do computador. Use a configuração adicional que conecta o app às redes do computador e do supervisor:

```sh
docker compose -f compose.yml -f compose.computers.yml -f compose.computers-app.yml build computer-image computer-supervisor app browser
docker compose -f compose.yml -f compose.computers.yml -f compose.computers-app.yml up -d app browser computer-supervisor
```

Nesta configuração, o app acessa os computadores pelos nomes dos contêineres. Nenhuma porta deles é publicada no host. O supervisor fica em uma rede de controle separada e é o único que monta o socket do Docker. Nem o app Web nem o computador de um Dot recebem esse socket. Alterar o namespace muda os contêineres e volumes selecionados; mantenha-o estável e exclusivo para cada implantação.

## Usar o computador

- **Navegador:** acesse e inspecione a página atual, incluindo capturas de tela e snapshots dos elementos. Os perfis do navegador mantêm cookies e sessões após reiniciar os contêineres.
- **Assumir o controle:** pause as ações do agente enquanto você clica, digita, rola ou pressiona teclas no navegador. Libere o controle quando terminar. Antes de retomar ações em elementos, o agente precisa obter um snapshot atualizado.
- **Arquivos:** liste, leia e grave arquivos de texto no espaço de trabalho do Dot. Os caminhos devem permanecer relativos a esse espaço. Esses arquivos não são adicionados automaticamente às páginas dos espaços.
- **Terminal:** execute um comando limitado dentro do contêiner do Dot quando o acesso ao terminal estiver habilitado. A saída do comando é exibida; ele não é executado no host do OpenDots.
- **Atividade:** inspecione os nomes das ações, quem as solicitou e se foram bem-sucedidas. Por segurança, o registro de auditoria não inclui os valores digitados, o conteúdo dos arquivos nem comandos completos.

Parar mantém os arquivos e perfis do navegador. O app não oferece uma ação de redefinição destrutiva. Parar o supervisor não interrompe os computadores criados dinamicamente; pare primeiro o computador de cada Dot se quiser deixá-los todos offline. O Compose não gerencia esses contêineres ou volumes dinâmicos. Não exclua volumes nomeados de espaços de trabalho ou perfis como parte da limpeza de rotina.

Revogar um recurso cancela a solicitação ativa da aplicação e impede ações posteriores. O cancelamento não desfaz efeitos já concluídos, e uma operação de navegador em andamento pode terminar depois do cancelamento. Pare o computador para encerrar toda a atividade no contêiner. A atividade mantém os mil registros concluídos mais recentes por Dot, além das solicitações pendentes.

O modelo usa o isolamento padrão de contêineres Docker; eles compartilham o kernel do host. O acesso ao terminal permite executar programas e acessar a rede dentro do contêiner, além de ler o perfil de navegador do próprio Dot. Execute o projeto em uma infraestrutura adequada a esse nível de confiança. `COMPUTER_RUNTIME=runsc` pode selecionar um runtime gVisor já instalado; o modelo não o instala nem garante isolamento adicional por padrão. Ele também não configura uma política restritiva de tráfego de saída da rede.

## Verificar e solucionar problemas

Crie dois Dots e habilite os recursos em teste. Grave um arquivo no computador do primeiro e confirme que o segundo não consegue listá-lo. Pare e reinicie o primeiro e verifique se o arquivo persiste. Teste uma sessão do navegador após reiniciar, assumir e devolver o controle, permissões desativadas e o comportamento da pausa. Confirme que as ferramentas do computador informam claramente quando o serviço está indisponível.

Um endpoint configurado não comprova que o Docker provisionou o computador corretamente. Um status de indisponibilidade pode indicar que o daemon Docker está parado, que a imagem não foi criada, que as credenciais são diferentes ou que o app não consegue acessar o endereço retornado pelo computador. Use a configuração local para executar o app no host e a configuração adicional para executá-lo em um contêiner. Não substitua o endereço retornado do serviço por outro arbitrário nem exponha a API do computador diretamente à Internet.

A revisão do código-fonte e a alteração restrita de credenciais por Dot estão documentadas em [deployment/computers](../deployment/computers/README.md). Quando o token mestre ou a imagem mudar, o supervisor substituirá os contêineres de computador gerenciados na próxima solicitação de verificação, mantendo os volumes de perfil e espaço de trabalho. Isso encerra qualquer atividade em andamento; coordene atualizações com o trabalho ativo.

Os testes automatizados usam simulações controladas dos serviços para verificar políticas, solicitações e ciclo de vida. As verificações reais de Docker, modelo, Slack e voz devem ser registradas separadamente desses testes.
