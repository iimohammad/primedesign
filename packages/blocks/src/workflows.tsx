'use client';
import { useState, type ReactNode } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Switch,
  Textarea,
  useLabels,
} from '@primedesign/react';
import { Icon } from '@primedesign/icons';
import { searchText } from '@primedesign/persian';
export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
}
export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}
export function KanbanBoard({
  columns,
  onMove,
  label,
}: {
  columns: KanbanColumn[];
  onMove: (itemId: string, from: string, to: string) => void | Promise<void>;
  label: string;
}) {
  const [error, setError] = useState(''),
    [pending, setPending] = useState<string | null>(null),
    l = useLabels(
      { move: 'انتقال به ستون', empty: 'کاری در این ستون نیست' },
      { move: 'Move to column', empty: 'No tasks in this column' },
    );
  const move = async (id: string, from: string, to: string) => {
    if (from === to || pending) return;
    setPending(id);
    setError('');
    try {
      await onMove(id, from, to);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Move failed');
    } finally {
      setPending(null);
    }
  };
  return (
    <section aria-label={label} className="pd-kanban">
      <div>
        {columns.map((column) => (
          <section
            key={column.id}
            aria-label={column.title}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const data = JSON.parse(e.dataTransfer.getData('application/primedesign-task'));
                if (
                  columns.find((c) => c.id === data.from)?.items.some((item) => item.id === data.id)
                )
                  void move(data.id, data.from, column.id);
              } catch {}
            }}
          >
            <header>
              <h3>{column.title}</h3>
              <Badge>{column.items.length}</Badge>
            </header>
            {column.items.length ? (
              column.items.map((item) => (
                <Card
                  key={item.id}
                  className="pd-kanban-card"
                  draggable={!pending}
                  onDragStart={(e) =>
                    e.dataTransfer.setData(
                      'application/primedesign-task',
                      JSON.stringify({ id: item.id, from: column.id }),
                    )
                  }
                >
                  <div>
                    {item.tags?.map((tag) => (
                      <Badge key={tag} tone="brand">
                        {tag}
                      </Badge>
                    ))}
                    {item.priority === 'high' && <Badge tone="danger">!</Badge>}
                  </div>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                  <footer>
                    {item.assignee && <Avatar name={item.assignee} size="sm" />}
                    <Select
                      aria-label={`${l.move}: ${item.title}`}
                      disabled={!!pending}
                      value={column.id}
                      onChange={(e) => void move(item.id, column.id, e.target.value)}
                      options={columns.map((c) => ({ label: c.title, value: c.id }))}
                    />
                  </footer>
                </Card>
              ))
            ) : (
              <EmptyState title={l.empty} icon="check" />
            )}
          </section>
        ))}
      </div>
      {error && (
        <p className="pd-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status?: string;
}
export function TeamMembers({
  members,
  roles,
  onRoleChange,
  onInvite,
}: {
  members: TeamMember[];
  roles: { label: string; value: string }[];
  onRoleChange?: (id: string, role: string) => void;
  onInvite?: () => void;
}) {
  const [query, setQuery] = useState(''),
    l = useLabels(
      { search: 'جست‌وجوی اعضا', invite: 'دعوت عضو', role: 'نقش' },
      { search: 'Search members', invite: 'Invite member', role: 'Role' },
    );
  return (
    <Card className="pd-team-members">
      <header>
        <Input
          aria-label={l.search}
          placeholder={l.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {onInvite && (
          <Button size="sm" onClick={onInvite}>
            <Icon name="plus" size={15} />
            {l.invite}
          </Button>
        )}
      </header>
      <ul>
        {members
          .filter((member) =>
            searchText(member.name + ' ' + member.email).includes(searchText(query)),
          )
          .map((member) => (
            <li key={member.id}>
              <Avatar name={member.name} src={member.avatar} />
              <div>
                <strong>{member.name}</strong>
                <small>{member.email}</small>
              </div>
              {member.status && <Badge tone="success">{member.status}</Badge>}
              <Select
                aria-label={`${l.role}: ${member.name}`}
                value={member.role}
                disabled={!onRoleChange}
                onChange={(e) => onRoleChange?.(member.id, e.target.value)}
                options={roles}
              />
            </li>
          ))}
      </ul>
    </Card>
  );
}
export interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  enabled: boolean;
}
export function NotificationPreferences({
  items,
  onValueChange,
  label,
}: {
  items: PreferenceItem[];
  onValueChange: (id: string, enabled: boolean) => void;
  label: string;
}) {
  return (
    <Card className="pd-notification-preferences">
      <h3>{label}</h3>
      {items.map((item) => (
        <Switch
          key={item.id}
          label={item.title}
          description={item.description}
          checked={item.enabled}
          onChange={(e) => onValueChange(item.id, e.target.checked)}
        />
      ))}
    </Card>
  );
}
export function SettingsPanel({
  title,
  description,
  initialValues,
  onSave,
  children,
}: {
  title: string;
  description?: string;
  initialValues: { name: string; description: string };
  onSave: (values: { name: string; description: string }) => void | Promise<void>;
  children?: ReactNode;
}) {
  const [values, setValues] = useState(initialValues),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    l = useLabels(
      { name: 'نام', description: 'توضیحات', save: 'ذخیرهٔ تغییرات', saved: 'ذخیره شد' },
      { name: 'Name', description: 'Description', save: 'Save changes', saved: 'Saved' },
    );
  return (
    <Card className="pd-settings-panel">
      <header>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </header>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError('');
          setSaved(false);
          try {
            await onSave(values);
            setSaved(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Save failed');
          } finally {
            setPending(false);
          }
        }}
      >
        <Input
          label={l.name}
          value={values.name}
          required
          onChange={(e) => {
            setValues((v) => ({ ...v, name: e.target.value }));
            setSaved(false);
          }}
        />
        <Textarea
          label={l.description}
          value={values.description}
          onChange={(e) => {
            setValues((v) => ({ ...v, description: e.target.value }));
            setSaved(false);
          }}
        />
        {children}
        {error && (
          <p className="pd-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <span role="status">{saved ? l.saved : ''}</span>
          <Button type="submit" loading={pending}>
            {l.save}
          </Button>
        </footer>
      </form>
    </Card>
  );
}
