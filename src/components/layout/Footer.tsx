import { ArrowUpRight, Heart } from "lucide-react";

const links = {
  resources: ["Study Notes", "Previous Papers", "Presentations", "Interview Prep"],
  branches: ["Computer Science", "AI & ML", "Electronics", "Mechanical"],
  company: ["About", "Contact", "Privacy", "Terms"],
};

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold">
                btech<span className="text-primary">verse</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground">
              Free study materials for every engineering student.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="font-semibold mb-4 capitalize">{title}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
                    >
                      {item}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 BTechVerse. No rights reserved (we're students lol).
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> and lots of chai
          </p>
        </div>
      </div>
    </footer>
  );
}
