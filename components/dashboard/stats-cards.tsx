"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Phone, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalLeads: number
    newLeads: number
    contactedLeads: number
    conversionRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const [displayStats, setDisplayStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    const duration = 800
    const steps = 30
    const interval = duration / steps
    let currentStep = 0

    const animate = setInterval(() => {
      currentStep++
      setDisplayStats({
        totalLeads: Math.round((stats.totalLeads / steps) * currentStep),
        newLeads: Math.round((stats.newLeads / steps) * currentStep),
        contactedLeads: Math.round((stats.contactedLeads / steps) * currentStep),
        conversionRate: Math.round((stats.conversionRate / steps) * currentStep),
      })
      if (currentStep >= steps) clearInterval(animate)
    }, interval)

    return () => clearInterval(animate)
  }, [stats])

  const cards = [
    {
      title: "Total Leads",
      value: displayStats.totalLeads,
      description: "All time leads",
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-100",
    },
    {
      title: "New Leads",
      value: displayStats.newLeads,
      description: "This month",
      icon: <UserCheck className="h-5 w-5 text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: "Contacted",
      value: displayStats.contactedLeads,
      description: "Active leads",
      icon: <Phone className="h-5 w-5 text-yellow-600" />,
      bg: "bg-yellow-100",
    },
    {
      title: "Conversion Rate",
      value: `${displayStats.conversionRate}%`,
      description: "Last 30 days",
      icon: <TrendingUp className="h-5 w-5 text-pink-600" />,
      bg: "bg-pink-100",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bg}`}>{card.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {card.value}
              </div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
