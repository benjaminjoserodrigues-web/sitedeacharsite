"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Globe2, Mail, MapPin, MessageCircle, Phone, Save, Send, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";
import { MESSAGE_TEMPLATES, personalizeMessage, type MessageTemplate } from "@/lib/messages";
import { getSettings, saveLead, updateLeadStatus } from "@/lib/storage";
import { whatsappUrl } from "@/lib/phone";

export const levelLabel = { forte: "Lead forte", médio: "Lead médio", fraco: "Lead fraco" } as const;
export const levelClass = { forte: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300", médio: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300", fraco: "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" } as const;

export function StatusSelect({ lead, onChange }: { lead: Lead; onChange?: (status: LeadStatus) => void }) {
  return <NativeSelect className="h-8 min-w-36 bg-card text-xs" value={lead.status} onChange={(event) => { const status = event.target.value as LeadStatus; saveLead(lead); updateLeadStatus(lead.key, status); onChange?.(status); }}>
    {LEAD_STATUSES.map((status) => <NativeSelectOption key={status}>{status}</NativeSelectOption>)}
  </NativeSelect>;
}

export function LeadDetails({ lead, open, onOpenChange, onStatus }: { lead: Lead | null; open: boolean; onOpenChange: (open: boolean) => void; onStatus?: (lead: Lead, status: LeadStatus) => void }) {
  if (!lead) return null;
  const fields = [
    [MapPin, "Endereço", lead.address || "Não informado"], [Phone, "Telefone", lead.phone || "Não informado"],
    [MessageCircle, "WhatsApp", lead.whatsapp || "Não informado"], [Mail, "E-mail", lead.email || "Não informado"],
    [Globe2, "Website", lead.website || "Site não encontrado nos dados consultados."],
  ] as const;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
    <DialogHeader><DialogTitle className="pr-8 text-xl">{lead.name}</DialogTitle><DialogDescription>{lead.category} · {lead.city}, {lead.state}</DialogDescription></DialogHeader>
    <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
      <div className="space-y-2">{fields.map(([Icon, label, value]) => <div key={label} className="flex gap-3 rounded-xl border bg-muted/30 p-3"><Icon className="mt-0.5 size-4 shrink-0 text-amber-600" /><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 break-all text-sm">{value}</p></div></div>)}
        <div className="rounded-xl border p-3 text-sm"><p><strong>Horário:</strong> {lead.openingHours || "Não informado"}</p><p className="mt-1"><strong>Coordenadas:</strong> {lead.latitude.toFixed(5)}, {lead.longitude.toFixed(5)}</p><p className="mt-1"><strong>OSM ID:</strong> {lead.osmType}/{lead.osmId}</p></div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl bg-zinc-950 p-5 text-white"><p className="text-xs text-zinc-400">Lead Score</p><p className="mt-1 text-4xl font-bold text-amber-400">{lead.score}<span className="text-base text-zinc-500">/100</span></p><Badge className={`mt-3 ${levelClass[lead.scoreLevel]}`}>{levelLabel[lead.scoreLevel]}</Badge></div>
        <div><p className="mb-2 text-sm font-semibold">Motivos do score</p><ul className="space-y-2">{lead.scoreReasons.map((reason) => <li key={reason.label} className="flex items-start justify-between gap-2 text-xs"><span className="flex gap-1.5"><Check className="mt-0.5 size-3 text-emerald-600" />{reason.label}</span><strong>+{reason.points}</strong></li>)}</ul></div>
        <div><p className="mb-2 text-sm font-semibold">Status</p><StatusSelect lead={lead} onChange={(status) => onStatus?.(lead, status)} /></div>
      </div>
    </div>
    {lead.history.length > 0 && <div><p className="mb-2 text-sm font-semibold">Histórico</p><div className="space-y-2">{lead.history.map((item) => <div key={item.id} className="flex justify-between gap-4 border-l-2 border-amber-400 pl-3 text-xs"><span>{item.action}</span><time className="text-muted-foreground">{new Date(item.at).toLocaleString("pt-BR")}</time></div>)}</div></div>}
  </DialogContent></Dialog>;
}

export function ProspectDialog({ lead, open, onOpenChange, onContacted }: { lead: Lead | null; open: boolean; onOpenChange: (open: boolean) => void; onContacted?: () => void }) {
  const [template, setTemplate] = useState<MessageTemplate>("profissional");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (lead && open) { const base = template === "profissional" ? getSettings().defaultMessage : MESSAGE_TEMPLATES[template]; setMessage(personalizeMessage(base, { company: lead.name, category: lead.category, city: lead.city })); } }, [lead, open, template]);
  if (!lead) return null;
  const wa = whatsappUrl(lead.whatsapp || lead.phone, message);
  const instagram = lead.instagram ? (lead.instagram.startsWith("http") ? lead.instagram : `https://instagram.com/${lead.instagram.replace(/^@/, "")}`) : null;
  const markContacted = () => { saveLead(lead); updateLeadStatus(lead.key, "Contatado"); onContacted?.(); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl">
    <DialogHeader><DialogTitle>Preparar abordagem</DialogTitle><DialogDescription>Personalize e envie quando quiser. A Lions Leads não dispara mensagens automaticamente.</DialogDescription></DialogHeader>
    <div className="flex flex-wrap gap-2">{(["profissional", "curto", "instagram"] as MessageTemplate[]).map((item) => <Button key={item} size="sm" variant={template === item ? "default" : "outline"} onClick={() => setTemplate(item)} className="capitalize">{item}</Button>)}</div>
    <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={8} className="resize-none" />
    <div className="grid gap-2 sm:grid-cols-2">
      <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{copied ? <Check /> : <Copy />}{copied ? "Copiada" : "Copiar mensagem"}</Button>
      <Button disabled={!wa} onClick={() => { if (wa) { window.open(wa, "_blank", "noopener,noreferrer"); markContacted(); } }}><MessageCircle />Abrir WhatsApp</Button>
      <Button variant="outline" disabled={!instagram} onClick={() => instagram && window.open(instagram, "_blank", "noopener,noreferrer")}><ExternalLink />Abrir Instagram</Button>
      <Button variant="outline" onClick={markContacted}><Send />Marcar contatado</Button>
    </div>
  </DialogContent></Dialog>;
}

export function LeadCard({ lead, onDetails, onProspect, onSaved }: { lead: Lead; onDetails: () => void; onProspect: () => void; onSaved?: () => void }) {
  const [saved, setSaved] = useState(false);
  return <article className="group rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline" className={levelClass[lead.scoreLevel]}>{levelLabel[lead.scoreLevel]}</Badge><span className="text-xs text-muted-foreground">{lead.category}</span></div><h3 className="truncate text-lg font-semibold tracking-tight">{lead.name}</h3><p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0" />{lead.address || `${lead.city}, ${lead.state}`}</p></div><div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-lg font-bold text-amber-400">{lead.score}</div></div>
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4"><span className="truncate"><Phone className="mr-1 inline size-3" />{lead.phone || "Sem telefone"}</span><span className="truncate"><MessageCircle className="mr-1 inline size-3" />{lead.whatsapp || "Sem WhatsApp"}</span><span className="truncate"><Globe2 className="mr-1 inline size-3" />{lead.website ? "Com site" : "Site não encontrado"}</span><span className="truncate"><Star className="mr-1 inline size-3" />{lead.status}</span></div>
    <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={onProspect}><Send />Abordar</Button><Button size="sm" variant="outline" onClick={onDetails}>Ver detalhes</Button><Button size="sm" variant="ghost" onClick={() => { saveLead(lead); setSaved(true); onSaved?.(); }}><Save />{saved ? "Lead salvo" : "Salvar lead"}</Button></div>
  </article>;
}
