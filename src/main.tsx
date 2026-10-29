import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import rawSeed from "./spec.json";
type MockupData = {title:string;description:string;accent:string;pages:{id:string;title:string;description:string;metrics:{label:string;value:string}[];columns:string[];rows:string[][];form:string[]}[]};
const seed: MockupData = rawSeed;
import "./style.css";
const accents = {
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-700",
  rose: "bg-rose-700",
};
function App() {
  const [pages, setPages] = useState(structuredClone(seed.pages));
  const [active, setActive] = useState(
    location.hash.slice(1) || seed.pages[0].id,
  );
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const changed = () => {
      setActive(location.hash.slice(1));
      setSearch("");
      setMessage("");
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  const page = pages.find((p) => p.id === active) ?? pages[0];
  const color = accents[seed.accent as keyof typeof accents] ?? accents.indigo;
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-300 bg-white p-6 md:min-h-screen md:w-64 md:border-r">
        <div
          className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${color}`}
        >
          M
        </div>
        <h1 data-testid="mockup-title" className="text-xl font-bold">{seed.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{seed.description}</p>
        <nav
          aria-label="Schermate"
          className="mt-8 flex flex-wrap gap-2 md:flex-col"
        >
          {pages.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              aria-current={page.id === p.id ? "page" : undefined}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${page.id === p.id ? `${color} text-white` : "text-slate-700 hover:bg-slate-100"}`}
            >
              {p.title}
            </a>
          ))}
        </nav>
        <p className="mt-8 text-xs leading-relaxed text-slate-600">
          Prototipo pubblico · Tutti i dati sono inventati. Non inserire dati
          personali o riservati. Le modifiche durano soltanto in questa
          sessione.
        </p>
        <button
          className="mt-4 rounded border border-slate-400 px-3 py-2 text-sm"
          onClick={() => {
            setPages(structuredClone(seed.pages));
            setSearch("");
            setMessage("Dati dimostrativi ripristinati");
          }}
        >
          Ripristina demo
        </button>
      </aside>
      <main className="mx-auto w-full max-w-6xl p-5 md:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
          Spazio dimostrativo
        </p>
        <h2 className="text-3xl font-bold">{page.title}</h2>
        <p className="mt-2 text-slate-600">{page.description}</p>
        <div className="my-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-600">{m.label}</p>
              <p className="mt-3 text-3xl font-semibold">{m.value}</p>
            </div>
          ))}
        </div>
        {page.columns.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 p-5">
              <h3 className="font-semibold">Elenco</h3>
              <label className="text-sm">
                Filtra{" "}
                <input
                  className="ml-2 rounded-md border border-slate-400 px-3 py-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca nel prototipo"
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {page.columns.map((c, i) => (
                      <th key={i} className="px-5 py-3">
                        {c}
                      </th>
                    ))}
                    <th className="px-5 py-3">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {page.rows
                    .map((row, index) => ({ row, index }))
                    .filter(({ row }) =>
                      row
                        .join(" ")
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map(({ row, index }) => (
                      <tr key={index} className="border-t border-slate-200">
                        {row.map((cell, i) => (
                          <td key={i} className="px-5 py-4">
                            {cell}
                          </td>
                        ))}
                        <td className="px-5 py-4">
                          <button
                            className="font-medium text-rose-700"
                            onClick={() => {
                              setPages(
                                pages.map((p) =>
                                  p.id === page.id
                                    ? {
                                        ...p,
                                        rows: p.rows.filter(
                                          (_, i) => i !== index,
                                        ),
                                      }
                                    : p,
                                ),
                              );
                              setMessage("Elemento rimosso dalla demo");
                            }}
                          >
                            Rimuovi
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {page.rows.filter((r) =>
              r.join(" ").toLowerCase().includes(search.toLowerCase()),
            ).length === 0 && (
              <p className="p-5 text-slate-600">Nessun elemento trovato.</p>
            )}
          </section>
        )}
        {page.form.length > 0 && (
          <section className="mt-6 rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold">
              Aggiungi un esempio inventato
            </h3>
            <form
              key={page.id}
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                const row = page.columns.map((_, i) =>
                  String(data.get(`field-${i}`) ?? "Esempio"),
                );
                setPages(
                  pages.map((p) =>
                    p.id === page.id ? { ...p, rows: [...p.rows, row] } : p,
                  ),
                );
                form.reset();
                setMessage("Esempio aggiunto nella sessione");
              }}
            >
              {page.form.map((f, i) => (
                <label key={i} className="grid gap-2 text-sm">
                  {f}
                  <input
                    required
                    maxLength={120}
                    name={`field-${i}`}
                    className="rounded-md border border-slate-400 px-3 py-2"
                    autoComplete="off"
                  />
                </label>
              ))}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className={`rounded-lg px-5 py-2.5 font-medium text-white ${color}`}
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </section>
        )}
        <p role="status" className="mt-5 text-sm text-slate-700">
          {message}
        </p>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
