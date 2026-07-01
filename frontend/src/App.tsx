import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { HomePage } from "./pages/HomePage";
import { PresentationMode } from "./pages/PresentationMode";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectEditorPage } from "./pages/ProjectEditorPage";
import { ProjectListPage } from "./pages/ProjectListPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/projekter/:id/præsentation" element={<PresentationMode />} />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="projekter" element={<ProjectListPage />} />
            <Route path="projekter/ny" element={<ProjectEditorPage />} />
            <Route path="projekter/:id" element={<ProjectDetailPage />} />
            <Route path="projekter/:id/rediger" element={<ProjectEditorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
