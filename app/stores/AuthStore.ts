import { defineStore } from "pinia";
import { nextTick } from "vue";

// Add type definitions
type FormType = "auth" | "signup";
type StepType = "name" | "celular" | "password";

export const useAuthStore = defineStore("Auth", {
  state: () => ({
    name: "",
    celular: "",
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

    setLoading(value: boolean) {
      this.loading = value;
    },

    resetForm() {
      this.name = "";
      this.celular = "";
      this.password = "";
      this.error = "";
      this.loading = false;
      this.step = "name";
    },

    setFormType(type: FormType) {
      this.resetForm();
      this.formType = type;
      this.step = type === "auth" ? "celular" : "name";
    },

    async handleSignup() {
      try {
        const response = await $fetch("/api/auth/signup", {
          method: "POST",
          body: {
            name: this.name,
            celular: this.celular,
            password: this.password,
          },
        });

        if (response.success) {
          const { signIn } = useAuth();
          const result = await signIn("credentials", {
            redirect: false,
            celular: this.celular,
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
            'Número de celular já cadastrado, <a href="/auth/login" class="login-link">clique aqui para fazer login</a>'
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
        // Extract only the digits for authentication
        const celularDigits = this.celular.replace(/\D/g, '');

        const { signIn } = useAuth();
        const result = await signIn("credentials", {
          redirect: false,
          celular: celularDigits, // Send only digits
          password: this.password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }
        return navigateTo("/app");
      } catch (e) {
        this.setError("Número de celular ou senha inválidos");
        this.step = "celular";
        this.celular = "";
        this.password = "";
        this.loading = false;
      }
    },

    maskPhoneNumber() {
      let value = this.celular.replace(/\D/g, ''); // Remove non-digits
      if (value.length <= 11) {
        // Format as (XX) X XXXX-XXXX
        if (value.length >= 2) {
          value = value.replace(/^(\d{2})/, '($1) ');
        }
        if (value.length >= 4) {
          value = value.replace(/^\((\d{2})\) (\d{1})/, '($1) $2 ');
        }
        if (value.length >= 8) {
          value = value.replace(/^\((\d{2})\) (\d{1}) (\d{4})/, '($1) $2 $3-');
        }
        this.celular = value;
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
          this.step = "celular";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "celular") {
        const phoneDigits = this.celular.replace(/\D/g, '');
        if (!this.celular.trim() || phoneDigits.length !== 11) {
          this.setError("Digite um número de celular válido (11 dígitos)");
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
    }
  }
});
