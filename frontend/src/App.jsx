import AppShell from "./components/layout/AppShell";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import PlaceholderPage from "./pages/PlaceholderPage";
import Portfolio from "./pages/Portfolio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/portfolio"
            element={<Portfolio />}
          />
          {/* <Route
            path="/portfolio"
            element={
              <PlaceholderPage
                label="Portfolio"
                title="Top holdings workspace"
                description="Highest exposure positions ranked by absolute market value."
              />
            }
          /> */}
          <Route
            path="/market"
            element={<Market />}
          />
          <Route
            path="/orders"
            element={
              <PlaceholderPage
                label="Orders"
                title="Order workflow workspace"
                description="This route is now ready for an order ticket, open orders, fills, and trade confirmations without polluting the dashboard or portfolio views."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
