import { z } from "zod"

// Budget validator function
export function validateBudgetRange(budgetMin?: number, budgetMax?: number): boolean {
  if (!budgetMin && !budgetMax) return true
  if (budgetMin && budgetMax && budgetMax < budgetMin) return false
  return true
}

// CSV row validator for testing
export function validateCSVRow(row: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!row.fullName?.trim()) errors.push("Full name is required")
  if (!row.phone?.toString().trim()) errors.push("Phone is required")
  if (!row.city?.trim()) errors.push("City is required")
  if (!row.propertyType?.trim()) errors.push("Property type is required")
  if (!row.purpose?.trim()) errors.push("Purpose is required")
  if (!row.timeline?.trim()) errors.push("Timeline is required")
  if (!row.source?.trim()) errors.push("Source is required")

  // Phone validation
  const phone = row.phone?.toString().trim()
  if (phone && !/^\d{10,15}$/.test(phone)) {
    errors.push("Phone must be 10-15 digits")
  }

  // Email validation (if provided)
  if (row.email?.trim()) {
    const emailSchema = z.string().email()
    try {
      emailSchema.parse(row.email.trim())
    } catch {
      errors.push("Invalid email format")
    }
  }

  // BHK validation for residential properties
  if (["Apartment", "Villa"].includes(row.propertyType?.trim()) && !row.bhk?.trim()) {
    errors.push("BHK is required for Apartment and Villa")
  }

  // Budget validation
  const budgetMin = row.budgetMin ? Number.parseInt(row.budgetMin.toString()) : undefined
  const budgetMax = row.budgetMax ? Number.parseInt(row.budgetMax.toString()) : undefined

  if (!validateBudgetRange(budgetMin, budgetMax)) {
    errors.push("Maximum budget must be greater than minimum budget")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Test function for budget validation
export function testBudgetValidation() {
  const testCases = [
    { min: undefined, max: undefined, expected: true },
    { min: 1000000, max: 2000000, expected: true },
    { min: 2000000, max: 1000000, expected: false },
    { min: 1000000, max: undefined, expected: true },
    { min: undefined, max: 2000000, expected: true },
  ]

  console.log("Running budget validation tests...")

  testCases.forEach((testCase, index) => {
    const result = validateBudgetRange(testCase.min, testCase.max)
    const passed = result === testCase.expected
    console.log(
      `Test ${index + 1}: ${passed ? "PASS" : "FAIL"} - Min: ${testCase.min}, Max: ${testCase.max}, Expected: ${testCase.expected}, Got: ${result}`,
    )
  })
}
