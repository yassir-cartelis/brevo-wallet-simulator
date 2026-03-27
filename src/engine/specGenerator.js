import { getMappingGroup } from '../data/cwSchema.js'

export function generateMarkdownSpec({ projectName, accountId, projectId, environment, baseApiUrl, tokenEndpoint, updateEndpoint, userIdentifier, siFields, mappings, payload }) {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const envLabel = environment === 'DEV' ? 'Qualification (DEV)' : 'Production'

  // Build mapping table rows (active fields with a mapping)
  const mappedFields = siFields.filter(f => f.active && mappings[f.id])
  const mappingRows = mappedFields.map(f => {
    const path = mappings[f.id]
    const group = getMappingGroup(path) || 'root'
    const isRequired = path === 'identifier'
    return `| \`${f.name}\` | \`${f.type}\` | \`${path}\` | \`${group}\` | ${isRequired ? '**Oui**' : ''} | \`${f.value}\` |`
  }).join('\n')

  // Build payload example
  const payloadJson = JSON.stringify(payload, null, 2)

  // Build counters section if present
  const hasCounters = Array.isArray(payload.counters) && payload.counters.length > 0
  const hasMetadatas = payload.metadatas && Object.keys(payload.metadatas).length > 0

  const metaSection = hasMetadatas ? `
Le champ \`metadatas\` est un dictionnaire libre clé/valeur :

\`\`\`json
"metadatas": ${JSON.stringify(payload.metadatas, null, 2)}
\`\`\`
` : ''

  const countersSection = hasCounters ? `
Le champ \`counters\` est un tableau de compteurs numériques :

\`\`\`json
"counters": ${JSON.stringify(payload.counters, null, 2)}
\`\`\`

> Chaque compteur est identifié par son \`identifier\` (ex: \`points\`, \`visits\`). La valeur est toujours une chaîne de caractères.
` : ''

  return `# Spécification d'intégration — Captain Wallet by Brevo

**Projet :** ${projectName || 'Non défini'}
**Account ID :** \`${accountId}\`
**Project ID :** \`${projectId}\`
**Environnement :** ${envLabel}
**Identifiant de test :** \`${userIdentifier}\`
**Généré le :** ${date}

---

## 1. Authentification — OAuth2 Client Credentials

L'API Captain Wallet utilise le protocole **OAuth2 Client Credentials** pour sécuriser les appels machine-to-machine. Votre SI doit obtenir un token Bearer avant chaque session d'appels (ou le renouveler à expiration).

### 1.1 Obtention du token

**Endpoint :**
\`\`\`
POST ${tokenEndpoint}
\`\`\`

**Headers :**
\`\`\`
Content-Type: application/x-www-form-urlencoded
\`\`\`

**Corps de la requête :**
\`\`\`
grant_type=client_credentials&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}
\`\`\`

**Réponse :**
\`\`\`json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}
\`\`\`

> Le token est valable **1 heure**. Mettez en place un mécanisme de renouvellement automatique côté SI.

### 1.2 Utilisation du token

Le token doit être transmis dans le header \`Authorization\` de chaque appel API :

\`\`\`
Authorization: Bearer {access_token}
\`\`\`

---

## 2. Encartement — Création de la carte dans le Wallet

L'encartement est le processus par lequel le client final installe sa carte dans Apple Wallet ou Google Wallet. Il se déclenche via un lien (CTA) intégré dans vos communications.

### 2.1 Format de l'URL

\`\`\`
https://${accountId}.captainwallet.com/${projectId}/{campaignId}?user[identifier]={valeur}&channel={canal}&tag={tag}
\`\`\`

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| \`accountId\` | Identifiant de votre compte CW | \`${accountId}\` |
| \`projectId\` | Identifiant du projet / locale | \`${projectId}\` |
| \`campaignId\` | Point d'entrée configuré dans CW | \`loyalty\` |
| \`user[identifier]\` | Identifiant unique du porteur (pivot SI↔CW) | \`${userIdentifier}\` |
| \`channel\` | Canal de diffusion (tracking) | \`email\`, \`sms\`, \`web\` |
| \`tag\` | Campagne (tracking) | \`newsletter_mars\` |

### 2.2 Sécurisation (recommandée)

Pour éviter la fraude (falsification de l'identifiant dans l'URL), deux modes de sécurisation sont disponibles :

**SHA256 + SALT** *(recommandé)*
Ajouter un paramètre \`signature\` calculé côté serveur :
\`\`\`
signature = SHA256(identifier + SALT)
\`\`\`

**AES-256-CBC**
Chiffrement complet du payload de l'URL. Nécessite une clé et un vecteur d'initialisation fournis par Captain Wallet.

---

## 3. Contrat d'interface — Mise à jour du pass-owner

### 3.1 Endpoint

\`\`\`
PUT ${updateEndpoint}
\`\`\`

### 3.2 Headers

| Header | Valeur |
|--------|--------|
| \`Authorization\` | \`Bearer {access_token}\` |
| \`Content-Type\` | \`application/json\` |

### 3.3 Mapping des champs

Le tableau ci-dessous décrit la correspondance entre les champs de votre SI et les champs de l'API Captain Wallet.

| Champ SI | Type | Champ Captain Wallet | Zone | Requis | Valeur exemple |
|----------|------|---------------------|------|--------|----------------|
${mappingRows || '| *(aucun champ mappé)* | | | | | |'}

**Zones disponibles :**
- \`root\` — Champs natifs Captain Wallet (\`identifier\`, \`firstname\`, \`lastname\`, \`email\`, \`store\`)
- \`metadatas\` — Données métier libres (\`metadatas.nomDuChamp\`)
- \`counters\` — Compteurs numériques affichés sur la carte (\`counters.points\`)
${metaSection}${countersSection}

### 3.4 Exemple de payload

\`\`\`json
${payloadJson}
\`\`\`

### 3.5 Réponse en cas de succès (200 OK)

\`\`\`json
{
  "identifier": "${userIdentifier}",
  "updatedAt": "${new Date().toISOString()}",
  "firstname": "...",
  "metadatas": { "...": "..." },
  "counters": [{ "identifier": "points", "value": "1200" }]
}
\`\`\`

---

## 4. Codes de réponse API

| Code | Statut | Cause | Action recommandée |
|------|--------|-------|--------------------|
| \`200\` | OK | Mise à jour réussie | — |
| \`400\` | Bad Request | Payload vide ou mal formé | Vérifier la structure JSON |
| \`401\` | Unauthorized | Token Bearer manquant ou expiré | Renouveler le token OAuth2 |
| \`422\` | Unprocessable Entity | Champ requis manquant (\`identifier\`) ou format invalide (email) | Vérifier les données source |
| \`500\` | Server Error | Erreur interne Captain Wallet | Contacter le support CW |

---

## 5. Notes d'implémentation

- Les mises à jour ne sont propagées aux cartes que si **au moins une donnée a changé** par rapport à la valeur stockée.
- Seuls les porteurs avec \`optinWallet = true\` reçoivent les mises à jour sur leur device.
- Un porteur peut avoir plusieurs cartes actives (multi-appareils) — toutes sont mises à jour simultanément.
- En cas d'erreur réseau, implémenter une **stratégie de retry avec backoff exponentiel** (max 3 tentatives).

---

*Document généré avec **Brevo Wallet Simulator** — ${date}*
`
}
