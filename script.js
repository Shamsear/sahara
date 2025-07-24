// Sahara Mart JavaScript

// Use requestAnimationFrame for smoother animations
let ticking = false;
let lastKnownScrollPosition = 0;
let parallaxElements = [];
let glassCards = [];
let animatedElements = [];
let rafId = null; // Track animation frame ID
let animatedElementsMap = new Map(); // Track which elements have been animated
let isMobile = window.innerWidth < 768; // Track if device is mobile

// Initialize everything after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for a short time to ensure all resources are processed
    setTimeout(() => {
        // Cache DOM elements to avoid repeated queries
        parallaxElements = document.querySelectorAll('.bg-sahara-orange, .bg-sahara-yellow');
        glassCards = document.querySelectorAll('.glass-card');
        animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        // Initialize tracking for animated elements
        animatedElements.forEach(el => {
            animatedElementsMap.set(el, false);
        });
        
        // Optimize image loading
        optimizeImages();
        
        // Initialize all features
        initParallaxEffect();
        initScrollAnimations();
        initGlassCardEffects();
        initTestimonialCarousel();
        initMobileMenu();
        initMobileOptimizations();
        
        // Add page-loaded class for CSS transitions
        document.body.classList.add('page-loaded');
        
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
        
        // Make body visible
        document.body.style.opacity = '1';
    }, 100);
});

// Optimize image loading
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add loading attribute for native lazy loading
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add decoding attribute for async image decoding
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    });
}

// Parallax effect with requestAnimationFrame
function initParallaxEffect() {
    if (parallaxElements.length === 0 || isMobile) return; // Skip on mobile
    
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;
    let lastUpdate = 0;
    const throttleTime = 16; // Approx 60fps
    
    window.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        const now = Date.now();
        
        if (!isMoving && now - lastUpdate > throttleTime) {
            isMoving = true;
            lastUpdate = now;
            
            // Cancel any existing animation frame
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            
            // Schedule the update
            rafId = requestAnimationFrame(() => {
                updateParallaxElements(mouseX, mouseY);
                isMoving = false;
                rafId = null;
            });
        }
    });
}

function updateParallaxElements(mouseX, mouseY) {
    parallaxElements.forEach(el => {
        const offsetX = (mouseX - 0.5) * 20;
        const offsetY = (mouseY - 0.5) * 20;
        
        // Use transform for better performance
        el.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
    });
}

// Scroll animations with Intersection Observer
function initScrollAnimations() {
    if (animatedElements.length === 0) return;
    
    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Only animate if element hasn't been animated yet
            if (entry.isIntersecting && !animatedElementsMap.get(entry.target)) {
                // Mark this element as animated
                animatedElementsMap.set(entry.target, true);
                
                // Use fixed delays instead of random for more consistent animations
                const index = Array.from(animatedElements).indexOf(entry.target);
                const delay = Math.min(index * 0.1, 0.5); // Cap delay at 0.5s
                entry.target.style.animationDelay = `${delay}s`;
                
                // Use requestAnimationFrame for smoother animation
                requestAnimationFrame(() => {
                    // Force a reflow before adding the class
                    void entry.target.offsetWidth;
                    entry.target.classList.add('animate-fade-in');
                });
                
                // We could unobserve here, but we'll keep observing to handle potential DOM changes
                // observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.15, 
        rootMargin: '0px 0px -10% 0px' 
    });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add a reset function for testing purposes
    window.resetAnimations = function() {
        animatedElements.forEach(el => {
            el.classList.remove('animate-fade-in');
            animatedElementsMap.set(el, false);
        });
    };
}

