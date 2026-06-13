import DocShell from '~/components/landing/doc_shell'
import { IconMail } from '~/components/landing/icons'

export default function Confidentialite() {
  return (
    <DocShell
      title="Politique de confidentialité — Tacticx"
      metaDescription="Comment Tacticx collecte, utilise et protège vos données personnelles."
      heading="Politique de confidentialité"
      updated="12 juin 2026"
    >
      <section>
        <p>
          Cette politique décrit comment <strong>Tacticx</strong>, édité par Netzil (Enrick Bilba,
          Guadeloupe), collecte, utilise et protège vos données lorsque vous utilisez l'application
          mobile et ce site. En utilisant Tacticx, vous acceptez les pratiques décrites ci-dessous.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">01</span>Données que nous collectons
        </h2>
        <h3>Compte</h3>
        <ul>
          <li>
            <strong>Email</strong> — lors de la création d'un compte ou de l'inscription à la liste
            d'attente.
          </li>
          <li>
            <strong>Identifiant SSO</strong> — si vous vous connectez via Apple ou Google, nous
            recevons un identifiant unique et votre email.
          </li>
          <li>
            <strong>Pseudo &amp; avatar</strong> — facultatifs, pour le feed communautaire.
          </li>
        </ul>
        <h3>Contenu</h3>
        <ul>
          <li>Les équipes que vous créez, sauvegardez ou publiez.</li>
          <li>Vos likes et commentaires sur les équipes publiées.</li>
        </ul>
        <h3>Données techniques</h3>
        <ul>
          <li>Type d'appareil, version de l'OS et identifiants de diagnostic anonymes.</li>
          <li>Identifiants publicitaires gérés par AdMob (voir section Publicité).</li>
        </ul>
      </section>

      <section>
        <h2>
          <span className="ix">02</span>Utilisation des données
        </h2>
        <ul>
          <li>Fournir et synchroniser vos équipes entre vos appareils.</li>
          <li>Faire fonctionner le feed communautaire et la modération.</li>
          <li>Gérer votre abonnement VIP via RevenueCat.</li>
          <li>Améliorer la stabilité et les performances de l'application.</li>
          <li>Vous contacter au sujet de la bêta ou de mises à jour importantes.</li>
        </ul>
        <p>
          Nous ne vendons jamais vos données personnelles. Le mode invité fonctionne sans compte et
          ne collecte aucune donnée identifiante.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">03</span>Publicité &amp; abonnement
        </h2>
        <p>
          La version gratuite affiche des publicités via <strong>Google AdMob</strong>, qui peut
          utiliser un identifiant publicitaire pour proposer des annonces pertinentes. L'abonnement{' '}
          <strong>VIP</strong> retire toute publicité ; les paiements et droits sont gérés par{' '}
          <strong>RevenueCat</strong> et les boutiques Apple App Store / Google Play. Nous ne
          stockons aucune donnée de carte bancaire.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">04</span>Partage avec des tiers
        </h2>
        <ul>
          <li>
            <strong>Apple / Google</strong> — authentification SSO et paiements in-app.
          </li>
          <li>
            <strong>RevenueCat</strong> — gestion des abonnements.
          </li>
          <li>
            <strong>Google AdMob</strong> — diffusion publicitaire (version gratuite).
          </li>
          <li>
            <strong>Hébergeur</strong> — serveurs situés en Europe pour le stockage des données.
          </li>
        </ul>
      </section>

      <section>
        <h2>
          <span className="ix">05</span>Vos droits (RGPD)
        </h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de
          portabilité et d'opposition sur vos données. Vous pouvez supprimer votre compte depuis
          l'application à tout moment — toutes vos données associées sont alors effacées.
        </p>
        <div className="doc-card">
          <div className="doc-card-title">Exercer vos droits</div>
          <p>Écrivez-nous, nous répondons sous 30 jours.</p>
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
          <span className="ix">06</span>Conservation &amp; sécurité
        </h2>
        <p>
          Vos données sont conservées tant que votre compte est actif. Les communications sont
          chiffrées en transit (HTTPS) et les mots de passe sont hachés. Nous appliquons des mesures
          techniques et organisationnelles raisonnables pour protéger vos informations.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">07</span>Modifications
        </h2>
        <p>
          Cette politique peut évoluer. Toute modification importante sera signalée dans
          l'application. La date de dernière mise à jour figure en haut de cette page.
        </p>
      </section>
    </DocShell>
  )
}
