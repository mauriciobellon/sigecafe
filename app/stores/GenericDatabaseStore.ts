import { defineStore } from "pinia";
import { getPhoneDigits } from "~/utils/phoneUtils";

/**
 * Generic Database Store for handling CRUD operations on any model
 * @param modelName The name of the model (will be used to generate the API endpoint)
 * @returns A Pinia store with generic CRUD operations
 */
export const createGenericDatabaseStore = (modelName: string) => {
  const apiEndpoint = `/api/${modelName.toLowerCase()}`;

  const useGenericDatabaseStore = defineStore(`${modelName}Store`, {
    state: () => ({
      items: [] as any[],
      currentItem: null as any,
      isLoading: false,
      error: null as string | null,
      isEditing: false,
      modalOpen: false,
      dataLoaded: false
    }),

    getters: {
      getItems: (state) => state.items,
      getItemById: (state) => (id: number) => state.items.find(item => item.id === id)
    },

    actions: {
      /**
       * Process field values before sending to the API
       * @param item The item to process
       * @param columns Column definitions
       * @returns Processed item with normalized field values
       */
      processItemForApi(item: any, columns?: any[]) {
        const processed = { ...item };

        // If we have columns, check for special types that need normalization
        if (columns) {
          columns.forEach(col => {
            if (col.type === 'phone' && processed[col.field]) {
              // Strip formatting from phone numbers
              processed[col.field] = getPhoneDigits(processed[col.field]);
            }
          });
        }

        return processed;
      },

      /**
       * Fetch all items from the API
       */
      async fetchAll() {
        if (this.isLoading) return this.items;

        this.isLoading = true;
        this.error = null;

        try {
          console.log(`GenericDatabaseStore: Fetching ${modelName} items...`);
          const response = await $fetch<any>(apiEndpoint, {
            credentials: "include"
          });

          console.log(`GenericDatabaseStore: ${modelName} API response:`, response);

          // Handle different response formats
          if (response && typeof response === 'object' && 'data' in response) {
            this.items = Array.isArray(response.data) ? response.data : [];
          } else if (Array.isArray(response)) {
            this.items = response;
          } else {
            console.warn(`GenericDatabaseStore: Unexpected ${modelName} response format:`, response);
            this.items = [];
          }

          this.dataLoaded = true;
          console.log(`GenericDatabaseStore: ${modelName} items loaded:`, this.items.length);
          return this.items;

        } catch (error) {
          console.error(`GenericDatabaseStore: Error fetching ${modelName} items:`, error);
          this.error = `Failed to load ${modelName} data`;
          this.items = [];
          throw error;
        } finally {
          this.isLoading = false;
        }
      },

      /**
       * Create a new item
       * @param item The item to create
       */
      async create(item: any) {
        this.isLoading = true;
        this.error = null;

        try {
          // Create a copy of the item for creating
          const createPayload = { ...item };

          // Get column definitions
          const columns = (window as any).__columnDefinitions?.[modelName.toLowerCase()];

          // Process fields (like phone numbers) before sending to API
          const processedPayload = this.processItemForApi(createPayload, columns);

          console.log(`GenericDatabaseStore: Creating ${modelName}:`, processedPayload);
          const response = await $fetch(apiEndpoint, {
            method: "POST",
            body: processedPayload,
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include"
          });

          console.log(`GenericDatabaseStore: ${modelName} created:`, response);

          // Add to the items array if response is successful
          if (response && typeof response === 'object') {
            this.items.push(response);
          }

          return response;
        } catch (error) {
          console.error(`GenericDatabaseStore: Error creating ${modelName}:`, error);
          this.error = `Failed to create ${modelName}`;
          throw error;
        } finally {
          this.isLoading = false;
          this.modalOpen = false;
        }
      },

      /**
       * Update an existing item
       * @param item The item to update
       */
      async update(item: any) {
        this.isLoading = true;
        this.error = null;

        try {
          if (!item.id) {
            throw new Error(`Cannot update ${modelName} without an ID`);
          }

          // Get original item if available to determine readonly fields
          const originalItem = this.items.find(i => i.id === item.id);

          // Create a copy of the item for updating
          const updatePayload = { ...item };

          // Get column definitions if available
          const columns = (window as any).__columnDefinitions?.[modelName.toLowerCase()];

          if (columns && originalItem) {
            // Restore original values for readonly fields
            columns.forEach((col: any) => {
              if (col.readonly && col.field !== 'id' && originalItem[col.field] !== undefined) {
                updatePayload[col.field] = originalItem[col.field];
              }
            });
          }

          // Process fields (like phone numbers) before sending to API
          const processedPayload = this.processItemForApi(updatePayload, columns);

          console.log(`GenericDatabaseStore: Updating ${modelName}:`, processedPayload);
          const response = await $fetch(apiEndpoint, {
            method: "PUT",
            body: processedPayload,
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include"
          });

          console.log(`GenericDatabaseStore: ${modelName} updated:`, response);

          // After update, force a complete refresh of the data
          await this.fetchAll();

          return response;
        } catch (error) {
          console.error(`GenericDatabaseStore: Error updating ${modelName}:`, error);
          this.error = `Failed to update ${modelName}`;
          throw error;
        } finally {
          this.isLoading = false;
          this.modalOpen = false;

          // After an update and closing the modal, trigger UI refresh
          this.dataLoaded = false;
          setTimeout(() => {
            this.dataLoaded = true;
          }, 10);
        }
      },

      /**
       * Delete an item
       * @param item The item to delete
       */
      async delete(item: any) {
        this.isLoading = true;
        this.error = null;

        try {
          if (!item.id) {
            throw new Error(`Cannot delete ${modelName} without an ID`);
          }

          console.log(`GenericDatabaseStore: Deleting ${modelName}:`, item);
          await $fetch(apiEndpoint, {
            method: "DELETE",
            body: { usuario: item }, // This matches the API's expected format
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include"
          });

          console.log(`GenericDatabaseStore: ${modelName} deleted:`, item.id);

          // Remove the item from the items array
          const index = this.items.findIndex(i => i.id === item.id);
          if (index !== -1) {
            this.items.splice(index, 1);
          }

          return true;
        } catch (error) {
          console.error(`GenericDatabaseStore: Error deleting ${modelName}:`, error);
          this.error = `Failed to delete ${modelName}`;
          throw error;
        } finally {
          this.isLoading = false;
        }
      },

      /**
       * Open the edit modal for an item
       * @param item The item to edit
       */
      openEditModal(item: any) {
        this.currentItem = { ...item };
        this.isEditing = true;
        this.modalOpen = true;
      },

      /**
       * Open the create modal
       */
      openCreateModal() {
        this.currentItem = {};
        this.isEditing = false;
        this.modalOpen = true;
      },

      /**
       * Close the modal
       */
      closeModal() {
        this.modalOpen = false;
        this.currentItem = null;

        // Trigger a refresh when modal is closed to ensure UI is up to date
        setTimeout(() => {
          this.fetchAll();
        }, 100);
      }
    }
  });

  return useGenericDatabaseStore;
};