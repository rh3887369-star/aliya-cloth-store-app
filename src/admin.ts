import { supabase } from "./supabase";
import "./admin.css";

document.querySelector<HTMLDivElement>("#admin-app")!.innerHTML = `
  <main class="admin-login-page">

    <section class="admin-login-card">

      <div class="admin-brand">
        <img
          src="/images/aliya-logo.jpeg"
          alt="Aliya Cloth Store"
        />

        <p class="admin-label">PRIVATE ADMIN ACCESS</p>

        <h1>Welcome Back</h1>

        <p class="admin-subtitle">
          Sign in to manage Aliya Cloth Store.
        </p>
      </div>

      <form id="admin-login-form">

        <label for="admin-email">
          Email Address
        </label>

        <input
          id="admin-email"
          type="email"
          required
          autocomplete="email"
          placeholder="Enter admin email"
        />

        <label for="admin-password">
          Password
        </label>

        <input
          id="admin-password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="Enter password"
        />

        <button
          id="forgot-password-button"
          type="button"
          class="forgot-password-button"
        >
          Forgot Password?
        </button>

        <p
          id="login-message"
          class="login-message"
        ></p>

        <button
          id="login-button"
          type="submit"
        >
          Sign In
        </button>

      </form>

    </section>

  </main>
`;


const loginForm =
  document.querySelector<HTMLFormElement>(
    "#admin-login-form"
  );

const emailInput =
  document.querySelector<HTMLInputElement>(
    "#admin-email"
  );

const passwordInput =
  document.querySelector<HTMLInputElement>(
    "#admin-password"
  );

const loginMessage =
  document.querySelector<HTMLParagraphElement>(
    "#login-message"
  );

const loginButton =
  document.querySelector<HTMLButtonElement>(
    "#login-button"
  );

const forgotPasswordButton =
  document.querySelector<HTMLButtonElement>(
    "#forgot-password-button"
  );


/* =========================
   ADMIN LOGIN
========================= */

loginForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (
      !emailInput ||
      !passwordInput ||
      !loginMessage ||
      !loginButton
    ) {
      return;
    }

    loginMessage.textContent = "";

    loginButton.disabled = true;

    loginButton.textContent = "Signing In...";


    const { error } =
      await supabase.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });


    if (error) {

      loginMessage.textContent =
        "Invalid email or password.";

      loginMessage.className =
        "login-message error";

      loginButton.disabled = false;

      loginButton.textContent = "Sign In";

      return;
    }


    loginMessage.textContent =
      "Login successful. Opening dashboard...";

    loginMessage.className =
      "login-message success";


    window.location.href =
      "/dashboard.html";

  }
);


/* =========================
   FORGOT PASSWORD
========================= */

forgotPasswordButton?.addEventListener(
  "click",
  async () => {

    if (
      !emailInput ||
      !loginMessage ||
      !forgotPasswordButton
    ) {
      return;
    }


    const email =
      emailInput.value.trim();


    if (!email) {

      loginMessage.textContent =
        "Enter your admin email first.";

      loginMessage.className =
        "login-message error";

      return;
    }


    forgotPasswordButton.disabled = true;

    forgotPasswordButton.textContent =
      "Sending Reset Link...";

    loginMessage.textContent = "";


    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/reset-password.html`,
        }
      );


    if (error) {

      loginMessage.textContent =
        error.message;

      loginMessage.className =
        "login-message error";

      forgotPasswordButton.disabled = false;

      forgotPasswordButton.textContent =
        "Forgot Password?";

      return;
    }


    loginMessage.textContent =
      "Password reset link sent. Check your email.";

    loginMessage.className =
      "login-message success";

    forgotPasswordButton.disabled = false;

    forgotPasswordButton.textContent =
      "Forgot Password?";

  }
);