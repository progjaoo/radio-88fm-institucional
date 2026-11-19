import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Debates from "./Debates";

function Destination() {
  const { pathname, search } = useLocation();
  return <output>{pathname}{search}</output>;
}

it("redirects a previously shared debate URL with its valid filters", async () => {
  render(
    <MemoryRouter initialEntries={["/debates?q=pecado&ano=2025&mes=2&dia=29"]}>
      <Routes>
        <Route path="/debates" element={<Debates />} />
        <Route path="/conteudos" element={<Destination />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(await screen.findByRole("status")).toHaveTextContent("/conteudos?categoria=debate-88&q=pecado&ano=2025&mes=2");
});
