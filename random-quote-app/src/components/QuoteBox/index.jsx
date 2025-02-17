import {
  UserContext,
  UserDispatchContext,
  UserActionTypes,
} from "../../UserContext";
import { useContext, useEffect, useState } from "react";
import { doc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export function QuoteBox({ id, quote, author, onNewQuoteClick }) {
  const user = useContext(UserContext);
  const dispatch = useContext(UserDispatchContext);
  const collectionReference = collection(db, "quotes");

  const [currentQuoteDocument, setCurrentQuoteDocument] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      const dbQuery = query(collectionReference, where("id", "==", id));
      const querySnapshots = await getDocs(dbQuery);
      if (!querySnapshots.empty) {
        const quoteData = querySnapshots.docs.map(doc => doc.data())[0];
        setCurrentQuoteDocument(quoteData);
      }
    };

    fetchQuote();
  }, [id]);

  async function handleLike() {
    if (!user) {
      alert("You must be logged in to like a quote.");
      return;
    }
    dispatch({ type: UserActionTypes.UpdateLikedQuotes, payload: { id } });
    try {
      const updatedLikedBy = currentQuoteDocument.likedBy || [];
      const quoteDocRef = doc(db, "quotes", currentQuoteDocument.id);
      
      const updatedQuoteData = {
        ...currentQuoteDocument,
        likedBy: [...updatedLikedBy, user.id],
      };

      await setDoc(quoteDocRef, updatedQuoteData);
    } catch (error) {
      console.error("Error getting quotes:", error);
    }
  }

  async function handleDislike() {
    if (!user) {
      alert("You must be logged in to dislike a quote.");
      return;
    }
    dispatch({ type: UserActionTypes.UpdateDislikedQuotes, payload: { id } });
    try {
      const updatedDislikedBy = currentQuoteDocument.dislikedBy || [];
      const quoteDocRef = doc(db, "quotes", currentQuoteDocument.id);
      
      const updatedQuoteData = {
        ...currentQuoteDocument,
        dislikedBy: [...updatedDislikedBy, user.id],
      };

      await setDoc(quoteDocRef, updatedQuoteData);
    } catch (error) {
      console.error("Error getting quotes:", error);
    }
  }

  if (!currentQuoteDocument) return <p>Loading...</p>;

  return (
    <>
      <div>
        <p>{quote}</p>
        <span>{author}</span>
        <div>
          <button disabled={user.likedQuotes.includes(id)} onClick={handleLike}>
            Like {currentQuoteDocument.likedBy.length}
          </button>
          <button
            disabled={user.dislikedQuotes.includes(id)}
            onClick={handleDislike}
          >
            Dislike {currentQuoteDocument.dislikedBy.length}
          </button>
        </div>
      </div>
      <button onClick={onNewQuoteClick}>New Quote</button>
    </>
  );
}