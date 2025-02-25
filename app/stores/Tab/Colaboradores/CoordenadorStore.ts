import { defineStore } from "pinia";
import type { Usuario, UsuarioType } from "@prisma/client";

interface CoordenadorState {
  coordenadores: Usuario[];
  selectedRows: number;
  isEditing: boolean;
  modalState: boolean;
  editingRowIndex: number | null;
  newCoordenador: {
    id: number | null;
    name: string;
    email: string;
  };
}

export const useCoordenadorStore = defineStore("Coordenador", {
  state: (): CoordenadorState => ({
    coordenadores: [],
    selectedRows: 0,
    isEditing: false,
    modalState: false,
    editingRowIndex: null,
    newCoordenador: {
      id: null,
      name: "",
      email: "",
    },
  }),

  actions: {
    async fetch() {
      try {
        const response = await $fetch<Usuario[]>(`http://localhost:3000/api/colaborador/coordenador`, {
          credentials: "include"
        });
        this.coordenadores = response;
      } catch (error) {
        console.error("Error fetching coordenadores:", error);
      }
    },

    async create() {
      try {
        const response = await $fetch(`http://localhost:3000/api/colaborador/coordenador`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newCoordenador),
        });
        // @ts-ignore
        this.coordenadores.push(response);
        this.resetForm();
      } catch (error) {
        console.error("Error creating professor:", error);
      }
    },

    async update() {
      try {
        const response = await $fetch(`http://localhost:3000/api/colaborador/coordenador`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newCoordenador),
        });

        if (this.editingRowIndex !== null) {
          // @ts-ignore
          this.coordenadores[this.editingRowIndex] = response;
        }
        this.resetForm();
      } catch (error) {
        console.error("Error updating professor:", error);
      }
    },

    async remove(coordenador: Usuario) {
      try {
        await $fetch(`http://localhost:3000/api/colaborador/coordenador`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: { usuario: coordenador },
          credentials: "include",
        });

        const index = this.coordenadores.findIndex((p) => p.id === coordenador.id);
        if (index !== -1) {
          this.coordenadores.splice(index, 1);
        }
      } catch (error) {
        console.error("Error removing professor:", error);
      }
    },

    resetForm() {
      this.modalState = false;
      this.isEditing = false;
      this.editingRowIndex = null;
      this.newCoordenador = {
        id: null,
        name: "",
        email: "",
      };
    },

    setEditingCoordenador(coordenador: Usuario) {
      this.isEditing = true;
      this.newCoordenador = { ...coordenador };
      this.editingRowIndex = this.coordenadores.findIndex((p) => p.id === coordenador.id);
      this.modalState = true;
    },
  },
});
