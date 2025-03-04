// Create dot pattern
function createDotPattern() {
    const container = document.getElementById('dotPattern');
    const containerRect = container.getBoundingClientRect();
    
    // Calculate spacing based on viewport size to ensure full coverage
    const dotSpacing = Math.min(window.innerWidth, window.innerHeight) / 30;
    
    // Calculate number of dots needed to cover the entire container with some overflow
    const columns = Math.ceil(containerRect.width / dotSpacing) + 2;
    const rows = Math.ceil(containerRect.height / dotSpacing) + 2;
    
    // Create dots using document fragment for better performance
    const fragment = document.createDocumentFragment();
    const dots = [];
    
    // Create dots with requestAnimationFrame for smoother initial render
    let currentRow = 0;
    let currentCol = 0;

    function createDotsChunk() {
        const startTime = performance.now();
        
        while (currentRow < rows && performance.now() - startTime < 16) {
            while (currentCol < columns) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                // Offset the dots by -dotSpacing/2 to ensure full coverage
                dot.style.left = `${currentCol * dotSpacing - dotSpacing/2}px`;
                dot.style.top = `${currentRow * dotSpacing - dotSpacing/2}px`;
                fragment.appendChild(dot);
                dots.push({
                    element: dot,
                    x: currentCol * dotSpacing - dotSpacing/2,
                    y: currentRow * dotSpacing - dotSpacing/2
                });
                currentCol++;
            }
            currentCol = 0;
            currentRow++;
        }
        
        if (currentRow < rows) {
            requestAnimationFrame(createDotsChunk);
        } else {
            container.appendChild(fragment);
            // Start animation only after all dots are created
            initializeMouseInteraction();
        }
    }
    
    requestAnimationFrame(createDotsChunk);
    return dots;
}

// Store dots array globally for better performance
let dotsArray = [];
let isAnimating = false;
let mouseX = 0;
let mouseY = 0;
let animationFrame = null;

// Create ripple effect
function createRipple(x, y) {
    const hero = document.querySelector('.hero');
    
    // Create three ripples with different sizes and speeds
    for (let i = 1; i <= 3; i++) {
        const ripple = document.createElement('div');
        ripple.className = `ripple ripple-${i}`;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        hero.appendChild(ripple);
        
        // Remove ripple after animation
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
}

// Pulse dots near click
function pulseDots(x, y) {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => {
        const dotRect = dot.getBoundingClientRect();
        const dotX = dotRect.left + dotRect.width/2;
        const dotY = dotRect.top + dotRect.height/2;
        
        const distX = x - dotX;
        const distY = y - dotY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < 100) {
            dot.classList.add('pulse');
            dot.addEventListener('animationend', () => {
                dot.classList.remove('pulse');
            }, { once: true });
        }
    });
}

// Optimize animation with throttling and performance checks
function animateDots() {
    if (!isAnimating) return;
    
    const now = performance.now();
    
    dotsArray.forEach(dot => {
        const dotX = dot.x;
        const dotY = dot.y;
        
        const distX = mouseX - dotX;
        const distY = mouseY - dotY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Reduced influence range for better performance
        if (distance < 120) {
            const scale = (120 - distance) / 120;
            const angle = Math.atan2(distY, distX);
            const push = 25 * scale;
            const scaleEffect = 1 + scale;
            
            dot.element.style.transform = `translate(${Math.cos(angle) * -push}px, ${Math.sin(angle) * -push}px) scale(${scaleEffect})`;
            dot.element.style.opacity = 0.35 + scale * 0.35;
        } else if (dot.element.style.transform) {
            dot.element.style.transform = 'none';
            dot.element.style.opacity = 0.35;
        }
    });
    
    animationFrame = requestAnimationFrame(animateDots);
}

// Throttle mouse move events
function throttle(func, limit) {
    let inThrottle;
    return function(event) {
        if (!inThrottle) {
            func(event);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize mouse interaction
function initializeMouseInteraction() {
    // Throttled mouse move handler
    const handleMouseMove = throttle((e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isAnimating) {
            isAnimating = true;
            animationFrame = requestAnimationFrame(animateDots);
        }
    }, 16); // Throttle to ~60fps

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    window.addEventListener('mouseleave', () => {
        isAnimating = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        // Reset all dots to original position
        dotsArray.forEach(dot => {
            dot.element.style.transform = 'none';
            dot.element.style.opacity = 0.35;
        });
    });
}

// Initialize dot pattern when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    dotsArray = createDotPattern();
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            const container = document.getElementById('dotPattern');
            container.innerHTML = '';
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            dotsArray = createDotPattern();
        }, 250);
    });
});

// FAQ Accordion functionality
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // If the clicked item wasn't active, open it
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Intersection Observer for entrance animations
const animateOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once the animation is triggered, we don't need to observe this element anymore
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when at least 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Slightly offset the trigger point
    });

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in, .scale-up, .stagger-children');
    animatedElements.forEach(el => observer.observe(el));
};

// Initialize animations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
}); 