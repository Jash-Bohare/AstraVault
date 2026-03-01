import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Import from "./pages/Import";
import Unlock from "./pages/Unlock";
import Send from "./pages/Send";
import AddToken from "./pages/AddToken";
import SendToken from "./pages/SendToken";
import SignMessage from "./pages/SignMessage";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/import" element={<Import />} />
        <Route path="/unlock" element={<Unlock />} />
        <Route path="/send" element={<Send />} />
        <Route path="/add-token" element={<AddToken />} />
        <Route path="/send-token/:address" element={<SendToken />} />
        <Route path="/sign" element={<SignMessage />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;