const partners = [
  { name: "Network", color: "#4F46E5" },
  { name: "Product", color: "#DC2626" },
  { name: "Vertigo", color: "#0891B2" },
  { name: "Proline", color: "#F59E0B" },
  { name: "Minty", color: "#10B981" },
];

const Partners = () => {
  return (
    <section className="py-16 px-6 bg-background">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <div
                className="w-8 h-8 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${partner.color}, ${partner.color}dd)`,
                }}
              />
              <span className="text-xl font-semibold">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
