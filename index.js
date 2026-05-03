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
        <title>Blacklist | قريباً</title>
        <style>
            @import url('https://googleapis.com');

            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                /* استخدمت هنا درجات الأزرق العميق من صورتك بالضبط */
                background: linear-gradient(135deg, #001d4a 0%, #00458b 50%, #002d62 100%);
                background-size: 400% 400%;
                animation: deepSeaBreeze 15s ease-in-out infinite; /* حركة هواء عميقة وبطيئة */
                color: white;
                font-family: 'Cairo', sans-serif;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            /* طبقة ضبابية متحركة لتعطي شعور حركة الهواء */
            body::after {
                content: "";
                position: absolute;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle at center, rgba(0, 116, 217, 0.1) 0%, transparent 60%);
                animation: windMove 10s linear infinite alternate;
                z-index: 1;
            }

            .container {
                position: relative;
                z-index: 5;
                text-align: center;
            }

            .glass-card {
                background: rgba(0, 30, 70, 0.4);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                padding: 60px 80px;
                border-radius: 10px;
                border: 1px solid rgba(0, 116, 217, 0.3);
                box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
                transition: 0.5s;
            }

            h1 {
                font-size: clamp(3rem, 10vw, 6rem);
                font-weight: 900;
                letter-spacing: 15px;
                text-transform: uppercase;
                background: linear-gradient(to bottom, #ffffff 30%, #38b6ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 15px rgba(0, 116, 217, 0.5));
            }

            .coming-soon {
                font-size: 1.5rem;
                color: #38b6ff;
                letter-spacing: 8px;
                font-weight: 400;
                opacity: 0.8;
            }

            .coming-soon::after {
                content: "";
                display: block;
                width: 60px;
                height: 2px;
                background: #38b6ff;
                margin: 15px auto;
                animation: expand 2.5s infinite;
            }

            /* أنيميشن الخلفية */
            @keyframes deepSeaBreeze {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes windMove {
                from { transform: translate(-10%, -10%); }
                to { transform: translate(10%, 10%); }
            }

            @keyframes expand {
                0%, 100% { width: 40px; opacity: 0.4; }
                50% { width: 180px; opacity: 1; }
            }

            .particles {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none;
                z-index: 2;
            }

            .footer {
                position: absolute;
                bottom: 30px;
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.3);
                letter-spacing: 4px;
                z-index: 5;
            }
        </style>
    </head>
    <body>
        <div class="particles" id="particles"></div>
        <div class="container">
            <div class="glass-card">
                <h1>BLACKLIST</h1>
                <div class="coming-soon">COMING SOON</div>
            </div>
        </div>
        <div class="footer">EMBRACE THE VOID • THE BLUE HORIZON</div>

        <script>
            // جزيئات زرقاء صغيرة "كأنها غبار في الريح"
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 40; i++) {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = '2px';
                dot.style.height = '2px';
                dot.style.background = '#38b6ff';
                dot.style.top = Math.random() * 100 + 'vh';
                dot.style.left = Math.random() * 100 + 'vw';
                dot.style.opacity = Math.random();
                dot.style.borderRadius = '50%';
                dot.animate([
                    { transform: 'translate(0, 0)', opacity: 0 },
                    { transform: 'translate(50px, -100px)', opacity: 0.7 },
                    { transform: 'translate(100px, -200px)', opacity: 0 }
                ], {
                    duration: Math.random() * 4000 + 3000,
                    iterations: Infinity
                });
                particlesContainer.appendChild(dot);
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(port, () => {
    console.log(`Blacklist site is live on port ${port}`);
});
