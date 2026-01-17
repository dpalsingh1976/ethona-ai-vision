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

const portfolioData: Category[] = [
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    icon: <Heart className="w-5 h-5" />,
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
    icon: <Scale className="w-5 h-5" />,
    clients: [{ name: "The Medical Attorney", url: "https://www.themedicalattorney.com/" }],
  },
  {
    id: "medspa",
    name: "Med Spa & Aesthetics",
    icon: <Sparkles className="w-5 h-5" />,
    clients: [
      { name: "In.Shape Medical Spa", url: "https://inshapespa.com/" },
      { name: "ReSpa", url: "https://respapalmbeach.com/" },
      { name: "Daisy Merey MD", url: "https://drmerey.com/" },
    ],
  },
  {
    id: "dental",
    name: "Dental",
    icon: <Smile className="w-5 h-5" />,
    clients: [{ name: "Florida Smile Design", url: "https://www.floridasmiledesign.com/" }],
  },
  {
    id: "automotive",
    name: "Automotive & Powersports",
    icon: <Car className="w-5 h-5" />,
    clients: [
      { name: "Brinson Athens", url: "https://www.brinsonpowersportsofathens.com/" },
      { name: "Destination Cycle", url: "https://www.destinationcycle.com/" },
      { name: "Link CDJR", url: "https://www.linkchryslerdodgejeepram.com/" },
    ],
  },
  {
    id: "realestate",
    name: "Real Estate",
    icon: <Building2 className="w-5 h-5" />,
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
    icon: <Plane className="w-5 h-5" />,
    clients: [
      { name: "Discover Treasure Island FL", url: "https://discovertreasureislandflorida.com/" },
      { name: "Desert Safari Tours", url: "https://www.desertsafaritours.com/" },
    ],
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    icon: <ShoppingCart className="w-5 h-5" />,
    clients: [
      { name: "Magnets", url: "https://www.magnets.com/" },
      { name: "Customized Stickers", url: "https://www.customizedstickers.com/" },
      { name: "Cutting Edge Stencils", url: "https://www.cuttingedgestencils.com/" },
    ],
  },
  {
    id: "contractors",
    name: "Home Contractors",
    icon: <Hammer className="w-3 h-3" />,
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
    icon: <Users className="w-5 h-5" />,
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDE9DD] to-[#FFF8EE]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,200,150,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,180,120,0.2),transparent_50%)]" />

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
            marketing and AI-powered solutions.
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="relative z-10 -mt-4 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6">
            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 text-base rounded-xl border-border/50 focus:border-primary"
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {portfolioData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Categories */}
      <section className="py-12 bg-gradient-to-b from-[#FFF8EE] to-background">
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
            <div className="space-y-16">
              {filteredData.map((category) => (
                <div key={category.id} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {category.clients.length} client{category.clients.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Client Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {category.clients.map((client, clientIndex) => (
                      <a
                        key={clientIndex}
                        href={client.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-card rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/40 hover:-translate-y-1 flex flex-col justify-between min-h-[140px]"
                      >
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg leading-tight mb-2">
                            {client.name}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            {category.icon}
                            <span className="truncate max-w-[120px]">{category.name}</span>
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Category Note */}
                  {category.note && (
                    <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-primary/30">
                      {category.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-[#FDE9DD]">
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
