import WishReveal from "./WishReveal";

export const metadata = {
  title: "Someone sent you a Secret Holi Wish! 🎈",
  description: "Tap the balloon to reveal your secret Holi wish!",
};

export default async function RevealPage({ searchParams }) {
  const params = await searchParams;
  const data = params?.d;

  let wishData = null;
  if (data) {
    try {
      wishData = JSON.parse(decodeURIComponent(atob(data)));
    } catch {
      wishData = null;
    }
  }

  return <WishReveal wishData={wishData} />;
}
