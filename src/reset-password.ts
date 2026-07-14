import { supabase } from "./supabase";

document.querySelector<HTMLDivElement>("#reset-password-app")!.innerHTML = `
  <main>
    <h1>Set New Password</h1>

    <form id="reset-password-form">
      <label for="new-password">New Password</label>

      <input
        id="new-password"
        type="password"
        required
        minlength="8"
        placeholder="Enter new password"
      />

      <label for="confirm-password">Confirm Password</label>

      <input
        id="confirm-password"
        type="password"
        required
        minlength="8"
        placeholder="Confirm new password"
      />

      <p id="reset-message"></p>

      <button type="submit">
        Update Password
      </button>
    </form>
  </main>
`;

const form =
  document.querySelector<HTMLFormElement>("#reset-password-form");

const newPassword =
  document.querySelector<HTMLInputElement>("#new-password");

const confirmPassword =
  document.querySelector<HTMLInputElement>("#confirm-password");

const message =
  document.querySelector<HTMLParagraphElement>("#reset-message");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!newPassword || !confirmPassword || !message) {
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    message.textContent = "Passwords do not match.";
    return;
  }

  message.textContent = "Updating password...";

  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  message.textContent = "Password updated successfully.";

  setTimeout(() => {
    window.location.href = "/admin.html";
  }, 1500);
});