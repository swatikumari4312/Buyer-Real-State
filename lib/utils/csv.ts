import Papa from "papaparse"
import { buyerSchema } from "@/lib/validations/buyer"
import type { BuyerFormData } from "@/lib/validations/buyer"

export interface CSVImportResult {
  validRows: BuyerFormData[]
  errors: Array<{
    row: number
    errors: string[]
    data: Record<string, any>
  }>
  totalRows: number
}

export interface CSVError {
  row: number
  field: string
  message: string
  value: any
}

const CSV_HEADERS = [
  "fullName",
  "email",
  "phone",
  "city",
  "propertyType",
  "bhk",
  "purpose",
  "budgetMin",
  "budgetMax",
  "timeline",
  "source",
  "notes",
  "tags",
  "status",
]

export function validateCSVHeaders(headers: string[]): string[] {
  const errors: string[] = []
  const requiredHeaders = ["fullName", "phone", "city", "propertyType", "purpose", "timeline", "source"]

  // Check for required headers
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      errors.push(`Missing required header: ${required}`)
    }
  }

  // Check for unknown headers
  for (const header of headers) {
    if (!CSV_HEADERS.includes(header)) {
      errors.push(`Unknown header: ${header}`)
    }
  }

  return errors
}

export function parseCSVRow(row: Record<string, any>, rowIndex: number): { data?: BuyerFormData; errors: string[] } {
  const errors: string[] = []

  try {
    // Transform row data
    const transformedData: any = {
      fullName: row.fullName?.trim() || "",
      email: row.email?.trim() || "",
      phone: row.phone?.toString().trim() || "",
      city: row.city?.trim() || "",
      propertyType: row.propertyType?.trim() || "",
      bhk: row.bhk?.trim() || undefined,
      purpose: row.purpose?.trim() || "",
      budgetMin: row.budgetMin ? Number.parseInt(row.budgetMin.toString()) : undefined,
      budgetMax: row.budgetMax ? Number.parseInt(row.budgetMax.toString()) : undefined,
      timeline: row.timeline?.trim() || "",
      source: row.source?.trim() || "",
      status: row.status?.trim() || "New",
      notes: row.notes?.trim() || "",
      tags: row.tags
        ? row.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [],
    }

    // Remove empty bhk for non-residential properties
    if (!["Apartment", "Villa"].includes(transformedData.propertyType)) {
      transformedData.bhk = undefined
    }

    // Validate with Zod schema
    const validatedData = buyerSchema.parse(transformedData)
    return { data: validatedData, errors: [] }
  } catch (error: any) {
    if (error.errors) {
      error.errors.forEach((err: any) => {
        errors.push(`${err.path.join(".")}: ${err.message}`)
      })
    } else {
      errors.push(`Validation error: ${error.message}`)
    }
    return { errors }
  }
}

export function parseCSVFile(file: File): Promise<CSVImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: BuyerFormData[] = []
        const errors: Array<{ row: number; errors: string[]; data: Record<string, any> }> = []

        // Validate headers
        const headerErrors = validateCSVHeaders(results.meta.fields || [])
        if (headerErrors.length > 0) {
          resolve({
            validRows: [],
            errors: [{ row: 0, errors: headerErrors, data: {} }],
            totalRows: 0,
          })
          return
        }

        // Process each row
        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 1
          const { data, errors: rowErrors } = parseCSVRow(row, rowNumber)

          if (data && rowErrors.length === 0) {
            validRows.push(data)
          } else {
            errors.push({
              row: rowNumber,
              errors: rowErrors,
              data: row,
            })
          }
        })

        resolve({
          validRows,
          errors,
          totalRows: results.data.length,
        })
      },
      error: (error) => {
        resolve({
          validRows: [],
          errors: [{ row: 0, errors: [`CSV parsing error: ${error.message}`], data: {} }],
          totalRows: 0,
        })
      },
    })
  })
}

export function generateCSVTemplate(): string {
  const headers = CSV_HEADERS
  const sampleData = [
    {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "3",
      purpose: "Buy",
      budgetMin: "5000000",
      budgetMax: "7000000",
      timeline: "3-6m",
      source: "Website",
      notes: "Looking for a 3BHK apartment",
      tags: "urgent,family",
      status: "New",
    },
    {
      fullName: "Jane Smith",
      email: "",
      phone: "9876543211",
      city: "Mohali",
      propertyType: "Plot",
      bhk: "",
      purpose: "Buy",
      budgetMin: "2000000",
      budgetMax: "3000000",
      timeline: ">6m",
      source: "Referral",
      notes: "Investment purpose",
      tags: "investment",
      status: "New",
    },
  ]

  return Papa.unparse([
    headers,
    ...sampleData.map((row) => headers.map((header) => row[header as keyof typeof row] || "")),
  ])
}

export function exportBuyersToCSV(buyers: any[]): string {
  const csvData = buyers.map((buyer) => ({
    fullName: buyer.fullName,
    email: buyer.email || "",
    phone: buyer.phone,
    city: buyer.city,
    propertyType: buyer.propertyType,
    bhk: buyer.bhk || "",
    purpose: buyer.purpose,
    budgetMin: buyer.budgetMin || "",
    budgetMax: buyer.budgetMax || "",
    timeline: buyer.timeline,
    source: buyer.source,
    notes: buyer.notes || "",
    tags: Array.isArray(buyer.tags) ? buyer.tags.join(",") : "",
    status: buyer.status,
  }))

  return Papa.unparse(csvData)
}
