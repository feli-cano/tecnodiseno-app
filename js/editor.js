let currentProduct = null;

let canvas, ctx;
let uploadedImage = null;
let imgX = 0, imgY = 0, imgScale = 1, imgRotation = 0, isFlipped = false;
let canvasTexts = [];
let generatedQRImage = null;

let selectedItem = null; // { type: 'image' | 'text', action: 'move' | 'scale', corner: 'tl'|'tr'|'bl'|'br' }
let startX = 0, startY = 0;
let initialScale = 1;
let isInteracting = false;
let initialPinchDistance = null;
const handleRadius = 14; // Tamaño visual del tirador
const hitBoxRadius = 28;  // Zona de toque fácil para dedos en celulares

function initCanvas() {
    canvas = document.getElementById('productCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    // Eventos de Mouse (Computador)
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Eventos Táctiles (Celulares / Tablets)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

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

    const phoneGroup = document.getElementById('phoneSelectorGroup');
    const qrGroup = document.getElementById('qrFieldGroup');
    const petGroup = document.getElementById('petFieldsGroup');

    phoneGroup.classList.toggle('hidden', currentProduct.category !== 'carcasas');
    qrGroup.classList.toggle('hidden', !currentProduct.title.toLowerCase().includes('qr') && currentProduct.category !== 'accesorios');
    petGroup.classList.toggle('hidden', !currentProduct.title.toLowerCase().includes('mascota') && !currentProduct.title.toLowerCase().includes('perro'));

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
        canvasTexts[selectedItem.index].font = document.getElementById('fontSelect').value;
        redrawCanvas();
    }
}

function updateSelectedTextColor() {
    if(selectedItem && selectedItem.type === 'text') {
        canvasTexts[selectedItem.index].color = document.getElementById('textColorPicker').value;
        redrawCanvas();
    }
}

function zoomInImage() {
    imgScale = Math.min(5, imgScale * 1.15);
    redrawCanvas();
}

function zoomOutImage() {
    imgScale = Math.max(0.05, imgScale / 1.15);
    redrawCanvas();
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

// Obtener las coordenadas exactas de las 4 esquinas de la imagen
function getImageCorners() {
    if (!uploadedImage) return null;
    const w = (uploadedImage.width * imgScale) / 2;
    const h = (uploadedImage.height * imgScale) / 2;
    return {
        tl: { x: imgX - w, y: imgY - h },
        tr: { x: imgX + w, y: imgY - h },
        bl: { x: imgX - w, y: imgY + h },
        br: { x: imgX + w, y: imgY + h },
        width: w * 2,
        height: h * 2
    };
}

function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Dibujar la imagen principal
    if (uploadedImage) {
        ctx.save();
        ctx.translate(imgX, imgY);
        ctx.rotate((imgRotation * Math.PI) / 180);
        if (isFlipped) ctx.scale(-1, 1);
        ctx.scale(imgScale, imgScale);
        ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);
        ctx.restore();

        // Marco estilo App de Diseño (Canva / Photoshop)
        const corners = getImageCorners();
        if (corners) {
            ctx.save();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(corners.tl.x, corners.tl.y, corners.width, corners.height);
            ctx.setLineDash([]);

            // Tiradores táctiles en las 4 esquinas
            const handleKeys = ['tl', 'tr', 'bl', 'br'];
            handleKeys.forEach(key => {
                const pt = corners[key];
                
                // Círculo exterior dorado
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, handleRadius, 0, 2 * Math.PI);
                ctx.fillStyle = '#D4AF37';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Punto centro interior
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#000000';
                ctx.fill();
            });
            ctx.restore();
        }
    } else {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.font = '12px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sube tu foto o diseño aquí', canvas.width / 2, canvas.height / 2 - 10);
    }

    if (generatedQRImage) {
        ctx.drawImage(generatedQRImage, canvas.width - 130, canvas.height - 140, 110, 110);
        ctx.strokeStyle = '#D4AF37';
        ctx.strokeRect(128, canvas.height - 142, 114, 114);
    }

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

