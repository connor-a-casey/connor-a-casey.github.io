(function() {
    'use strict';

    const sectionCommands = {
        'home': 'whoami',
        'about': 'cat about_me.txt',
        'publications': 'grep -r "publication" papers/',
        'talks': 'find . -name "*.pdf" -type f',
        'lectures': 'ls -la lectures/',
        'news': 'tail -f news.log'
    };

    let currentCommand = '';
    let isTyping = false;
    let typingTimeout = null;

    const terminal = document.getElementById('terminal');
    const terminalCommand = document.getElementById('terminal-command');
    const terminalOutputs = document.querySelectorAll('.terminal-output');
    
    const bgScenes = document.querySelectorAll('.bg-scene');
    const sceneMap = {
        'home': 'bg-scene-home',
        'about': 'bg-scene-about',
        'publications': 'bg-scene-publications',
        'talks': 'bg-scene-talks',
        'lectures': 'bg-scene-talks',
        'news': 'bg-scene-news'
    };

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    function typeCommand(command, callback) {
        if (isTyping) return;
        isTyping = true;
        terminalCommand.textContent = '';
        let index = 0;

        function type() {
            if (index < command.length) {
                terminalCommand.textContent += command[index];
                index++;
                typingTimeout = setTimeout(type, 50 + Math.random() * 50);
            } else {
                isTyping = false;
                if (callback) callback();
            }
        }
        type();
    }

    function updateTerminalCommand() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const sections = document.querySelectorAll('.full-section, .hero-section');
        
        let activeSection = 'home';
        let activeCommand = sectionCommands['home'];
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.id;
            
            if (scrollPosition >= sectionTop - windowHeight * 0.4 && 
                scrollPosition < sectionTop + sectionHeight - windowHeight * 0.2) {
                
                if (sectionId && sectionCommands[sectionId]) {
                    activeSection = sectionId;
                    activeCommand = sectionCommands[sectionId];
                } else if (section.classList.contains('hero-section')) {
                    activeSection = 'home';
                    activeCommand = sectionCommands['home'];
                } else if (section.querySelector('.section-number')) {
                    const sectionNum = section.querySelector('.section-number').textContent.trim();
                    const numToSection = {
                        '01': 'about',
                        '02': 'talks',
                        '03': 'publications',
                        '04': 'lectures',
                        '05': 'news'
                    };
                    const mappedSection = numToSection[sectionNum];
                    if (mappedSection && sectionCommands[mappedSection]) {
                        activeSection = mappedSection;
                        activeCommand = sectionCommands[mappedSection];
                    }
                }
            }
        });

        if (activeCommand !== currentCommand) {
            currentCommand = activeCommand;
            typeCommand(activeCommand);
            
            if (scrollPosition > 100) {
                terminal.classList.add('visible');
            } else {
                terminal.classList.remove('visible');
            }
        }
    }

    function handleTerminalOutputs() {
        terminalOutputs.forEach(output => {
            const section = output.closest('.full-section');
            if (section) {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
                
                if (isVisible) {
                    output.classList.add('visible');
                }
            }
        });
    }

    function initScrollAnimations() {
        const elements = document.querySelectorAll(
            '.education-item, .about-text, .publication-item, .talk-item, .news-item, .lecture-item'
        );
        
        elements.forEach(el => {
            observer.observe(el);
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function initNavbarScroll() {
        const nav = document.querySelector('.nav');
        const navLogo = document.querySelector('.nav-logo');
        const hero = document.querySelector('.hero-section');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const heroHeight = hero ? hero.offsetHeight : window.innerHeight;

            if (currentScroll > 100) {
                nav.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                nav.style.background = 'rgba(0, 0, 0, 0.8)';
            }

            if (navLogo) {
                if (currentScroll > heroHeight * 0.8) {
                    navLogo.classList.add('hidden');
                } else {
                    navLogo.classList.remove('hidden');
                }
            }

            lastScroll = currentScroll;
        });
    }

    function updateBackgroundScene(activeSection) {
        bgScenes.forEach(scene => {
            scene.classList.remove('active');
        });
        
        const sceneClass = sceneMap[activeSection] || 'bg-scene-home';
        const activeScene = document.querySelector(`.${sceneClass}`);
        if (activeScene) {
            activeScene.classList.add('active');
        }
    }

    function initTerminalScroll() {
        let ticking = false;

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTerminalCommand();
                    handleTerminalOutputs();
                    updateBackgroundFromScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function updateBackgroundFromScroll() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const sections = document.querySelectorAll('.full-section, .hero-section');
        
        let activeSection = 'home';
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.id;
            
            if (scrollPosition >= sectionTop - windowHeight * 0.3 && 
                scrollPosition < sectionTop + sectionHeight - windowHeight * 0.2) {
                
                if (sectionId && sceneMap[sectionId]) {
                    activeSection = sectionId;
                } else if (section.classList.contains('hero-section')) {
                    activeSection = 'home';
                } else if (section.querySelector('.section-number')) {
                    const sectionNum = section.querySelector('.section-number').textContent.trim();
                    const numToSection = {
                        '01': 'about',
                        '02': 'talks',
                        '03': 'publications',
                        '04': 'lectures',
                        '05': 'news'
                    };
                    const mappedSection = numToSection[sectionNum];
                    if (mappedSection && sceneMap[mappedSection]) {
                        activeSection = mappedSection;
                    }
                }
            }
        });

        updateBackgroundScene(activeSection);
    }

    function initParallax() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            
            if (scrolled < window.innerHeight) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    function initStaggerAnimations() {
        const aboutText = document.querySelector('.about-text');
        if (aboutText) {
            observer.observe(aboutText);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        initSmoothScroll();
        initNavbarScroll();
        initTerminalScroll();
        initParallax();
        initStaggerAnimations();
        
        setTimeout(() => {
            typeCommand(sectionCommands['home']);
            updateBackgroundScene('home');
        }, 1000);
    });

    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });

    window.addEventListener('beforeunload', () => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
    });

})();
