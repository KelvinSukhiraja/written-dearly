export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div data-reveal className="workspace-page-header border-b border-border pb-6">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
