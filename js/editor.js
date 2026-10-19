let currentProduct = null;

let canvas, ctx;
let uploadedImage = null;
let imgX = 0, imgY = 0, imgScale = 1, imgRotation = 0, isFlipped = false;
let canvasTexts = [];
let generatedQRImage = null;

let selectedItem = null;
let interactionMode = null;
let startX = 0, startY = 0;
let initialScale = 1;
let initialSize = 20;
let isInteracting = false;
let initialDistFromCenter = 0;

function initCanvas() {
    canvas = document.getElementById('productCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    // Eventos del mouse y táctiles para manipulación fluida de elementos
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchUp);

    redrawCanvas();
}

function populatePhoneModels() {
    const select = document.getElementById('phoneModelSelect');
    if(!select) return;
    const models = [
        "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 14", "iPhone 13", 
        "Samsung Galaxy S24 Ultra", "Samsung Galaxy S23", "Samsung A54", 
        "Xiaomi Redmi Note 13 Pro", "Xiaomi Poco X6", "Motorola Edge 40"
    ];
    select.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
}

function openEditor(productId) {
    currentProduct = productsData.find(p => p.id === productId);
    if (!currentProduct) return;

    document.getElementById('editorTitle').innerText = currentProduct.title;
    document.getElementById('editorPrice').innerText = currentProduct.priceText;

    // Mostrar u ocultar campos según la categoría
    const phoneGroup = document.getElementById('phoneSelectorGroup');
    const qrGroup = document.getElementById('qrFieldGroup');
    const petGroup = document.getElementById('petFieldsGroup');

    phoneGroup.classList.toggle('hidden', currentProduct.category !== 'carcasas');
    qrGroup.classList.toggle('hidden', !currentProduct.title.toLowerCase().includes('qr') && currentProduct.category !== 'accesorios');
    petGroup.classList.toggle('hidden', !currentProduct.title.toLowerCase().includes('mascota') && !currentProduct.title.toLowerCase().includes('perro'));

    // Resetear estados del canvas
    uploadedImage = null;
    canvasTexts = [];
    imgScale = 1;
    imgRotation = 0;
    isFlipped = false;
    imgX = canvas.width / 2;
    imgY = canvas.height / 2;

    document.getElementById('imageInput').value = '';
    document.getElementById('textInput').value = '';
    if(document.getElementById('qrInput')) document.getElementById('qrInput').value = '';

    redrawCanvas();
    document.getElementById('editorModal').classList.remove('hidden');
}

