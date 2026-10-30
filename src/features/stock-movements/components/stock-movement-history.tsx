import { cn } from "@/lib/utils";
import type {
  MovementType,
  StockMovement,
} from "../api/stock-movements-api";

type StockMovementHistoryProps = {
  movements: StockMovement[];
};

const movementDateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatMovementDate(value: string) {
  return movementDateFormatter.format(new Date(value));
}

function MovementTypeBadge({ type }: { type: MovementType }) {
  const isEntry = type === "IN";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        isEntry
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
      )}
    >
      {isEntry ? "Entrada" : "Salida"}
    </span>
  );
}

export function StockMovementHistory({
  movements,
}: StockMovementHistoryProps) {
  return (
    <>
      <div
        className="grid gap-3 lg:hidden"
        data-testid="stock-movement-cards"
      >
        {movements.map((movement) => (
          <article
            className="rounded-xl border bg-card p-4 shadow-sm"
            key={movement.id}
          >
            <div className="flex items-start justify-between gap-3">
              <MovementTypeBadge type={movement.type} />
              <time
                className="text-right text-xs text-muted-foreground"
                dateTime={movement.createdAt}
              >
                {formatMovementDate(movement.createdAt)}
              </time>
            </div>
            <p className="mt-4 text-2xl font-semibold">
              {movement.type === "IN" ? "+" : "−"}
              {movement.quantity}
              <span className="sr-only"> unidades</span>
            </p>
            <dl className="mt-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Motivo</dt>
                <dd className="mt-1 break-words font-medium">
                  {movement.reason}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div
        className="hidden overflow-hidden rounded-xl border bg-card shadow-sm lg:block"
        data-testid="stock-movement-table"
      >
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Historial de movimientos del producto seleccionado
          </caption>
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Fecha
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Tipo
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Cantidad
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Motivo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  <time dateTime={movement.createdAt}>
                    {formatMovementDate(movement.createdAt)}
                  </time>
                </td>
                <td className="px-4 py-4">
                  <MovementTypeBadge type={movement.type} />
                </td>
                <td className="px-4 py-4 font-medium">
                  {movement.type === "IN" ? "+" : "−"}
                  {movement.quantity}
                </td>
                <td className="max-w-md break-words px-4 py-4">
                  {movement.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
