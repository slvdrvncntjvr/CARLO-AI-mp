"use client"

import { useMemo, useState } from "react"
import { Search, Gauge, Cog, Fuel, MapPin, ArrowUpDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CarloCallModal } from "@/components/carlo-call-modal"
import { CarloFab } from "@/components/carlo-fab"
import { type Car, formatMileage, formatPHP, inventory } from "@/lib/inventory"
import { cn } from "@/lib/utils"

const transmissionOptions = ["All", "Automatic", "Manual"] as const
const fuelOptions = ["All", "Gasoline", "Diesel"] as const
const bodyOptions = ["All", "Sedan", "SUV", "Pickup", "Hatchback", "MPV"] as const
type SortKey = "newest" | "price-low" | "price-high" | "mileage-low"

const MIN_PRICE = 300_000
const MAX_PRICE = 1_700_000

const conditionStyles: Record<Car["condition"], string> = {
  Excellent: "bg-primary/15 text-primary border-primary/30",
  Good: "bg-amber/15 text-amber border-amber/30",
  Fair: "bg-orange-muted/15 text-orange-muted border-orange-muted/30",
}

export default function InventoryPage() {
  const [callOpen, setCallOpen] = useState(false)
  const [activeCar, setActiveCar] = useState<Car | undefined>(undefined)

  const [query, setQuery] = useState("")
  const [transmission, setTransmission] =
    useState<(typeof transmissionOptions)[number]>("All")
  const [fuel, setFuel] = useState<(typeof fuelOptions)[number]>("All")
  const [body, setBody] = useState<(typeof bodyOptions)[number]>("All")
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE)
  const [sort, setSort] = useState<SortKey>("newest")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = inventory.filter((c) => {
      if (transmission !== "All" && c.transmission !== transmission) return false
      if (fuel !== "All" && c.fuelType !== fuel) return false
      if (body !== "All" && c.bodyType !== body) return false
      if (c.price > maxPrice) return false
      if (q) {
        const hay = `${c.year} ${c.make} ${c.model} ${c.variant} ${c.color} ${c.location}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "mileage-low":
          return a.mileage - b.mileage
        case "newest":
        default:
          return b.year - a.year
      }
    })
    return list
  }, [query, transmission, fuel, body, maxPrice, sort])

  const openCall = (car?: Car) => {
    setActiveCar(car)
    setCallOpen(true)
  }

  const resetFilters = () => {
    setQuery("")
    setTransmission("All")
    setFuel("All")
    setBody("All")
    setMaxPrice(MAX_PRICE)
    setSort("newest")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="surface-dark relative">
        <div className="bg-dotted absolute inset-0 opacity-20" aria-hidden="true" />
        <SiteHeader variant="dark" />
        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 md:pb-16 md:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Live inventory
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            Browse the lot.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
            Eight carefully inspected units in stock. Filter, sort, and find the one that fits.
            When you have a question on a specific car, our AI agent CARLO is one tap away.
          </p>
        </div>
      </div>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by make, model, color, or city…"
                className="h-12 rounded-xl border-border bg-card pl-11 pr-4 text-sm shadow-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs text-muted-foreground">
                {filtered.length} of {inventory.length} units
              </p>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-12 w-full rounded-xl border-border bg-card text-sm sm:w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest year first</SelectItem>
                  <SelectItem value="price-low">Price: low to high</SelectItem>
                  <SelectItem value="price-high">Price: high to low</SelectItem>
                  <SelectItem value="mileage-low">Lowest mileage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters panel + Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider">
                    Filters
                  </h2>
                  <button
                    onClick={resetFilters}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-6 space-y-7">
                  <FilterChips
                    label="Body type"
                    options={bodyOptions as unknown as string[]}
                    value={body}
                    onChange={(v) => setBody(v as (typeof bodyOptions)[number])}
                  />
                  <FilterChips
                    label="Transmission"
                    options={transmissionOptions as unknown as string[]}
                    value={transmission}
                    onChange={(v) =>
                      setTransmission(v as (typeof transmissionOptions)[number])
                    }
                  />
                  <FilterChips
                    label="Fuel"
                    options={fuelOptions as unknown as string[]}
                    value={fuel}
                    onChange={(v) => setFuel(v as (typeof fuelOptions)[number])}
                  />
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Max price
                      </p>
                      <p className="font-mono text-sm font-semibold">
                        {formatPHP(maxPrice)}
                      </p>
                    </div>
                    <Slider
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={25_000}
                      value={[maxPrice]}
                      onValueChange={(v) => setMaxPrice(v[0])}
                    />
                    <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{formatPHP(MIN_PRICE)}</span>
                      <span>{formatPHP(MAX_PRICE)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-foreground p-6 text-background">
                <p className="text-xs font-semibold uppercase tracking-wider text-background/60">
                  Need a hand?
                </p>
                <p className="mt-2 text-base font-bold">
                  Let CARLO match a unit to you.
                </p>
                <p className="mt-2 text-sm text-background/70">
                  Tell him your budget, family size and use case &mdash; he&apos;ll shortlist what fits.
                </p>
                <Button
                  onClick={() => openCall(undefined)}
                  className="mt-4 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ask CARLO
                </Button>
              </div>
            </aside>

            {/* Grid */}
            <div>
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
                  <p className="text-base font-semibold">No units match your filters.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try widening the price range or resetting filters.
                  </p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="mt-6 rounded-full bg-transparent"
                  >
                    Reset filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((car) => (
                    <CarCard key={car.id} car={car} onCall={() => openCall(car)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <CarloFab onClick={() => openCall(undefined)} />

      <CarloCallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        car={activeCar}
      />
    </main>
  )
}

function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o === value
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-foreground/30",
              )}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CarCard({ car, onCall }: { car: Car; onCall: () => void }) {
  return (
    <article className="car-card group flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={car.image || "/placeholder.svg"}
          alt={`${car.year} ${car.make} ${car.model} in ${car.color}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div
          className={cn(
            "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm",
            conditionStyles[car.condition],
          )}
        >
          {car.condition}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-sm">
          {car.bodyType}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{car.year}</p>
            <h3 className="mt-0.5 truncate text-lg font-bold leading-tight tracking-tight">
              {car.make} {car.model}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{car.variant}</p>
          </div>
          <p className="text-right">
            <span className="block text-xl font-bold tracking-tight text-foreground">
              {formatPHP(car.price)}
            </span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip icon={<Gauge className="h-3 w-3" />}>{formatMileage(car.mileage)}</Chip>
          <Chip icon={<Cog className="h-3 w-3" />}>{car.transmission}</Chip>
          <Chip icon={<Fuel className="h-3 w-3" />}>{car.fuelType}</Chip>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{car.location}</span>
          <span aria-hidden>·</span>
          <span>{car.color}</span>
        </div>

        <Button
          onClick={onCall}
          variant="outline"
          className="mt-5 h-11 w-full rounded-xl border-border bg-background font-semibold hover:border-foreground/30 hover:bg-muted"
        >
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          Ask CARLO about this
        </Button>
      </div>
    </article>
  )
}

function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
      {icon}
      {children}
    </span>
  )
}