function closeEditor() {
    document.getElementById('editorModal').classList.add('hidden');
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loader = document.getElementById('canvasLoader');
    loader.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            uploadedImage = img;
            // Ajustar escala inicial proporcional
            imgScale = Math.min((canvas.width * 0.7) / img.width, (canvas.height * 0.7) / img.height);
            imgX = canvas.width / 2;
            imgY = canvas.height / 2;
            loader.classList.add('hidden');
            redrawCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function addTextToCanvas() {
    const input = document.getElementById('textInput');
    const textVal = input.value.trim();
    if(!textVal) return;

    const font = document.getElementById('fontSelect').value;
    const color = document.getElementById('textColorPicker').value;

    canvasTexts.push({
        text: textVal,
        x: canvas.width / 2,
        y: canvas.height / 2 + 50,
        size: 24,
        font: font,
        color: color
    });

    input.value = '';
    redrawCanvas();
}

function updateSelectedTextFont() {
    if(selectedItem && selectedItem.type === 'text') {
        selectedItem.font = document.getElementById('fontSelect').value;
        redrawCanvas();
    }
}

function updateSelectedTextColor() {
    if(selectedItem && selectedItem.type === 'text') {
        selectedItem.color = document.getElementById('textColorPicker').value;
        redrawCanvas();
    }
}

function rotateImage() {
    imgRotation += 90;
    if(imgRotation >= 360) imgRotation = 0;
    redrawCanvas();
}

function flipImage() {
    isFlipped = !isFlipped;
    redrawCanvas();
}

function resetCanvasElements() {
    uploadedImage = null;
    canvasTexts = [];
    imgScale = 1;
    imgRotation = 0;
    isFlipped = false;
    imgX = canvas.width / 2;
    imgY = canvas.height / 2;
    redrawCanvas();
}

function generateLiveQR() {
    const val = document.getElementById('qrInput').value.trim();
    if(!val) {
        generatedQRImage = null;
        redrawCanvas();
        return;
    }

    // Usar librería qrcode.js en contenedor oculto para renderizar
    const tempDiv = document.createElement('div');
    new QRCode(tempDiv, {
        text: val,
        width: 120,
        height: 120,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const imgEl = tempDiv.querySelector('img') || tempDiv.querySelector('canvas');
        if(imgEl) {
            const qrImg = new Image();
            qrImg.onload = function() {
                generatedQRImage = qrImg;
                redrawCanvas();
            };
            qrImg.src = imgEl.src || imgEl.toDataURL();
        }
    }, 100);
}

function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo base elegante del canvas
    ctx.fillStyle = '#111115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Marco decorativo interior
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Dibujar imagen principal cargada
    if (uploadedImage) {
        ctx.save();
        ctx.translate(imgX, imgY);
        ctx.rotate((imgRotation * Math.PI) / 180);
        if (isFlipped) ctx.scale(-1, 1);
        ctx.scale(imgScale, imgScale);
        ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);
        ctx.restore();
    } else {
        // Placeholder visual
        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.font = '12px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sube tu foto o diseño aquí', canvas.width / 2, canvas.height / 2 - 10);
    }

    // Dibujar código QR si existe
    if (generatedQRImage) {
        ctx.drawImage(generatedQRImage, canvas.width - 130, canvas.height - 140, 110, 110);
        ctx.strokeStyle = '#D4AF37';
        ctx.strokeRect(128, canvas.height - 142, 114, 114);
    }

    // Dibujar textos personalizados
    canvasTexts.forEach(t => {
        ctx.save();
        ctx.font = `bold ${t.size}px '${t.font}', sans-serif`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
}

// Control de eventos de interacción (Arrastre y escalado básico)
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Verificar selección de textos
    for (let i = canvasTexts.length - 1; i >= 0; i--) {
        const t = canvasTexts[i];
        if (Math.abs(mouseX - t.x) < 60 && Math.abs(mouseY - t.y) < 20) {
            selectedItem = { type: 'text', index: i };
            isInteracting = true;
            startX = mouseX;
            startY = mouseY;
            return;
        }
    }

    // Si no es texto, interactuar con la imagen principal
    selectedItem = { type: 'image' };
    isInteracting = true;
    startX = mouseX;
    startY = mouseY;
    initialScale = imgScale;
}

function handleMouseMove(e) {
    if (!isInteracting) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - startX;
    const dy = mouseY - startY;

    if (selectedItem) {
        if (selectedItem.type === 'text') {
            canvasTexts[selectedItem.index].x += dx;
            canvasTexts[selectedItem.index].y += dy;
        } else if (selectedItem.type === 'image') {
            if (e.shiftKey) {
                // Escalar con Shift + Movimiento
                imgScale = Math.max(0.1, initialScale + (dx * 0.005));
            } else {
                // Mover imagen
                imgX += dx;
                imgY += dy;
            }
        }
        startX = mouseX;
        startY = mouseY;
        redrawCanvas();
    }
}

function handleMouseUp() {
    isInteracting = false;
    selectedItem = null;
}

// Soportes táctiles para móviles
function handleTouchStart(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, shiftKey: false });
    }
}
function handleTouchMove(e) {
    if (e.touches.length === 1 && isInteracting) {
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, shiftKey: false });
        e.preventDefault();
    }
}
function handleTouchUp() {
    handleMouseUp();
}

function openReviewModal() {
    const dataURL = canvas.toDataURL('image/png');
    document.getElementById('reviewImagePreview').src = dataURL;
    document.getElementById('reviewModal').classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
}

function submitOrderToWhatsApp() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();

    if (!customerName || !customerAddress) {
        alert('Por favor ingresa tu nombre y dirección para continuar.');
        return;
    }

    const phoneModel = document.getElementById('phoneModelSelect') && !document.getElementById('phoneSelectorGroup').classList.contains('hidden') 
        ? document.getElementById('phoneModelSelect').value 
        : 'N/A';

    let textsSummary = canvasTexts.map(t => t.text).join(' / ');
    
    const message = `*¡NUEVO PEDIDO - TECNODISEÑO!*%0A%0A` +
        `🛍️ *Producto:* ${currentProduct.title}%0A` +
        `💵 *Precio:* ${currentProduct.priceText}%0A` +
        `📱 *Modelo/Detalle:* ${phoneModel}%0A` +
        `✍️ *Textos personalizados:* ${textsSummary || 'Ninguno'}%0A%0A` +
        `👤 *Cliente:* ${customerName}%0A` +
        `📍 *Dirección/Ubicación:* ${customerAddress}%0A%0A` +
        `_Enviado desde la plataforma web interactiva de Tecnodiseño Studio_.`;

    window.open(`https://wa.me/573148398359?text=${message}`, '_blank');
}