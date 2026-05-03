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
                background: #000;
                color: white;
                font-family: 'Cairo', sans-serif;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                perspective: 1000px;
            }

            /* خلفية نار متحركة خفيفة */
            body::before {
                content: "";
                position: absolute;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(255, 0, 0, 0.15) 0%, transparent 70%);
                animation: pulseBg 4s infinite alternate;
            }

            .container {
                position: relative;
                z-index: 2;
                text-align: center;
            }

            .glass-card {
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(15px);
                padding: 60px 80px;
                border-radius: 5px;
                border: 1px solid rgba(255, 0, 0, 0.3);
                box-shadow: 0 0 50px rgba(255, 0, 0, 0.2);
                transform: rotateX(10deg);
                transition: 0.5s;
            }

            .glass-card:hover {
                transform: rotateX(0deg) scale(1.02);
                border-color: #ff0000;
                box-shadow: 0 0 70px rgba(255, 0, 0, 0.4);
            }

            h1 {
                font-size: clamp(3rem, 10vw, 6rem);
                font-weight: 900;
                letter-spacing: 15px;
                text-transform: uppercase;
                /* تأثير النص الناري */
                background: linear-gradient(to bottom, #fff 20%, #ff4d4d 50%, #800000 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.5));
                animation: glow 2s ease-in-out infinite alternate;
            }

            .coming-soon {
                font-size: 1.5rem;
                color: #ffd700; /* ذهبي ناري */
                letter-spacing: 8px;
                font-weight: 400;
                opacity: 0.8;
                position: relative;
            }

            .coming-soon::after {
                content: "";
                display: block;
                width: 50px;
                height: 2px;
                background: #ff0000;
                margin: 10px auto;
                animation: expand 2s infinite;
            }

            /* أنيميشن */
            @keyframes glow {
                from { filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5)); }
                to { filter: drop-shadow(0 0 30px rgba(255, 0, 0, 0.8)); }
            }

            @keyframes pulseBg {
                from { transform: scale(1); opacity: 0.5; }
                to { transform: scale(1.2); opacity: 1; }
            }

            @keyframes expand {
                0%, 100% { width: 30px; opacity: 0.3; }
                50% { width: 150px; opacity: 1; }
            }

            .particles {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none;
            }

            .footer {
                position: absolute;
                bottom: 30px;
                font-size: 0.7rem;
                color: #444;
                letter-spacing: 3px;
                text-transform: uppercase;
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
        <div class="footer">STAY TUNED • THE UNDERWORLD IS CALLING</div>

        <script>
            // إضافة ذرات متطايرة بسيطة تعطي جو "الرماد" أو "النار"
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = '2px';
                dot.style.height = '2px';
                dot.style.background = '#ff4d4d';
                dot.style.top = Math.random() * 100 + 'vh';
                dot.style.left = Math.random() * 100 + 'vw';
                dot.style.opacity = Math.random();
                dot.style.borderRadius = '50%';
                dot.animate([
                    { transform: 'translateY(0) translateX(0)', opacity: 0 },
                    { transform: 'translateY(-100px) translateX(20px)', opacity: 1 },
                    { transform: 'translateY(-200px) translateX(-20px)', opacity: 0 }
                ], {
                    duration: Math.random() * 3000 + 2000,
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
