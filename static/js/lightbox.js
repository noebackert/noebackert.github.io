// Image Lightbox functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-caption"></div>
            <div class="lightbox-controls">
                <button class="lightbox-zoom-in">+</button>
                <button class="lightbox-zoom-out">-</button>
                <button class="lightbox-reset">Reset</button>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Get lightbox elements
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    const zoomInBtn = lightbox.querySelector('.lightbox-zoom-in');
    const zoomOutBtn = lightbox.querySelector('.lightbox-zoom-out');
    const resetBtn = lightbox.querySelector('.lightbox-reset');

    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    // Find all images in content areas and make them clickable
    function initializeLightbox() {
        const images = document.querySelectorAll('.post-content img, .entry-content img, article img');
        
        images.forEach(img => {
            // Skip if image is already wrapped in a link or has lightbox disabled
            if (img.parentElement.tagName === 'A' || img.hasAttribute('data-no-lightbox')) {
                return;
            }

            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                openLightbox(this);
            });
        });
    }

    function openLightbox(img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt || img.title || '';
        
        // Reset zoom and position
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateImageTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }

    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);

    // Zoom controls
    zoomInBtn.addEventListener('click', function() {
        currentScale = Math.min(currentScale * 1.2, 5);
        updateImageTransform();
    });

    zoomOutBtn.addEventListener('click', function() {
        currentScale = Math.max(currentScale / 1.2, 0.5);
        updateImageTransform();
    });

    resetBtn.addEventListener('click', function() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
    });

    // Mouse wheel zoom
    lightboxImg.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        const rect = lightboxImg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(currentScale * delta, 0.5), 5);
        
        // Adjust translation to zoom towards mouse position
        const scaleDiff = newScale - currentScale;
        translateX -= (x - rect.width / 2) * scaleDiff / currentScale;
        translateY -= (y - rect.height / 2) * scaleDiff / currentScale;
        
        currentScale = newScale;
        updateImageTransform();
    });

    // Mouse drag functionality
    lightboxImg.addEventListener('mousedown', function(e) {
        if (currentScale <= 1) return;
        
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateImageTransform();
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        lightboxImg.style.cursor = currentScale > 1 ? 'grab' : 'default';
    });

    // Touch support for mobile
    let initialDistance = 0;
    let initialScale = 1;

    lightboxImg.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            // Pinch to zoom
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = currentScale;
        } else if (e.touches.length === 1 && currentScale > 1) {
            // Single touch drag
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
        e.preventDefault();
    });

    lightboxImg.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            // Pinch zoom
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            currentScale = Math.min(Math.max(initialScale * (distance / initialDistance), 0.5), 5);
            updateImageTransform();
        } else if (e.touches.length === 1 && isDragging) {
            // Single touch drag
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateImageTransform();
        }
        e.preventDefault();
    });

    lightboxImg.addEventListener('touchend', function() {
        isDragging = false;
    });

    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case '+':
            case '=':
                currentScale = Math.min(currentScale * 1.2, 5);
                updateImageTransform();
                break;
            case '-':
                currentScale = Math.max(currentScale / 1.2, 0.5);
                updateImageTransform();
                break;
            case '0':
                currentScale = 1;
                translateX = 0;
                translateY = 0;
                updateImageTransform();
                break;
        }
    });

    // Initialize lightbox for existing images
    initializeLightbox();

    // Re-initialize when new content is loaded (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && (node.tagName === 'IMG' || node.querySelector('img'))) {
                    initializeLightbox();
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
