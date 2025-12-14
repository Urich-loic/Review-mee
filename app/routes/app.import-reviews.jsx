import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import Papa from "papaparse";
import prisma from "../db.server";
import { useActionData, useNavigation, useSubmit } from "react-router";

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const csvData = formData.get("csvData");
  const autoPublish = formData.get("autoPublish") === "true";
  const updateExisting = formData.get("updateExisting") === "true";

  if (!csvData) {
    return { error: "No CSV data provided", status: 400 };
  }

  try {
    const rows = JSON.parse(csvData);

    const results = {
      total: rows.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        if (
          !row.productId ||
          !row.rating ||
          !row.customerName ||
          !row.content
        ) {
          results.skipped++;
          results.errors.push({
            row: i + 2,
            error: "Champs requis manquants",
          });
          continue;
        }

        const rating = parseInt(row.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          results.skipped++;
          results.errors.push({
            row: i + 2,
            error: "La note doit être entre 1 et 5",
          });
          continue;
        }

        let images = null;
        if (row.images) {
          try {
            images =
              typeof row.images === "string"
                ? row.images
                : JSON.stringify(row.images);
          } catch (e) {}
        }

        const reviewData = {
          shop: session.shop,
          productId: row.productId.toString(),
          variantId: row.variantId ? row.variantId.toString() : null,
          customerId: row.customerId ? row.customerId.toString() : null,
          customerName: row.customerName.trim(),
          customerEmail: row.customerEmail ? row.customerEmail.trim() : "",
          rating: rating,
          title: row.title ? row.title.trim() : null,
          content: row.content.trim(),
          images: images,
          verified:
            row.verified === "true" ||
            row.verified === "1" ||
            row.verified === true,
          published: autoPublish,
          createdAt: row.date ? new Date(row.date) : new Date(),
        };

        if (updateExisting && row.customerEmail) {
          const existing = await prisma.review.findFirst({
            where: {
              shop: session.shop,
              productId: reviewData.productId,
              customerEmail: reviewData.customerEmail,
            },
          });

          if (existing) {
            await prisma.review.update({
              where: { id: existing.id },
              data: reviewData,
            });
            results.updated++;
            continue;
          }
        }

        await prisma.review.create({ data: reviewData });
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
      message: `${results.imported} créés, ${results.updated} mis à jour, ${results.skipped} ignorés`,
    };
  } catch (error) {
    console.error("Import error:", error);
    return{
        error: "Erreur lors de l'import: " + error.message,
        status: 500
      }
    ;
  }
}

