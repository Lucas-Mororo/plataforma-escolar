import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import Login from "../pages/Login";
import Register from "../pages/Register";

import DashboardAluno from "../pages/aluno/Dashboard";
import AtividadesAluno from "../pages/aluno/Atividades";
import AtividadeDetail from "../pages/aluno/AtividadeDetail";
import MinhasRespostas from "../pages/aluno/MinhasRespostas";

import DashboardProfessor from "../pages/professor/Dashboard";
import AtividadesProfessor from "../pages/professor/Atividades";
import CriarAtividade from "../pages/professor/CriarAtividade";
import RespostasAtividade from "../pages/professor/RespostasAtividade";
import Turmas from "../pages/professor/Turmas";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsuarios from "../pages/admin/Usuarios";
import AdminTurmas from "../pages/admin/Turmas";
import AdminAtividades from "../pages/admin/Atividades";
import AdminRespostasAtividade from "../pages/admin/RespostasAtividade";
import AdminRespostas from "../pages/admin/Respostas";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <NuqsAdapter>
                <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />

                <Route path="/aluno" element={<ProtectedRoute role="ALUNO"><DashboardAluno /></ProtectedRoute>} />
                <Route path="/aluno/atividades" element={<ProtectedRoute role="ALUNO"><AtividadesAluno /></ProtectedRoute>} />
                <Route path="/aluno/atividade/:id" element={<ProtectedRoute role="ALUNO"><AtividadeDetail /></ProtectedRoute>} />
                <Route path="/aluno/respostas" element={<ProtectedRoute role="ALUNO"><MinhasRespostas /></ProtectedRoute>} />

                <Route path="/professor" element={<ProtectedRoute role="PROFESSOR"><DashboardProfessor /></ProtectedRoute>} />
                <Route path="/professor/atividades" element={<ProtectedRoute role="PROFESSOR"><AtividadesProfessor /></ProtectedRoute>} />
                <Route path="/professor/atividades/criar" element={<ProtectedRoute role="PROFESSOR"><CriarAtividade /></ProtectedRoute>} />
                <Route path="/professor/atividade/:id/respostas" element={<ProtectedRoute role="PROFESSOR"><RespostasAtividade /></ProtectedRoute>} />
                <Route path="/professor/turmas" element={<ProtectedRoute role="PROFESSOR"><Turmas /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin><AdminUsuarios /></ProtectedRoute>} />
                <Route path="/admin/turmas" element={<ProtectedRoute requireAdmin><AdminTurmas /></ProtectedRoute>} />
                <Route path="/admin/atividades" element={<ProtectedRoute requireAdmin><AdminAtividades /></ProtectedRoute>} />
                <Route path="/admin/atividades/:id/respostas" element={<ProtectedRoute requireAdmin><AdminRespostasAtividade /></ProtectedRoute>} />
                <Route path="/admin/respostas" element={<ProtectedRoute requireAdmin><AdminRespostas /></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </NuqsAdapter>
        </BrowserRouter>
    );
}
