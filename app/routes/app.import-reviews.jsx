import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useActionData, useNavigation, useSubmit } from "react-router";

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const csvData = formData.get("csvData");
  const autoPublish = formData.get("autoPublish") === "true";

  if (!csvData) {
    return ({ error: "No CSV data provided" }, { status: 400 });
  }

  try {
    // Parser le CSV
    const rows = parseCSV(csvData);

    // Valider et importer
    const results = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Validation
        if (
          !row.productId ||
          !row.rating ||
          !row.customerName ||
          !row.content
        ) {
          results.skipped++;
          results.errors.push({
            row: i + 2, // +2 car ligne 1 = headers et index commence à 0
            error:
              "Champs requis manquants (productId, rating, customerName, content)",
          });
          continue;
        }

        // Vérifier que la note est entre 1 et 5
        const rating = parseInt(row.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          results.skipped++;
          results.errors.push({
            row: i + 2,
            error: "La note doit être entre 1 et 5",
          });
          continue;
        }

        // Créer l'avis
        await prisma.review.create({
          data: {
            shop: session.shop,
            productId: row.productId.toString(),
            variantId: row.variantId ? row.variantId.toString() : null,
            customerId: row.customerId ? row.customerId.toString() : null,
            customerName: row.customerName,
            customerEmail: row.customerEmail || "",
            rating: rating,
            title: row.title || null,
            content: row.content,
            images: row.images || null, // Format JSON: ["url1", "url2"]
            verified: row.verified === "true" || row.verified === "1",
            published: autoPublish,
            createdAt: row.date ? new Date(row.date) : new Date(),
          },
        });

        results.imported++;
      } catch (error) {
        results.skipped++;
        results.errors.push({
          row: i + 2,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      results,
      message: `${results.imported} avis importés sur ${results.total}`,
    };
  } catch (error) {
    console.error("Import error:", error);
    return (
      {
        error: "Erreur lors de l'import: " + error.message,
      },
      { status: 500 }
    );
  }
}

// Parser CSV simple
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index]
        ? values[index].trim().replace(/^"|"$/g, "")
        : "";
    });

    rows.push(row);
  }

  return rows;
}

// Parser une ligne CSV en gérant les guillemets
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

