import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let updatedAtText = "Carregando...";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div> Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let databaseStatusText = "Carregando...";
  if (!isLoading && data) {
    const database = data.dependencies.database;
    databaseStatusText = (
      <>
        <div>Versão: {database.version}</div>
        <div>Conexões máximas: {database.max_connections}</div>
        <div>Conexões abertas: {database.opened_connections}</div>
      </>
    );
  }
  return (
    <>
      <h1>Database</h1>
      <div> {databaseStatusText}</div>
    </>
  );
}
