<?php
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP Backend Gateway</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            padding: 2rem;
            text-align: center;
            background: #f0f2f5;
        }

        .card {
            background: white;
            border: 1px solid #ddd;
            padding: 1.5rem;
            margin: 1rem auto;
            max-width: 600px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }

        .status {
            color: #10b981;
            font-weight: bold;
            background: #d1fae5;
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 99px;
            font-size: 0.9rem;
        }

        .service-list {
            text-align: left;
            margin-top: 1rem;
        }

        .service-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }

        .port {
            font-family: monospace;
            background: #eee;
            padding: 2px 6px;
            border-radius: 4px;
            color: #333;
        }
    </style>
</head>

<body>
    <h1>ERP & Sales Reporting Gateway</h1>
    <div class="card">
        <p class="status">✅ EasyPHP Connecté</p>
        <p>Les services Node.js doivent être démarrés manuellement :</p>

        <div class="service-list">
            <div class="service-item">
                <strong>Backend Core (Commandes/Devis)</strong>
                <span class="port">Port 4000</span>
            </div>
            <div class="service-item">
                <strong>Backend Livraisons</strong>
                <span class="port">Port 5000</span>
            </div>
            <div class="service-item">
                <strong>Backend Reporting</strong>
                <span class="port">Port 3000</span>
            </div>
            <div class="service-item">
                <strong>Frontend ERP</strong>
                <span class="port">Port 5174</span>
            </div>
            <div class="service-item">
                <strong>Frontend Reporting</strong>
                <span class="port">Port 5173</span>
            </div>
        </div>
    </div>
</body>

</html>