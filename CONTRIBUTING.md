# Como contribuir com o OpenDots

O OpenDots é um modelo de aplicação em estágio inicial de desenvolvimento. Concentre as alterações em espaços, Dots especialistas, texto e chamadas, Slack e tarefas em segundo plano que possam ser inspecionadas. Mantenha funcionais as integrações de SDK documentadas e indique claramente quando faltar configuração.

Ao relatar bugs, informe o modo da aplicação, a versão do Node, as etapas para reproduzir, o comportamento esperado e o observado. Remova credenciais e conteúdo privado de páginas dos logs e capturas de tela.

Para propor recursos, descreva primeiro o fluxo do usuário. Diferencie claramente integrações funcionais, simulações de exemplo e trabalho planejado. Não adicione controles que pareçam conectar um serviço quando não houver um adaptador.

Antes de abrir um pull request:

- Adicione testes de regressão para alterações em tarefas persistentes, permissões, cancelamento ou comportamento da API.
- Execute o formatador, o lint, a verificação de tipos, os testes e a compilação de produção do repositório.
- Exercite o comportamento alterado da interface e verifique layouts em telas estreitas e o acesso pelo teclado.
- Atualize as instruções de configuração quando houver mudanças em configurações ou dependências.
- Não inclua credenciais, bancos de dados locais, relatórios de teste gerados nem notas internas de planejamento nos commits.

O código do projeto está sob a licença MIT. Mantenha os avisos aplicáveis a códigos ou recursos de terceiros que você incluir.
