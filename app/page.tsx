import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UserPlus,
  Upload,
  Filter,
  Lock,
  Activity,
  HomeIcon,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Buyer Lead CRM</span>
          </div>
          <div className="space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left side text */}
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-gray-900 mb-6">
              Grow Your <span className="text-indigo-600">Real Estate</span> Business
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Manage leads, track progress, and close deals faster with our
              modern CRM built for real estate professionals.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">View Demo</Link>
              </Button>
            </div>
          </div>

          {/* Right side illustration */}
          <div className="hidden md:block">
            <img
              src="https://tse3.mm.bing.net/th/id/OIP.bwYhE8tFNKMWucZ8BBYN6QHaEJ?pid=Api&P=0&h=180"
              alt="CRM Illustration"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/40">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-gray-900">
            Powerful Features for Realtors
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: "Lead Management",
                desc: "Capture, organize, and track buyer leads easily.",
                icon: <UserPlus className="h-10 w-10 text-indigo-600" />,
              },
              {
                title: "CSV Import/Export",
                desc: "Import existing data or export for reports.",
                icon: <Upload className="h-10 w-10 text-indigo-600" />,
              },
              {
                title: "Advanced Filtering",
                desc: "Filter leads by city, budget, and property type.",
                icon: <Filter className="h-10 w-10 text-indigo-600" />,
              },
              {
                title: "Secure & Private",
                desc: "Enterprise-level security for peace of mind.",
                icon: <Lock className="h-10 w-10 text-indigo-600" />,
              },
              {
                title: "Real-time Updates",
                desc: "Stay informed with instant lead status changes.",
                icon: <Activity className="h-10 w-10 text-indigo-600" />,
              },
              {
                title: "Property Focused",
                desc: "Designed specifically for real estate pros.",
                icon: <HomeIcon className="h-10 w-10 text-indigo-600" />,
              },
            ].map((f, idx) => (
              <Card
                key={idx}
                className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-xl"
              >
                <CardHeader>
                  <div className="mb-4 p-3 rounded-lg bg-indigo-50 w-fit">
                    {f.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{f.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {f.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Convert More Leads?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            Start using Buyer Lead CRM today and close deals faster with smart tools designed for realtors.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-white">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Buyer Lead CRM. Built for real estate professionals.</p>
        </div>
      </footer>
    </div>
  )
}
