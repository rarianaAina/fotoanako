interface ConfigurationErrorProps {
  missing: string[];
}

/**
 * Écran affiché quand les variables d'environnement manquent.
 *
 * Volontairement sans dépendance : ni Tailwind, ni composant d'interface, ni
 * accès à la base. Il doit s'afficher précisément dans le cas où le reste de
 * l'application ne peut pas démarrer.
 *
 * Il s'adresse à la personne qui déploie, pas au visiteur — d'où les noms de
 * variables et la marche à suivre en clair.
 */
export default function ConfigurationError({ missing }: ConfigurationErrorProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#faf8f5',
        color: '#2a2520',
      }}
    >
      <div style={{ maxWidth: '34rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a8f80' }}>
          Configuration incomplète
        </p>
        <h1 style={{ fontSize: '1.6rem', margin: '0.5rem 0 1rem', fontWeight: 600 }}>
          L'application n'est pas reliée à sa base de données
        </h1>

        <p style={{ lineHeight: 1.6, color: '#5c5347' }}>
          {missing.length > 1 ? 'Les variables suivantes sont absentes' : 'La variable suivante est absente'} du
          build :
        </p>
        <ul style={{ lineHeight: 1.9, color: '#5c5347' }}>
          {missing.map((name) => (
            <li key={name}>
              <code style={{ background: '#efe9e1', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{name}</code>
            </li>
          ))}
        </ul>

        <p style={{ lineHeight: 1.6, color: '#5c5347', marginTop: '1.5rem' }}>
          Ces valeurs sont intégrées au moment de la construction, pas au
          chargement de la page. Les ajouter à l'hébergeur ne suffit donc pas :
          <strong> il faut relancer un déploiement</strong> pour qu'elles soient
          prises en compte.
        </p>

        <p style={{ lineHeight: 1.6, color: '#5c5347' }}>
          Sur Vercel : <em>Settings → Environment Variables</em>, puis
          <em> Deployments → ⋯ → Redeploy</em>. En local : renseignez le fichier{' '}
          <code style={{ background: '#efe9e1', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>.env</code> à la
          racine du projet.
        </p>
      </div>
    </div>
  );
}