import { defineStore } from "pinia";
import type { Usuario } from "@prisma/client";

interface ProfessorState {
  professors: Usuario[];
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

export const useProfessorStore = defineStore("professor", {
  state: (): ProfessorState => ({
    professors: [],
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
    async fetchProfessors() {
      try {
        const response = await $fetch<Usuario[]>(`/api/professor`);
        this.professors = response;
      } catch (error) {
        console.error("Error fetching professors:", error);
      }
    },

    async createProfessor() {
      try {
        const response = await $fetch(`/api/professor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newProfessor),
        });
        // @ts-ignore
        this.professors.push(response);
        this.resetForm();
      } catch (error) {
        console.error("Error creating professor:", error);
      }
    },

    async updateProfessor() {
      try {
        const response = await $fetch(`/api/professor`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newProfessor),
        });

        if (this.editingRowIndex !== null) {
          // @ts-ignore
          this.professors[this.editingRowIndex] = response;
        }
        this.resetForm();
      } catch (error) {
        console.error("Error updating professor:", error);
      }
    },

    async removeProfessor(professor: Usuario) {
      try {
        await $fetch(`/api/professor`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: { usuario: professor },
          credentials: "include",
        });

        const index = this.professors.findIndex((p) => p.id === professor.id);
        if (index !== -1) {
          this.professors.splice(index, 1);
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

    setEditingProfessor(professor: Usuario) {
      this.isEditing = true;
      this.newProfessor = { ...professor };
      this.editingRowIndex = this.professors.findIndex((p) => p.id === professor.id);
      this.modalState = true;
    },
  },
});
