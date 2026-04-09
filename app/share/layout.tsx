export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-clay blueprint-grid">{children}</div>;
}