// Glass card effects with optimized event handling
function initGlassCardEffects() {
    if (glassCards.length === 0 || isMobile) return; // Skip on mobile
    
    glassCards.forEach(card => {
        let cardRafId = null;
        let lastUpdate = 0;
        const throttleTime = 16; // Approx 60fps
        
        card.addEventListener('mousemove', function(e) {
            const now = Date.now();
            
            // Throttle updates for smoother animation
            if (now - lastUpdate < throttleTime) return;
            
            lastUpdate = now;
            
            // Cancel previous animation frame if it exists
            if (cardRafId !== null) {
                cancelAnimationFrame(cardRafId);
            }
            
            cardRafId = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate rotation based on mouse position
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / 20).toFixed(2);
                const rotateY = ((centerX - x) / 20).toFixed(2);
                
                // Use transform3d for hardware acceleration
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.transition = 'transform 0.1s';
                
                cardRafId = null;
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Cancel any ongoing animation
            if (cardRafId !== null) {
                cancelAnimationFrame(cardRafId);
            }
            
            requestAnimationFrame(() => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.transition = 'transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)';
            });
        });
    });
}

// Testimonial carousel with optimized transitions
function initTestimonialCarousel() {
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial-card');
    const totalTestimonials = testimonials.length;
    
    if (totalTestimonials === 0) return;
    
    // Initialize testimonials
    testimonials.forEach((testimonial, index) => {
        // Set initial state
        if (index === 0) {
            testimonial.classList.add('active');
        } else {
            testimonial.classList.add('hidden');
        }
        
        // Add transition styles with will-change for better performance
        testimonial.style.transition = 'opacity 0.5s cubic-bezier(0.215, 0.61, 0.355, 1), transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)';
        testimonial.style.willChange = 'opacity, transform';
    });
    
    // Next testimonial function with optimized animations
    window.nextTestimonial = function() {
        // Prevent rapid clicking
        if (window.isAnimating) return;
        window.isAnimating = true;
        
        // Fade out current testimonial
        const current = testimonials[currentTestimonial];
        
        requestAnimationFrame(() => {
            current.style.opacity = '0';
            current.style.transform = 'translateX(-50px)';
            
            setTimeout(() => {
                current.classList.add('hidden');
                current.classList.remove('active');
                
                currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
                
                // Prepare next testimonial for animation
                const next = testimonials[currentTestimonial];
                next.style.opacity = '0';
                next.style.transform = 'translateX(50px)';
                next.classList.remove('hidden');
                
                // Trigger reflow
                void next.offsetWidth;
                
                // Fade in next testimonial
                requestAnimationFrame(() => {
                    next.style.opacity = '1';
                    next.style.transform = 'translateX(0)';
                    next.classList.add('active');
                    
                    // Reset animation flag after transition completes
                    setTimeout(() => {
                        window.isAnimating = false;
                    }, 500);
                });
            }, 300);
        });
    };
    
    // Previous testimonial function with optimized animations
    window.prevTestimonial = function() {
        // Prevent rapid clicking
        if (window.isAnimating) return;
        window.isAnimating = true;
        
        // Fade out current testimonial
        const current = testimonials[currentTestimonial];
        
        requestAnimationFrame(() => {
            current.style.opacity = '0';
            current.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                current.classList.add('hidden');
                current.classList.remove('active');
                
                currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
                
                // Prepare next testimonial for animation
                const next = testimonials[currentTestimonial];
                next.style.opacity = '0';
                next.style.transform = 'translateX(-50px)';
                next.classList.remove('hidden');
                
                // Trigger reflow
                void next.offsetWidth;
                
                // Fade in next testimonial
                requestAnimationFrame(() => {
                    next.style.opacity = '1';
                    next.style.transform = 'translateX(0)';
                    next.classList.add('active');
                    
                    // Reset animation flag after transition completes
                    setTimeout(() => {
                        window.isAnimating = false;
                    }, 500);
                });
            }, 300);
        });
    };
    
    // Add swipe support for mobile
    if (isMobile) {
        const testimonialContainer = document.querySelector('.testimonial-carousel');
        let touchStartX = 0;
        let touchEndX = 0;
        
        testimonialContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        testimonialContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            // Detect swipe direction
            if (touchEndX < touchStartX - 50) {
                // Swipe left - go to next
                window.nextTestimonial();
            } else if (touchEndX > touchStartX + 50) {
                // Swipe right - go to previous
                window.prevTestimonial();
            }
        }
    }
    
    // Auto-rotate testimonials with requestAnimationFrame for better performance
    let autoRotateTimer;
    
    function startAutoRotate() {
        autoRotateTimer = setTimeout(() => {
            if (!window.isAnimating) {
                window.nextTestimonial();
            }
            startAutoRotate();
        }, 5000);
    }
    
    // Start auto-rotation
    startAutoRotate();
    
    // Pause auto-rotation when user interacts with testimonials
    const testimonialSection = document.querySelector('.testimonial-carousel').parentElement;
    
    testimonialSection.addEventListener('mouseenter', () => {
        clearTimeout(autoRotateTimer);
    });
    
    testimonialSection.addEventListener('mouseleave', () => {
        startAutoRotate();
    });
    
    // Also pause on touch for mobile
    testimonialSection.addEventListener('touchstart', () => {
        clearTimeout(autoRotateTimer);
    }, { passive: true });
    
    testimonialSection.addEventListener('touchend', () => {
        startAutoRotate();
    }, { passive: true });
}

