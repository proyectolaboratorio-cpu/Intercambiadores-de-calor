// Heat Exchange - Página de Tipos TEMA
// Script para la clasificación de intercambiadores

// Animación al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar las tarjetas de tipo
document.querySelectorAll('.tipo-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    observer.observe(el);
});

// Click en tarjeta completa redirige a la calculadora
document.querySelectorAll('.tipo-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // No redirigir si se hizo clic en el botón directamente
        if (e.target.closest('.tipo-btn')) return;

        const target = card.dataset.target;
        if (target) {
            window.location.href = target;
        }
    });
});

// Efecto hover en tarjetas
document.querySelectorAll('.tipo-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.cursor = 'pointer';
    });
});

console.log('✓ Página de Tipos TEMA cargada correctamente');