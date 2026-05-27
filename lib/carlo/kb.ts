import fs from "node:fs"
import path from "node:path"

let cachedKB: KnowledgeBase | null = null

export type KBCar = {
  id: string
  stock_number: string
  year: number
  make: string
  model: string
  variant: string
  body_type: string
  color: string
  interior_color?: string
  transmission: string
  fuel: string
  engine_displacement_l?: number
  engine_code?: string
  horsepower?: number
  torque_nm?: number
  drivetrain?: string
  seats?: number
  doors?: number
  mileage_km: number
  previous_owners?: number
  service_history?: string
  registration_status?: string
  or_cr_status?: string
  location_branch: string
  price_php: number
  cash_price_php?: number
  negotiable?: boolean
  minimum_acceptable_php?: number
  condition_grade?: string
  key_features?: string[]
  known_issues?: string[]
  tires?: string
  fuel_economy_kmpl_city?: number
  fuel_economy_kmpl_highway?: number
  photos?: string[]
  talking_points?: string[]
}

export type KnowledgeBase = {
  dealership: Record<string, unknown>
  inventory: KBCar[]
  policies?: Record<string, unknown>
  financing?: Record<string, unknown>
  faq?: Record<string, unknown>
  [key: string]: unknown
}

export function loadKnowledgeBase(): KnowledgeBase {
  if (cachedKB) return cachedKB
  const filePath = path.join(process.cwd(), "public", "carlo-knowledge-base.json")
  const raw = fs.readFileSync(filePath, "utf-8")
  cachedKB = JSON.parse(raw) as KnowledgeBase
  return cachedKB
}

export function findCar(id: string): KBCar | undefined {
  const kb = loadKnowledgeBase()
  return kb.inventory.find((c) => c.id === id)
}

/** Compact one-car summary for system prompt injection. */
export function carBlurb(car: KBCar): string {
  const lines = [
    `${car.year} ${car.make} ${car.model} ${car.variant} (${car.id}) — ${car.color}`,
    `Body: ${car.body_type} · Transmission: ${car.transmission} · Fuel: ${car.fuel}`,
    `Mileage: ${car.mileage_km.toLocaleString()} km · Condition: ${car.condition_grade ?? "n/a"}`,
    `Asking: PHP ${car.price_php.toLocaleString()}${car.cash_price_php ? ` · Cash: PHP ${car.cash_price_php.toLocaleString()}` : ""}`,
    car.minimum_acceptable_php
      ? `Floor (DO NOT SHARE): PHP ${car.minimum_acceptable_php.toLocaleString()}`
      : "",
    `Branch: ${car.location_branch}`,
    car.key_features?.length ? `Features: ${car.key_features.join("; ")}` : "",
    car.known_issues?.length ? `Known issues: ${car.known_issues.join("; ")}` : "Known issues: none",
    car.talking_points?.length ? `Talking points: ${car.talking_points.join("; ")}` : "",
  ]
  return lines.filter(Boolean).join("\n")
}

/** One-line summary used for the lot overview in the system prompt. */
export function carOneLine(car: KBCar): string {
  return `- ${car.id} | ${car.year} ${car.make} ${car.model} ${car.variant} | ${car.body_type} | ${car.transmission} ${car.fuel} | ${car.mileage_km.toLocaleString()} km | PHP ${car.price_php.toLocaleString()} | ${car.location_branch}`
}
