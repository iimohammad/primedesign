import { Icon } from '@primedesign/icons';
import { CopyButton } from '@primedesign/react';
import type { ReactNode } from 'react';
export function Section({
  title,
  description,
  children,
  code,
  id,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  code?: string;
  id?: string;
}) {
  return (
    <section className="demo-section" id={id}>
      <div className="demo-section-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {code && <CopyButton value={code} />}
      </div>
      <div className="demo-section-content">{children}</div>
      {code && (
        <details className="demo-code">
          <summary>
            <Icon name="code" size={15} />
            مشاهدهٔ کد
          </summary>
          <pre dir="ltr">
            <code>{code}</code>
          </pre>
        </details>
      )}
    </section>
  );
}
