import { defineStore } from "pinia";
import { nextTick } from "vue";

// Add type definitions
type FormType = "auth" | "signup";
type StepType = "name" | "email" | "password";

export const useAuthStore = defineStore("Auth", {
  state: () => ({
    name: "",
    email: "",
    password: "",
    loading: false,
    error: "",
    step: "name" as StepType,
    formType: "auth" as FormType,
  }),

  actions: {
    setError(message: string) {
      this.error = message;
    },

    clearError() {
      this.error = "";
    },

    setLoading(status: boolean) {
      this.loading = status;
    },

    resetForm() {
      this.name = "";
      this.email = "";
      this.password = "";
      this.error = "";
      this.loading = false;
      this.step = "name";
    },

    setFormType(type: FormType) {
      this.resetForm();
      this.formType = type;
      this.step = type === "auth" ? "email" : "name";
    },

    async handleSignup() {
      try {
        const response = await $fetch("/api/auth/signup", {
          method: "POST",
          body: {
            name: this.name,
            email: this.email,
            password: this.password,
          },
        });

        if (response.success) {
          const { signIn } = useAuth();
          const result = await signIn("credentials", {
            redirect: false,
            email: this.email,
            password: this.password,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          return navigateTo("/app");
        }

        // @ts-ignore
        if (response.errorCode === "USER_EXISTS") {
          this.setError(
            'Email já cadastrado, <a href="/auth/login" class="login-link">clique aqui para fazer login</a>'
          );
        } else {
          this.setError("Problema ao cadastrar tente novamente mais tarde");
        }
      } catch (e) {
        this.setError("Problema ao cadastrar tente novamente mais tarde");
      } finally {
        this.resetForm();
      }
    },

    async handleLogin() {
      try {
        const { signIn } = useAuth();
        const result = await signIn("credentials", {
          redirect: false,
          email: this.email,
          password: this.password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }
        return navigateTo("/app");
      } catch (e) {
        this.setError("Email ou senha inválidos");
        this.step = "email";
        this.email = "";
        this.password = "";
        this.loading = false;
      }
    },

    async validateAndProceed(event: Event) {
      event.preventDefault();
      this.clearError();

      if (this.formType === "signup" && this.step === "name") {
        if (!this.name.trim()) {
          this.setError("Nome não pode ser vazio");
          return;
        }
        this.setLoading(true);
        await nextTick();
        setTimeout(() => {
          this.step = "email";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "email") {
        if (!this.email.trim()) {
          this.setError("Email não pode ser vazio");
          return;
        }
        this.setLoading(true);
        await nextTick();
        setTimeout(() => {
          this.step = "password";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "password") {
        if (!this.password.trim()) {
          this.setError("Senha não pode ser vazia");
          return;
        }
        this.setLoading(true);
        // Call appropriate handler based on form type
        await (this.formType === "auth" ? this.handleLogin() : this.handleSignup());
      }
    },
  },
});
