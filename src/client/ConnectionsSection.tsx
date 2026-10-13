import { useEffect, useState, type KeyboardEvent } from 'react';
import { PlugZap, RefreshCw, Trash2 } from 'lucide-react';
import type { Connection } from '../shared/connection-types';
import { api } from './api';
// Lives inside the Dot form, so it saves immediately through its own
// requests and keeps Enter from submitting the surrounding form.
const stayInSection = (event: KeyboardEvent) => {
  if (event.key === 'Enter') event.preventDefault();
};
export function ConnectionsSection({ dotId }: { dotId: string }) {
  const [connections, setConnections] = useState<Connection[]>();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void api<Connection[]>(`/dots/${encodeURIComponent(dotId)}/connections`)
      .then((value) => active && setConnections(value))
      .catch(
        (cause) =>
          active &&
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar as conexões.',
          ),
      );
    return () => {
      active = false;
    };
  }, [dotId]);
  const run = async <T,>(key: string, request: () => Promise<T>) => {
    setBusy(key);
    setError('');
    try {
      return await request();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Request failed.');
    } finally {
      setBusy('');
    }
  };
  const replace = (next: Connection) =>
    setConnections((list) =>
      list?.map((item) => (item.id === next.id ? next : item)),
    );
  const add = async () => {
    const created = await run('add', () =>
      api<Connection>(
        `/dots/${encodeURIComponent(dotId)}/connections`,
        'POST',
        {
          name: name.trim(),
          url: url.trim(),
          ...(token.trim() ? { token: token.trim() } : {}),
        },
      ),
    );
    if (!created) return;
    setConnections((list) => [...(list ?? []), created]);
    setName('');
    setUrl('');
    setToken('');
  };
  return (
    <fieldset className="space-access-fields connections-fields">
      <legend>Conexões</legend>
      <p className="muted">
        Disponibilize ferramentas de servidores MCP para este Dot. Ferramentas
        somente de leitura são executadas diretamente; as demais pedem sua
        aprovação no chat antes de executar. Os tokens ficam no servidor.
      </p>
      {connections?.map((connection) => (
        <div className="connection" key={connection.id}>
          <div className="connection-head">
            <PlugZap size={15} />
            <span>
              <strong>{connection.name}</strong>
              <small>
                {new URL(connection.url).host}
                {connection.hasToken ? ' · token salvo' : ''}
              </small>
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label={`Atualizar ferramentas de ${connection.name}`}
              disabled={!!busy}
              onClick={async () => {
                const next = await run(connection.id, () =>
                  api<Connection>(
                    `/connections/${connection.id}/refresh`,
                    'POST',
                    {},
                  ),
                );
                if (next) replace(next);
              }}
            >
              <RefreshCw size={15} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Remover ${connection.name}`}
              disabled={!!busy}
              onClick={async () => {
                if (!window.confirm(`Remover ${connection.name} deste Dot?`))
                  return;
                const done = await run(connection.id, () =>
                  api(`/connections/${connection.id}`, 'DELETE'),
                );
                if (done)
                  setConnections((list) =>
                    list?.filter((item) => item.id !== connection.id),
                  );
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
          {connection.error && (
            <p className="chat-error" role="alert">
              {connection.error}
            </p>
          )}
          {!connection.tools.length && (
            <p className="muted">Este servidor não oferece ferramentas.</p>
          )}
          <ul className="connection-tools">
            {connection.tools.map((tool) => {
              const patch = async (value: {
                enabled?: boolean;
                requiresApproval?: boolean;
              }) => {
                const next = await run(connection.id, () =>
                  api<Connection>(
                    `/connections/${connection.id}/tools/${encodeURIComponent(tool.name)}`,
                    'PATCH',
                    value,
                  ),
                );
                if (next) replace(next);
              };
              return (
                <li key={tool.name}>
                  <label className="permission-row">
                    <input
                      type="checkbox"
                      checked={tool.enabled}
                      disabled={!!busy}
                      onChange={(event) =>
                        void patch({ enabled: event.target.checked })
                      }
                    />
                    <span>
                      <strong>
                        {tool.title}
                        {tool.readOnly && <em>somente leitura</em>}
                      </strong>
                      {tool.description && <small>{tool.description}</small>}
                    </span>
                  </label>
                  <label className="connection-approval">
                    <input
                      type="checkbox"
                      checked={tool.requiresApproval}
                      disabled={!!busy || !tool.enabled}
                      onChange={(event) =>
                        void patch({ requiresApproval: event.target.checked })
                      }
                    />
                    Perguntar antes
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="connection-add">
        <label className="field-label" htmlFor="connection-name">
          Adicionar um servidor MCP
        </label>
        <input
          id="connection-name"
          placeholder="Nome, por exemplo, GitHub"
          maxLength={40}
          value={name}
          onKeyDown={stayInSection}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          aria-label="URL do servidor MCP"
          placeholder="https://example.com/mcp"
          type="url"
          value={url}
          onKeyDown={stayInSection}
          onChange={(event) => setUrl(event.target.value)}
        />
        <input
          aria-label="Token bearer (opcional)"
          placeholder="Token bearer (opcional)"
          type="password"
          autoComplete="off"
          value={token}
          onKeyDown={stayInSection}
          onChange={(event) => setToken(event.target.value)}
        />
        <button
          type="button"
          className="connection-connect"
          disabled={!!busy || !name.trim() || !url.trim()}
          onClick={() => void add()}
        >
          {busy === 'add' ? 'Conectando…' : 'Conectar'}
        </button>
      </div>
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
