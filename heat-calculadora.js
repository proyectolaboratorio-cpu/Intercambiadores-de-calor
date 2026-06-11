// HEAT EXCHANGE - Calculadora de Intercambiadores de Calor

let tipoIntercambiador = 'paralelo';
let tipoExchanger = 'coraza-tubos';

// ============================================
// DROPDOWN DE TIPOS DE FLUJO
// ============================================

// Toggle dropdown al hacer clic en el boton o en la flecha
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const dropdown = btn.closest('.dropdown');
        const menu = dropdown.querySelector('.dropdown-menu');
        const icon = btn.querySelector('.dropdown-icon');

        // Cerrar todos los demas dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) {
                m.classList.remove('show');
                m.closest('.dropdown').querySelector('.dropdown-icon')?.classList.remove('rotate');
            }
        });

        // Toggle el dropdown actual
        menu.classList.toggle('show');
        icon.classList.toggle('rotate');
    });
});

// Seleccionar tipo de flujo al hacer clic en un item del dropdown
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const flowType = item.dataset.flow;
        const parentDropdown = item.closest('.dropdown');
        const menu = parentDropdown.querySelector('.dropdown-menu');
        const icon = parentDropdown.querySelector('.dropdown-icon');

        // Marcar el item como activo
        parentDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Cerrar el dropdown
        menu.classList.remove('show');
        icon.classList.remove('rotate');

        // Actualizar el tipo de intercambiador activo
        const typeBtn = parentDropdown.querySelector('.type-btn');
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        typeBtn.classList.add('active');

        // Guardar el tipo de intercambiador y flujo seleccionados
        tipoIntercambiador = flowType;
        const exchangerType = typeBtn.dataset.type;
        const flowName = flowType === 'paralelo' ? 'Flujo Paralelo' : 'Contraflujo';
        const exchangerName = typeBtn.querySelector('span').textContent;
        document.getElementById('detail-tipo').textContent = exchangerName + ' - ' + flowName;
    });
});

// Cerrar dropdowns al hacer clic fuera de ellos
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-icon').forEach(icon => {
            icon.classList.remove('rotate');
        });
    }
});


// Elementos del DOM
const tipoButtons = document.querySelectorAll('.type-btn');
const calcularBtn = document.getElementById('calcular-btn');
const limpiarBtn = document.getElementById('limpiar-btn');
const resultadosDiv = document.getElementById('resultados');
const emptyStateDiv = document.getElementById('empty-state');

// Inputs
const inputs = {
    t_entrada_h: document.getElementById('t_entrada_h'),
    t_salida_h: document.getElementById('t_salida_h'),
    caudal_h: document.getElementById('caudal_h'),
    cp_h: document.getElementById('cp_h'),
    t_entrada_c: document.getElementById('t_entrada_c'),
    t_salida_c: document.getElementById('t_salida_c'),
    caudal_c: document.getElementById('caudal_c'),
    cp_c: document.getElementById('cp_c'),
    u_coeff: document.getElementById('u_coeff'),
    area: document.getElementById('area')
};

// Event Listeners
tipoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tipoButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tipoIntercambiador = btn.dataset.type;
        document.getElementById('detail-tipo').textContent = btn.querySelector('span').textContent;
    });
});

calcularBtn.addEventListener('click', calcular);
limpiarBtn.addEventListener('click', limpiar);

