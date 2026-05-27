export type Car = {
  id: string
  make: string
  model: string
  variant: string
  year: number
  color: string
  mileage: number
  transmission: "Automatic" | "Manual"
  fuelType: "Gasoline" | "Diesel"
  condition: "Excellent" | "Good" | "Fair"
  price: number
  location: string
  image: string
  bodyType: "Sedan" | "SUV" | "Hatchback" | "Pickup" | "MPV"
}

// Specs and pricing modeled on real Philippine used-car market data
// (typical Metro Manila listings for these exact variants).
export const inventory: Car[] = [
  {
    id: "phm-001",
    make: "Toyota",
    model: "Vios",
    variant: "1.3 XE CVT",
    year: 2020,
    color: "Pearl White",
    mileage: 42000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Excellent",
    price: 595000,
    location: "Quezon City",
    image: "/cars/toyota-vios-white.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-002",
    make: "Honda",
    model: "City",
    variant: "1.5 V CVT",
    year: 2020,
    color: "Lunar Silver",
    mileage: 38000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Excellent",
    price: 715000,
    location: "Pasig City",
    image: "/cars/honda-city-silver.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-003",
    make: "Honda",
    model: "Civic",
    variant: "1.5 RS Turbo CVT",
    year: 2021,
    color: "Crystal Black Pearl",
    mileage: 31000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Excellent",
    price: 1245000,
    location: "Makati City",
    image: "/cars/honda-civic-black.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-004",
    make: "Toyota",
    model: "Innova",
    variant: "2.8 E Diesel AT",
    year: 2019,
    color: "Freedom White",
    mileage: 64000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Good",
    price: 935000,
    location: "Mandaluyong",
    image: "/cars/toyota-innova-white.jpg",
    bodyType: "MPV",
  },
  {
    id: "phm-005",
    make: "Toyota",
    model: "Fortuner",
    variant: "2.4 G 4x2 Diesel AT",
    year: 2021,
    color: "Gunmetal Gray",
    mileage: 41000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Excellent",
    price: 1585000,
    location: "Alabang",
    image: "/cars/toyota-fortuner-gray.jpg",
    bodyType: "SUV",
  },
  {
    id: "phm-006",
    make: "Mitsubishi",
    model: "Montero Sport",
    variant: "GLS 2.4 Diesel AT",
    year: 2018,
    color: "Jet Black Mica",
    mileage: 78000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Good",
    price: 985000,
    location: "Makati City",
    image: "/cars/mitsubishi-montero-black.jpg",
    bodyType: "SUV",
  },
  {
    id: "phm-007",
    make: "Ford",
    model: "Ranger",
    variant: "2.0 Wildtrak 4x2 AT",
    year: 2020,
    color: "Race Red",
    mileage: 55000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Excellent",
    price: 1195000,
    location: "Taguig",
    image: "/cars/ford-ranger-red.jpg",
    bodyType: "Pickup",
  },
  {
    id: "phm-008",
    make: "Nissan",
    model: "Almera",
    variant: "1.5 E MT",
    year: 2019,
    color: "Deep Blue Pearl",
    mileage: 60000,
    transmission: "Manual",
    fuelType: "Gasoline",
    condition: "Good",
    price: 425000,
    location: "Caloocan",
    image: "/cars/nissan-almera-blue.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-009",
    make: "Hyundai",
    model: "Accent",
    variant: "1.6 GL CRDi MT",
    year: 2018,
    color: "Sleek Silver",
    mileage: 72000,
    transmission: "Manual",
    fuelType: "Diesel",
    condition: "Fair",
    price: 425000,
    location: "Marikina",
    image: "/cars/hyundai-accent-silver.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-010",
    make: "Mazda",
    model: "3 Hatchback",
    variant: "2.0 Premium SkyActiv-G AT",
    year: 2020,
    color: "Soul Red Crystal",
    mileage: 44000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Excellent",
    price: 1085000,
    location: "San Juan",
    image: "/cars/mazda3-red.jpg",
    bodyType: "Hatchback",
  },
]

export function formatPHP(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatMileage(km: number) {
  return new Intl.NumberFormat("en-PH").format(km) + " km"
}
