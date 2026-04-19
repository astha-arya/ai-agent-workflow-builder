# AI Agent Workflow Editor

## 📌 Overview
A React-based visual workflow editor designed for HR administrators to build, configure, and simulate internal automation processes. This application provides a scalable drag-and-drop canvas with dynamic node configurations and a simulated execution environment.

## 🚀 How to Run Locally

1. **Clone the repository:**
    ```bash
    git clone https://github.com/astha-arya/ai-agent-workflow-builder.git
    cd ai-agent-workflow-builder

2. **Install dependencies:**
    ```bash
    npm install

3. **Start the development server:**
    ```bash
    npm run dev

## 🏗️ Architecture & Design Decisions

This application was built with a strict focus on modularity, type safety, and optimal rendering performance.

* **State Management (Zustand):** Chosen specifically over the React Context API to manage the `nodes` and `edges` arrays. Zustand prevents unnecessary re-renders of the entire canvas when a user edits a single node's properties in the right sidebar, keeping the UI highly performant.
* **Canvas Engine (React Flow):** Utilized for core drag-and-drop mechanics. I implemented heavily customized node components (`StartNode`, `TaskNode`, etc.) to maintain strict control over the visual UI, moving away from default library styling to match an enterprise SaaS design system.
* **Type Safety (Discriminated Unions):** Enforced strict TypeScript discriminated unions for the `WorkflowNode` types. This ensures that the dynamic property panel (Right Sidebar) safely and predictably renders the correct form fields based on the selected node type without relying on `any`.
* **Data Layer Separation:** The mock API (`src/services/api.ts`) is completely decoupled from the UI. The simulation panel and dynamic dropdown forms fetch from these asynchronous simulated endpoints using standard promises, demonstrating how the frontend would seamlessly integrate with a real backend (e.g., Node.js or FastAPI).

## ✅ What Was Completed

* **Custom Node Canvas:** Fully implemented Start, Task, Approval, Automated, and End nodes with custom UI and drag-and-drop functionality.
* **Dynamic Form Editor:** A reactive right sidebar that binds form inputs directly to the canvas state in real-time.
* **Mock API Integration:** Asynchronous data fetching for the "Automated" node action dropdowns.
* **Simulation Sandbox:** A validation and execution engine that serializes the graph, checks for a valid starting point, and renders a step-by-step CI/CD style execution timeline.
* **Bonus Feature - Zoom & Minimap:** Integrated canvas controls to navigate sprawling workflows.
* **Bonus Feature - Import/Export:** Added the ability to serialize the workflow state to JSON for downloading, and parse uploaded JSON to rebuild the canvas state.

## 🔮 What I Would Add With More Time

* **Graph Cycle Detection:** Implement an algorithm (like Depth-First Search) in the Simulation Sandbox to detect infinite loops or invalid cyclic dependencies before sending the payload to the API.
* **Backend Persistence:** Connect the application to a real database (MongoDB/PostgreSQL) to save user sessions and workflow templates permanently.
* **Auto-Layout:** Integrate a directed graph layout library (like `dagre`) to automatically format messy or tangled node structures with the click of a button.
* **Undo/Redo Stack:** Utilize a state history middleware within Zustand to allow users to revert accidental node deletions or edge connections.