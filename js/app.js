const productsData = [
    { id: 1, title: 'Estuche de Celular Personalizado', category: 'carcasas', price: 38000, priceText: '$ 38.000 COP', icon: 'fa-mobile-screen-button', desc: 'Soporta iPhone, Samsung, Xiaomi y Motorola.' },
    { id: 2, title: 'Pad Mouse Personalizado 22x18cm', category: 'carcasas', price: 15000, priceText: '$ 15.000 COP', icon: 'fa-rug', desc: 'Superficie suave con base antideslizante.' },
    { id: 3, title: 'Base para Celular 360°', category: 'carcasas', price: 30000, priceText: '$ 30.000 COP', icon: 'fa-mobile-retro', desc: 'Soporte metálico orientable e imprimible.' },
    { id: 4, title: 'Mug Blanco Sublimado 11oz', category: 'mugs', price: 22000, priceText: '$ 22.000 COP', icon: 'fa-mug-hot', desc: 'Cerámica de alta nitidez apta para microondas.' },
    { id: 5, title: 'Mug Mágico Negro 11oz', category: 'mugs', price: 30000, priceText: '$ 30.000 COP', icon: 'fa-wand-magic-sparkles', desc: 'Revela la imagen personalizada con líquido caliente.' },
    { id: 6, title: 'Termo Térmico 30oz', category: 'mugs', price: 65000, priceText: '$ 65.000 COP', icon: 'fa-bottle-water', desc: 'Mantiene bebidas frías o calientes por 12 horas.' },
    { id: 7, title: 'Rompecabezas 80 Piezas', category: 'rompecabezas', price: 28000, priceText: '$ 28.000 COP', icon: 'fa-puzzle-piece', desc: 'Acabado brillante ideal para enmarcar.' },
    { id: 8, title: 'Rompecabezas Corazón 75 Piezas', category: 'rompecabezas', price: 28000, priceText: '$ 28.000 COP', icon: 'fa-heart', desc: 'Diseño especial para regalo romántico.' },
    { id: 9, title: 'Rompecabezas 120 Piezas', category: 'rompecabezas', price: 36000, priceText: '$ 36.000 COP', icon: 'fa-puzzle-piece', desc: 'Tamaño A4 con marco perimetral.' },
    { id: 10, title: 'Rompecabezas 300 Piezas Pro', category: 'rompecabezas', price: 45000, priceText: '$ 45.000 COP', icon: 'fa-puzzle-piece', desc: 'Gran formato para alta resolución.' },
    { id: 11, title: 'Portarretrato Bambú Mini', category: 'portarretratos', price: 35000, priceText: '$ 35.000 COP', icon: 'fa-image', desc: 'Madera natural ecológica de alta calidad.' },
    { id: 12, title: 'Piedra Roca Corazón Sublimada', category: 'portarretratos', price: 38000, priceText: '$ 38.000 COP', icon: 'fa-gem', desc: 'Acabado rústico natural en piedra roca.' },
    { id: 13, title: 'Lámina Mediana Bambú', category: 'portarretratos', price: 45000, priceText: '$ 45.000 COP', icon: 'fa-frame', desc: 'Estructura elegante en tono cálido.' },
    { id: 14, title: 'Lámina Grande Bambú Premium', category: 'portarretratos', price: 58000, priceText: '$ 58.000 COP', icon: 'fa-image', desc: 'Formato amplio para retratos familiares.' },
    { id: 15, title: 'Lámpara LED Acrílico Corazón', category: 'portarretratos', price: 85000, priceText: '$ 85.000 COP', icon: 'fa-lightbulb', desc: 'Luz cálida con grabado personalizado.' },
    { id: 16, title: 'Lámpara LED Luna 3D', category: 'portarretratos', price: 85000, priceText: '$ 85.000 COP', icon: 'fa-moon', desc: 'Relieve lunar iluminado con tu foto.' },
    { id: 17, title: 'Lámpara LED Flor de la Vida', category: 'portarretratos', price: 85000, priceText: '$ 85.000 COP', icon: 'fa-sun', desc: 'Efecto óptico decorativo de lujo.' },
    { id: 18, title: 'Llavero Acrílico Personalizado', category: 'accesorios', price: 20000, priceText: '$ 20.000 COP', icon: 'fa-key', desc: 'Impresión doble cara en acrílico.' },
    { id: 19, title: 'Llavero 3D Figura', category: 'accesorios', price: 20000, priceText: '$ 20.000 COP', icon: 'fa-key', desc: 'Diseño en relieve con acabados pulidos.' },
    { id: 20, title: 'Placa Mascota con Nombre y Tel', category: 'accesorios', price: 25000, priceText: '$ 25.000 COP', icon: 'fa-dog', desc: 'Aluminio ligero y resistente al agua.' },
    { id: 21, title: 'Collar de Cuero para Mascota', category: 'accesorios', price: 40000, priceText: '$ 40.000 COP', icon: 'fa-shield-dog', desc: 'Cuero genuino con placa grabada.' },
    { id: 22, title: 'Placa QR para Negocios', category: 'accesorios', price: 60000, priceText: '$ 60.000 COP', icon: 'fa-qrcode', desc: 'Base acrílica dorada/negra con QR dinámico.' }
];

