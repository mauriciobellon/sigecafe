import { defineStore } from "pinia";
import type { Usuario, UsuarioType } from "@prisma/client";

interface ColaboradorState {
  colaboradores: Usuario[];
  selectedRows: number;
  isEditing: boolean;
  modalState: boolean;
  editingRowIndex: number | null;
  newColaborador: {
    id: number | null;
    name: string;
    email: string | null;
    celular?: string;
    type?: UsuarioType;
  };
}

export const useColaboradorStore = defineStore("Colaborador", {
  state: (): ColaboradorState => ({
    colaboradores: [],
    selectedRows: 0,
    isEditing: false,
    modalState: false,
    editingRowIndex: null,
    newColaborador: {
      id: null,
      name: "",
      email: "",
      celular: "",
      type: "COLABORADOR" as UsuarioType
    },
  }),

  actions: {
    async fetch() {
      try {
          const response = await $fetch<Usuario[]>(`/api/colaborador`, {
          credentials: "include"
        });

        // Ensure response is always an array
        this.colaboradores = Array.isArray(response) ? response : [];

      } catch (error) {
        console.error("Error fetching colaboradores:", error);
        // Initialize as empty array on error
        this.colaboradores = [];
      }
    },

    async create() {
      try {
        const response = await $fetch<Usuario>(`/api/colaborador`, {
          method: "POST" as const,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newColaborador),
        });

        // Ensure colaboradores is an array before pushing
        if (!Array.isArray(this.colaboradores)) {
          this.colaboradores = [];
        }

        // Add the new colaborador to the array if response is a Usuario
        if (response && typeof response === 'object' && 'id' in response) {
          this.colaboradores.push(response as Usuario);
        }

        this.resetForm();
      } catch (error) {
        console.error("Error creating colaborador:", error);
      }
    },

    async update() {
      try {
        const response = await $fetch<Usuario>(`/api/colaborador`, {
          method: "PUT" as const,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newColaborador),
        });

        // Ensure colaboradores is an array
        if (!Array.isArray(this.colaboradores)) {
          this.colaboradores = [];
        }

        if (this.editingRowIndex !== null && response && typeof response === 'object' && 'id' in response) {
          // Update the collaborator in the array
          this.colaboradores[this.editingRowIndex] = response as Usuario;
        }

        this.resetForm();
      } catch (error) {
        console.error("Error updating colaborador:", error);
      }
    },

    async remove(colaborador: Usuario) {
      try {
        await $fetch(`/api/colaborador`, {
          method: "DELETE" as const,
          headers: {
            "Content-Type": "application/json",
          },
          body: { usuario: colaborador },
          credentials: "include",
        });

        const index = this.colaboradores.findIndex((p) => p.id === colaborador.id);
        if (index !== -1) {
          this.colaboradores.splice(index, 1);
        }
      } catch (error) {
        console.error("Error removing colaborador:", error);
      }
    },

    resetForm() {
      this.modalState = false;
      this.isEditing = false;
      this.editingRowIndex = null;
      this.newColaborador = {
        id: null,
        name: "",
        email: "",
        celular: "",
        type: "COLABORADOR" as UsuarioType
      };
    },

    setEditingColaborador(colaborador: Usuario) {
      this.isEditing = true;
      this.newColaborador = {
        id: colaborador.id,
        name: colaborador.name,
        email: colaborador.email,
        celular: colaborador.celular,
        type: colaborador.type
      };
      this.editingRowIndex = this.colaboradores.findIndex((p) => p.id === colaborador.id);
      this.modalState = true;
    },
  },
});