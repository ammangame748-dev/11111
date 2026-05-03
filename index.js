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
                /* خلفية متدرجة بألوان الصورة (أزرق عميق وأزرق سماوي) */
                background: linear-gradient(135deg, #001f3f 0%, #0074D9 50%, #7FDBFF 100%);
                background-size: 400% 400%;
                animation: windFlow 15s ease infinite; /* حركة انسيابية مثل الهوا */
                color: white;
                font-family: 'Cairo', sans-serif;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            /* تأثير الغيوم أو الضباب المتحرك */
            body::before {
                content: "";
                position: absolute;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
                animation: clouds 20s linear infinite;
                z-index: 1;
            }

            .container {
                position: relative;
                z-index: 2;
                text-align: center;
            }

            .glass-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 60px 80px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 50, 0.3);
                transition: 0.5s;
            }

            .glass-card:hover {
                transform: translateY(-10px);
                border-color: rgba(255, 255, 255, 0.5);
                box-shadow: 0 15px 45px rgba(0, 116, 217, 0.4);
            }

            h1 {
                font-size: clamp(3rem, 10vw, 6rem);
                font-weight: 900;
                letter-spacing: 10px;
                text-transform: uppercase;
                /* تأثير نص زجاجي/سماوي */
                background: linear-gradient(to bottom, #fff 0%, #7FDBFF 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
            }

            .coming-soon {
                font-size: 1.5rem;
                color: #fff;
                letter-spacing: 8px;
                font-weight: 400;
                opacity: 0.9;
            }

            .coming-soon::after {
                content: "";
                display: block;
                width: 50px;
                height: 2px;
                background: #7FDBFF;
                margin: 15px auto;
                animation: expand 3s infinite ease-in-out;
            }

            /* أنيميشن حركة الهوا في الخلفية */
            @keyframes windFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes clouds {
                from { transform: translate(-10%, -10%) rotate(0deg); }
                to { transform: translate(10%, 10%) rotate(360deg); }
            }

            @keyframes expand {
                0%, 100% { width: 40px; opacity: 0.5; }
                50% { width: 200px; opacity: 1; }
            }

            .particles {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .footer {
                position: absolute;
                bottom: 30px;
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.5);
                letter-spacing: 2px;
                text-transform: uppercase;
                z-index: 2;
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
        <div class="footer">FRESH BREEZE • THE SKY IS THE LIMIT</div>

        <script>
            // ذرات خفيفة مثل "نسمات الهواء" أو "بلورات ثلجية"
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 40; i++) {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = Math.random() * 3 + 'px';
                dot.style.height = dot.style.width;
                dot.style.background = 'rgba(255, 255, 255, 0.6)';
                dot.style.top = Math.random() * 100 + 'vh';
                dot.style.left = Math.random() * 100 + 'vw';
                dot.style.borderRadius = '50%';
                dot.style.filter = 'blur(1px)';
                
                dot.animate([
                    { transform: 'translateX(0) translateY(0)', opacity: 0 },
                    { transform: 'translateX(' + (Math.random() * 200 - 100) + 'px) translateY(-150px)', opacity: 0.8 },
                    { transform: 'translateX(' + (Math.random() * 400 - 200) + 'px) translateY(-300px)', opacity: 0 }
                ], {
                    duration: Math.random() * 5000 + 4000,
                    iterations: Infinity,
                    easing: 'linear'
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
