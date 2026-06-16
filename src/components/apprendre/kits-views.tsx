"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  Headphones,
  MapPin,
  Package,
  Play,
  Target,
  Users,
} from "lucide-react";
import {
  KIT_BASE_INCLUDES,
  KIT_BY_ID,
  KIT_CAT_LABEL,
  KIT_CATS,
  KIT_FACILITATOR_FEE,
  KIT_FORMAT,
  KITS,
  kitDates,
  kitMoney,
  kitMoney0,
  kitQuote,
  kitZone,
  type ActivityKit,
  type KitOrder,
} from "@/lib/learn/kits";
import { getKitIllustration } from "@/lib/learn/kit-images";
import { MethodIcon } from "@/components/modeles/method-icon";
import {
  BackBtn,
  FilterChip,
  MethodIconTile,
  RailItemThumb,
  SectionHead,
  palColor,
  parcoursGrad,
} from "@/components/apprendre/learn-shared";
import { CHAT_AI_GRADIENT } from "@/components/dashboard/assistant-ia-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function KitArt({ kit, size = 96 }: { kit: ActivityKit; size?: number }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: size }}>
      <Image
        src={getKitIllustration(kit.id, kit.cat)}
        alt={kit.name}
        fill
        sizes={`(max-width: 640px) 50vw, ${size * 2}px`}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}

export function KitsPromo({ go }: { go: (name: string, id?: string) => void }) {
  const preview = KITS.slice(0, 4);
  return (
    <section className="mb-7">
      <SectionHead title="Boutique · Kits d'activité" action="Explorer la boutique" onAction={() => go("kits-catalog")} />
      <div className={cn("relative flex flex-wrap items-center gap-5 overflow-hidden rounded-2xl p-6", CHAT_AI_GRADIENT)}>
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <Package className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-extrabold text-white">16 kits clés en main, livrés avant votre séance</div>
          <p className="mt-1 text-[13.5px] leading-relaxed text-white/75">
            Chaque kit est conçu pour 5 équipes (20 à 30 participants) et peut être pris avec ou sans animateur My Facilitator.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {[
              { icon: MapPin, t: "Grand Montréal" },
              { icon: Headphones, t: "Animateur en option" },
              { icon: Clock, t: "Livré J-1 / J-2" },
            ].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
                <c.icon className="h-3.5 w-3.5" /> {c.t}
              </span>
            ))}
          </div>
        </div>
        <Button className="shrink-0 rounded-xl bg-white text-primary hover:bg-white/90" onClick={() => go("kits-catalog")}>
          Voir les 16 kits <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {preview.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => go("kit", k.id)}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <KitArt kit={k} size={76} />
            <div className="flex flex-col gap-1.5 p-3">
              <div className="text-[13.5px] font-extrabold leading-tight">{k.name}</div>
              <span className="text-[13px] font-extrabold">{kitMoney0(k.price)}<span className="text-[11px] font-semibold text-muted-foreground"> / kit</span></span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function KitStepper({ value, onChange, min = 1, max = 20 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</Button>
      <span className="min-w-[28px] text-center text-base font-extrabold tabular-nums">{value}</span>
      <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</Button>
    </div>
  );
}