// Función principal de cálculo
function calcular() {
    try {
        // Validar inputs
        const valores = validarInputs();
        if (!valores) return;

        // Extraer valores
        const {
            t_entrada_h, t_salida_h, caudal_h, cp_h,
            t_entrada_c, t_salida_c, caudal_c, cp_c,
            u_coeff, area
        } = valores;

        // Calcular calor transferido
        const q_h = caudal_h * cp_h * (t_entrada_h - t_salida_h);
        const q_c = caudal_c * cp_c * (t_salida_c - t_entrada_c);
        const q = (q_h + q_c) / 2; // Promedio de ambos lados

        // Calcular LMTD (Diferencia Media Logarítmica de Temperatura)
        const dt1 = t_entrada_h - t_salida_c;
        const dt2 = t_salida_h - t_entrada_c;
        
        let lmtd;
        if (Math.abs(dt1 - dt2) < 0.1) {
            lmtd = dt1; // Si son muy parecidas, usar una
        } else {
            lmtd = (dt1 - dt2) / Math.log(dt1 / dt2);
        }

        // Calcular Q teórico máximo
        const caudal_min = Math.min(caudal_h * cp_h, caudal_c * cp_c);
        const dt_entrada = t_entrada_h - t_entrada_c;
        const q_max = caudal_min * dt_entrada;

        // Calcular efectividad
        const efectividad = (q / q_max) * 100;

        // Calcular NTU (Número de Unidades de Transferencia)
        const ntu = (u_coeff * area) / (caudal_min * 1000); // Convertir a kW

        // Mostrar resultados
        mostrarResultados(q, lmtd, efectividad, ntu, caudal_h, caudal_c, 
                         t_entrada_h - t_salida_h, t_salida_c - t_entrada_c, q_max);

    } catch (error) {
        console.error('Error en cálculo:', error);
        alert('Error en los cálculos. Verifica los valores ingresados.');
    }
}

// Validar inputs
function validarInputs() {
    const valores = {};
    
    for (const [key, input] of Object.entries(inputs)) {
        const valor = parseFloat(input.value);
        
        if (isNaN(valor)) {
            alert(`Por favor completa el campo: ${input.parentElement.querySelector('label').textContent}`);
            input.focus();
            return null;
        }
        
        if (valor <= 0) {
            alert(`${input.parentElement.querySelector('label').textContent} debe ser mayor a 0`);
            input.focus();
            return null;
        }
        
        valores[key] = valor;
    }
    
    return valores;
}

// Mostrar resultados
function mostrarResultados(q, lmtd, efectividad, ntu, m_h, m_c, dt_h, dt_c, q_max) {
    // Actualizar valores de resultados
    document.getElementById('q-calor').textContent = q.toFixed(2);
    document.getElementById('lmtd').textContent = lmtd.toFixed(2);
    document.getElementById('efectividad').textContent = efectividad.toFixed(2);
    document.getElementById('ntu').textContent = ntu.toFixed(4);

    // Actualizar detalles
    document.getElementById('detail-m_h').textContent = m_h.toFixed(2) + ' kg/s';
    document.getElementById('detail-m_c').textContent = m_c.toFixed(2) + ' kg/s';
    document.getElementById('detail-dt_h').textContent = dt_h.toFixed(2) + ' °C';
    document.getElementById('detail-dt_c').textContent = dt_c.toFixed(2) + ' °C';
    document.getElementById('detail-q-max').textContent = (q_max / 1000).toFixed(2) + ' kW';

    // Mostrar/ocultar secciones
    emptyStateDiv.style.display = 'none';
    resultadosDiv.style.display = 'block';

    // Scroll a resultados
    setTimeout(() => {
        resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Limpiar formulario
function limpiar() {
    Object.values(inputs).forEach(input => {
        input.value = '';
    });
    
    resultadosDiv.style.display = 'none';
    emptyStateDiv.style.display = 'block';
    
    // Reset a valores por defecto
    inputs.t_entrada_h.value = '80';
    inputs.t_salida_h.value = '40';
    inputs.caudal_h.value = '1';
    inputs.cp_h.value = '4.18';
    inputs.t_entrada_c.value = '20';
    inputs.t_salida_c.value = '50';
    inputs.caudal_c.value = '1.5';
    inputs.cp_c.value = '4.18';
    inputs.u_coeff.value = '500';
    inputs.area.value = '10';
}

// Agregar evento Enter en inputs
Object.values(inputs).forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calcular();
        }
    });
});

console.log('✓ Calculadora de HeatExchange cargada correctamente');
