export type Car = {
  id: string
  make: string
  model: string
  year: number
  color: string
  mileage: number
  transmission: "Automatic" | "Manual"
  fuelType: "Gasoline" | "Diesel"
  condition: "Excellent" | "Good" | "Fair"
  price: number
  location: string
  image: string
  bodyType: "Sedan" | "SUV" | "Hatchback" | "Pickup"
}

export const inventory: Car[] = [
  {
    id: "phm-001",
    make: "Honda",
    model: "City",
    year: 2020,
    color: "Silver",
    mileage: 38000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Excellent",
    price: 695000,
    location: "Pasig City",
    image: "/cars/honda-city-silver.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-002",
    make: "Toyota",
    model: "Vios",
    year: 2019,
    color: "Pearl White",
    mileage: 52000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Good",
    price: 545000,
    location: "Quezon City",
    image: "/cars/toyota-vios-white.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-003",
    make: "Mitsubishi",
    model: "Montero Sport",
    year: 2018,
    color: "Black",
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
    id: "phm-004",
    make: "Toyota",
    model: "Fortuner",
    year: 2021,
    color: "Gunmetal Gray",
    mileage: 41000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Excellent",
    price: 1185000,
    location: "Mandaluyong",
    image: "/cars/toyota-fortuner-gray.jpg",
    bodyType: "SUV",
  },
  {
    id: "phm-005",
    make: "Nissan",
    model: "Almera",
    year: 2019,
    color: "Deep Blue",
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
    id: "phm-006",
    make: "Ford",
    model: "Ranger XLT",
    year: 2020,
    color: "Race Red",
    mileage: 55000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Excellent",
    price: 1095000,
    location: "Taguig",
    image: "/cars/ford-ranger-red.jpg",
    bodyType: "Pickup",
  },
  {
    id: "phm-007",
    make: "Hyundai",
    model: "Accent",
    year: 2018,
    color: "Silver",
    mileage: 72000,
    transmission: "Manual",
    fuelType: "Gasoline",
    condition: "Fair",
    price: 365000,
    location: "Marikina",
    image: "/cars/hyundai-accent-silver.jpg",
    bodyType: "Sedan",
  },
  {
    id: "phm-008",
    make: "Mazda",
    model: "3 Hatchback",
    year: 2020,
    color: "Soul Red",
    mileage: 44000,
    transmission: "Automatic",
    fuelType: "Gasoline",
    condition: "Excellent",
    price: 845000,
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
