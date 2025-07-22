// Function to generate a random number within a range
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

document.addEventListener('DOMContentLoaded', () => {
    // Scroll to Wheel button functionality
    const scrollToWheelButton = document.getElementById('scrollToWheel');
    if (scrollToWheelButton) {
        scrollToWheelButton.addEventListener('click', () => {
            document.getElementById('wheel-game-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Spin the Wheel Game Logic
    const wheelCanvas = document.getElementById('wheelCanvas');
    const spinButton = document.getElementById('spinButton');
    const wheelResult = document.getElementById('wheel-result');
    const ctx = wheelCanvas.getContext('2d');

    // Pop-up elements
    const winModal = document.getElementById('winModal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalHint = document.querySelector('.modal-hint'); // Select the hint paragraph
    const closeButtons = document.querySelectorAll('.close-button, #modal-close-button');
    const confettiContainer = document.getElementById('confetti-container');

    // Define wheel segments (fewer, clearer options)
    const segments = [
        { text: "Movie Night Treat!", color: "#FF6347" },     // Tomato
        { text: "Your Favorite Coffee Date!", color: "#FFD700" },     // Gold
        // THIS IS THE SPECIAL BAG HINT SEGMENT!
        { text: "A Fantastic Surprise!", color: "#9370DB" }, // MediumPurple
        { text: "A Fun Day Out!", color: "#87CEEB" },   // SkyBlue
        { text: "Customized Playlist!", color: "#DA70D6" }  // Orchid
    ];

    const numSegments = segments.length;
    const arcSize = (2 * Math.PI) / numSegments;
    let isSpinning = false; // Flag to prevent multiple rapid spins

    // IMPORTANT: Determine the index of the segment you want to land on
    // Make sure the text exactly matches one of the segment texts above.
    const targetSegmentText = "A Fantastic Surprise!"; // The text for the bag hint
    const targetSegmentIndex = segments.findIndex(segment => segment.text === targetSegmentText);

    if (targetSegmentIndex === -1) {
        console.error("Target segment for bag hint not found! Please check the text in segments array and targetSegmentText constant.");
        // Fallback to random if target is not found (though this case is controlled)
    }

    function drawWheel() {
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height); // Clear canvas

        for (let i = 0; i < numSegments; i++) {
            const angle = i * arcSize; // Starting angle for this segment
            ctx.beginPath();
            ctx.arc(wheelCanvas.width / 2, wheelCanvas.height / 2, wheelCanvas.width / 2 - 5, angle, angle + arcSize);
            ctx.lineTo(wheelCanvas.width / 2, wheelCanvas.height / 2);
            ctx.closePath();
            ctx.fillStyle = segments[i].color;
            ctx.fill();

            // Draw text
            ctx.save();
            ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
            ctx.rotate(angle + arcSize / 2 + Math.PI / 2); // Rotate text to be readable from top
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFF"; // Text color
            ctx.font = "bold 20px 'Open Sans', sans-serif"; // Slightly larger font
            ctx.fillText(segments[i].text, 0, -wheelCanvas.width / 2 + 50); // Position text
            ctx.restore();
        }
    }

    drawWheel(); // Initial draw of the wheel

    spinButton.addEventListener('click', () => {
        if (isSpinning) return; // Prevent multiple spins
        isSpinning = true;
        spinButton.classList.add('spinning');
        wheelResult.textContent = "Spinning... Good luck!";
        wheelResult.style.color = "#333";

        const spinDuration = 5000; // 5 seconds for a longer, more dramatic spin

        // Calculate the target rotation
        // We want the middle of the `targetSegmentIndex` to align with the pointer (which is at the top/0 degrees).
        // The wheel itself rotates clockwise.
        // The segments are drawn starting from 0 (right horizontal) clockwise.
        // So, if segment 0 is at 0 degrees, segment 1 at arcSize, etc.
        // We need to rotate the wheel such that the center of the target segment
        // lands at the top (which is -Math.PI / 2 or 270 degrees on a standard canvas).

        // Calculate the "ideal" angle for the center of the target segment to be at the right (0 radians)
        const targetAngleAtRight = targetSegmentIndex * arcSize + arcSize / 2;

        // How much rotation is needed to move this "targetAngleAtRight" to the top (3/2 * PI counter-clockwise from right)
        // A full rotation is 2 * Math.PI.
        // We need to rotate such that target segment's center ends up at the top (270 degrees or -90 degrees).
        // Angle to rotate = (2 * PI - targetAngleAtRight) + (3 * PI / 2) - small offset
        let finalAngle = (2 * Math.PI * 5) + (2 * Math.PI - targetAngleAtRight) + (3 * Math.PI / 2); // 5 full rotations + landing angle
        // Add a small random offset to make it seem less predictable, but still within the segment
        finalAngle += getRandom(-arcSize / 4, arcSize / 4); // Small wiggle within the segment

        wheelCanvas.style.transition = `transform ${spinDuration / 1000}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`; // Smooth spin out ease
        wheelCanvas.style.transform = `rotate(${finalAngle}rad)`;

        setTimeout(() => {
            isSpinning = false;
            spinButton.classList.remove('spinning');
            wheelCanvas.style.transition = 'none'; // Remove transition

            const winningSegment = segments[targetSegmentIndex];
            wheelResult.textContent = `🎉 You won: ${winningSegment.text}! 🎉`;
            wheelResult.style.color = winningSegment.color;

            // Trigger the pop-up
            showWinModal(winningSegment.text);

            // To reset the wheel's actual transform value for cleaner subsequent spins (if any)
            // Get the current computed rotation
            let st = window.getComputedStyle(wheelCanvas, null);
            let tr = st.getPropertyValue("-webkit-transform") ||
                     st.getPropertyValue("-moz-transform") ||
                     st.getPropertyValue("-ms-transform") ||
                     st.getPropertyValue("-o-transform") ||
                     st.getPropertyValue("transform") ||
                     "none";

            if (tr !== "none") {
                let values = tr.split('(')[1].split(')')[0].split(',');
                let a = values[0];
                let b = values[1];
                let currentRot = Math.atan2(b, a);
                wheelCanvas.style.transform = `rotate(${currentRot}rad)`; // Set to exact final position
            }

        }, spinDuration);
    });

    // Modal Logic
    function showWinModal(winnerText) {
        modalMessage.textContent = `You've won: ${winnerText}!`;
        // Show the specific hint only for the target segment
        if (winnerText === targetSegmentText) {
            modalHint.style.display = 'block'; // Show the hint
        } else {
            modalHint.style.display = 'none'; // Hide if not the target win
        }

        winModal.style.display = 'flex'; // Use flex to center content
        startConfetti(); // Start confetti when modal appears
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            winModal.style.display = 'none';
            stopConfetti(); // Stop confetti when modal closes
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === winModal) {
            winModal.style.display = 'none';
            stopConfetti();
        }
    });

    // Simple Confetti Effect (Pure JS/CSS - you can use a library for more complex effects)
    // This is a very basic example. For more robust confetti, consider a library like 'confetti-js' or 'canvas-confetti'
    // To use a library, you'd typically include it via a CDN link in your HTML <head>
    let confettiInterval;
    function startConfetti() {
        confettiContainer.innerHTML = ''; // Clear previous confetti
        for (let i = 0; i < 50; i++) { // Generate 50 pieces of confetti
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${getRandom(0, 100)}%`;
            confetti.style.top = `${getRandom(-20, 0)}%`;
            confetti.style.backgroundColor = `hsl(${getRandom(0, 360)}, 100%, 70%)`; // Random color
            confetti.style.animationDelay = `${getRandom(0, 5)}s`;
            confetti.style.transform = `rotate(${getRandom(0, 360)}deg)`;
            confettiContainer.appendChild(confetti);
        }
        // Basic falling animation (CSS based)
        // For a burst, you would generate them with initial velocities.
    }

    function stopConfetti() {
        confettiContainer.innerHTML = ''; // Remove all confetti elements
    }

    // Add basic confetti styles to your style.css
    /*
    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        animation: fall 3s ease-in forwards;
        opacity: 0;
    }

    @keyframes fall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
    }
    */
    // For this demonstration, the confetti will be generated in JS, and we'll add the CSS to style.css for movement.
    // However, a true "burst" requires more complex JS/Canvas. For now, it's falling confetti.
});

// A small CSS addition for confetti (add this to your style.css)
/*
.confetti {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    opacity: 0;
    animation: confetti-fall 3s linear forwards;
    transform-origin: center center;
}

@keyframes confetti-fall {
    0% {
        transform: translate(var(--x, 0px), var(--y, 0px)) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translate(var(--x, 0px), 500px) rotate(720deg);
        opacity: 0;
    }
}
*/
// The above is more complex than needed for a quick demo.
// For the purpose of this demo, we'll keep the JS simple, and CSS simple as well.
// Just add this simple version to your style.css:
/*
.confetti {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    opacity: 0;
    animation: fall 3s ease-in forwards;
}

@keyframes fall {
    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
}
*/