const categories = [
    { id: 'todos', name: 'Todos', icon: 'fa-border-all' },
    { id: 'carcasas', name: 'Carcasas & Tech', icon: 'fa-mobile-screen' },
    { id: 'mugs', name: 'Mugs & Termos', icon: 'fa-mug-hot' },
    { id: 'rompecabezas', name: 'Rompecabezas', icon: 'fa-puzzle-piece' },
    { id: 'portarretratos', name: 'Lámparas & Fotos', icon: 'fa-lightbulb' },
    { id: 'accesorios', name: 'Mascotas & QR', icon: 'fa-dog' }
];

let activeCategory = 'todos';

window.addEventListener('DOMContentLoaded', () => {
    renderCategoryFilters();
    renderProducts();
    populatePhoneModels();
    initCanvas();
});

function renderCategoryFilters() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;
    container.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${cat.id}')" 
                class="px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeCategory === cat.id 
                    ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105 font-bold' 
                    : 'bg-[#141418] text-gray-300 hover:border-gold/50 border border-gold/20'
                }">
            <i class="fa-solid ${cat.icon}"></i> ${cat.name}
        </button>
    `).join('');
}

function filterCategory(catId) {
    activeCategory = catId;
    renderCategoryFilters();
    renderProducts();
}

function renderProducts(items = null) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const list = items || (activeCategory === 'todos' ? productsData : productsData.filter(p => p.category === activeCategory));

    if (list.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">No se encontraron productos en esta categoría.</p>`;
        return;
    }

    grid.innerHTML = list.map(prod => `
        <div class="bg-[#141418] border border-gold/20 hover:border-gold/70 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group shadow-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <div class="space-y-4">
                <div class="w-full h-44 bg-[#0A0A0C] rounded-xl flex flex-col items-center justify-center border border-gold/10 group-hover:border-gold/30 transition-all relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <i class="fa-solid ${prod.icon} text-4xl text-gold/60 group-hover:text-gold transition-all group-hover:scale-110"></i>
                    <span class="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-semibold">Exclusivo</span>
                </div>

                <div>
                    <span class="text-[10px] text-gold font-bold uppercase tracking-wider">${prod.category}</span>
                    <h3 class="font-bold text-sm text-white line-clamp-1 mt-0.5 group-hover:text-gold-light transition-colors">${prod.title}</h3>
                    <p class="text-xs text-gray-400 mt-1 line-clamp-2 font-light">${prod.desc}</p>
                </div>
            </div>

            <div class="mt-5 pt-3.5 border-t border-gold/10 flex items-center justify-between">
                <span class="text-sm font-extrabold text-gold">${prod.priceText}</span>
                <button onclick="openEditor(${prod.id})" 
                        class="px-3.5 py-2 bg-gold/10 border border-gold/40 hover:bg-gold hover:text-black text-gold text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Personalizar
                </button>
            </div>
        </div>
    `).join('');
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = productsData.filter(p => p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
    renderProducts(filtered);
}