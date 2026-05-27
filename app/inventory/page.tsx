"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Gauge,
  Cog,
  Fuel,
  MapPin,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react"
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
  const [moreOpen, setMoreOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = inventory.filter((c) => {
      if (transmission !== "All" && c.transmission !== transmission) return false
      if (fuel !== "All" && c.fuelType !== fuel) return false
      if (body !== "All" && c.bodyType !== body) return false
      if (c.price > maxPrice) return false
      if (q) {
        const hay =
          `${c.year} ${c.make} ${c.model} ${c.variant} ${c.color} ${c.location}`.toLowerCase()
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

  const activeFilterCount =
    (transmission !== "All" ? 1 : 0) +
    (fuel !== "All" ? 1 : 0) +
    (maxPrice !== MAX_PRICE ? 1 : 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="surface-dark relative">
        <div className="bg-dotted absolute inset-0 opacity-20" aria-hidden="true" />
        <SiteHeader variant="dark" />
        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 md:pb-14 md:pt-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Live inventory
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            Browse the lot.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/70 md:text-lg">
            {inventory.length} carefully inspected units across our four Metro Manila branches.
            Filter, sort, and find the one that fits.
          </p>
        </div>
      </div>

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make, model, color, city..."
              className="h-11 rounded-full border-border bg-card pl-11 pr-4 text-sm shadow-sm"
            />
          </div>

          {/* Body type pills — primary filter */}
          <div className="-mx-1 flex flex-1 items-center gap-1.5 overflow-x-auto px-1 lg:overflow-visible">
            {bodyOptions.map((o) => {
              const active = o === body
              return (
                <button
                  key={o}
                  onClick={() => setBody(o)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {o}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "h-11 rounded-full border-border bg-card text-sm",
                activeFilterCount > 0 && "border-foreground/40",
              )}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              More
              {activeFilterCount > 0 && (
                <span className="ml-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-11 w-[180px] rounded-full border-border bg-card text-sm">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest year</SelectItem>
                <SelectItem value="price-low">Price: low to high</SelectItem>
                <SelectItem value="price-high">Price: high to low</SelectItem>
                <SelectItem value="mileage-low">Lowest mileage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible advanced filters */}
        {moreOpen && (
          <div className="border-t border-border bg-card">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-5 md:flex-row md:items-end md:justify-between">
              <div className="grid w-full gap-5 md:grid-cols-3">
                <ChipRow
                  label="Transmission"
                  options={transmissionOptions as unknown as string[]}
                  value={transmission}
                  onChange={(v) =>
                    setTransmission(v as (typeof transmissionOptions)[number])
                  }
                />
                <ChipRow
                  label="Fuel"
                  options={fuelOptions as unknown as string[]}
                  value={fuel}
                  onChange={(v) => setFuel(v as (typeof fuelOptions)[number])}
                />
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Max price
                    </p>
                    <p className="font-mono text-xs font-semibold">
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
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Reset all
                </button>
                <Button
                  onClick={() => setMoreOpen(false)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close filters</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex items-baseline justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">{filtered.length}</span> of{" "}
              {inventory.length} units
            </p>
            {(query ||
              body !== "All" ||
              transmission !== "All" ||
              fuel !== "All" ||
              maxPrice !== MAX_PRICE) && (
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((car) => (
                <CarCard key={car.id} car={car} onCall={() => openCall(car)} />
              ))}
            </div>
          )}
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

function ChipRow({
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
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o === value
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-foreground bg-foreground text-background"
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
            <h3 className="mt-0.5 truncate text-base font-bold leading-tight tracking-tight">
              {car.make} {car.model}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {car.variant}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xl font-bold tracking-tight text-foreground">
          {formatPHP(car.price)}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip icon={<Gauge className="h-3 w-3" />}>{formatMileage(car.mileage)}</Chip>
          <Chip icon={<Cog className="h-3 w-3" />}>{car.transmission}</Chip>
          <Chip icon={<Fuel className="h-3 w-3" />}>{car.fuelType}</Chip>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{car.location}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{car.color}</span>
        </div>

        <Button
          onClick={onCall}
          variant="outline"
          className="mt-5 h-10 w-full rounded-xl border-border bg-background text-sm font-semibold hover:border-foreground/30 hover:bg-muted"
        >
          <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
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