// Obtener la posición (X,Y) del punto presionado (unificando Mouse y Touch)
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function handleMouseDown(e) {
    const pos = getPointerPos(e);
    const mouseX = pos.x;
    const mouseY = pos.y;

    // 1. Detectar si presionó alguna esquina para escalar
    if (uploadedImage) {
        const corners = getImageCorners();
        const keys = ['tl', 'tr', 'bl', 'br'];
        for (let key of keys) {
            const pt = corners[key];
            const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
            if (dist <= hitBoxRadius) {
                selectedItem = { type: 'image', action: 'scale', corner: key };
                isInteracting = true;
                startX = mouseX;
                startY = mouseY;
                initialScale = imgScale;
                return;
            }
        }
    }

    // 2. Detectar si presionó un texto
    for (let i = canvasTexts.length - 1; i >= 0; i--) {
        const t = canvasTexts[i];
        if (Math.abs(mouseX - t.x) < 60 && Math.abs(mouseY - t.y) < 20) {
            selectedItem = { type: 'text', action: 'move', index: i };
            isInteracting = true;
            startX = mouseX;
            startY = mouseY;
            return;
        }
    }

    // 3. Detectar si presionó sobre la imagen para moverla
    if (uploadedImage) {
        const corners = getImageCorners();
        if (mouseX >= corners.tl.x && mouseX <= corners.tr.x && mouseY >= corners.tl.y && mouseY <= corners.bl.y) {
            selectedItem = { type: 'image', action: 'move' };
            isInteracting = true;
            startX = mouseX;
            startY = mouseY;
            initialScale = imgScale;
            return;
        }
    }
}

function handleMouseMove(e) {
    const pos = getPointerPos(e);
    const mouseX = pos.x;
    const mouseY = pos.y;

    if (!isInteracting && uploadedImage) {
        const corners = getImageCorners();
        let hoverCorner = false;
        if (corners) {
            ['tl', 'tr', 'bl', 'br'].forEach(key => {
                const pt = corners[key];
                if (Math.hypot(mouseX - pt.x, mouseY - pt.y) <= hitBoxRadius) {
                    canvas.style.cursor = (key === 'tl' || key === 'br') ? 'nwse-resize' : 'nesw-resize';
                    hoverCorner = true;
                }
            });
        }
        if (!hoverCorner) {
            if (mouseX >= corners.tl.x && mouseX <= corners.tr.x && mouseY >= corners.tl.y && mouseY <= corners.bl.y) {
                canvas.style.cursor = 'move';
            } else {
                canvas.style.cursor = 'default';
            }
        }
    }

    if (!isInteracting) return;
    const dx = mouseX - startX;
    const dy = mouseY - startY;

    if (selectedItem) {
        if (selectedItem.type === 'text') {
            canvasTexts[selectedItem.index].x += dx;
            canvasTexts[selectedItem.index].y += dy;
            startX = mouseX;
            startY = mouseY;
        } else if (selectedItem.type === 'image') {
            if (selectedItem.action === 'move') {
                imgX += dx;
                imgY += dy;
                startX = mouseX;
                startY = mouseY;
            } else if (selectedItem.action === 'scale') {
                const currentDist = Math.hypot(mouseX - imgX, mouseY - imgY);
                const initialDist = Math.hypot(startX - imgX, startY - imgY);
                if (initialDist > 0) {
                    const factor = currentDist / initialDist;
                    imgScale = Math.max(0.05, Math.min(5, initialScale * factor));
                }
            }
        }
        redrawCanvas();
    }
}

function handleMouseUp() {
    isInteracting = false;
    selectedItem = null;
    if (canvas) canvas.style.cursor = 'default';
}

// MANEJO DE EVENTOS TÁCTILES MÓVILES
function getPinchDistance(touches) {
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
}

function handleTouchStart(e) {
    if (e.cancelable) e.preventDefault();
    if (e.touches.length === 1) {
        handleMouseDown(e);
    } else if (e.touches.length === 2 && uploadedImage) {
        initialPinchDistance = getPinchDistance(e.touches);
        initialScale = imgScale;
    }
}

function handleTouchMove(e) {
    if (e.cancelable) e.preventDefault();
    if (e.touches.length === 1 && isInteracting) {
        handleMouseMove(e);
    } else if (e.touches.length === 2 && initialPinchDistance && uploadedImage) {
        const currentDistance = getPinchDistance(e.touches);
        const factor = currentDistance / initialPinchDistance;
        imgScale = Math.max(0.05, Math.min(5, initialScale * factor));
        redrawCanvas();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        initialPinchDistance = null;
    }
    if (e.touches.length === 0) {
        handleMouseUp();
    }
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