export default function ImportReviews() {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [autoPublish, setAutoPublish] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Validation côté client
  const validateData = (data) => {
    const errors = [];
    data.forEach((row, idx) => {
      if (!row.productId) {
        errors.push({
          row: idx + 2,
          field: "productId",
          message: "ID produit manquant",
        });
      }
      if (!row.rating) {
        errors.push({
          row: idx + 2,
          field: "rating",
          message: "Note manquante",
        });
      }
      if (!row.customerName) {
        errors.push({
          row: idx + 2,
          field: "customerName",
          message: "Nom client manquant",
        });
      }
      if (!row.content) {
        errors.push({
          row: idx + 2,
          field: "content",
          message: "Contenu manquant",
        });
      }

      const rating = parseInt(row.rating);
      if (row.rating && (isNaN(rating) || rating < 1 || rating > 5)) {
        errors.push({
          row: idx + 2,
          field: "rating",
          message: "Note invalide (doit être 1-5)",
        });
      }
    });
    return errors;
  };

  // Gérer le changement de fichier
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Veuillez sélectionner un fichier CSV valide");
      return;
    }

    setFile(selectedFile);
    setParsedData(null);
    setValidationErrors([]);

    // Parser avec Papaparse
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        setParsedData(results.data);
        setParseErrors(results.errors);
        const errors = validateData(results.data);
        setValidationErrors(errors);

        // Passer à l'étape 2 si tout est ok
        if (results.data.length > 0 && errors.length === 0) {
          setCurrentStep(2);
        }
      },
      error: (error) => {
        alert("Erreur lors de la lecture: " + error.message);
      },
    });
  }, []);

  // Soumettre l'import
  const handleSubmit = useCallback(() => {
    if (!parsedData || validationErrors.length > 0) return;

    const formData = new FormData();
    formData.append("csvData", JSON.stringify(parsedData));
    formData.append("autoPublish", autoPublish.toString());
    formData.append("updateExisting", updateExisting.toString());
    submit(formData, { method: "post" });
    setCurrentStep(4);
  }, [parsedData, autoPublish, updateExisting, submit, validationErrors]);

  // Télécharger le template
  const downloadTemplate = () => {
    const template = `productId,rating,customerName,customerEmail,title,content,verified,date,images
9876543210,5,Jean Dupont,jean@example.com,Excellent produit !,J'adore ce produit. Qualité exceptionnelle.,true,2024-01-15,
9876543210,4,Marie Martin,marie@example.com,Très bien,Bon produit mais un peu cher.,false,2024-01-16,"[""https://example.com/photo1.jpg""]"
9876543210,3,Pierre Dubois,pierre@example.com,,Correct sans plus.,false,2024-01-17,`;

    const blob = new Blob(["\uFEFF" + template], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-import-avis.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Réinitialiser l'import
  const resetImport = () => {
    setFile(null);
    setParsedData(null);
    setParseErrors([]);
    setValidationErrors([]);
    setCurrentStep(1);
  };

  return (
    <>
      <style>{`
        .import-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .progress-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          position: relative;
        }

        .progress-bar::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: #e5e7eb;
          z-index: 0;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s;
        }

        .step-circle.active {
          background: #000;
          color: #fff;
          border-color: #000;
          transform: scale(1.1);
        }

        .step-circle.completed {
          background: #10b981;
          color: #fff;
          border-color: #10b981;
        }

        .step-label {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-align: center;
        }

        .step-label.active {
          color: #000;
          font-weight: 600;
        }

        .upload-zone {
          border: 3px dashed #d1d5db;
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          background: #fafafa;
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
        }

        .upload-zone:hover {
          border-color: #000;
          background: #f5f5f5;
        }

        .upload-zone.active {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
        }

        .stat-card.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card.info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .preview-table thead {
          background: #f9fafb;
        }

        .preview-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .preview-table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .preview-table tr:hover {
          background: #f9fafb;
        }

        .error-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #fee;
          color: #dc2626;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .validation-summary {
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }

        .validation-summary.error {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .validation-summary.success {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
        }

        .btn-primary {
          background: #000;
          color: #fff;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1f2937;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-animation {
          text-align: center;
          padding: 40px;
        }

        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: inline-block;
          background: #10b981;
          position: relative;
          animation: scaleIn 0.5s ease-in-out;
        }

        .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          color: white;
          font-weight: bold;
        }

        @keyframes scaleIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .progress-bar {
            font-size: 12px;
          }

          .step-circle {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
        }
      `}</style>

      <s-page title="Importer des Avis">
        <div className="import-container">
          {/* Barre de progression */}
          <div className="progress-bar">
            <div className="progress-step">
              <div
                className={`step-circle ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span
                className={`step-label ${currentStep === 1 ? "active" : ""}`}
              >
                Charger le fichier
              </span>
            </div>

            <div className="progress-step">
              <div
                className={`step-circle ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span
                className={`step-label ${currentStep === 2 ? "active" : ""}`}
              >
                Vérifier les données
              </span>
            </div>

            <div className="progress-step">
              <div
                className={`step-circle ${currentStep >= 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}
              >
                {currentStep > 3 ? "✓" : "3"}
              </div>
              <span
                className={`step-label ${currentStep === 3 ? "active" : ""}`}
              >
                Configurer
              </span>
            </div>

            <div className="progress-step">
              <div
                className={`step-circle ${currentStep >= 4 ? "active" : ""}`}
              >
                4
              </div>
              <span
                className={`step-label ${currentStep === 4 ? "active" : ""}`}
              >
                Importer
              </span>
            </div>
          </div>

          {/* ÉTAPE 1 : Upload */}
          {currentStep === 1 && (
            <s-layout>
              <s-layout-section>
                <s-card>
                  <s-box padding="600">
                    <s-stack vertical spacing="400">
                      <div style={{ textAlign: "center" }}>
                        <s-text variant="headingLg">
                          📥 Téléchargez votre fichier CSV
                        </s-text>
                        <s-text variant="bodyMd" tone="subdued">
                          Importez plusieurs avis en une seule fois
                        </s-text>
                      </div>

                      <label htmlFor="file-upload">
                        <div className={`upload-zone ${file ? "active" : ""}`}>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                          <div className="upload-icon">
                            {file ? "✅" : "📂"}
                          </div>
                          <s-text variant="headingMd">
                            {file
                              ? file.name
                              : "Cliquez pour sélectionner un fichier CSV"}
                          </s-text>
                          <s-text variant="bodyMd" tone="subdued">
                            {file
                              ? `${(file.size / 1024).toFixed(2)} KB`
                              : "ou glissez-déposez votre fichier ici"}
                          </s-text>
                        </div>
                      </label>

                      {parseErrors.length > 0 && (
                        <div className="validation-summary error">
                          <s-text variant="bodyMd" fontWeight="semibold">
                            ⚠️ {parseErrors.length} erreur(s) de parsing
                            détectée(s)
                          </s-text>
                        </div>
                      )}

                      {validationErrors.length > 0 && (
                        <div className="validation-summary error">
                          <s-text variant="bodyMd" fontWeight="semibold">
                            ❌ {validationErrors.length} erreur(s) de validation
                          </s-text>
                          <div
                            style={{
                              marginTop: "12px",
                              maxHeight: "150px",
                              overflow: "auto",
                            }}
                          >
                            {validationErrors.slice(0, 5).map((err, idx) => (
                              <div
                                key={idx}
                                style={{ fontSize: "13px", marginTop: "4px" }}
                              >
                                • Ligne {err.row}: {err.message}
                              </div>
                            ))}
                            {validationErrors.length > 5 && (
                              <div
                                style={{
                                  fontSize: "13px",
                                  marginTop: "4px",
                                  fontStyle: "italic",
                                }}
                              >
                                ... et {validationErrors.length - 5} autres
                                erreurs
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <s-divider />

                      <s-stack spacing="200">
                        <button
                          className="btn btn-secondary"
                          onClick={downloadTemplate}
                        >
                          📄 Télécharger le Template
                        </button>
                        <s-text variant="bodySm" tone="subdued">
                          Téléchargez notre modèle pour voir le format attendu
                        </s-text>
                      </s-stack>
                    </s-stack>
                  </s-box>
                </s-card>
              </s-layout-section>

              <s-layout-section>
                <s-card>
                  <s-box padding="400">
                    <s-stack vertical spacing="300">
                      <s-text variant="headingMd">💡 Colonnes requises</s-text>
                      <s-grid columns="2">
                        <div>
                          <s-text variant="bodyMd" fontWeight="semibold">
                            • productId *
                          </s-text>
                          <s-text variant="bodySm" tone="subdued">
                            ID du produit Shopify
                          </s-text>
                        </div>
                        <div>
                          <s-text variant="bodyMd" fontWeight="semibold">
                            • rating *
                          </s-text>
                          <s-text variant="bodySm" tone="subdued">
                            Note de 1 à 5
                          </s-text>
                        </div>
                        <div>
                          <s-text variant="bodyMd" fontWeight="semibold">
                            • customerName *
                          </s-text>
                          <s-text variant="bodySm" tone="subdued">
                            Nom du client
                          </s-text>
                        </div>
                        <div>
                          <s-text variant="bodyMd" fontWeight="semibold">
                            • content *
                          </s-text>
                          <s-text variant="bodySm" tone="subdued">
                            Texte de l'avis
                          </s-text>
                        </div>
                      </s-grid>
                    </s-stack>
                  </s-box>
                </s-card>
              </s-layout-section>
            </s-layout>
          )}

          {/* ÉTAPE 2 : Prévisualisation */}
          {currentStep === 2 && parsedData && (
            <s-layout>
              <s-layout-section>
                <s-card>
                  <s-box padding="400">
                    <s-stack vertical spacing="400">
                      <div style={{ textAlign: "center" }}>
                        <s-text variant="headingLg">
                          👀 Aperçu de vos données
                        </s-text>
                        <s-text variant="bodyMd" tone="subdued">
                          Vérifiez que tout est correct avant de continuer
                        </s-text>
                      </div>

                      <div className="stats-grid">
                        <div className="stat-card info">
                          <div className="stat-value">{parsedData.length}</div>
                          <div className="stat-label">Avis trouvés</div>
                        </div>
                        <div className="stat-card success">
                          <div className="stat-value">
                            {parsedData.length - validationErrors.length}
                          </div>
                          <div className="stat-label">Avis valides</div>
                        </div>
                        <div className="stat-card warning">
                          <div className="stat-value">
                            {validationErrors.length}
                          </div>
                          <div className="stat-label">Erreurs</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">
                            {Object.keys(parsedData[0] || {}).length}
                          </div>
                          <div className="stat-label">Colonnes</div>
                        </div>
                      </div>

                      {validationErrors.length === 0 && (
                        <div className="validation-summary success">
                          <s-text variant="bodyMd" fontWeight="semibold">
                            ✅ Toutes les données sont valides !
                          </s-text>
                        </div>
                      )}

                      <div style={{ overflow: "auto" }}>
                        <table className="preview-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              {Object.keys(parsedData[0] || {}).map((key) => (
                                <th key={key}>{key}</th>
                              ))}
                              <th>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.slice(0, 10).map((row, idx) => {
                              const rowError = validationErrors.find(
                                (e) => e.row === idx + 2,
                              );
                              return (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  {Object.values(row).map((value, i) => (
                                    <td key={i}>
                                      {String(value).substring(0, 40)}
                                      {String(value).length > 40 && "..."}
                                    </td>
                                  ))}
                                  <td>
                                    {rowError ? (
                                      <span className="error-badge">
                                        ❌ Erreur
                                      </span>
                                    ) : (
                                      <span style={{ color: "#10b981" }}>
                                        ✓
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {parsedData.length > 10 && (
                        <s-text
                          variant="bodySm"
                          tone="subdued"
                          style={{ textAlign: "center" }}
                        >
                          Affichage des 10 premières lignes sur{" "}
                          {parsedData.length}
                        </s-text>
                      )}

                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={resetImport}
                        >
                          ← Changer de fichier
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => setCurrentStep(3)}
                          disabled={validationErrors.length > 0}
                        >
                          Continuer →
                        </button>
                      </div>
                    </s-stack>
                  </s-box>
                </s-card>
              </s-layout-section>
            </s-layout>
          )}
        </div>
      </s-page>
    </>
  );
}
