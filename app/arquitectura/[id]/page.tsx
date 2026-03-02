export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div style={{ padding: 40 }}>
      <h1>Arquitectura</h1>
      <p>ID: {id}</p>
    </div>
  );
}