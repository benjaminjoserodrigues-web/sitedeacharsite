"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe2, MessageCircle, Search, Target, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { LeadCard, LeadDetails, ProspectDialog } from "@/components/lead-ui";
import { getLastResults, getStoredLeads } from "@/lib/storage";
import type { Lead } from "@/lib/types";

export default function DashboardPage() {
  const [results, setResults] = useState<Lead[]>([]), [saved, setSaved] = useState<Lead[]>([]), [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState<Lead | null>(null), [mode, setMode] = useState<"details" | "prospect" | null>(null);
  useEffect(() => { setResults(getLastResults()); setSaved(getStoredLeads()); }, []);
  const source = results.length ? results : saved;
  const stats = [["Estabelecimentos", source.length, Users], ["Com site", source.filter(l => l.website).length, Globe2], ["Sem site cadastrado", source.filter(l => !l.website).length, Search], ["Com contato", source.filter(l => l.phone || l.whatsapp || l.email || l.instagram).length, MessageCircle], ["Leads fortes", source.filter(l => l.score >= 80).length, Target]] as const;
  const filtered = useMemo(() => source.filter((lead) => filter === "forte" || filter === "médio" || filter === "fraco" ? lead.scoreLevel === filter : filter === "não contatados" ? ["Novo", "Mensagem preparada"].includes(lead.status) : filter === "contatados" ? !["Novo", "Mensagem preparada"].includes(lead.status) : filter === "whatsapp" ? Boolean(lead.whatsapp) : filter === "instagram" ? Boolean(lead.instagram) : true), [source, filter]);
  return <AppShell>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-semibold text-amber-600">VISÃO GERAL</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Seu radar de oportunidades.</h1><p className="mt-2 text-muted-foreground">Dados da busca mais recente e do seu CRM local.</p></div><Button asChild><Link href="/search"><Search />Nova busca</Link></Button></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([label, value, Icon], i) => <div key={label} className={`rounded-2xl border p-4 ${i === 2 ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "bg-card"}`}><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-amber-600" /></div><p className="mt-3 text-3xl font-bold">{value}</p></div>)}</section>
    <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Oportunidades recentes</h2><p className="text-sm text-muted-foreground">Ordenadas por maior potencial.</p></div><div className="flex gap-2 overflow-x-auto pb-1">{["todos", "forte", "médio", "fraco", "não contatados", "contatados", "whatsapp", "instagram"].map(item => <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${filter === item ? "border-zinc-950 bg-zinc-950 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-zinc-950" : "bg-card hover:bg-muted"}`}>{item}</button>)}</div></div>
    <section className="mt-4 grid gap-3 xl:grid-cols-2">{filtered.slice(0, 8).map(lead => <LeadCard key={lead.key} lead={lead} onDetails={() => { setSelected(lead); setMode("details"); }} onProspect={() => { setSelected(lead); setMode("prospect"); }} onSaved={() => setSaved(getStoredLeads())} />)}</section>
    {!source.length && <div className="mt-5 rounded-3xl border border-dashed bg-card p-10 text-center"><Search className="mx-auto size-8 text-amber-500" /><h2 className="mt-4 text-lg font-semibold">Comece pela primeira busca</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Informe cidade, estado e categoria para encontrar estabelecimentos reais no OpenStreetMap.</p><Button asChild className="mt-5"><Link href="/search">Buscar empresas <ArrowRight /></Link></Button></div>}
    {source.length > 0 && !filtered.length && <p className="mt-8 text-center text-sm text-muted-foreground">Nenhum resultado para este filtro.</p>}
    <LeadDetails lead={selected} open={mode === "details"} onOpenChange={open => !open && setMode(null)} />
    <ProspectDialog lead={selected} open={mode === "prospect"} onOpenChange={open => !open && setMode(null)} onContacted={() => setSaved(getStoredLeads())} />
  </AppShell>;
}
