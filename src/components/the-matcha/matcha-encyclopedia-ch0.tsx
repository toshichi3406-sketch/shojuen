"use client"

import { useState } from "react"

import { useLanguage } from "@/i18n/language-context"
import type { MatchaEncyclopediaCh0Messages } from "@/i18n/matcha-encyclopedia-ch0-messages"
import { cn } from "@/lib/utils"

type TabId = "a" | "b" | "c"

function HtmlText({
  html,
  className,
  as: Tag = "span",
}: {
  html: string
  className?: string
  as?: "span" | "p" | "div" | "h2"
}) {
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function TypePanel({
  active,
  route,
  tags,
  traits,
  usesLabel,
  traitsLabel,
}: {
  active: boolean
  route: string
  tags: [string, string, string, string]
  traits: [string, string]
  usesLabel: string
  traitsLabel: string
}) {
  if (!active) return null

  return (
    <div className="mt-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="border border-border/80 bg-card p-5">
        <p className="border-b border-border/70 pb-3.5 text-[0.82rem] leading-relaxed text-muted-foreground">
          {route}
        </p>
        <h3 className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted-foreground first:mt-0">
          {usesLabel}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={cn(
                "border border-border/80 px-2.5 py-1 text-[0.78rem] text-foreground",
                i === 3 && "text-muted-foreground opacity-65",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {traitsLabel}
        </h3>
        <ul className="mt-2 space-y-1 text-[0.9rem] leading-relaxed text-foreground/90">
          {traits.map((trait) => (
            <li key={trait} className="relative pl-3.5 before:absolute before:left-0 before:text-primary before:content-['·']">
              {trait}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Accordion({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <details className="group border-b border-border/80">
      <summary className="cursor-pointer list-none py-4 pr-9 text-[0.95rem] font-bold leading-snug marker:content-none hover:text-primary [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden
          className="float-right -mr-1 text-xl font-normal leading-none text-primary group-open:hidden"
        >
          +
        </span>
        <span
          aria-hidden
          className="float-right -mr-1 hidden text-xl font-normal leading-none text-primary group-open:inline"
        >
          −
        </span>
      </summary>
      <div className="pb-6 text-[0.9rem] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  )
}

function ComboExample({
  title,
  lines,
  result,
}: {
  title: string
  lines: [string, string]
  result: string
}) {
  return (
    <div className="mb-2 border border-border/80 p-3.5">
      <strong className="block text-[0.88rem] text-foreground">{title}</strong>
      <ul className="mt-2 space-y-0.5 text-[0.82rem]">
        {lines.map((line) => (
          <li
            key={line}
            className="relative pl-3 before:absolute before:left-0 before:text-primary before:content-['·']"
          >
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.82rem] font-bold text-primary">{result}</p>
    </div>
  )
}

function Ch0Content({ c }: { c: MatchaEncyclopediaCh0Messages }) {
  const [tab, setTab] = useState<TabId>("a")

  const tabs: { id: TabId; badge: string; title: string; sub: string }[] = [
    { id: "a", badge: "A", title: c.tabATitle, sub: c.tabASub },
    { id: "b", badge: "B", title: c.tabBTitle, sub: c.tabBSub },
    { id: "c", badge: "C", title: c.tabCTitle, sub: c.tabCSub },
  ]

  return (
    <>
      <p className="text-xs font-medium tracking-[0.14em] text-primary">
        {c.kicker}
      </p>
      <HtmlText
        as="h2"
        html={c.h1Html}
        className="font-heading mt-3 text-[clamp(1.35rem,4vw,1.75rem)] font-medium leading-snug text-foreground"
      />
      <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
        {c.lead}
      </p>
      <HtmlText
        as="p"
        html={c.leadEmHtml}
        className="mt-2.5 border-l-[3px] border-primary bg-muted/60 px-3.5 py-3 text-[0.92rem] leading-relaxed text-foreground [&_strong]:font-bold"
      />

      <div
        className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="tablist"
        aria-label={c.kicker}
      >
        {tabs.map(({ id, badge, title, sub }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "border border-border/80 bg-card p-3.5 text-left transition-colors hover:border-primary/50",
                active && "border-primary bg-muted/70",
              )}
            >
              <span
                className={cn(
                  "mb-2 inline-flex size-7 items-center justify-center rounded-full border-[1.5px] border-primary text-[0.82rem] font-bold text-primary",
                  active && "bg-primary text-primary-foreground",
                )}
              >
                {badge}
              </span>
              <strong className="block text-[0.88rem] text-foreground">
                {title}
              </strong>
              <span className="mt-1 block text-[0.78rem] leading-snug text-muted-foreground">
                {sub}
              </span>
            </button>
          )
        })}
      </div>

      <TypePanel
        active={tab === "a"}
        route={c.panelARoute}
        tags={c.aTags}
        traits={c.aTraits}
        usesLabel={c.usesLabel}
        traitsLabel={c.traitsLabel}
      />
      <TypePanel
        active={tab === "b"}
        route={c.panelBRoute}
        tags={c.bTags}
        traits={c.bTraits}
        usesLabel={c.usesLabel}
        traitsLabel={c.traitsLabel}
      />
      <TypePanel
        active={tab === "c"}
        route={c.panelCRoute}
        tags={c.cTags}
        traits={c.cTraits}
        usesLabel={c.usesLabel}
        traitsLabel={c.traitsLabel}
      />

      <div className="mt-10 border-t border-border/80">
        <Accordion title={c.acc1Title}>
          <p className="mb-3.5">{c.acc1Intro}</p>
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[0.82rem]">
            <span className="border border-border/80 bg-muted/50 px-2.5 py-1.5">
              {c.chipLeaf}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="border border-border/80 bg-muted/50 px-2.5 py-1.5">
              A / B / C
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="border border-border/80 bg-muted/50 px-2.5 py-1.5">
              {c.chipDry}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="border border-border/80 bg-muted/50 px-2.5 py-1.5">
              {c.chipGrind}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="border border-border/80 bg-muted/50 px-2.5 py-1.5">
              {c.chipPowder}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                {
                  head: `A ${c.laneTencha}`,
                  steps: [c.laneAS1, c.laneAS2, c.laneAS3],
                },
                {
                  head: `B ${c.laneSencha}`,
                  steps: [c.laneBS1, c.laneBS2, c.laneBS3],
                },
                {
                  head: `C ${c.laneKamairi}`,
                  steps: [c.laneCS1, c.laneCS2],
                },
              ] as const
            ).map(({ head, steps }) => (
              <div
                key={head}
                className="border border-border/80 p-3 text-center text-[0.78rem] leading-snug"
              >
                <p className="mb-2 text-[0.82rem] font-bold text-primary">
                  {head}
                </p>
                {steps.map((step) => (
                  <p key={step} className="py-0.5 text-muted-foreground">
                    {step}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <HtmlText
            as="p"
            html={c.acc1NoteHtml}
            className="mt-3 bg-muted/60 p-3.5 text-[0.84rem] leading-relaxed [&_strong]:font-bold [&_strong]:text-foreground"
          />
          <div className="mt-4 border border-primary bg-muted/50 px-4 py-6 text-center">
            <p className="text-[0.72rem] tracking-[0.1em] text-muted-foreground">
              {c.resultPre}
            </p>
            <p className="mt-2 text-[1.1rem] font-bold tracking-wide text-primary">
              {c.resultMain}
            </p>
          </div>
        </Accordion>

        <Accordion title={c.acc2Title}>
          <p className="mb-3">{c.acc2Intro}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                { name: c.grind1Name, desc: c.grind1DescHtml },
                { name: c.grind2Name, desc: c.grind2DescHtml },
                { name: c.grind3Name, desc: c.grind3DescHtml },
              ] as const
            ).map(({ name, desc }) => (
              <div
                key={name}
                className="border border-border/80 p-3.5 text-center text-[0.82rem]"
              >
                <strong className="block text-foreground">{name}</strong>
                <HtmlText
                  html={desc}
                  className="mt-1.5 block text-[0.78rem] leading-snug text-muted-foreground"
                />
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title={c.acc3Title}>
          {(
            [
              { label: c.stepShade, body: c.stepShadeBodyHtml, html: true },
              { label: c.stepKill, body: c.stepKillBodyHtml, html: true },
              { label: c.stepRoll, body: c.stepRollBodyHtml, html: true },
              { label: c.stepGrind, body: c.stepGrindBody, html: false },
            ] as const
          ).map(({ label, body, html }) => (
            <div
              key={label}
              className="grid grid-cols-1 gap-1 border-b border-border/70 py-3 last:border-b-0 sm:grid-cols-[100px_1fr] sm:gap-3"
            >
              <span className="text-[0.82rem] font-bold text-primary">
                {label}
              </span>
              {html ? (
                <HtmlText
                  html={body}
                  className="text-foreground/90 [&_strong]:font-bold"
                />
              ) : (
                <span className="text-foreground/90">{body}</span>
              )}
            </div>
          ))}
        </Accordion>

        <Accordion title={c.acc4Title}>
          <p className="mb-3">{c.acc4Intro}</p>
          <ComboExample
            title={c.combo1Title}
            lines={[c.combo1L1, c.combo1L2]}
            result={c.combo1Result}
          />
          <ComboExample
            title={c.combo2Title}
            lines={[c.combo2L1, c.combo2L2]}
            result={c.combo2Result}
          />
          <ComboExample
            title={c.combo3Title}
            lines={[c.combo3L1, c.combo3L2]}
            result={c.combo3Result}
          />
          <p className="mt-3 bg-muted/60 p-3.5 text-[0.84rem] leading-relaxed text-foreground/90">
            {c.acc4Note}
          </p>
        </Accordion>
      </div>
    </>
  )
}

export function MatchaEncyclopediaCh0() {
  const { m } = useLanguage()

  return (
    <section
      aria-labelledby="matcha-encyclopedia-ch0-heading"
      className="border-b border-border/70 bg-background"
    >
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Ch0Content c={m.encyclopediaCh0} />
      </div>
    </section>
  )
}
