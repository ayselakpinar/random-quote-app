import { useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { logout, auth } from "./firebase/auth";
import { UserPage } from "./components/UserPage";
import { Home } from "./components/Home";
import {Login} from "./components/Login";
import {Register} from "./components/Register";
import { uploadQuotesScript } from "./uploadQuotesScript";
import {UserContext, UserDispatchContext, UserActionTypes} from "./UserContext";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const user = useContext(UserContext);
  const dispatch = useContext(UserDispatchContext);

  // THE issue with the code below: I used a bad password so the user was not created. That's why logging in did not work.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const { email, displayName, uid } = user;
            dispatch({ type: UserActionTypes.SetUser, payload: { email, name: displayName, id: uid } });
        } else {
            dispatch({ type: UserActionTypes.SetUser, payload: null });
        }
    });

    return unsubscribe;
  }, []);

  async function handleLogout () {
    try {
      await logout();
      setCurrentPage("home");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  }

  return (
    <div className="App">
      <nav className="nav--top">
        <button onClick={() => setCurrentPage("home")} className="nav-btn">
          Home
        </button>
        {user ? (
          <>
            <button onClick={() => setCurrentPage("user")} className="nav-btn">
              User
            </button>
            <button onClick={handleLogout} className="nav-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setCurrentPage("login")} className="nav-btn">
              Login
            </button>
            <button
              onClick={() => setCurrentPage("register")}
              className="nav-btn"
            >
              Register
            </button>
          </>
        )}
      </nav>
      {currentPage === "home" && <Home />}
      {currentPage === "user" && <UserPage />}
      {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
      {currentPage === "register" && <Register setCurrentPage={setCurrentPage} />}
{/* 
      <h2>Upload quotes</h2>
      <button onClick={() => uploadQuotesScript()}>Add all existing quotes</button> */}
    </div>
  );
}

export default App;