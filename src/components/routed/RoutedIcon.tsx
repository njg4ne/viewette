import { Routes, Route } from "react-router-dom";
import appRoutes from "../../routes";
export default function RoutedIcon() {
  return (
    <Routes>
      {appRoutes.map(({ path, Icon }) => (
        <Route key={path} path={path} element={<Icon />} />
      ))}
    </Routes>
  );
}
