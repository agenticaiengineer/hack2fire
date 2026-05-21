import { loginAction, registerAction } from "@/lib/actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="shell auth-layout">
      <section className="panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in</h1>
        {searchParams.error ? <p className="error">Check the details and try again.</p> : null}
        <form className="form-stack" action={loginAction}>
          <label className="field">Email<input name="email" type="email" defaultValue="user@hack2fire.com" required /></label>
          <label className="field">Password<input name="password" type="password" defaultValue="Hack2Fire!2026" required /></label>
          <button className="primary-button" type="submit">Log in</button>
        </form>
        <p className="muted">Demo accounts: user@hack2fire.com, contributor@hack2fire.com, admin@hack2fire.com. Password: Hack2Fire!2026</p>
      </section>
      <section className="panel">
        <p className="eyebrow">New learner</p>
        <h2>Create an account</h2>
        <form className="form-stack" action={registerAction}>
          <label className="field">Name<input name="name" minLength={2} required /></label>
          <label className="field">Email<input name="email" type="email" required /></label>
          <label className="field">Password<input name="password" type="password" minLength={8} required /></label>
          <button className="secondary-button" type="submit">Create end-user account</button>
        </form>
      </section>
    </main>
  );
}
