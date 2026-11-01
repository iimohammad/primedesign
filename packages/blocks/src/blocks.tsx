'use client';
import { Icon } from '@primedesign/icons';
import { formatMoney, type MoneyCurrency } from '@primedesign/persian';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Drawer,
  DropdownMenu,
  EmptyState,
  IconButton,
  Input,
  PasswordInput,
  SideNav,
  Textarea,
  cx,
  useLabels,
  usePrime,
  type SideNavItem,
} from '@primedesign/react';
import { useState, type ReactNode } from 'react';
export function AppShell({
  logo,
  sidebar,
  header,
  children,
  className,
}: {
  logo: ReactNode;
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false),
    l = useLabels(
      { menu: 'باز کردن منو', navigation: 'منوی اصلی' },
      { menu: 'Open menu', navigation: 'Main navigation' },
    );
  return (
    <div className={cx('pd-app-shell', className)}>
      <aside className="pd-app-sidebar">
        <div className="pd-app-logo">{logo}</div>
        {sidebar}
      </aside>
      <div className="pd-app-content">
        <header className="pd-app-header">
          <IconButton
            icon="menu"
            label={l.menu}
            variant="ghost"
            className="pd-mobile-menu"
            onClick={() => setOpen(true)}
          />
          {header}
        </header>
        <main>{children}</main>
      </div>
      <Drawer open={open} onOpenChange={setOpen} title={l.navigation} placement="start" size="sm">
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a,button')) setOpen(false);
          }}
        >
          {sidebar}
        </div>
      </Drawer>
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="pd-page-header">
      {breadcrumb}
      <div>
        <div>
          {eyebrow && <span className="pd-eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="pd-page-actions">{actions}</div>}
      </div>
    </div>
  );
}
export function UserMenu({
  name,
  email,
  avatar,
  items,
}: {
  name: string;
  email?: string;
  avatar?: string;
  items: Parameters<typeof DropdownMenu>[0]['items'];
}) {
  return (
    <DropdownMenu
      label={name}
      trigger={
        <span className="pd-user-trigger">
          <Avatar name={name} src={avatar} size="sm" />
          <span>
            <strong>{name}</strong>
            {email && <small>{email}</small>}
          </span>
          <Icon name="chevronDown" size={16} />
        </span>
      }
      items={items}
    />
  );
}
export interface Ticket {
  id: string;
  title: string;
  preview?: string;
  status: 'open' | 'pending' | 'closed';
  priority?: 'low' | 'normal' | 'high';
  date: string;
  unread?: number;
  customer?: string;
}
export function TicketList({
  tickets,
  selected,
  onSelect,
}: {
  tickets: Ticket[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const l = useLabels(
    {
      open: 'باز',
      pending: 'در انتظار پاسخ',
      closed: 'بسته',
      empty: 'تیکتی وجود ندارد',
      high: 'فوری',
    },
    {
      open: 'Open',
      pending: 'Awaiting reply',
      closed: 'Closed',
      empty: 'No tickets',
      high: 'Urgent',
    },
  );
  return (
    <div className="pd-ticket-list">
      {tickets.length ? (
        tickets.map((t) => (
          <button
            type="button"
            key={t.id}
            className="pd-ticket"
            data-active={selected === t.id || undefined}
            onClick={() => onSelect(t.id)}
          >
            <div>
              <span className="pd-ticket-id">#{t.id}</span>
              <Badge
                tone={
                  t.status === 'open' ? 'brand' : t.status === 'pending' ? 'warning' : 'neutral'
                }
              >
                {l[t.status]}
              </Badge>
              {t.priority === 'high' && <Badge tone="danger">{l.high}</Badge>}
            </div>
            <strong>{t.title}</strong>
            {t.preview && <p>{t.preview}</p>}
            <footer>
              <span>{t.customer ?? t.date}</span>
              {t.unread ? <Badge tone="brand">{t.unread}</Badge> : <small>{t.date}</small>}
            </footer>
          </button>
        ))
      ) : (
        <EmptyState title={l.empty} icon="message" />
      )}
    </div>
  );
}
export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  own?: boolean;
  avatar?: string;
  status?: 'sent' | 'read';
}
export function ConversationView({
  title,
  messages,
  onSend,
  subtitle,
  actions,
  sending,
}: {
  title: string;
  subtitle?: string;
  messages: Message[];
  onSend: (text: string) => void | Promise<void>;
  actions?: ReactNode;
  sending?: boolean;
}) {
  const [text, setText] = useState(''),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    l = useLabels(
      {
        message: 'متن پیام',
        placeholder: 'پیامتان را بنویسید…',
        send: 'ارسال پیام',
        error: 'پیام ارسال نشد.',
        read: 'خوانده شده',
        sent: 'ارسال شده',
      },
      {
        message: 'Message',
        placeholder: 'Write a message…',
        send: 'Send message',
        error: 'Could not send message.',
        read: 'Read',
        sent: 'Sent',
      },
    );
  return (
    <section className="pd-conversation">
      <header>
        <div>
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </div>
        {actions}
      </header>
      <ol
        className="pd-message-list"
        aria-label={title}
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((m) => (
          <li key={m.id} className={cx('pd-message', m.own && 'pd-message--own')}>
            <Avatar name={m.sender} src={m.avatar} size="sm" />
            <div>
              <strong>{m.sender}</strong>
              <p>{m.text}</p>
              <small>
                {m.time}{' '}
                {m.status && (
                  <span role="img" aria-label={l[m.status]}>
                    <Icon name="check" size={12} />
                  </span>
                )}
              </small>
            </div>
          </li>
        ))}
      </ol>
      <form
        className="pd-message-composer"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim() || pending) return;
          setPending(true);
          setError('');
          try {
            await onSend(text.trim());
            setText('');
          } catch (e) {
            setError(e instanceof Error ? e.message : l.error);
          } finally {
            setPending(false);
          }
        }}
      >
        <Textarea
          aria-label={l.message}
          placeholder={l.placeholder}
          value={text}
          rows={2}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          type="submit"
          loading={pending || sending}
          disabled={!text.trim()}
          startIcon={<Icon name="arrowLeft" />}
        >
          {l.send}
        </Button>
        {error && (
          <p role="alert" className="pd-error">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
export function InboxLayout({
  list,
  conversation,
  showConversation = false,
  onBack,
}: {
  list: ReactNode;
  conversation: ReactNode;
  showConversation?: boolean;
  onBack?: () => void;
}) {
  const back = useLabels('بازگشت به گفتگوها', 'Back to conversations');
  return (
    <div className={cx('pd-inbox', showConversation && 'pd-inbox--selected')}>
      <aside>{list}</aside>
      <div>
        {onBack && (
          <Button
            className="pd-inbox-back"
            variant="ghost"
            startIcon={<Icon name="arrowRight" />}
            onClick={onBack}
          >
            {back}
          </Button>
        )}
        {conversation}
      </div>
    </div>
  );
}
export function NotificationCenter({
  items,
  onRead,
  onReadAll,
}: {
  items: { id: string; title: string; description?: string; date: string; read?: boolean }[];
  onRead: (id: string) => void;
  onReadAll?: () => void;
}) {
  const l = useLabels(
    { title: 'اعلان‌ها', all: 'خواندن همه', empty: 'اعلان جدیدی ندارید' },
    { title: 'Notifications', all: 'Mark all as read', empty: 'You are all caught up' },
  );
  return (
    <Card className="pd-notification-center">
      <header>
        <h3>{l.title}</h3>
        {onReadAll && (
          <Button variant="ghost" size="sm" onClick={onReadAll}>
            {l.all}
          </Button>
        )}
      </header>
      {items.length ? (
        <ul>
          {items.map((n) => (
            <li key={n.id} data-unread={!n.read || undefined}>
              <button type="button" onClick={() => onRead(n.id)}>
                <span>
                  <Icon name="bell" />
                </span>
                <div>
                  <strong>{n.title}</strong>
                  {n.description && <p>{n.description}</p>}
                  <small>{n.date}</small>
                </div>
                {!n.read && <i aria-label={l.title} />}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={l.empty} icon="bell" />
      )}
    </Card>
  );
}
export function PricingCard({
  title,
  description,
  price,
  currency = 'IRT',
  period,
  features,
  highlighted,
  action,
}: {
  title: string;
  description?: string;
  price: number;
  currency?: MoneyCurrency;
  period?: string;
  features: { label: string; included: boolean }[];
  highlighted?: boolean;
  action: ReactNode;
}) {
  const { locale } = usePrime(),
    recommended = useLabels('پیشنهاد ما', 'Recommended');
  return (
    <Card className={cx('pd-pricing-card', highlighted && 'pd-pricing-card--featured')}>
      {highlighted && <Badge tone="brand">{recommended}</Badge>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div className="pd-plan-price">
        <strong>{formatMoney(price, currency, locale)}</strong>
        {period && <small> / {period}</small>}
      </div>
      <ul>
        {features.map((f, i) => (
          <li key={i} data-included={f.included}>
            <Icon name={f.included ? 'check' : 'close'} size={18} />
            {f.label}
          </li>
        ))}
      </ul>
      {action}
    </Card>
  );
}
export function AuthCard({
  title,
  description,
  onSubmit,
  logo,
  footer,
}: {
  title: string;
  description?: string;
  onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
  logo?: ReactNode;
  footer?: ReactNode;
}) {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    l = useLabels(
      { email: 'ایمیل', password: 'رمز عبور', submit: 'ورود به حساب', error: 'ورود انجام نشد.' },
      { email: 'Email', password: 'Password', submit: 'Sign in', error: 'Sign in failed.' },
    );
  return (
    <Card className="pd-auth-card">
      {logo}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError('');
          try {
            await onSubmit({ email, password });
          } catch (e) {
            setError(e instanceof Error ? e.message : l.error);
          } finally {
            setPending(false);
          }
        }}
      >
        <Input
          label={l.email}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label={l.password}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div role="alert" className="pd-error">
            {error}
          </div>
        )}
        <Button type="submit" loading={pending} fullWidth>
          {l.submit}
        </Button>
      </form>
      {footer}
    </Card>
  );
}
export function FileCard({
  name,
  size,
  type,
  onDownload,
  onRemove,
}: {
  name: string;
  size: string;
  type?: string;
  onDownload?: () => void;
  onRemove?: () => void;
}) {
  const l = useLabels(
    { download: 'دانلود', remove: 'حذف' },
    { download: 'Download', remove: 'Remove' },
  );
  return (
    <Card className="pd-file-card">
      <span>
        <Icon name="box" size={28} />
      </span>
      <strong>{name}</strong>
      <small>
        {type} · {size}
      </small>
      <div>
        {onDownload && (
          <IconButton
            label={`${l.download} ${name}`}
            icon="download"
            variant="outline"
            size="sm"
            onClick={onDownload}
          />
        )}{' '}
        {onRemove && (
          <IconButton
            label={`${l.remove} ${name}`}
            icon="trash"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          />
        )}
      </div>
    </Card>
  );
}
export function DashboardNav({
  items,
  active,
  onSelect,
}: {
  items: SideNavItem[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const label = useLabels('ناوبری داشبورد', 'Dashboard navigation');
  return <SideNav items={items} active={active} onSelect={onSelect} label={label} />;
}
