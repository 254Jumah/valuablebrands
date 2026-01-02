import React from "react";

import { Header } from "./Header";
import { Footer } from "./Footer";

export const PublicLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
