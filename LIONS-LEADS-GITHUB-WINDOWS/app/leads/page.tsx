"use client";
import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LeadCard, LeadDetails, ProspectDialog } from "@/components/lead-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getStoredLeads } from "@/lib/storage";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";
const csvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]), [query, setQuery] = useState(""), [status, setStatus] = useState<LeadStatus | "todos">("todos");
  const [selected, setSelected] = useState<Lead | null>(null), [mode, setMode] = useState<"details" | "prospect" | null>(null);
  useEffect(() => { setLeads(getStoredLeads()); }, []);
  const filtered = useMemo(() => leads.filter(lead => (status === "todos" || lead.status === status) && `${lead.name} ${lead.city} ${lead.category}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))), [leads, query, status]);
  function exportCsv() { const header = ["empresa", "categoria", "cidade", "endereço", "telefone", "Instagram", "e-mail", "score", "status"]; const rows = filtered.map(lead => [lead.name, lead.category, lead.city, lead.address, lead.phone, lead.instagram, lead.email, lead.score, lead.status]); const blob = new Blob(["\uFEFF" + [header, ...rows].map(row => row.map(csvValue).join(";")).join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = `lions-leads-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url); }
  return <AppShell>
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-semibold text-amber-600">CRM LOCAL</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Meus leads</h1><p className="mt-2 text-muted-foreground">{leads.length} {leads.length === 1 ? "empresa salva" : "empresas salvas"} neste dispositivo.</p></div><Button variant="outline" disabled={!filtered.length} onClick={exportCsv}><Download />Exportar CSV</Button></div>
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por empresa, cidade ou categoria" className="pl-9" /></div><NativeSelect value={status} onChange={e => setStatus(e.target.value as LeadStatus | "todos")} className="w-full sm:w-56"><NativeSelectOption value="todos">Todos os status</NativeSelectOption>{LEAD_STATUSES.map(item => <NativeSelectOption key={item}>{item}</NativeSelectOption>)}</NativeSelect></div>
    <section className="mt-5 grid gap-3 xl:grid-cols-2">{filtered.map(lead => <LeadCard key={lead.key} lead={lead} onDetails={() => { setSelected(lead); setMode("details"); }} onProspect={() => { setSelected(lead); setMode("prospect"); }} />)}</section>
    {!filtered.length && <div className="mt-5 rounded-2xl border border-dashed bg-card p-10 text-center"><h2 className="font-semibold">Nenhum lead por aqui</h2><p className="mt-1 text-sm text-muted-foreground">Salve empresas durante a busca para montar seu CRM.</p></div>}
    <LeadDetails lead={selected} open={mode === "details"} onOpenChange={open => !open && setMode(null)} onStatus={() => { const fresh = getStoredLeads(); setLeads(fresh); setSelected(current => current ? fresh.find(item => item.key === current.key) ?? current : current); }} />
    <ProspectDialog lead={selected} open={mode === "prospect"} onOpenChange={open => !open && setMode(null)} onContacted={() => setLeads(getStoredLeads())} />
  </AppShell>;
}

