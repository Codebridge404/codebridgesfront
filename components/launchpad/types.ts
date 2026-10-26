export interface CatalogModule {
  id: string;
  name: string;
  monogram: string;
  category: string;
  description: string;
  bgPill: string;
  cardBg?: string;
  icon: any;
  logoUrl?: string;
  href: string;
  isCore?: boolean;
}
