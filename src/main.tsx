import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { AppProvider } from "./app/context";
import { LocalStorageRepository, MemoryRepository, type Repository } from "./storage/repository";
import { createStore } from "./store/store";
import "./styles/app.css";

function createRepository(): { repo: Repository; persistent: boolean } {
  try {
    const probe = "ventureForge.probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return { repo: new LocalStorageRepository(window.localStorage), persistent: true };
  } catch {
    console.warn("Venture Forge: localStorage unavailable; progress will last for this tab only.");
    return { repo: new MemoryRepository(), persistent: false };
  }
}

const { repo, persistent } = createRepository();
const store = createStore(repo);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider store={store} persistent={persistent}>
      <App />
    </AppProvider>
  </StrictMode>,
);
