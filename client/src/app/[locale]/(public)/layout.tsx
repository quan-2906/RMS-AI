import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavItems from "@/app/[locale]/(public)/nav-items";
import { Link } from "@/i18n/navigation";
import DarkModeToggle from "@/components/ui/dark-mode-toggle";
import SwitchLanguage from "@/components/ui/switch-language";
import { getTranslations } from "next-intl/server";

export default async function Layout(
  props: Readonly<{
    children: React.ReactNode;
    modal: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>,
) {
  const params = await props.params;
  const { locale } = params;
  const { children, modal } = props;
  const t = await getTranslations({ locale, namespace: "Footer" });
  const tHome = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <div className="flex min-h-screen w-full flex-col relative font-body bg-background text-foreground antialiased">
      <header className="glass-nav sticky z-50 top-0 flex h-16 items-center gap-4 border-b border-border px-6 md:px-8">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-8 md:text-sm lg:gap-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-secondary uppercase font-serif"
          >
            Five Seasons Restaurant
          </Link>
          <NavItems className="text-muted-foreground font-label-caps uppercase text-xs transition-colors hover:text-secondary" />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden border-border text-foreground bg-transparent hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="glass-card border-r-border text-foreground"
          >
            <SheetHeader className="sr-only">
              <SheetTitle />
              <SheetDescription />
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium mt-10">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-secondary font-serif uppercase"
              >
                Five Seasons Restaurant
              </Link>

              <NavItems className="text-muted-foreground hover:text-secondary transition-colors" />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center gap-4">
          <SwitchLanguage />
          <DarkModeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
        {modal}
      </main>
      <footer className="bg-surface-container-high/30 pt-16 pb-12 px-6 md:px-12 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-secondary font-serif text-2xl uppercase mb-4">
              Five Seasons Restaurant
            </h4>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">
              {tHome("description")}
            </p>
            <div className="flex gap-4">
              <a
                className="text-neutral-400 hover:text-secondary transition-colors"
                href="#"
              >
                <span className="sr-only">Social</span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-secondary transition-colors">
                  f
                </div>
              </a>
              <a
                className="text-neutral-400 hover:text-secondary transition-colors"
                href="#"
              >
                <span className="sr-only">Instagram</span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-secondary transition-colors">
                  ig
                </div>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-xs text-foreground uppercase mb-6 tracking-widest">
              {t("contact")}
            </h5>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-secondary">📍</span>
                <span>{t("address")}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-secondary">📞</span>
                <span>+84 826 477 024</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-secondary">✉️</span>
                <span>nguyenquanksqt123@gmail.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-xs text-foreground uppercase mb-6 tracking-widest">
              {t("discover")}
            </h5>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  {t("privateRoom")}
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  {t("aiPhilosophy")}
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  {t("booking")}
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  {t("giftCard")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2024 RMS-AI Vietnamese Restaurant. All rights reserved.
          </p>
          <div className="flex gap-8 text-muted-foreground text-xs">
            <a className="hover:text-foreground transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-foreground transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
