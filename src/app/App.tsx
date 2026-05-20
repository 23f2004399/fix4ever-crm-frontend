import { RouterProvider } from "react-router-dom";
import { Providers } from "./providers";
import { router } from "./router";

export const App = () => {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};
