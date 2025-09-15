"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { parseCSVFile, generateCSVTemplate, type CSVImportResult } from "@/lib/utils/csv"

export function CSVImport() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      alert("Please select a CSV file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const result = await parseCSVFile(file)
      setImportResult(result)
      setUploadProgress(100)

      setTimeout(() => {
        clearInterval(progressInterval)
        setIsUploading(false)
      }, 500)
    } catch (error) {
      console.error("File parsing error:", error)
      setIsUploading(false)
      alert("Error parsing CSV file")
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImport = async () => {
    if (!importResult || importResult.validRows.length === 0) return

    setIsImporting(true)

    try {
      const response = await fetch("/api/buyers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyers: importResult.validRows }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully imported ${data.imported} leads`)
        router.push("/buyers")
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(`Import failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Import error:", error)
      alert("Import failed. Please try again.")
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "buyer-leads-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Leads from CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file to import multiple buyer leads at once. Maximum 200 rows per import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <FileText className="mr-2 h-4 w-4" />
              Select CSV File
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select CSV file"
          />

          {isUploading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Processing CSV file...</p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <Alert>
            <AlertDescription>
              <strong>CSV Format Requirements:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Required columns: fullName, phone, city, propertyType, purpose, timeline, source</li>
                <li>BHK is required only for Apartment and Villa property types</li>
                <li>Budget values should be in INR (e.g., 5000000 for 50 lakhs)</li>
                <li>Tags should be comma-separated (e.g., "urgent,family")</li>
                <li>Maximum 200 rows per import</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Import Preview
            </CardTitle>
            <CardDescription>
              {importResult.validRows.length} valid rows, {importResult.errors.length} errors found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{importResult.validRows.length}</p>
                <p className="text-sm text-muted-foreground">Valid Rows</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{importResult.totalRows}</p>
                <p className="text-sm text-muted-foreground">Total Rows</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Errors Found:</h4>
                <div className="max-h-64 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Errors</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResult.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row === 0 ? "Header" : error.row}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {error.errors.map((err, errIndex) => (
                                <Badge key={errIndex} variant="destructive" className="text-xs">
                                  {err}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {JSON.stringify(error.data)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {importResult.validRows.length > 0 && (
              <div className="flex gap-4">
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${importResult.validRows.length} Leads`
                  )}
                </Button>
                <Button variant="outline" onClick={() => setImportResult(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
