import { useApp } from "../store/AppContext";

export const useWishlist = () => {
  const { wishlist, toggleWishlist } = useApp();
  
  return {
    wishlist,
    toggleWishlist,
    isWishlisted: (bookId) => wishlist.includes(bookId)
  };
};
export default useWishlist;
