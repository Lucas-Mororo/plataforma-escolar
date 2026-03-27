import "./App.css";
import AppRoutes from "./routes";
import ToastContainer from "./components/ToastContainer";
import { useAuthInitialize } from "./hooks/useAuth";

function App() {
  const { isLoading } = useAuthInitialize();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
