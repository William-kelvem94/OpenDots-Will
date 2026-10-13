let token = sessionStorage.getItem('opendots-token') ?? '';
export function setToken(value: string) {
  token = value;
  if (value) sessionStorage.setItem('opendots-token', value);
  else sessionStorage.removeItem('opendots-token');
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export function translateApiError(message: string): string {
  const exact: Record<string, string> = {
    'Server returned an unreadable response.': 'O servidor retornou uma resposta ilegível.',
    'The service request failed. Check the server configuration and try again.': 'A solicitação falhou. Verifique a configuração do servidor e tente novamente.',
    'Conversation sync unavailable. Check your runtime connection.': 'A sincronização de conversas está indisponível. Verifique a conexão com o runtime.',
    'Computer service is not configured.': 'O serviço de computador não está configurado.',
    'Computer service is unavailable or returned an invalid response.': 'O serviço de computador está indisponível ou retornou uma resposta inválida.',
    'There is no active control request.': 'Não há uma solicitação de controle ativa.',
    'This tool is no longer enabled for this Dot. Nothing was run.': 'Esta ferramenta não está mais habilitada para este Dot. Nada foi executado.',
    'Intelligence could not create this conversation. Check the runtime key and connection.': 'O Intelligence não conseguiu criar esta conversa. Verifique a chave e a conexão do runtime.',
    'Enter your owner access token to unlock OpenDots.': 'Informe o token de acesso do proprietário para desbloquear o OpenDots.',
    'Request is too large.': 'A solicitação é grande demais.',
    'Unrecognized host.': 'Host não reconhecido.',
    'Cross-origin requests are not allowed.': 'Solicitações entre origens diferentes não são permitidas.',
    'Cross-site requests are not allowed.': 'Solicitações entre sites diferentes não são permitidas.',
    'Use application/json.': 'Use o formato application/json.',
    'Research is disabled in Settings.': 'A pesquisa está desativada nas configurações.',
    'Select a conversation for this scheduled task.': 'Selecione uma conversa para esta tarefa agendada.',
    'Conversation is not owned by this workspace.': 'Esta conversa não pertence a este espaço de trabalho.',
    'Task not found.': 'Tarefa não encontrada.',
    'Unknown task action.': 'Ação de tarefa desconhecida.',
    'Repeat interval must be 60 seconds to one year, or null.': 'O intervalo de repetição deve ser de 60 segundos a um ano, ou nulo.',
    'Invalid settings.': 'Configurações inválidas.',
    'Memory must be between 1 and 2,000 characters.': 'A memória deve ter entre 1 e 2.000 caracteres.',
    'Memory not found.': 'Memória não encontrada.',
    'Connection not found.': 'Conexão não encontrada.',
    'Approval request not found.': 'Solicitação de aprovação não encontrada.',
    'This action is already running.': 'Esta ação já está em execução.',
    'This action belongs to a different approval request.': 'Esta ação pertence a outra solicitação de aprovação.',
    'Page not found in this Space.': 'Página não encontrada neste espaço.',
    'This Dot no longer has access to the selected Space.': 'Este Dot não tem mais acesso ao espaço selecionado.',
    'Choose a specialist.': 'Escolha um especialista.',
    'Enter a valid page title and parent.': 'Informe um título de página e uma página superior válidos.',
    'Enter a valid page draft.': 'Informe um rascunho de página válido.',
    'Invalid JSON request.': 'Solicitação JSON inválida.',
    'Computer permission is disabled.': 'A permissão do computador está desativada.',
    'Agents are paused.': 'Os agentes estão pausados.',
    'Computer service returned an empty response.': 'O serviço de computador retornou uma resposta vazia.',
    'Computer response exceeded its size limit.': 'A resposta do computador excedeu o limite de tamanho.',
    'Computer request was cancelled or timed out.': 'A solicitação ao computador foi cancelada ou expirou.',
    'Invalid computer namespace.': 'Namespace do computador inválido.',
    'Computer identity mismatch.': 'A identidade do computador não corresponde.',
    'Computer endpoint is not bound to this Dot.': 'O endpoint do computador não está vinculado a este Dot.',
    'Start this Dot’s computer first.': 'Inicie o computador deste Dot primeiro.',
    'Unknown computer action.': 'Ação de computador desconhecida.',
    'Human controls are owner-only.': 'Os controles manuais estão disponíveis apenas ao proprietário.',
    'Specialist Dot not found.': 'Dot especialista não encontrado.',
    'Intelligence and model configuration are required.': 'É necessário configurar o Intelligence e o modelo.',
    'Research permission is disabled.': 'A permissão de pesquisa está desativada.',
    'The current compute turn returned no assistant response.': 'A execução atual não retornou uma resposta do assistente.',
    'The selected Dot is unavailable in the runtime.': 'O Dot selecionado não está disponível no runtime.',
    'Space access has been revoked or was not granted.': 'O acesso ao espaço foi revogado ou não foi concedido.',
    'Parallel web research is disabled.': 'A pesquisa paralela na web está desativada.',
    'Parallel returned an invalid response.': 'A pesquisa paralela retornou uma resposta inválida.',
    'Parallel could not extract usable source evidence.': 'A pesquisa paralela não conseguiu extrair evidências utilizáveis das fontes.',
    'Parallel could not complete the web request. Retry later or check the provider quota.': 'A pesquisa paralela não conseguiu concluir a solicitação à web. Tente novamente mais tarde ou verifique a cota do provedor.',
    'Parallel web research is disabled.': 'A pesquisa paralela na web está desativada.',
    'Parallel returned an invalid response.': 'A pesquisa paralela retornou uma resposta inválida.',
    'Parallel found no usable sources. Try a more specific research request.': 'A pesquisa paralela não encontrou fontes utilizáveis. Tente fazer uma solicitação de pesquisa mais específica.',
    'Browser returned an invalid or empty source response.': 'O navegador retornou uma resposta de fonte inválida ou vazia.',
    'Could not read the source.': 'Não foi possível ler a fonte.',
    'This call has ended.': 'Esta chamada foi encerrada.',
    'Dot is paused.': 'O Dot está pausado.',
    'End the current call before starting another.': 'Encerre a chamada atual antes de iniciar outra.',
    'An audio WebRTC SDP offer is required.': 'É necessária uma oferta SDP de áudio do WebRTC.',
    'Call connection was cancelled or timed out.': 'A conexão da chamada foi cancelada ou expirou.',
    'Call session expired; start a new call.': 'A sessão da chamada expirou; inicie uma nova chamada.',
    'A conversation and audio SDP offer are required.': 'É necessária uma conversa e uma oferta SDP de áudio.',
    'A bounded compute request and tool call ID are required.': 'É necessária uma solicitação de execução limitada e um ID de chamada da ferramenta.',
    'Not found.': 'Não encontrado.',
    'Dot not found.': 'Dot não encontrado.',
    'Call not found.': 'Chamada não encontrada.',
    'Conversation does not belong to this Dot and owner.': 'A conversa não pertence a este Dot e proprietário.',
    'Browser returned an invalid or empty source response.': 'O navegador retornou uma resposta de fonte inválida ou vazia.',
    'Model provider returned an invalid or empty completion.': 'O provedor do modelo retornou uma resposta inválida ou vazia.',
    'The provider returned warnings; some source evidence may be incomplete.': 'O provedor retornou avisos; algumas evidências das fontes podem estar incompletas.',
    'Transcript exceeds the maximum length.': 'A transcrição excede o tamanho máximo.',
    'The service request failed. Check the server configuration and try again.': 'A solicitação ao serviço falhou. Verifique a configuração do servidor e tente novamente.',
  };
  if (exact[message]) return exact[message];
  if (message.startsWith('Task queued for a new run.')) return 'Tarefa adicionada à fila para uma nova execução.';
  if (message === 'Task paused.' || message === 'Task cancelled.') return message === 'Task paused.' ? 'Tarefa pausada.' : 'Tarefa cancelada.';
  if (message.startsWith('Repeats every ')) return message.replace('Repeats every ', 'Repete a cada ').replace(' minutes after a successful run.', ' minutos após uma execução bem-sucedida.');
  if (message === 'Repeat schedule removed.') return 'Agendamento de repetição removido.';
  if (message.startsWith('Worker lease expired.')) return 'O prazo de execução do worker expirou. Revise os efeitos concluídos antes de tentar novamente.';
  if (message.startsWith('Browser failed (')) return message.replace(/^Browser failed \((\d+)\): /, 'Falha no navegador ($1): ');
  if (message.startsWith('Model provider returned HTTP ')) return message.replace('Model provider returned HTTP ', 'O provedor do modelo retornou HTTP ').replace(". Check the server's model configuration and quota.", '. Verifique a configuração do modelo no servidor e a cota.');
  if (message.startsWith('Voice provider returned HTTP ')) return message.replace('Voice provider returned HTTP ', 'O provedor de voz retornou HTTP ').replace('. Check voice configuration and quota.', '. Verifique a configuração de voz e a cota.');
  if (message.startsWith('The local call stopped, but provider hangup returned HTTP ')) return message.replace('The local call stopped, but provider hangup returned HTTP ', 'A chamada local foi encerrada, mas o provedor respondeu HTTP ');
  if (message.startsWith('The local call stopped, but provider hangup ')) return message.replace('The local call stopped, but provider hangup ', 'A chamada local foi encerrada, mas o encerramento no provedor ');
  if (message.startsWith('Setup required: ')) return `Configuração necessária: ${message.slice(16)}`;
  if (message.startsWith('Voice setup required: ')) return `Configuração de voz necessária: ${message.slice(22)}`;
  if (message.startsWith('Enter a Space name')) return 'Informe o nome do espaço (até 60 caracteres).';
  if (message.startsWith('Provide a name, role instructions')) return 'Informe um nome, instruções de função e permissões explícitas para as ferramentas.';
  if (message.startsWith('Setup step does not match')) return 'A etapa de configuração não corresponde ao estado do servidor.';
  if (message.startsWith('Request failed (')) return `A solicitação falhou (${message.slice(16)}`;
  return message;
}
export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(['GET', 'HEAD'].includes(method)
        ? {}
        : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = (await response
    .json()
    .catch(() => ({ error: 'Server returned an unreadable response.' }))) as {
    error?: string;
  };
  if (!response.ok)
    throw new ApiError(
      translateApiError(data.error ?? `Request failed (${response.status}).`),
      response.status,
    );
  return data as T;
}
export function authHeaders(): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
