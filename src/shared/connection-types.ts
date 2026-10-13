import { z } from 'zod';
export interface ConnectionTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  // The server's readOnlyHint. A hint only: approval is the owner's call.
  readOnly: boolean;
  enabled: boolean;
  requiresApproval: boolean;
}
export interface Connection {
  id: string;
  dotId: string;
  name: string;
  url: string;
  hasToken: boolean;
  tools: ConnectionTool[];
  error: string | null;
  createdAt: number;
  updatedAt: number;
}
export interface ConnectionActionResult {
  isError: boolean;
  text: string;
}
// What the owner reviews: the server's record of the exact connection,
// tool, and arguments, created when the Dot called the gated tool.
export interface PendingApproval {
  id: string;
  connection: string;
  title: string;
  description: string;
  arguments: Record<string, unknown>;
  expiresAt: number;
}
export const APPROVAL_TTL_MS = 60 * 60_000;
export const connectionActionSchema = z
  .object({
    approvalId: z.string().min(1).max(64),
    summary: z.string().trim().min(1).max(500),
  })
  .strict();
export const connectionActionTool = {
  name: 'request_connection_action',
  description:
    'Peça ao proprietário que aprove uma ação de serviço conectado que altere algo (enviar, criar, atualizar ou excluir). Use somente depois que uma ferramenta de conexão retornar approval_required. Informe o approvalId e resuma o efeito em uma frase. Chame uma vez e aguarde: o resultado conterá a resposta do serviço se a ação for aprovada.',
  parameters: z.toJSONSchema(connectionActionSchema),
};
