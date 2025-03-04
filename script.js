// Create dot pattern
function createDotPattern() {
    const container = document.getElementById('dotPattern');
    const containerRect = container.getBoundingClientRect();
    const dotSpacing = 30;
    
    // Calculate number of dots needed
    const columns = Math.floor(containerRect.width / dotSpacing);
    const rows = Math.floor(containerRect.height / dotSpacing);
    
    // Create dots using document fragment for better performance
    const fragment = document.createDocumentFragment();
    const dots = [];
    
    // Create dots
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `${j * dotSpacing + dotSpacing/2}px`;
            dot.style.top = `${i * dotSpacing + dotSpacing/2}px`;
            fragment.appendChild(dot);
            dots.push({
                element: dot,
                x: j * dotSpacing + dotSpacing/2,
                y: i * dotSpacing + dotSpacing/2
            });
        }
    }
    
    container.appendChild(fragment);
    return dots;
}

// Store dots array globally for better performance
let dotsArray = [];

// Optimize animation with requestAnimationFrame
let isAnimating = false;
let mouseX = 0;
let mouseY = 0;

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

// Animate dots on mouse move
function animateDots() {
    if (!isAnimating) return;
    
    dotsArray.forEach(dot => {
        const dotX = dot.x;
        const dotY = dot.y;
        
        // Calculate distance from mouse to dot
        const distX = mouseX - dotX;
        const distY = mouseY - dotY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Increase influence range to 150px and push distance to 30px
        if (distance < 150) {
            const scale = (150 - distance) / 150;
            const angle = Math.atan2(distY, distX);
            const push = 30 * scale;
            const scaleEffect = 1 + scale * 1.5;
            
            dot.element.style.transform = `translate(${Math.cos(angle) * -push}px, ${Math.sin(angle) * -push}px) scale(${scaleEffect})`;
            dot.element.style.opacity = 0.35 + scale * 0.45;
        } else {
            dot.element.style.transform = 'none';
            dot.element.style.opacity = 0.35;
        }
    });
    
    requestAnimationFrame(animateDots);
}

// Initialize dot pattern and interactions
window.addEventListener('load', () => {
    dotsArray = createDotPattern();
    
    // Mouse move interaction with throttling
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animateDots);
        }
    });
    
    window.addEventListener('mouseleave', () => {
        isAnimating = false;
    });
    
    // Click interaction
    document.querySelector('.hero').addEventListener('click', (e) => {
        createRipple(e.clientX, e.clientY);
        pulseDots(e.clientX, e.clientY);
    });
    
    // Optimize resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const container = document.getElementById('dotPattern');
            container.innerHTML = '';
            dotsArray = createDotPattern();
        }, 150);
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