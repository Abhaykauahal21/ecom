import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  flavor?: string;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (data: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (data: CartItem) => {
        const currentItems = get().items;
        // Create a unique key for the item based on productId, flavor and size
        const cartItemId = `${data.productId}-${data.flavor || ""}-${
          data.size || ""
        }`;
        const existingItem = currentItems.find((item) => item.id === cartItemId);

        if (existingItem) {
          const newQuantity = existingItem.quantity + data.quantity;
          
          if (newQuantity > data.stock) {
            toast.error(`Only ${data.stock} units available in stock`);
            // Set to max available stock
            const updatedItems = currentItems.map((item) =>
              item.id === cartItemId
                ? { ...item, quantity: data.stock }
                : item
            );
            set({ items: updatedItems });
            return;
          }

          const updatedItems = currentItems.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
          set({ items: updatedItems });
          toast.success("Updated quantity in cart");
          return;
        }

        if (data.quantity > data.stock) {
          toast.error(`Only ${data.stock} units available in stock`);
          set({ items: [...get().items, { ...data, id: cartItemId, quantity: data.stock }] });
          return;
        }

        set({ items: [...get().items, { ...data, id: cartItemId }] });
        toast.success("Item added to cart");
      },
      removeItem: (id: string) => {
        set({ items: [...get().items.filter((item) => item.id !== id)] });
        toast.success("Item removed from cart");
      },
      updateQuantity: (id: string, quantity: number) => {
        const currentItem = get().items.find(item => item.id === id);
        if (!currentItem) return;

        if (quantity < 1) return;
        
        if (quantity > currentItem.stock) {
          toast.error(`Only ${currentItem.stock} units available in stock`);
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity: currentItem.stock } : item
            ),
          });
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
