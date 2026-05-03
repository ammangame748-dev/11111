const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blacklist | الموقع الرسمي</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: radial-gradient(circle at center, #1a3a5f 0%, #0a192f 100%);
                color: white;
                font-family: 'Segoe UI', sans-serif;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            .container {
                text-align: center;
                animation: fadeIn 2s ease-in-out;
            }

            h1 {
                font-size: 5rem;
                letter-spacing: 5px;
                text-transform: uppercase;
                background: linear-gradient(to right, #64ffda, #00d2ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
                filter: drop-shadow(0 0 10px rgba(100, 255, 218, 0.3));
            }

            p {
                font-size: 1.2rem;
                color: #8892b0;
                letter-spacing: 2px;
            }

            .glass-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                padding: 40px 60px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .footer {
                position: absolute;
                bottom: 20px;
                font-size: 0.8rem;
                color: #495670;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="glass-card">
                <h1>BLACKLIST</h1>
                <p>COMING SOON | قريباً</p>
            </div>
        </div>
        <div class="footer">© 2024 Blacklist Brand. All rights reserved.</div>
    </body>
    </html>
    `);
});

app.listen(port, () => {
    console.log(`Blacklist site is live on port ${port}`);
});