// Mobile menu toggle with optimized animations
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.querySelector('header');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenu.style.transition = 'transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)';
    mobileMenu.style.transformOrigin = 'top';
    mobileMenu.style.willChange = 'transform, opacity';
    
    let isAnimating = false;
    let isMenuOpen = false;
    
    mobileMenuBtn.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        
        if (mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            isMenuOpen = true;
            
            // Add active state to button
            mobileMenuBtn.classList.add('active');
            
            // Change icon to close (X)
            mobileMenuBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            
            requestAnimationFrame(() => {
                mobileMenu.style.opacity = '0';
                mobileMenu.style.transform = 'scaleY(0.9)';
                
                // Trigger reflow
                void mobileMenu.offsetWidth;
                
                requestAnimationFrame(() => {
                    mobileMenu.style.opacity = '1';
                    mobileMenu.style.transform = 'scaleY(1)';
                    
                    setTimeout(() => {
                        isAnimating = false;
                    }, 300);
                });
            });
        } else {
            isMenuOpen = false;
            
            // Remove active state from button
            mobileMenuBtn.classList.remove('active');
            
            // Change icon back to hamburger
            mobileMenuBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            `;
            
            requestAnimationFrame(() => {
                mobileMenu.style.opacity = '0';
                mobileMenu.style.transform = 'scaleY(0.9)';
                
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                    isAnimating = false;
                }, 300);
            });
        }
    });
    
    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen && !isAnimating) {
                // Simulate click on the menu button to close the menu
                mobileMenuBtn.click();
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && 
            !isAnimating && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            mobileMenuBtn.click();
        }
    });
    
    // Handle scroll behavior for mobile menu
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, 10));
}

// Mobile-specific optimizations
function initMobileOptimizations() {
    if (!isMobile) return;
    
    // Add touch feedback to buttons and links
    const touchElements = document.querySelectorAll('button, a.btn-vision, a.glass-effect');
    touchElements.forEach(el => {
        el.addEventListener('touchstart', () => {
            el.classList.add('touch-active');
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
            setTimeout(() => {
                el.classList.remove('touch-active');
            }, 150);
        }, { passive: true });
    });
    
    // Optimize scroll performance
    window.addEventListener('scroll', debounce(() => {
        // Check which sections are in viewport and optimize accordingly
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isInViewport = (
                rect.top <= window.innerHeight &&
                rect.bottom >= 0
            );
            
            if (isInViewport) {
                section.classList.add('in-viewport');
            } else {
                section.classList.remove('in-viewport');
            }
        });
    }, 100), { passive: true });
    
    // Add fastclick to eliminate 300ms delay on mobile
    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            const links = document.querySelectorAll('a, button');
            links.forEach(link => {
                link.style.touchAction = 'manipulation';
            });
        }, false);
    }
    
    // Handle viewport height issues on mobile (100vh problem)
    function setMobileHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setMobileHeight();
    window.addEventListener('resize', debounce(setMobileHeight, 100));
    
    // Check for notch/safe areas
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
        document.body.classList.add('has-notch');
    }
}

// Utility: Debounce function for performance optimization
function debounce(func, wait = 10) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
} 