import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {activePage === "dashboard" && <Dashboard setActivePage={setActivePage} />}
        {activePage === "inventory" && <Inventory setActivePage={setActivePage} />}
      </main>
    </div>
  );
}
