import { CircleCheck, Database, FlaskConical } from "lucide-react";

const foundationItems = [
  {
    title: "Interfaz preparada",
    description: "Diseño adaptable con navegación y temas claro y oscuro.",
    icon: CircleCheck,
  },
  {
    title: "API centralizada",
    description: "Una base tipada conecta el panel con el backend de StockFlow.",
    icon: Database,
  },
  {
    title: "Calidad integrada",
    description: "Pruebas unitarias, de componentes y de flujos principales.",
    icon: FlaskConical,
  },
] as const;

export function DashboardOverview() {
  return (
    <section aria-labelledby="dashboard-title" className="mx-auto max-w-6xl">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary">StockFlow Web</p>
        <h1
          className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
          id="dashboard-title"
        >
          Tu inventario, en un solo lugar
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          La base del panel está lista. Los módulos de gestión se incorporarán en
          los próximos pasos.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {foundationItems.map(({ title, description, icon: Icon }) => (
          <article className="rounded-xl border bg-card p-5 shadow-sm" key={title}>
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
