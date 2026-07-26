import type { ReactNode } from 'react';

type ContentPageProperties = Readonly<{
  children: ReactNode;
  eyebrow: string;
  introduction: string;
  title: string;
}>;

export function ContentPage({
  children,
  eyebrow,
  introduction,
  title,
}: ContentPageProperties) {
  return (
    <main className="content-page">
      <header className="content-page-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </header>
      <div className="content-sections">{children}</div>
    </main>
  );
}
