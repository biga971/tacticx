import DocShell from '~/components/landing/doc_shell'
import { IconMail } from '~/components/landing/icons'

export default function DeleteAccount() {
  return (
    <DocShell
      title="Suppression de compte — Tacticx"
      metaDescription="Comment demander la suppression de votre compte Tacticx et de toutes les données associées."
      heading="Suppression de compte"
      updated="juin 2026"
    >
      <section>
        <p>
          Conformément au RGPD et aux règles de Google Play, vous pouvez demander la suppression de
          votre compte <strong>Tacticx</strong> et de toutes les données associées. Tacticx est
          édité par Netzil (Enrick Bilba, Les Abymes, Guadeloupe, France).
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">01</span>Comment demander la suppression
        </h2>
        <p>
          Pour supprimer votre compte, envoyez un email à <strong>contact@netzil.fr</strong> avec :
        </p>
        <ul>
          <li>
            Objet : <strong>Suppression de compte Tacticx</strong>
          </li>
          <li>L'adresse email associée à votre compte</li>
          <li>La mention « Je souhaite supprimer mon compte et toutes mes données »</li>
        </ul>
        <p>
          Nous traiterons votre demande dans un délai de <strong>30 jours</strong>.
        </p>
        <div className="doc-card">
          <div className="doc-card-title">Envoyer votre demande</div>
          <p>Un email suffit, nous nous occupons du reste.</p>
          <div className="doc-contact">
            <a href="mailto:contact@netzil.fr?subject=Suppression%20de%20compte%20Tacticx">
              <IconMail />
              contact@netzil.fr
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2>
          <span className="ix">02</span>Données supprimées
        </h2>
        <p>
          Lors de la suppression de votre compte, les données suivantes sont{' '}
          <strong>définitivement supprimées</strong> :
        </p>
        <ul>
          <li>Votre profil utilisateur (nom d'utilisateur, email)</li>
          <li>Vos équipes créées et sauvegardées</li>
          <li>Vos commentaires sur les équipes de la communauté</li>
          <li>Votre historique d'activité dans l'app</li>
        </ul>
      </section>

      <section>
        <h2>
          <span className="ix">03</span>Données conservées
        </h2>
        <p>
          Certaines données peuvent être conservées temporairement pour des raisons légales :
        </p>
        <ul>
          <li>
            Les données de transaction (achats, abonnements) sont conservées <strong>5 ans</strong>{' '}
            conformément aux obligations comptables françaises — elles sont gérées par RevenueCat et
            ne contiennent pas vos données personnelles identifiables.
          </li>
          <li>
            Les données publicitaires sont gérées par Google AdMob et supprimées selon leur propre
            politique de confidentialité.
          </li>
        </ul>
      </section>

      <section>
        <h2>
          <span className="ix">04</span>Suppression partielle des données
        </h2>
        <p>
          Si vous souhaitez supprimer uniquement certaines données sans supprimer votre compte (par
          exemple vos équipes ou vos commentaires), vous pouvez le faire directement depuis
          l'application Tacticx.
        </p>
      </section>

      <section>
        <h2>
          <span className="ix">05</span>Contact
        </h2>
        <p>Pour toute question relative à vos données personnelles :</p>
        <ul>
          <li>
            Email : <strong>contact@netzil.fr</strong>
          </li>
          <li>Éditeur : Enrick Bilba — Netzil, Les Abymes, Guadeloupe, France</li>
        </ul>
      </section>
    </DocShell>
  )
}
