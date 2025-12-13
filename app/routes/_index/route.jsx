import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>
          Review-Mee - Gestion des avis clients
        </h1>
        <p className={styles.text}>
          Collectez, modérez et affichez les avis de vos clients
          automatiquement.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Domaine de la boutique</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="ma-boutique.myshopify.com"
              />
              <span>ex: ma-boutique.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Se connecter
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Collecte automatique</strong>. Demandez automatiquement des
            avis après chaque commande validée.
          </li>
          <li>
            <strong>Modération facile</strong>. Approuvez ou rejetez les avis
            depuis un tableau de bord intuitif.
          </li>
          <li>
            <strong>Affichage personnalisé</strong>. Intégrez les avis
            directement sur vos pages produits.
          </li>
        </ul>
      </div>
    </div>
  );
}
