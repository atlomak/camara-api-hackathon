import React from "react";
import AddEntry from "./AddEntry";

function App() {
  console.log("App component loaded"); // Sprawdzenie, czy komponent się ładuje
  return (
    <div>
      <h1>Firestore Entry App</h1>
      <AddEntry />
    </div>
  );
}

export default App;
