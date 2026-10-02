import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getContactEmail } from "@/data/site-contact"
import { siteImages } from "@/data/site-images"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Japanese Matcha & Tea Wholesale from Japan",
  description:
    "Wholesale and export consultation for Japanese matcha, tencha and hojicha. Small test orders, cafe use, resale and distribution inquiries welcome.",
  alternates: {
    canonical: "https://ochanoshojuen.com/wholesale",
  },
  openGraph: {
    title: "Japanese Matcha & Tea Wholesale from Japan | SHOJUEN",
    description:
      "Japanese matcha, tencha and hojicha for cafes, brands, distributors and retailers worldwide.",
    url: "https://ochanoshojuen.com/wholesale",
    type: "website",
  },
}

const buyerTypes = [
  "Cafes & coffee shops",
  "Tea brands",
  "Importers & distributors",
  "Retailers & specialty stores",
]

const products = [
  {
    title: "Matcha",
    body: "From everyday latte applications to premium usucha and higher-grade selections. We match origin, cultivar and milling to your intended use.",
  },
  {
    title: "Tencha",
    body: "For buyers who need tencha as an ingredient or want to control milling and final product design on their side.",
  },
  {
    title: "Hojicha",
    body: "Roasted green tea options for beverages, desserts, powder applications and private product development.",
  },
]

const flow = [
  {
    step: "01",
    title: "Tell us your use",
    body: "Cafe beverage, baking, retail, distribution or product development.",
  },
  {
    step: "02",
    title: "We shortlist the fit",
    body: "We propose grades and origins based on budget, flavor profile, color and monthly volume.",
  },
  {
    step: "03",
    title: "Sample and confirm",
    body: "Start with a small quantity where possible, test in your actual recipe, then scale.",
  },
  {
    step: "04",
    title: "Export consultation",
    body: "We discuss packing, destination, timing and the information needed by your importer.",
  },
]

export default function WholesalePage() {
  const email = getContactEmail()
  const subject = encodeURIComponent("[SHOJUEN] Wholesale & export inquiry")
  const mailto = `mailto:${email}?subject=${subject}`

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border/70 bg-stone-950">
        <div className="absolute inset-0">
          <Image
            src={siteImages.matchaCatalogBanner}
            alt="Japanese matcha powder prepared for wholesale evaluation"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-emerald-950/45"
            aria-hidden
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.42em] text-emerald-100/85">
            SHOJUEN · Wholesale & Export
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-4xl font-medium leading-tight tracking-wide text-white sm:text-5xl md:text-6xl">
            Japanese Matcha & Tea
            <br />
            Wholesale from Japan
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
            Matcha, tencha and hojicha for cafes, brands, importers and
            distributors. We source from producers and tea regions across Japan,
            then propose the right tea for your actual use, volume and target
            price.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={mailto}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-7 no-underline"
              )}
            >
              Request wholesale consultation
            </a>
            <Link
              href="/journal"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-white/30 bg-white/10 px-7 text-white no-underline hover:bg-white/15"
              )}
            >
              See our sourcing journal
            </Link>
          </div>
          <p className="mt-5 text-sm text-stone-300">
            Small test orders are welcome where available.
          </p>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              Built for B2B buyers
            </p>
            <h2 className="mt-4 max-w-2xl font-heading text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
              We do not start with a grade name. We start with how you will use
              the tea.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
              Color for lattes, aroma for straight tea, cost control for
              high-volume cafes, consistency for retail products, or a
              distinctive origin story for a premium line — the right matcha
              depends on the job it has to do.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-muted/35 p-7">
            <p className="text-sm font-medium text-foreground">
              We regularly discuss supply for:
            </p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {buyerTypes.map((type) => (
                <li
                  key={type}
                  className="border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            What we can supply
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.title}
                className="rounded-3xl border border-border bg-background p-7"
              >
                <h2 className="font-heading text-2xl font-medium text-foreground">
                  {product.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {product.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
                Why SHOJUEN
              </p>
              <h2 className="mt-4 font-heading text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
                Multiple origins, one point of contact.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                We work across tea regions rather than forcing every buyer into
                one origin. Depending on the lot and season, our sourcing spans
                areas such as Uji, Yame, Ureshino, Kagoshima and Miyazaki. That
                gives us room to compare flavor, color, price and availability
                instead of simply selling the same answer to every customer.
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Our aim is practical: help smaller and growing businesses access
                tea that fits their product without requiring unnecessarily large
                first orders.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-primary/[0.04] p-7 sm:p-8">
              <p className="text-sm font-medium text-foreground">
                Useful information to send us
              </p>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>Company / brand name</p>
                <p>Destination country</p>
                <p>Use: latte, straight tea, baking, retail, distribution</p>
                <p>Estimated monthly volume</p>
                <p>Target price range, if you have one</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
            How it works
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {flow.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="font-mono text-xs tracking-[0.25em] text-emerald-200/80">
                  {item.step}
                </p>
                <h3 className="mt-4 font-heading text-xl font-medium">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Start with your use case
          </p>
          <h2 className="mt-5 font-heading text-3xl font-medium tracking-wide text-foreground sm:text-5xl">
            Tell us what you want to make.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            You do not need to know the right cultivar or grade in advance. Tell
            us your country, use and approximate quantity, and we will narrow the
            options with you.
          </p>
          <div className="mt-9">
            <a
              href={mailto}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-8 no-underline"
              )}
            >
              Email {email}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
