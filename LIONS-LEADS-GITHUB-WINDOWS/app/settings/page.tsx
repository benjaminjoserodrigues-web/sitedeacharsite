"use client";
import { useEffect, useState } from "react";
import { Moon, Plus, Save, Sun, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/storage";
import type { Settings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS), [newCategory, setNewCategory] = useState(""), [saved, setSaved] = useState(false);
  useEffect(() => { setSettings(getSettings()); }, []);
  function persist() { saveSettings(settings); document.documentElement.classList.toggle("dark", settings.theme === "dark"); setSaved(true); setTimeout(() => setSaved(false), 1800); }
  function addCategory() { const value = newCategory.trim().toLocaleLowerCase("pt-BR"); if (value && !settings.customCategories.includes(value)) setSettings({ ...settings, customCategories: [...settings.customCategories, value] }); setNewCategory(""); }
  return <AppShell><div className="mb-6"><p className="mb-2 text-sm font-semibold text-amber-600">PREFERÊNCIAS</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Configurações</h1><p className="mt-2 text-muted-foreground">Personalize o CRM neste dispositivo.</p></div>
    <div className="grid gap-5 xl:grid-cols-[1fr_.7fr]"><section className="space-y-5 rounded-3xl border bg-card p-5 sm:p-7"><div><Label htmlFor="company">Nome da empresa</Label><Input id="company" value={settings.companyName} onChange={e => setSettings({ ...settings, companyName: e.target.value })} className="mt-2" /></div><div><Label htmlFor="message">Mensagem padrão</Label><Textarea id="message" value={settings.defaultMessage} onChange={e => setSettings({ ...settings, defaultMessage: e.target.value })} rows={6} className="mt-2" /><p className="mt-2 text-xs text-muted-foreground">Variáveis: {"{empresa}"}, {"{categoria}"}, {"{cidade}"}.</p></div><div><Label htmlFor="quantity">Quantidade padrão</Label><Input id="quantity" type="number" min={1} max={100} value={settings.defaultQuantity} onChange={e => setSettings({ ...settings, defaultQuantity: Number(e.target.value) })} className="mt-2 max-w-40" /></div><Button onClick={persist}><Save />{saved ? "Configurações salvas" : "Salvar configurações"}</Button></section>
      <div className="space-y-5"><section className="rounded-3xl border bg-card p-5 sm:p-7"><h2 className="font-semibold">Tema</h2><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => setSettings({ ...settings, theme: "light" })} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${settings.theme === "light" ? "border-amber-400 bg-amber-50 text-zinc-900" : ""}`}><Sun className="size-4" />Claro</button><button onClick={() => setSettings({ ...settings, theme: "dark" })} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${settings.theme === "dark" ? "border-amber-400 bg-zinc-900 text-white" : ""}`}><Moon className="size-4" />Escuro</button></div></section>
        <section className="rounded-3xl border bg-card p-5 sm:p-7"><h2 className="font-semibold">Categorias personalizadas</h2><div className="mt-3 flex gap-2"><Input value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }} placeholder="Nova categoria" /><Button size="icon" onClick={addCategory} aria-label="Adicionar categoria"><Plus /></Button></div><div className="mt-3 flex flex-wrap gap-2">{settings.customCategories.map(item => <span key={item} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs capitalize">{item}<button aria-label={`Remover ${item}`} onClick={() => setSettings({ ...settings, customCategories: settings.customCategories.filter(category => category !== item) })}><X className="size-3" /></button></span>)}</div></section></div></div>
  </AppShell>;
}