export function KitsCatalogView({ onBack, go }: { onBack: () => void; go: (name: string, id?: string) => void }) {
  const [cat, setCat] = useState("tous");
  const list = cat === "tous" ? KITS : KITS.filter((k) => k.cat === cat);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Apprendre" />
      <div className="mb-2 flex items-start gap-3.5">
        <MethodIconTile icon="Package" color="blue" size={50} />
        <div>
          <h1 className="mb-1 text-[28px] font-extrabold tracking-tight">Boutique · Kits d&apos;activité</h1>
          <p className="max-w-xl text-[15px] text-muted-foreground">Des défis d&apos;équipe clés en main, livrés prêts à animer. {KIT_FORMAT}.</p>
        </div>
      </div>

      <div className="my-5 rounded-2xl border bg-card p-5">
        <div className="mb-1 flex items-center gap-2 text-primary">
          <CheckCircle className="h-4 w-4" />
          <div className="font-extrabold">Inclus dans chaque kit</div>
        </div>
        <p className="mb-3.5 text-[13px] text-muted-foreground">Pour que profs et gestionnaires sachent exactement ce qu&apos;ils achètent.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {KIT_BASE_INCLUDES.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[13.5px] font-semibold">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <MethodIconTile icon={it.icon} color="slate" size={28} />
              </span>
              {it.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip active={cat === "tous"} onClick={() => setCat("tous")}>Tous les kits</FilterChip>
        {KIT_CATS.map((c) => (
          <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</FilterChip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((k) => {
          const pal = palColor(k.color);
          return (
            <div
              key={k.id}
              role="button"
              tabIndex={0}
              onClick={() => go("kit", k.id)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <KitArt kit={k} size={92} />
              <div className="flex flex-1 flex-col p-3.5">
                <div className="mb-1 text-[14.5px] font-extrabold leading-tight">{k.name}</div>
                <p className="mb-2.5 flex-1 text-xs leading-snug text-muted-foreground">{k.objective}</p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {k.skills.slice(0, 2).map((s, i) => (
                    <span key={i} className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: pal.bg, color: pal.fg }}>{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-2.5">
                  <span className="text-[15px] font-extrabold">{kitMoney0(k.price)}<span className="text-[11px] font-semibold text-muted-foreground"> / kit</span></span>
                  <span className="text-xs font-bold text-primary">Voir <ArrowRight className="inline h-3 w-3" /></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KitDetailView({
  kit,
  onBack,
  onOrder,
}: {
  kit: ActivityKit;
  onBack: () => void;
  onOrder: (order: KitOrder) => void;
}) {
  const today = new Date();
  today.setDate(today.getDate() + 7);
  const [qty, setQty] = useState(1);
  const [facil, setFacil] = useState(false);
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [slot, setSlot] = useState(1);
  const [pc, setPc] = useState("");

  const q = kitQuote(kit, qty, facil);
  const zone = pc ? kitZone(pc) : null;
  const dates = kitDates(date, slot);
  const canOrder = zone === "in" && dates;
  const pal = palColor(kit.color);

  return (
    <div className="mx-auto max-w-[1040px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Boutique · Kits d'activité" />
      <div className="grid items-start gap-7 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-start gap-4">
            <RailItemThumb src={getKitIllustration(kit.id, kit.cat)} alt={kit.name} size={64} />
            <div>
              <div className="mb-1.5 flex flex-wrap gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ background: pal.bg, color: pal.fg }}>{KIT_CAT_LABEL[kit.cat]}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-bold text-emerald-600"><MapPin className="h-3 w-3" /> Grand Montréal</span>
              </div>
              <h1 className="mb-1.5 text-[28px] font-extrabold tracking-tight">{kit.name}</h1>
              <p className="text-[15px] text-muted-foreground">{kit.objective}</p>
            </div>
          </div>

          {kit.vid ? (
            <div className="relative mb-5 aspect-video overflow-hidden rounded-2xl border bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${kit.vid}?rel=0&modestbranding=1`}
                title={kit.name}
                allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${kit.name} challenge team building`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("mb-5 flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border bg-gradient-to-br", parcoursGrad(kit.color))}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"><Play className="h-6 w-6 fill-white" /></span>
              <div className="text-center">
                <div className="font-extrabold">Vidéos d&apos;exemple sur YouTube</div>
                <div className="text-xs text-muted-foreground">Recherche pour « {kit.name} »</div>
              </div>
            </a>
          )}

          <div className="mb-5 flex flex-wrap gap-5 text-[13.5px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{kit.dur} de défi</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 5 équipes · 20–30 pers.</span>
          </div>
          <p className="mb-3.5 text-[14.5px] leading-relaxed text-muted-foreground">{kit.about}</p>
          <div className="mb-2 text-[13px] font-bold">Compétences développées</div>
          <div className="mb-5 flex flex-wrap gap-2">
            {kit.skills.map((d, i) => (
              <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{d}</span>
            ))}
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-xl p-4" style={{ background: pal.bg }}>
            <Target className="mt-0.5 h-4 w-4 shrink-0" style={{ color: pal.fg }} />
            <div>
              <div className="text-[13.5px] font-extrabold">Objectif du défi</div>
              <div className="text-[13.5px] text-muted-foreground">{kit.objective}</div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-1 font-extrabold">Matériel spécifique</div>
              <div className="overflow-hidden rounded-2xl border">
                {kit.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 border-b px-3.5 py-2.5 text-[13.5px] font-semibold last:border-b-0">
                    <Check className="h-4 w-4 shrink-0" style={{ color: pal.fg }} /> {it}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 font-extrabold">Toujours inclus</div>
              <div className="overflow-hidden rounded-2xl border">
                {KIT_BASE_INCLUDES.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 border-b px-3.5 py-2 text-[13px] font-semibold text-muted-foreground last:border-b-0">
                    <MethodIcon name={it.icon} className="h-3.5 w-3.5 shrink-0" /> {it.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-extrabold">Obtenir le kit</div>
            <div className="text-[13px] font-bold text-muted-foreground">{kitMoney0(kit.price)} <span className="font-semibold text-muted-foreground/70">/ kit</span></div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <label className="text-[13.5px] font-bold">Nombre de kits</label>
            <KitStepper value={qty} onChange={setQty} />
          </div>
          <p className="mb-4 text-xs text-muted-foreground">1 kit = 5 équipes ({qty * 5} équipes · {qty * 20}–{qty * 30} pers.)</p>

          <button
            type="button"
            onClick={() => setFacil((v) => !v)}
            className={cn(
              "mb-4 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
              facil ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", facil ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
              <Headphones className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex justify-between gap-2">
                <span className="text-[13.5px] font-extrabold">Animateur My Facilitator</span>
                <span className={cn("text-xs font-extrabold", facil ? "text-primary" : "text-muted-foreground")}>+{kitMoney0(KIT_FACILITATOR_FEE)}</span>
              </div>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">Un animateur certifié mène votre séance de A à Z.</p>
            </div>
          </button>

          <div className="mb-4">
            <label className="mb-1.5 block text-[13.5px] font-bold">Date du défi</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-[13.5px] font-bold">Livraison</label>
            <div className="flex gap-2">
              {[{ d: 1, l: "J-1" }, { d: 2, l: "J-2" }].map((o) => (
                <Button key={o.d} variant={slot === o.d ? "default" : "secondary"} className="flex-1 rounded-xl" onClick={() => setSlot(o.d)}>{o.l} avant</Button>
              ))}
            </div>
            {dates && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Livraison le <strong>{dates.deliveryLabel}</strong> · commander avant le <strong>{dates.deadlineLabel}</strong>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-[13.5px] font-bold">Code postal de livraison</label>
            <Input
              value={pc}
              onChange={(e) => setPc(e.target.value)}
              placeholder="H2X 1Y4"
              maxLength={7}
              className={cn("rounded-xl uppercase", zone === "out" && "border-amber-300", zone === "in" && "border-emerald-300")}
            />
            {zone === "in" && <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /> Zone desservie</p>}
            {zone === "out" && <p className="mt-1.5 text-xs font-bold text-amber-600">Hors Grand Montréal · liste d&apos;attente</p>}
            {zone === "invalid" && pc && <p className="mt-1.5 text-xs text-muted-foreground">Entrez un code postal canadien (ex. H2X 1Y4).</p>}
          </div>

          <div className="mb-4 space-y-1.5 border-t pt-3.5 text-[13px] text-muted-foreground">
            <div className="flex justify-between"><span>Kits ({qty} × {kitMoney0(kit.price)})</span><span>{kitMoney(q.kits)}</span></div>
            {facil && <div className="flex justify-between"><span>Animateur</span><span>{kitMoney(q.facil)}</span></div>}
            <div className="flex justify-between"><span>Livraison locale</span><span>{kitMoney(q.delivery)}</span></div>
            <div className="flex justify-between text-muted-foreground/70"><span>TPS + TVQ</span><span>{kitMoney(q.tps + q.tvq)}</span></div>
            <div className="flex justify-between pt-1 text-sm font-extrabold text-foreground"><span>Total</span><span>{kitMoney(q.total)}</span></div>
          </div>

          {zone === "out" ? (
            <Button variant="secondary" className="w-full rounded-xl border-amber-200 bg-amber-50 text-amber-700" onClick={() => alert("Vous serez ajouté à la liste d'attente pour votre secteur.")}>
              Rejoindre la liste d&apos;attente
            </Button>
          ) : (
            <Button
              className="w-full rounded-xl"
              disabled={!canOrder}
              onClick={() => canOrder && dates && onOrder({ kitId: kit.id, qty, facil, date, slot, pc, quote: q, dates })}
            >
              Commander <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {!pc && <p className="mt-2 text-center text-xs text-muted-foreground">Vérifiez votre code postal pour commander.</p>}
        </div>
      </div>
    </div>
  );
}

export function KitOrderFlowView({
  order,
  onBack,
  onHome,
}: {
  order: KitOrder;
  onBack: () => void;
  onHome: () => void;
}) {
  const [step, setStep] = useState<"recap" | "confirm">("recap");
  const [pay, setPay] = useState<"carte" | "bc">("carte");
  const [loading, setLoading] = useState(false);
  const [quoteOnly, setQuoteOnly] = useState(false);
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [po, setPo] = useState({ org: "", num: "", contact: "", email: "" });
  const [addr, setAddr] = useState("");

  const kit = KIT_BY_ID[order.kitId];
  const q = order.quote;
  const orderNo = `MFK-2026-${String(Math.floor(1000 + (order.qty * 137 + kit.name.length * 31) % 9000))}`;

  const cardValid = pay === "carte" ? card.num.replace(/\s/g, "").length >= 12 && card.exp && card.cvc.length >= 3 && !!addr : true;
  const poValid = pay === "bc" ? !!(po.org && po.contact && po.email && addr) : true;
  const canSubmit = pay === "carte" ? cardValid : poValid;

  const submit = (asQuote: boolean) => {
    setQuoteOnly(asQuote);
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setStep("confirm"); }, 1100);
  };

  if (step === "confirm") {
    return (
      <div className="mx-auto max-w-[620px] px-6 py-12 pb-14 text-center sm:px-10">
        <div className={cn("mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full", quoteOnly ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-600")}>
          <CheckCircle className="h-9 w-9" />
        </div>
        <h1 className="mb-2 text-[26px] font-extrabold tracking-tight">{quoteOnly ? "Devis envoyé" : "Commande confirmée"}</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground">
          {quoteOnly
            ? <>Votre devis pour <strong>{kit.name}</strong> a été envoyé à <strong>{po.email}</strong>.</>
            : <>Votre kit <strong>{kit.name}</strong> sera livré le <strong>{order.dates.deliveryLabel}</strong>.</>}
        </p>
        <div className="mb-5 rounded-2xl border bg-card p-5 text-left text-[13.5px]">
          <div className="mb-2 flex justify-between"><span>{quoteOnly ? "N° de devis" : "N° de commande"}</span><span className="font-bold">{quoteOnly ? orderNo.replace("MFK", "DEV") : orderNo}</span></div>
          <div className="mb-2 flex justify-between"><span>Kit</span><span>{kit.name} × {order.qty}</span></div>
          {order.facil && <div className="mb-2 flex justify-between"><span>Animateur</span><span>Inclus</span></div>}
          <div className="mb-2 flex justify-between"><span>Date du défi</span><span>{new Date(`${order.date}T12:00:00`).toLocaleDateString("fr-CA", { day: "numeric", month: "long" })}</span></div>
          <div className="mb-2 flex justify-between"><span>Livraison</span><span>{order.dates.deliveryLabel} (J-{order.slot})</span></div>
          <div className="mt-3 flex justify-between border-t pt-3 text-[15px] font-extrabold"><span>Total</span><span>{kitMoney(q.total)}</span></div>
        </div>
        <Button className="rounded-xl" onClick={onHome}>Retour à Apprendre</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label={kit.name} />
      <h1 className="mb-5 text-[28px] font-extrabold tracking-tight">Finaliser la commande</h1>
      <div className="grid items-start gap-7 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 text-base font-extrabold">Adresse de livraison</h2>
          <Textarea value={addr} onChange={(e) => setAddr(e.target.value)} rows={2} placeholder={`1100 rue Notre-Dame O, Montréal, QC ${order.pc}`} className="mb-5 rounded-xl" />

          <h2 className="mb-3 text-base font-extrabold">Mode de paiement</h2>
          <div className="mb-4 space-y-2">
            {[
              { id: "carte" as const, t: "Carte", d: "Paiement immédiat et sécurisé" },
              { id: "bc" as const, t: "Bon de commande", d: "Facturation institutionnelle" },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setPay(o.id)}
                className={cn("flex w-full items-center gap-3 rounded-xl border p-3.5 text-left", pay === o.id ? "border-primary bg-primary/5" : "border-border")}
              >
                <div className="flex-1">
                  <div className="font-bold">{o.t}</div>
                  <div className="text-xs text-muted-foreground">{o.d}</div>
                </div>
                <span className={cn("h-5 w-5 rounded-full border-4", pay === o.id ? "border-primary" : "border-muted-foreground/30")} />
              </button>
            ))}
          </div>

          {pay === "carte" ? (
            <div className="space-y-3 rounded-2xl border p-4">
              <Input placeholder="1234 5678 9012 3456" value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value })} className="rounded-xl" />
              <div className="flex gap-3">
                <Input placeholder="MM/AA" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className="rounded-xl" />
                <Input placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} maxLength={4} className="rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border p-4">
              <Input placeholder="Établissement" value={po.org} onChange={(e) => setPo({ ...po, org: e.target.value })} className="rounded-xl" />
              <div className="flex gap-3">
                <Input placeholder="N° bon de commande" value={po.num} onChange={(e) => setPo({ ...po, num: e.target.value })} className="rounded-xl" />
                <Input placeholder="Contact facturation" value={po.contact} onChange={(e) => setPo({ ...po, contact: e.target.value })} className="rounded-xl" />
              </div>
              <Input placeholder="Courriel facturation" value={po.email} onChange={(e) => setPo({ ...po, email: e.target.value })} className="rounded-xl" />
            </div>
          )}
        </div>

        <div className="sticky top-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3.5 font-extrabold">Récapitulatif</div>
          <div className="mb-3 flex items-center gap-3">
            <RailItemThumb src={getKitIllustration(kit.id, kit.cat)} alt={kit.name} size={42} />
            <div>
              <div className="text-sm font-bold">{kit.name}</div>
              <div className="text-xs text-muted-foreground">{order.qty} kit{order.qty > 1 ? "s" : ""} · J-{order.slot}</div>
            </div>
          </div>
          <div className="mb-3 space-y-1 text-[13px] text-muted-foreground">
            <div className="flex justify-between"><span>Kits</span><span>{kitMoney(q.kits)}</span></div>
            {order.facil && <div className="flex justify-between"><span>Animateur</span><span>{kitMoney(q.facil)}</span></div>}
            <div className="flex justify-between"><span>Livraison</span><span>{kitMoney(q.delivery)}</span></div>
            <div className="flex justify-between"><span>TPS + TVQ</span><span>{kitMoney(q.tps + q.tvq)}</span></div>
            <div className="flex justify-between border-t pt-2 font-extrabold text-foreground"><span>Total</span><span>{kitMoney(q.total)}</span></div>
          </div>
          {pay === "bc" && (
            <Button variant="secondary" className="mb-2 w-full rounded-xl" disabled={!poValid || loading} onClick={() => submit(true)}>
              Demander un devis
            </Button>
          )}
          <Button className="w-full rounded-xl" disabled={!canSubmit || loading} onClick={() => submit(false)}>
            {loading ? "Traitement…" : pay === "carte" ? `Payer ${kitMoney(q.total)}` : "Confirmer la commande"}
          </Button>
        </div>
      </div>
    </div>
  );
}
