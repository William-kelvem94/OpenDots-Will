import { useEffect, useRef, useState } from 'react';
import { Check, PlugZap } from 'lucide-react';
import {
  connectionActionSchema,
  type ConnectionActionResult,
  type PendingApproval,
} from '../shared/connection-types';
import { api } from './api';
import { computerToolResult } from './ComputerToolCard';
type Receipt = {
  approvalId: string | null;
  status: 'running' | 'done';
  result: ConnectionActionResult | null;
};
const conversation = (threadId: string) =>
  `/conversations/${encodeURIComponent(threadId)}`;
const display = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);
export function ConnectionActionCard({
  args,
  status,
  result,
  respond,
  threadId,
  toolCallId,
}: {
  args: unknown;
  status: string;
  result?: unknown;
  respond?: (result: unknown) => Promise<void>;
  threadId: string;
  toolCallId: string;
}) {
  const action = connectionActionSchema.safeParse(args);
  const recorded = computerToolResult(result);
  const [approval, setApproval] = useState<PendingApproval>();
  const [approvalError, setApprovalError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(false);
  const finished = status === 'complete';
  const approvalId = action.success ? action.data.approvalId : '';
  // Show the server's record of what will run, not the model's description.
  useEffect(() => {
    if (!approvalId) return;
    let active = true;
    setApprovalError('');
    void api<PendingApproval>(
      `${conversation(threadId)}/connection-approvals/${encodeURIComponent(approvalId)}`,
    )
      .then((value) => active && setApproval(value))
      .catch(
        (cause) =>
          active &&
          setApprovalError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar esta solicitação.',
          ),
      );
    return () => {
      active = false;
    };
  }, [threadId, approvalId]);
  // A saved result counts only if it came from this card's approval.
  const mismatch = !!receipt && receipt.approvalId !== approvalId;
  const own = mismatch ? null : receipt;
  // A receipt that is still running is checked until the server finishes.
  const running = own?.status === 'running';
  useEffect(() => {
    let active = true;
    const load = () =>
      api<Receipt | null>(
        `${conversation(threadId)}/connection-actions/${encodeURIComponent(toolCallId)}`,
      )
        .then((value) => active && setReceipt(value))
        .catch((cause) => {
          if (active)
            setError(
              cause instanceof Error
                ? cause.message
                : 'Não foi possível verificar esta ação.',
            );
        });
    setError('');
    void load();
    const timer = running ? setInterval(() => void load(), 2000) : undefined;
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [threadId, toolCallId, attempt, running]);
  const outcome = own?.result ?? null;
  const approved = recorded.approved === true || own?.status === 'done';
  const declined = recorded.approved === false;
  const ready = receipt !== undefined;
  const decide = async (approve: boolean) => {
    if (!respond || !action.success || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      if (!approve && !outcome) {
        await respond({
          approved: false,
          message:
            'O proprietário recusou esta ação. Não a execute nem tente realizá-la de outra forma.',
        });
        return;
      }
      // A previous approval may have run even if its response never arrived.
      const value =
        outcome ??
        (await api<ConnectionActionResult>(
          `${conversation(threadId)}/connection-actions`,
          'POST',
          { toolCallId, approvalId: action.data.approvalId },
        ));
      setReceipt({ approvalId, status: 'done', result: value });
      await respond({ approved: true, ...value });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível executar esta ação.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const entries = approval ? Object.entries(approval.arguments) : [];
  return (
    <section
      className="page-review-card connection-action-card"
      aria-label="Aprovar ação do serviço conectado"
    >
      <header>
        <PlugZap size={17} />
        <strong>
          {approval
            ? `${approval.connection} · ${approval.title}`
            : 'Serviço conectado'}
        </strong>
        <span>
          {approved
            ? outcome?.isError
              ? 'Falhou'
              : 'Aprovada'
            : declined
              ? 'Recusada'
              : running
                ? 'Em execução'
                : finished
                  ? 'Encerrada'
                  : !ready
                    ? 'Verificando'
                    : 'Aguardando sua aprovação'}
        </span>
      </header>
      <div className="page-review-body">
        <h3>
          {action.success ? action.data.summary : 'Preparando ação…'}
        </h3>
        {entries.length > 0 && (
          <dl className="connection-action-args">
            {entries.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{display(value)}</dd>
              </div>
            ))}
          </dl>
        )}
        {mismatch && (
          <div className="connection-action-result failed">
            <strong>Não é possível executar</strong>
            <pre>
              O resultado salvo neste cartão pertence a outra solicitação de aprovação.
              Esta ação não foi executada.
            </pre>
          </div>
        )}
        {approvalError && !outcome && (
          <div className="connection-action-result failed">
            <strong>Não é possível executar</strong>
            <pre>{approvalError}</pre>
          </div>
        )}
        {outcome && (
          <div
            className={`connection-action-result ${outcome.isError ? 'failed' : ''}`}
          >
            <strong>
              {outcome.isError ? 'Erro do serviço' : 'Resposta do serviço'}
            </strong>
            <pre>{outcome.text}</pre>
          </div>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <footer>
        {!ready && error && (
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Tentar novamente
          </button>
        )}
        {!finished && respond && ready && !running && !mismatch && (
          <>
            <button
              type="button"
              className="review-primary"
              disabled={busy || !action.success || (!outcome && !approval)}
              onClick={() => void decide(true)}
            >
              <Check size={15} />
              {busy
                ? 'Executando…'
                : outcome
                  ? 'Continuar conversa'
                  : 'Aprovar e executar'}
            </button>
            {!outcome && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void decide(false)}
              >
                Recusar
              </button>
            )}
          </>
        )}
        <small>
          {running
            ? 'Esta ação ainda está em execução no servidor.'
            : approved || declined || finished
              ? ''
              : 'Nada será executado até você aprovar. Estes são os argumentos exatos.'}
        </small>
      </footer>
    </section>
  );
}
