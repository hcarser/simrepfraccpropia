 const fractionCanvas = document.getElementById('fractionCanvas');
        const ctx = fractionCanvas.getContext('2d');
        const resultElement = document.getElementById('result');
        const numeratorEl = document.getElementById('numerator');
        const denominatorEl = document.getElementById('denominator');
        const correctCountEl = document.getElementById('correctCountEl');
        const incorrectCountEl = document.getElementById('incorrectCountEl');
        const percentageEl = document.getElementById('percentageEl');
        const verifyBtn = document.getElementById('verifyBtn');

        let currentFraction = {};
        let selectedSegments = new Set();
        let correctCount = 0;
        let incorrectCount = 0;
        const shapes = ['rectangle', 'circle'];
        let shapeIndex = 0; // Para alternar las figuras
        let currentShape = 'rectangle';

        function generateRandomFraction() {
            // Rango de denominador de 2 a 20
            const denominator = Math.floor(Math.random() * 19) + 2; 
            const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
            return { numerator, denominator };
        }

        function drawShape() {
            ctx.clearRect(0, 0, fractionCanvas.width, fractionCanvas.height);
            if (currentShape === 'rectangle') {
                drawRectangle(currentFraction.denominator);
            } else {
                drawCircle(currentFraction.denominator);
            }
        }

        function drawRectangle(denominator) {
            const segmentWidth = fractionCanvas.width / denominator;
            selectedSegments.forEach(index => {
                ctx.fillStyle = "rgba(0, 123, 255, 0.7)";
                ctx.fillRect(index * segmentWidth, 0, fractionCanvas.width / denominator, fractionCanvas.height);
            });
            ctx.strokeStyle = "#ccc"; ctx.lineWidth = 2;
            for (let i = 1; i < denominator; i++) {
                const xPos = i * segmentWidth;
                ctx.beginPath(); ctx.moveTo(xPos, 0); ctx.lineTo(xPos, fractionCanvas.height); ctx.stroke();
            }
            ctx.strokeStyle = "#333"; ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, fractionCanvas.width, fractionCanvas.height);
        }

        function drawCircle(denominator) {
            const centerX = fractionCanvas.width / 2;
            const centerY = fractionCanvas.height / 2;
            const radius = Math.min(centerX, centerY) * 0.9;
            const segmentAngle = (2 * Math.PI) / denominator;

            selectedSegments.forEach(index => {
                ctx.fillStyle = "rgba(0, 123, 255, 0.7)";
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, index * segmentAngle, (index + 1) * segmentAngle);
                ctx.closePath();
                ctx.fill();
            });
            ctx.strokeStyle = "#333"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.stroke();
            ctx.strokeStyle = "#ccc"; ctx.lineWidth = 2;
            for (let i = 0; i < denominator; i++) {
                ctx.beginPath(); ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + radius * Math.cos(i * segmentAngle), centerY + radius * Math.sin(i * segmentAngle));
                ctx.stroke();
            }
        }
        
        function newChallenge() {
            // Alterna la figura para el nuevo reto
            currentShape = shapes[shapeIndex];
            shapeIndex = (shapeIndex + 1) % shapes.length; // Avanza al siguiente y cicla

            currentFraction = generateRandomFraction();
            numeratorEl.textContent = currentFraction.numerator;
            denominatorEl.textContent = currentFraction.denominator;
            
            selectedSegments.clear();
            resultElement.classList.remove('visible', 'correct', 'incorrect');
            verifyBtn.disabled = false;
            
            drawShape();
        }

        function handleClick(event) {
            const rect = fractionCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            let segmentIndex;

            if (currentShape === 'rectangle') {
                const segmentWidth = fractionCanvas.width / currentFraction.denominator;
                segmentIndex = Math.floor(x / segmentWidth);
            } else {
                const centerX = fractionCanvas.width / 2;
                const centerY = fractionCanvas.height / 2;
                const angle = Math.atan2(y - centerY, x - centerX);
                const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
                const segmentAngle = (2 * Math.PI) / currentFraction.denominator;
                segmentIndex = Math.floor(normalizedAngle / segmentAngle);
            }
            
            if (selectedSegments.has(segmentIndex)) {
                selectedSegments.delete(segmentIndex);
            } else {
                selectedSegments.add(segmentIndex);
            }
            drawShape();
        }

        function verifySelection() {
            resultElement.classList.add('visible');
            verifyBtn.disabled = true;

            if (selectedSegments.size === currentFraction.numerator) {
                resultElement.innerHTML = `<strong>¡Correcto!</strong> Representaste ${selectedSegments.size}/${currentFraction.denominator}.`;
                resultElement.className = 'visible correct';
                correctCount++;
                setTimeout(newChallenge, 1500);
            } else {
                resultElement.innerHTML = `<strong>Incorrecto.</strong> Seleccionaste ${selectedSegments.size} en lugar de ${currentFraction.numerator}.`;
                resultElement.className = 'visible incorrect';
                incorrectCount++;
                setTimeout(newChallenge, 2500);
            }
            updateScoreboard();
        }
        
        function updateScoreboard() {
            correctCountEl.textContent = correctCount;
            incorrectCountEl.textContent = incorrectCount;
            const total = correctCount + incorrectCount;
            const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            percentageEl.textContent = `${percent}%`;
        }

        function resizeCanvas() {
            const size = fractionCanvas.parentElement.clientWidth;
            fractionCanvas.width = size;
            fractionCanvas.height = size;
            if (currentFraction.denominator) {
                drawShape();
            }
        }

        fractionCanvas.addEventListener('click', handleClick);
        verifyBtn.addEventListener('click', verifySelection);
        window.addEventListener('resize', resizeCanvas);
        
        resizeCanvas();
        newChallenge();