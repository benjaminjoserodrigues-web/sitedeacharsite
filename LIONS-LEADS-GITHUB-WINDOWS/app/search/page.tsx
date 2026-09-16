"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LeadCard, LeadDetails, ProspectDialog } from "@/components/lead-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { INITIAL_CATEGORIES } from "@/lib/categories";
import { getLastResults, getSettings, saveLastResults } from "@/lib/storage";
import type { Lead, SearchResponse } from "@/lib/types";

export default function SearchPage() {
  const [city, setCity] = useState(""), [state, setState] = useState(""), [category, setCategory] = useState("barbearia"), [customCategory, setCustomCategory] = useState("");
  const [quantity, setQuantity] = useState(30), [showWithWebsite, setShowWithWebsite] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  const [results, setResults] = useState<Lead[]>([]), [selected, setSelected] = useState<Lead | null>(null), [mode, setMode] = useState<"details" | "prospect" | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  useEffect(() => { const settings = getSettings(); setQuantity(settings.defaultQuantity); setCustomCategories(settings.customCategories); setResults(getLastResults()); }, []);
  const categories = [...INITIAL_CATEGORIES, ...customCategories, "personalizada"];
  const visible = useMemo(() => results.filter(lead => showWithWebsite || !lead.website), [results, showWithWebsite]);
  async function runSearch(values?: { city: string; state: string; category: string; quantity?: number }) {
    const chosen = values?.category ?? (category === "personalizada" ? customCategory.trim() : category), targetCity = values?.city ?? city, targetState = values?.state ?? state, targetQuantity = values?.quantity ?? quantity;
    if (!targetCity.trim() || !targetState.trim() || !chosen) { setError("Preencha cidade, estado e categoria."); return { total: 0 }; }
    setLoading(true); setError("");
    try { const response = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: targetCity, state: targetState, category: chosen, quantity: targetQuantity }) }); const data = await response.json() as SearchResponse & { error?: string }; if (!response.ok) throw new Error(data.error || "Falha na busca."); setResults(data.results); saveLastResults(data.results); return { total: data.results.length }; }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível concluir a busca."); throw err; } finally { setLoading(false); }
  }
  useEffect(() => {
    const doc = document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } };
    if (!doc.modelContext?.registerTool) return; const controller = new AbortController();
    void Promise.resolve(doc.modelContext.registerTool({ name: "search_local_businesses", title: "Buscar empresas locais", description: "Executa uma busca de empresas locais no OpenStreetMap.", inputSchema: { type: "object", properties: { city: { type: "string" }, state: { type: "string" }, category: { type: "string" }, quantity: { type: "number", minimum: 1, maximum: 100 } }, required: ["city", "state", "category"], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: true }, execute: async (input: unknown) => { const value = input as { city: string; state: string; category: string; quantity?: number }; setCity(value.city); setState(value.state); if (INITIAL_CATEGORIES.includes(value.category)) setCategory(value.category); else { setCategory("personalizada"); setCustomCategory(value.category); } return runSearch(value); } }, { signal: controller.signal })).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <AppShell>
    <div className="mb-6"><p className="mb-2 text-sm font-semibold text-amber-600">PROSPECÇÃO LOCAL</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Buscar empresas</h1><p className="mt-2 text-muted-foreground">Encontre oportunidades usando dados públicos do OpenStreetMap.</p></div>
    <section className="rounded-3xl border bg-zinc-950 p-4 text-white shadow-xl shadow-zinc-950/5 sm:p-6"><form onSubmit={e => { e.preventDefault(); void runSearch(); }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_.7fr_1fr_.55fr_auto] xl:items-end">
      <div><Label htmlFor="city" className="mb-2 text-zinc-300">Cidade</Label><Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Ex.: Campinas" className="h-11 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500" /></div>
      <div><Label htmlFor="state" className="mb-2 text-zinc-300">Estado</Label><Input id="state" value={state} onChange={e => setState(e.target.value)} placeholder="Ex.: SP" className="h-11 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500" /></div>
      <div><Label htmlFor="category" className="mb-2 text-zinc-300">Categoria</Label><NativeSelect id="category" value={category} onChange={e => setCategory(e.target.value)} className="h-11 w-full border-zinc-700 bg-zinc-900 text-white">{categories.map(item => <NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}</NativeSelect></div>
      <div><Label htmlFor="quantity" className="mb-2 text-zinc-300">Quantidade</Label><Input id="quantity" type="number" min={1} max={100} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="h-11 border-zinc-700 bg-zinc-900 text-white" /></div>
      <Button type="submit" size="lg" disabled={loading} className="h-11 px-6">{loading ? <span className="size-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" /> : <Search />}{loading ? "Buscando" : "Buscar"}</Button>
      {category === "personalizada" && <div className="md:col-span-2 xl:col-span-5"><Label htmlFor="custom" className="mb-2 text-zinc-300">Categoria personalizada</Label><Input id="custom" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Ex.: clínica veterinária" className="h-11 border-zinc-700 bg-zinc-900 text-white" /></div>}
    </form></section>
    {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{error}</div>}
    <div className="mt-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Resultados <span className="text-muted-foreground">({visible.length})</span></h2><p className="text-sm text-muted-foreground">Priorizados por Lead Score.</p></div><label className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={showWithWebsite} onCheckedChange={value => setShowWithWebsite(Boolean(value))} /><SlidersHorizontal className="size-4" />Exibir empresas com site</label></div>
    {loading ? <div className="mt-5 grid gap-3 xl:grid-cols-2">{[1,2,3,4].map(item => <div key={item} className="h-44 animate-pulse rounded-2xl bg-muted" />)}</div> : <section className="mt-4 grid gap-3 xl:grid-cols-2">{visible.map(lead => <LeadCard key={lead.key} lead={lead} onDetails={() => { setSelected(lead); setMode("details"); }} onProspect={() => { setSelected(lead); setMode("prospect"); }} />)}</section>}
    {!loading && results.length > 0 && !visible.length && <p className="mt-8 rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Todos os resultados encontrados têm website cadastrado. Ative “Exibir empresas com site”.</p>}
    <p className="mt-8 text-center text-xs text-muted-foreground">Dados © OpenStreetMap contributors. “Sem site” significa apenas: site não encontrado nos dados consultados.</p>
    <LeadDetails lead={selected} open={mode === "details"} onOpenChange={open => !open && setMode(null)} /><ProspectDialog lead={selected} open={mode === "prospect"} onOpenChange={open => !open && setMode(null)} />
  </AppShell>;
}
