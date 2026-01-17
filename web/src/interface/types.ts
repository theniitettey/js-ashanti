export type HeroCardProps = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    slug: string;
    discount: number;
  };


export type ShopCardProps = {
    imageUrl: string;
    title: string;
  };


export interface ProductCardProps {
    id: string;
    mainImage?: string;
    images?: string[];
    name: string;
    description: string;
    rating?: number | null;
    reviewCount?: number;
    price: number;
    oldPrice?: number;
    badge?: string; 
    badgeColor?: string; 
    link?: string;
    classNames?: string;
    slug: string;
    colors?: string[];
    discount?: number;
  }

export interface ProductCardCategoriesProps {
    categories?: string[];
    imageUrl?: string;
    classNames?: string;
  }

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }
  
export interface CartState {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    increaseQty: (id: string) => void;
    decreaseQty: (id: string) => void;
    clearCart: () => void;
    total: () => number;
    itemCount: () => number;
  }