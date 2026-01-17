import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Heart,
  Sparkles,
  Building2,
  Hammer,
  Smile,
  Plane,
  Users,
  Scale,
  Car,
  ShoppingCart,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Client {
  name: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  clients: Client[];
  note?: string;
}

// Category color mapping for vibrant, modern look
const categoryColors: Record<string, { bg: string; border: string; iconBg: string }> = {
  healthcare: { bg: "bg-emerald-50", border: "border-l-emerald-400", iconBg: "bg-emerald-100 text-emerald-600" },
  legal: { bg: "bg-rose-50", border: "border-l-rose-400", iconBg: "bg-rose-100 text-rose-600" },
  medspa: { bg: "bg-pink-50", border: "border-l-pink-400", iconBg: "bg-pink-100 text-pink-600" },
  dental: { bg: "bg-violet-50", border: "border-l-violet-400", iconBg: "bg-violet-100 text-violet-600" },
  automotive: { bg: "bg-amber-50", border: "border-l-amber-400", iconBg: "bg-amber-100 text-amber-600" },
  realestate: { bg: "bg-sky-50", border: "border-l-sky-400", iconBg: "bg-sky-100 text-sky-600" },
  travel: { bg: "bg-cyan-50", border: "border-l-cyan-400", iconBg: "bg-cyan-100 text-cyan-600" },
  ecommerce: { bg: "bg-yellow-50", border: "border-l-yellow-400", iconBg: "bg-yellow-100 text-yellow-600" },
  contractors: { bg: "bg-orange-50", border: "border-l-orange-400", iconBg: "bg-orange-100 text-orange-600" },
  agency: { bg: "bg-teal-50", border: "border-l-teal-400", iconBg: "bg-teal-100 text-teal-600" },
};

const portfolioData: Category[] = [
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    icon: <Heart className="w-4 h-4" />,
    clients: [
      { name: "Immediate Medical Care MD", url: "https://www.immediatemedicalcaremd.com/" },
      { name: "Skylake Medical Associates", url: "https://skylakehealth.com/" },
      { name: "Dr Lucien Alexandre", url: "https://drlucienalexandre.com/" },
      { name: "Center for Pain Treatment", url: "https://thecenterforpaintreatment.com/" },
      { name: "Mountain West Spine", url: "https://mountainwestspine.com/" },
      { name: "NeuLife Rehab", url: "https://neuliferehabla.com/" },
      { name: "SOSRAFA", url: "https://sosrafa.com/" },
    ],
  },
  {
    id: "legal",
    name: "Legal",
    icon: <Scale className="w-4 h-4" />,
    clients: [{ name: "The Medical Attorney", url: "https://www.themedicalattorney.com/" }],
  },
  {
    id: "medspa",
    name: "Med Spa & Aesthetics",
    icon: <Sparkles className="w-4 h-4" />,
    clients: [
      { name: "In.Shape Medical Spa", url: "https://inshapespa.com/" },
      { name: "ReSpa", url: "https://respapalmbeach.com/" },
      { name: "Daisy Merey MD", url: "https://drmerey.com/" },
    ],
  },
  {
    id: "dental",
    name: "Dental",
    icon: <Smile className="w-4 h-4" />,
    clients: [{ name: "Florida Smile Design", url: "https://www.floridasmiledesign.com/" }],
  },
  {
    id: "automotive",
    name: "Automotive & Powersports",
    icon: <Car className="w-4 h-4" />,
    clients: [
      { name: "Brinson Athens", url: "https://www.brinsonpowersportsofathens.com/" },
      { name: "Destination Cycle", url: "https://www.destinationcycle.com/" },
      { name: "Link CDJR", url: "https://www.linkchryslerdodgejeepram.com/" },
    ],
  },
  {
    id: "realestate",
    name: "Real Estate",
    icon: <Building2 className="w-4 h-4" />,
    clients: [
      { name: "Equity USA", url: "https://equity-usa.com/" },
      { name: "Golden Gate Team", url: "https://goldengateteam.com/" },
      { name: "Sotheby's Realty Gold Coast", url: "https://www.sothebysrealty.com/goldcoastsir/eng" },
      { name: "FastExpert", url: "https://www.fastexpert.com/" },
      { name: "Prestige Real Estate Pro", url: "https://prestigerealestatepro.com/" },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icon: <Plane className="w-4 h-4" />,
    clients: [
      { name: "Discover Treasure Island FL", url: "https://discovertreasureislandflorida.com/" },
      { name: "Desert Safari Tours", url: "https://www.desertsafaritours.com/" },
    ],
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    icon: <ShoppingCart className="w-4 h-4" />,
    clients: [
      { name: "Magnets", url: "https://www.magnets.com/" },
      { name: "Customized Stickers", url: "https://www.customizedstickers.com/" },
      { name: "Cutting Edge Stencils", url: "https://www.cuttingedgestencils.com/" },
    ],
  },
  {
    id: "contractors",
    name: "Home Contractors",
    icon: <Hammer className="w-4 h-4" />,
    clients: [
      { name: "ARC Contracting", url: "https://www.arccontracting.com/" },
      { name: "Gasper Roofing", url: "https://www.gasperroofing.com/" },
      { name: "800 Basements", url: "https://800basements.com/" },
      { name: "Champion Window", url: "https://www.championwindow.com/" },
      { name: "CKC Custom Homes", url: "https://ckccustomhomes.com/" },
    ],
  },
  {
    id: "agency",
    name: "Agency & Partners",
    icon: <Users className="w-4 h-4" />,
    clients: [
      { name: "Vertoz", url: "https://vertoz.com/" },
      { name: "Webimax", url: "https://webimax.com/" },
      { name: "Wheeler Advertising", url: "https://wheeleradvertising.com/" },
    ],
    note: "Some engagements were delivered through agency partnerships.",
  },
];

const Portfolio = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return portfolioData
      .filter((category) => {
        if (selectedCategory && category.id !== selectedCategory) return false;
        return true;
      })
      .map((category) => ({
        ...category,
        clients: category.clients.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase())),
      }))
      .filter((category) => category.clients.length > 0);
  }, [searchQuery, selectedCategory]);

  const totalClients = portfolioData.reduce((sum, cat) => sum + cat.clients.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Our Work
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Client{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Portfolio</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            We've partnered with {totalClients}+ businesses across diverse industries to deliver exceptional digital
            marketing.
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="relative z-10 -mt-4 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-5">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-11 text-base rounded-xl border-border/50 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {portfolioData.map((category) => {
                const colors = categoryColors[category.id];
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : `${colors.bg} text-foreground/80 hover:opacity-80`
                    }`}
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Categories */}
      <section className="py-10 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No clients found matching your search.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredData.map((category) => {
                const colors = categoryColors[category.id];
                return (
                  <div key={category.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.iconBg}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">{category.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {category.clients.length} client{category.clients.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Client Cards Grid - Sleek compact cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {category.clients.map((client, clientIndex) => (
                        <a
                          key={clientIndex}
                          href={client.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group flex items-center justify-between gap-3 rounded-xl px-4 py-3 border-l-4 ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                        >
                          <span className="font-medium text-foreground/90 group-hover:text-foreground text-sm leading-snug">
                            {client.name}
                          </span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
                        </a>
                      ))}
                    </div>

                    {/* Category Note */}
                    {category.note && (
                      <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-primary/30 mt-2">
                        {category.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-accent/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Join Our Success Stories?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Let's discuss how we can help grow your business with our proven digital marketing strategies and AI-powered
            solutions.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            Get in Touch
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
