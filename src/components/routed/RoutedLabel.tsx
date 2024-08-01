import { Routes, Route } from "react-router-dom";
import appRoutes from "../../routes";
export default function RoutedLabel() {
  return (
    <Routes>
      {appRoutes.map(({ path, label }) => (
        <Route key={path} path={path} element={<>{label}</>} />
      ))}
    </Routes>
  );
}
