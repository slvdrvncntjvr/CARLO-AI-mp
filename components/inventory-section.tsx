"use client"

import { useMemo, useState } from "react"
import { Phone, Gauge, Cog, MapPin, Fuel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { type Car, formatMileage, formatPHP, inventory } from "@/lib/inventory"
import { cn } from "@/lib/utils"

const transmissionOptions = ["All", "Automatic", "Manual"] as const
const fuelOptions = ["All", "Gasoline", "Diesel"] as const

const MIN_PRICE = 300_000
const MAX_PRICE = 1_300_000

const conditionStyles: Record<Car["condition"], string> = {
  Excellent: "bg-primary/15 text-primary border-primary/30",
  Good: "bg-amber/15 text-amber border-amber/30",
  Fair: "bg-orange-muted/15 text-orange-muted border-orange-muted/30",
}

export function InventorySection({ onCallCar }: { onCallCar: (car: Car) => void }) {
  const [transmission, setTransmission] =
    useState<(typeof transmissionOptions)[number]>("All")
  const [fuel, setFuel] = useState<(typeof fuelOptions)[number]>("All")
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE)

  const filtered = useMemo(() => {
    return inventory.filter((c) => {
      if (transmission !== "All" && c.transmission !== transmission) return false
      if (fuel !== "All" && c.fuelType !== fuel) return false
      if (c.price > maxPrice) return false
      return true
    })
  }, [transmission, fuel, maxPrice])

  return (
    <section id="inventory" className="bg-background py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Live inventory
            </p>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Available Units.
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              Talk to CARLO about any car in our lineup — he knows every detail, from mileage to
              service history.
            </p>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {filtered.length} of {inventory.length} units
          </p>
        </div>

        {/* Filters */}
        <div className="mt-10 grid gap-5 rounded-2xl border border-border bg-card p-5 md:grid-cols-3 md:gap-8 md:p-6">
          <FilterChips
            label="Transmission"
            options={transmissionOptions as unknown as string[]}
            value={transmission}
            onChange={(v) => setTransmission(v as (typeof transmissionOptions)[number])}
          />
          <FilterChips
            label="Fuel type"
            options={fuelOptions as unknown as string[]}
            value={fuel}
            onChange={(v) => setFuel(v as (typeof fuelOptions)[number])}
          />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max price
              </p>
              <p className="font-mono text-sm font-semibold">{formatPHP(maxPrice)}</p>
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

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} onCall={() => onCallCar(car)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-14 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-base font-semibold">No units match your filters.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try widening the price range or changing transmission.
            </p>
          </div>
        )}
      </div>
    </section>
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
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
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
          <div>
            <p className="font-mono text-xs text-muted-foreground">{car.year}</p>
            <h3 className="mt-0.5 text-lg font-bold leading-tight tracking-tight">
              {car.make} {car.model}
            </h3>
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
          className="mt-5 h-11 w-full rounded-xl bg-foreground font-semibold text-background hover:bg-foreground/90"
        >
          <Phone className="mr-2 h-4 w-4 fill-current" />
          Call CARLO About This Car
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