export default function ImportReviews() {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [file, setFile] = useState(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [preview, setPreview] = useState(null);

  // Gérer la sélection de fichier
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);

      // Prévisualiser le CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split("\n").slice(0, 6); // Premières 5 lignes + header
        setPreview(lines.join("\n"));
      };
      reader.readAsText(selectedFile);
    } else {
      alert("Veuillez sélectionner un fichier CSV valide");
    }
  }, []);

  // Gérer la soumission
  const handleSubmit = useCallback(() => {
    if (!file) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const formData = new FormData();
      formData.append("csvData", event.target.result);
      formData.append("autoPublish", autoPublish.toString());
      submit(formData, { method: "post" });
    };
    reader.readAsText(file);
  }, [file, autoPublish, submit]);

  // Télécharger le template CSV
  const downloadTemplate = () => {
    const template = `productId,rating,customerName,customerEmail,title,content,verified,date,images
9876543210,5,Jean Dupont,jean@example.com,Excellent produit !,J'adore ce produit. Qualité exceptionnelle et livraison rapide.,true,2024-01-15,
9876543210,4,Marie Martin,marie@example.com,Très bien,Bon produit mais un peu cher.,false,2024-01-16,"[""https://example.com/photo1.jpg"",""https://example.com/photo2.jpg""]"
9876543210,3,Pierre Dubois,pierre@example.com,,Correct sans plus.,false,2024-01-17,`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-import-avis.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {actionData?.success && (
        <s-toast open duration={5000} tone="success">
          {actionData.message}
        </s-toast>
      )}

      {actionData?.error && (
        <s-toast open duration={5000} tone="critical">
          {actionData.error}
        </s-toast>
      )}

      <s-page title="Importer des Avis">
        <s-page-actions slot="actions">
          <s-button onClick={() => window.history.back()}>Retour</s-button>
        </s-page-actions>

        <s-layout>
          {/* Instructions */}
          <s-layout-section>
            <s-card>
              <s-box padding="400">
                <s-stack vertical spacing="400">
                  <s-text variant="headingMd">📋 Instructions d'Import</s-text>

                  <s-stack vertical spacing="200">
                    <s-text variant="bodyMd">
                      <strong>1.</strong> Téléchargez le template CSV ci-dessous
                    </s-text>
                    <s-text variant="bodyMd">
                      <strong>2.</strong> Remplissez-le avec vos avis
                    </s-text>
                    <s-text variant="bodyMd">
                      <strong>3.</strong> Importez le fichier CSV
                    </s-text>
                  </s-stack>

                  <s-button onClick={downloadTemplate}>
                    📥 Télécharger le Template CSV
                  </s-button>
                </s-stack>
              </s-box>
            </s-card>
          </s-layout-section>

          {/* Format du CSV */}
          <s-layout-section>
            <s-card>
              <s-box padding="400">
                <s-stack vertical spacing="400">
                  <s-text variant="headingMd">📊 Format du Fichier CSV</s-text>

                  <s-text variant="bodyMd">
                    Votre fichier CSV doit contenir les colonnes suivantes :
                  </s-text>

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "16px",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                    }}
                  >
                    <div>
                      <strong>productId</strong> * - ID du produit Shopify
                    </div>
                    <div>
                      <strong>rating</strong> * - Note (1 à 5)
                    </div>
                    <div>
                      <strong>customerName</strong> * - Nom du client
                    </div>
                    <div>
                      <strong>customerEmail</strong> - Email du client
                    </div>
                    <div>
                      <strong>title</strong> - Titre de l'avis
                    </div>
                    <div>
                      <strong>content</strong> * - Contenu de l'avis
                    </div>
                    <div>
                      <strong>verified</strong> - Achat vérifié (true/false)
                    </div>
                    <div>
                      <strong>date</strong> - Date (YYYY-MM-DD)
                    </div>
                    <div>
                      <strong>images</strong> - URLs des images (format JSON)
                    </div>
                  </div>

                  <s-text variant="bodySm" tone="subdued">
                    * Champs obligatoires
                  </s-text>
                </s-stack>
              </s-box>
            </s-card>
          </s-layout-section>

          {/* Upload du fichier */}
          <s-layout-section>
            <s-card>
              <s-box padding="400">
                <s-stack vertical spacing="400">
                  <s-text variant="headingMd">📤 Importer le Fichier</s-text>

                  <div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      style={{
                        padding: "12px",
                        border: "2px dashed #d1d5db",
                        borderRadius: "8px",
                        width: "100%",
                        cursor: "pointer",
                      }}
                    />
                  </div>

                  {file && (
                    <s-banner tone="info">
                      <s-text>
                        Fichier sélectionné : <strong>{file.name}</strong> (
                        {(file.size / 1024).toFixed(2)} KB)
                      </s-text>
                    </s-banner>
                  )}

                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={autoPublish}
                        onChange={(e) => setAutoPublish(e.target.checked)}
                      />
                      <s-text variant="bodyMd">
                        Publier automatiquement les avis importés
                      </s-text>
                    </label>
                  </div>

                  <s-button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!file || isSubmitting}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? "Import en cours..." : "Importer les Avis"}
                  </s-button>
                </s-stack>
              </s-box>
            </s-card>
          </s-layout-section>

          {/* Prévisualisation */}
          {preview && (
            <s-layout-section>
              <s-card>
                <s-box padding="400">
                  <s-stack vertical spacing="300">
                    <s-text variant="headingMd">👀 Prévisualisation</s-text>
                    <s-text variant="bodySm" tone="subdued">
                      Premières lignes du fichier :
                    </s-text>
                    <pre
                      style={{
                        background: "#f9fafb",
                        padding: "16px",
                        borderRadius: "8px",
                        overflow: "auto",
                        fontSize: "12px",
                        fontFamily: "monospace",
                      }}
                    >
                      {preview}
                    </pre>
                  </s-stack>
                </s-box>
              </s-card>
            </s-layout-section>
          )}

          {/* Résultats de l'import */}
          {actionData?.results && (
            <s-layout-section>
              <s-card>
                <s-box padding="400">
                  <s-stack vertical spacing="400">
                    <s-text variant="headingMd">
                      ✅ Résultats de l'Import
                    </s-text>

                    <s-grid columns="3">
                      <div
                        style={{
                          textAlign: "center",
                          padding: "16px",
                          background: "#f0fdf4",
                          borderRadius: "8px",
                        }}
                      >
                        <s-text variant="heading2xl">
                          {actionData.results.imported}
                        </s-text>
                        <s-text variant="bodyMd" tone="subdued">
                          Importés
                        </s-text>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "16px",
                          background: "#fef3c7",
                          borderRadius: "8px",
                        }}
                      >
                        <s-text variant="heading2xl">
                          {actionData.results.skipped}
                        </s-text>
                        <s-text variant="bodyMd" tone="subdued">
                          Ignorés
                        </s-text>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "16px",
                          background: "#f3f4f6",
                          borderRadius: "8px",
                        }}
                      >
                        <s-text variant="heading2xl">
                          {actionData.results.total}
                        </s-text>
                        <s-text variant="bodyMd" tone="subdued">
                          Total
                        </s-text>
                      </div>
                    </s-grid>

                    {actionData.results.errors.length > 0 && (
                      <>
                        <s-divider />
                        <s-text variant="headingMd">
                          ⚠️ Erreurs ({actionData.results.errors.length})
                        </s-text>
                        <div style={{ maxHeight: "300px", overflow: "auto" }}>
                          {actionData.results.errors.map((err, idx) => (
                            <s-banner
                              key={idx}
                              tone="warning"
                              style={{ marginBottom: "8px" }}
                            >
                              <s-text variant="bodySm">
                                <strong>Ligne {err.row}:</strong> {err.error}
                              </s-text>
                            </s-banner>
                          ))}
                        </div>
                      </>
                    )}

                    <s-button
                      onClick={() => (window.location.href = "/app/reviews")}
                    >
                      Voir les Avis Importés
                    </s-button>
                  </s-stack>
                </s-box>
              </s-card>
            </s-layout-section>
          )}

          {/* Conseils */}
          <s-layout-section>
            <s-card>
              <s-box padding="400">
                <s-stack vertical spacing="300">
                  <s-text variant="headingMd">💡 Conseils</s-text>
                  <s-stack vertical spacing="200">
                    <s-text variant="bodyMd">
                      • Assurez-vous que les ID produits correspondent à ceux de
                      votre boutique Shopify
                    </s-text>
                    <s-text variant="bodyMd">
                      • Pour les images, utilisez le format JSON: ["url1",
                      "url2"]
                    </s-text>
                    <s-text variant="bodyMd">
                      • Les dates doivent être au format YYYY-MM-DD (ex:
                      2024-01-15)
                    </s-text>
                    <s-text variant="bodyMd">
                      • Si un avis contient des virgules ou des guillemets,
                      entourez le champ de guillemets
                    </s-text>
                    <s-text variant="bodyMd">
                      • Testez d'abord avec un petit fichier avant d'importer en
                      masse
                    </s-text>
                  </s-stack>
                </s-stack>
              </s-box>
            </s-card>
          </s-layout-section>
        </s-layout>
      </s-page>
    </>
  );
}
