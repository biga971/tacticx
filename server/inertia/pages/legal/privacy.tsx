import DocShell from '~/components/landing/doc_shell'
import { IconMail } from '~/components/landing/icons'

export default function Privacy() {
  return (
    <DocShell
      title="Privacy Policy — Tacticx"
      metaDescription="How Tacticx collects, uses and protects your personal data."
      heading="Privacy Policy"
      updated="June 12, 2026"
    >
      <section>
        <p>
          This Privacy Policy explains how <strong>Tacticx</strong>, operated by Netzil (Enrick
          Bilba, Guadeloupe, France), collects, uses and protects your data when you use the mobile
          app and this website. By using Tacticx, you agree to the practices described below. A
          French version is available on the{' '}
          <a href="/confidentialite">Politique de confidentialité</a> page.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">01</span>Data we collect
        </h2>
        <h3>Account</h3>
        <ul>
          <li>
            <strong>Email</strong> — when you create an account or join the waitlist.
          </li>
          <li>
            <strong>SSO identifier</strong> — if you sign in with Apple or Google, we receive a
            unique identifier and your email address.
          </li>
          <li>
            <strong>Display name &amp; avatar</strong> — optional, for the community feed.
          </li>
        </ul>
        <h3>Content</h3>
        <ul>
          <li>Teams you create, save or publish.</li>
          <li>Your likes and comments on published teams.</li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>Device type, OS version and anonymous diagnostic identifiers.</li>
          <li>Advertising identifiers managed by AdMob (see Advertising).</li>
        </ul>
      </section>

      <section>
        <h2>
          <span className="ix">02</span>How we use data
        </h2>
        <ul>
          <li>Provide and sync your teams across devices.</li>
          <li>Power the community feed and moderation.</li>
          <li>Manage your VIP subscription through RevenueCat.</li>
          <li>Improve app stability and performance.</li>
          <li>Contact you about the beta or important updates.</li>
        </ul>
        <p>
          We never sell your personal data. Guest mode works without an account and collects no
          identifying information.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">03</span>Advertising &amp; subscription
        </h2>
        <p>
          The free version shows ads via <strong>Google AdMob</strong>, which may use an advertising
          identifier to serve relevant ads. The <strong>VIP</strong> subscription removes all ads;
          payments and entitlements are handled by <strong>RevenueCat</strong> and the Apple App
          Store / Google Play. We never store payment card data.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">04</span>Third-party sharing
        </h2>
        <ul>
          <li>
            <strong>Apple / Google</strong> — SSO authentication and in-app payments.
          </li>
          <li>
            <strong>RevenueCat</strong> — subscription management.
          </li>
          <li>
            <strong>Google AdMob</strong> — ad delivery (free version).
          </li>
          <li>
            <strong>Hosting provider</strong> — EU-based servers for data storage.
          </li>
        </ul>
      </section>

      <section>
        <h2>
          <span className="ix">05</span>Your rights
        </h2>
        <p>
          Under the GDPR you have the right to access, rectify, erase, port and object to the
          processing of your data. You can delete your account from within the app at any time — all
          associated data is then erased.
        </p>
        <div className="doc-card">
          <div className="doc-card-title">Exercise your rights</div>
          <p>Email us and we will respond within 30 days.</p>
          <div className="doc-contact">
            <a href="mailto:privacy@tacticx.app">
              <IconMail />
              privacy@tacticx.app
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2>
          <span className="ix">06</span>Children
        </h2>
        <p>
          Tacticx is not directed to children under 13. We do not knowingly collect personal data
          from children under 13. If you believe a child has provided us data, contact us and we
          will delete it.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">07</span>Changes
        </h2>
        <p>
          We may update this policy. Material changes will be announced in the app. The last-updated
          date appears at the top of this page.
        </p>
      </section>
    </DocShell>
  )
}
