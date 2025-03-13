import React from "react";
import AddEntry from "./AddEntry";
import "./App.css";

function App() {
  console.log("App component loaded");
  return (
    <div className="App">
      <h1>🛠 Terminal Administracyjny</h1>
      <AddEntry />
    </div>
  );
}

export default App;
