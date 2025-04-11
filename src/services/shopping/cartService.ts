
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Get the user's cart ID, creating one if it doesn't exist
 */
export async function getUserCart(): Promise<string | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if user has a cart
    const { data: existingCart, error: cartError } = await supabase
      .from('shopping_carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cartError && cartError.code !== 'PGRST116') {
      // Real error occurred
      console.error("Error fetching cart:", cartError);
      throw cartError;
    }

    if (existingCart) {
      return existingCart.id;
    }

    // Create a new cart if none exists
    const { data: newCart, error: createError } = await supabase
      .from('shopping_carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (createError) {
      console.error("Error creating cart:", createError);
      throw createError;
    }

    return newCart.id;
  } catch (error) {
    console.error("Error in getUserCart:", error);
    return null;
  }
}

/**
 * Add an item to the user's cart
 */
export async function addToCart(productId: string, quantity: number = 1): Promise<boolean> {
  try {
    const cartId = await getUserCart();
    if (!cartId) return false;

    // Check if product is already in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking cart item:", checkError);
      throw checkError;
    }

    if (existingItem) {
      // Update existing cart item quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error("Error updating cart item:", updateError);
        throw updateError;
      }
    } else {
      // Insert new cart item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, quantity });

      if (insertError) {
        console.error("Error adding to cart:", insertError);
        throw insertError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in addToCart:", error);
    return false;
  }
}

/**
 * Get the items in a user's cart
 */
export async function getCartItems() {
  try {
    const cartId = await getUserCart();
    if (!cartId) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        products (
          id,
          title,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('cart_id', cartId);

    if (error) {
      console.error("Error fetching cart items:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCartItems:", error);
    return [];
  }
}

/**
 * Update the quantity of an item in the cart
 */
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    return false;
  }
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return false;
  }
}

/**
 * Get the number of items in the user's cart
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const cartItems = await getCartItems();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error in getCartItemCount:", error);
    return 0;
  }
}

/**
 * Clear all items from the cart
 */
export async function clearCart(): Promise<boolean> {
  try {
    const cartId = await getUserCart();
    if (!cartId) return false;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in clearCart:", error);
    return false;
  }
}
