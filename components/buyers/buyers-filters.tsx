"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Plus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

export function BuyersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "All Cities");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "All Property Types"
  );
  const [status, setStatus] = useState(
    searchParams.get("status") || "All Statuses"
  );
  const [timeline, setTimeline] = useState(
    searchParams.get("timeline") || "All Timelines"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "updatedAt"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc"
  );

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (city !== "All Cities") params.set("city", city);
    if (propertyType !== "All Property Types")
      params.set("propertyType", propertyType);
    if (status !== "All Statuses") params.set("status", status);
    if (timeline !== "All Timelines") params.set("timeline", timeline);
    if (sortBy !== "updatedAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

    params.delete("page");

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : "/buyers";

    router.push(newUrl);
  }, [
    debouncedSearch,
    city,
    propertyType,
    status,
    timeline,
    sortBy,
    sortOrder,
    router,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCity("All Cities");
    setPropertyType("All Property Types");
    setStatus("All Statuses");
    setTimeline("All Timelines");
    setSortBy("updatedAt");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    search ||
    city !== "All Cities" ||
    propertyType !== "All Property Types" ||
    status !== "All Statuses" ||
    timeline !== "All Timelines" ||
    sortBy !== "updatedAt" ||
    sortOrder !== "desc";

  return (
    <Card className="shadow-sm border">
      <CardContent className="p-6 space-y-6">
        {/* Search + Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link href="/buyers/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/buyers/import-export">Import/Export</Link>
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Cities">All Cities</SelectItem>
              <SelectItem value="Chandigarh">Chandigarh</SelectItem>
              <SelectItem value="Mohali">Mohali</SelectItem>
              <SelectItem value="Zirakpur">Zirakpur</SelectItem>
              <SelectItem value="Panchkula">Panchkula</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="All Property Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Property Types">
                All Property Types
              </SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Plot">Plot</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Visited">Visited</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="All Timelines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Timelines">All Timelines</SelectItem>
              <SelectItem value="0-3m">0-3 months</SelectItem>
              <SelectItem value="3-6m">3-6 months</SelectItem>
              <SelectItem value=">6m">More than 6 months</SelectItem>
              <SelectItem value="Exploring">Just exploring</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split("-");
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
              <SelectItem value="updatedAt-asc">Oldest Updated</SelectItem>
              <SelectItem value="createdAt-desc">Recently Created</SelectItem>
              <SelectItem value="createdAt-asc">Oldest Created</SelectItem>
              <SelectItem value="fullName-asc">Name A-Z</SelectItem>
              <SelectItem value="fullName-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
