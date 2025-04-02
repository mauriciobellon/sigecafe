import { defineStore } from "pinia";
import type { Usuario } from "@prisma/client";

interface ProfessorState {
  professores: Usuario[];
  selectedRows: number;
  isEditing: boolean;
  modalState: boolean;
  editingRowIndex: number | null;
  newProfessor: {
    id: number | null;
    name: string;
    email: string;
  };
}

export const useProfessorStore = defineStore("Professor", {
  state: (): ProfessorState => ({
    professores: [],
    selectedRows: 0,
    isEditing: false,
    modalState: false,
    editingRowIndex: null,
    newProfessor: {
      id: null,
      name: "",
      email: "",
    },
  }),

  actions: {
    async fetch() {
      try {
        const response = await $fetch<Usuario[]>(`/api/colaborador/professor`, {
          credentials: "include"
        });
        this.professores = response;
      } catch (error) {
        console.error("Error fetching professores:", error);
      }
    },

    async create() {
      try {
        const response = await $fetch(`/api/colaborador/professor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newProfessor),
        });
        // @ts-ignore
        this.professores.push(response);
        this.resetForm();
      } catch (error) {
        console.error("Error creating professor:", error);
      }
    },

    async update() {
      try {
        const response = await $fetch(`/api/colaborador/professor`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newProfessor),
        });

        if (this.editingRowIndex !== null) {
          // @ts-ignore
          this.professores[this.editingRowIndex] = response;
        }
        this.resetForm();
      } catch (error) {
        console.error("Error updating professor:", error);
      }
    },

    async remove(professor: Usuario) {
      try {
        await $fetch(`/api/colaborador/professor`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: { usuario: professor },
          credentials: "include",
        });

        const index = this.professores.findIndex((p) => p.id === professor.id);
        if (index !== -1) {
          this.professores.splice(index, 1);
        }
      } catch (error) {
        console.error("Error removing professor:", error);
      }
    },

    resetForm() {
      this.modalState = false;
      this.isEditing = false;
      this.editingRowIndex = null;
      this.newProfessor = {
        id: null,
        name: "",
        email: "",
      };
    },

    setEditingColaborador(professor: Usuario) {
      this.isEditing = true;
      this.newProfessor = { ...professor };
      this.editingRowIndex = this.professores.findIndex((p) => p.id === professor.id);
      this.modalState = true;
    },
  },
});
